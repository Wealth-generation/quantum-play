import type { Application, Container, Graphics } from "pixi.js";
import {
  getPlinkoBucketStyle,
  type PlinkoBucketVisualStyle,
} from "../lib/plinko-bucket-style";
import { formatPlinkoMultiplier } from "../lib/plinko-format";
import {
  createPlinkoMotionPlan,
  type PlinkoContactEvent,
  type PlinkoMotionPlan,
  type PlinkoMotionSegment,
} from "../lib/plinko-motion-plan";
import {
  createPlinkoBoardGeometry,
  type PlinkoBoardGeometry,
  type PlinkoBucketGeometry,
  type PlinkoPoint,
} from "../lib/plinko-path";
import type {
  PlinkoRenderer,
  PlinkoRendererOptions,
  PlinkoRendererRound,
  PlinkoRendererSettlementReason,
} from "./plinko-renderer-types";
import {
  buildMatterPlinkoTrajectory,
  type MatterPlinkoTrajectoryResult,
} from "./matter-plinko-trajectory";

interface CreatePixiPlinkoRendererOptions extends PlinkoRendererOptions {
  container: HTMLElement;
}

interface ActivePixiAnimation {
  frame: number;
  round: PlinkoRendererRound;
}

interface EvaluatedMotionFrame extends PlinkoPoint {
  contactPulse: number;
  segment: PlinkoMotionSegment;
}

interface EvaluatedTrajectoryFrame extends PlinkoPoint {
  contactPulse: number;
}

type PixiFillGradientConstructor = new (options: {
  colorStops: Array<{ offset: number; color: number }>;
  end: { x: number; y: number };
  start: { x: number; y: number };
  type: "linear";
}) => unknown;

const MAX_ACTIVE_EFFECTS = 42;

export async function createPixiPlinkoRenderer({
  container,
  ...initialOptions
}: CreatePixiPlinkoRendererOptions): Promise<PlinkoRenderer> {
  const { Application, Container, FillGradient, Graphics, Text } =
    await import("pixi.js");
  const app: Application = new Application();
  let destroyed = false;
  let options = initialOptions;
  let geometry: PlinkoBoardGeometry | null = null;
  const activeAnimations = new Map<string, ActivePixiAnimation>();
  const effectTimeouts = new Set<ReturnType<typeof setTimeout>>();
  const activeEffects = new Set<Graphics>();

  await app.init({
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    resizeTo: container,
  });

  if (destroyed) {
    app.destroy(
      { releaseGlobalResources: false, removeView: true },
      { children: true, texture: true, textureSource: true },
    );
    return createDestroyedRenderer();
  }

  const root: Container = new Container();
  const boardLayer: Container = new Container();
  const effectsLayer: Container = new Container();
  const ballLayer: Container = new Container();

  root.addChild(boardLayer, effectsLayer, ballLayer);
  app.stage.addChild(root);
  app.canvas.style.display = "block";
  app.canvas.style.height = "100%";
  app.canvas.style.inset = "0";
  app.canvas.style.position = "absolute";
  app.canvas.style.width = "100%";
  container.appendChild(app.canvas);

  function clearLayer(layer: Container) {
    layer.removeChildren().forEach((child) => child.destroy());
  }

  function scheduleEffectDestroy(effect: Graphics, delayMs: number) {
    if (activeEffects.size >= MAX_ACTIVE_EFFECTS) {
      effect.destroy();
      return;
    }

    activeEffects.add(effect);
    effectsLayer.addChild(effect);

    const timeout = setTimeout(() => {
      activeEffects.delete(effect);
      effect.destroy();
      effectTimeouts.delete(timeout);
    }, delayMs);

    effectTimeouts.add(timeout);
  }

  function clearEffectTimeouts() {
    for (const timeout of effectTimeouts.values()) {
      clearTimeout(timeout);
    }

    effectTimeouts.clear();
    activeEffects.clear();
  }

  function cancelAnimation({ settleActiveRounds = true } = {}) {
    for (const activeAnimation of activeAnimations.values()) {
      cancelAnimationFrame(activeAnimation.frame);

      if (settleActiveRounds) {
        options.onRoundSettled?.(activeAnimation.round, "cancelled");
      }
    }

    activeAnimations.clear();
    clearEffectTimeouts();
    clearLayer(ballLayer);
    clearLayer(effectsLayer);
  }

  function drawBoard() {
    clearLayer(boardLayer);
    clearEffectTimeouts();
    clearLayer(effectsLayer);

    if (!options.board) {
      geometry = null;
      return;
    }

    geometry = createPlinkoBoardGeometry({
      height: Math.max(container.clientHeight, 1),
      rowsCount: options.board.rowsCount,
      width: Math.max(container.clientWidth, 1),
    });

    const graphics: Graphics = new Graphics();

    for (const pegRow of geometry.pegRows) {
      for (const peg of pegRow) {
        graphics
          .circle(peg.x, peg.y, geometry.pegRadius)
          .stroke({ width: 2, color: 0x566274, alpha: 0.88 })
          .circle(peg.x, peg.y, Math.max(geometry.pegRadius - 2, 1))
          .fill({ color: 0x101823, alpha: 0.62 });
      }
    }

    for (const bucket of geometry.buckets) {
      const bucketStyle = getPlinkoBucketStyle(bucket.index, geometry.bucketCount);
      const glossHeight = Math.max(bucket.height * 0.34, 8);
      const shadeHeight = Math.max(bucket.height * 0.28, 7);

      graphics
        .roundRect(bucket.x, bucket.y, bucket.width, bucket.height, bucket.radius)
        .fill(createBucketGradient(FillGradient, bucketStyle) as never)
        .stroke({ width: 1, color: 0x170f0a, alpha: 0.32 })
        .roundRect(bucket.x, bucket.y, bucket.width, glossHeight, bucket.radius)
        .fill({ color: 0xffffff, alpha: 0.11 })
        .roundRect(
          bucket.x,
          bucket.y + bucket.height - shadeHeight,
          bucket.width,
          shadeHeight,
          bucket.radius,
        )
        .fill({ color: 0x000000, alpha: 0.12 });
    }

    boardLayer.addChild(graphics);

    for (const bucket of geometry.buckets) {
      const multiplier = options.board.bucketMultipliers[bucket.index] ?? 1;
      const bucketStyle = getPlinkoBucketStyle(bucket.index, geometry.bucketCount);
      const label = new Text({
        anchor: 0.5,
        style: {
          align: "center",
          fill: bucketStyle.labelColor,
          fontFamily: "Arial, sans-serif",
          fontSize: Math.max(Math.min(bucket.width * 0.31, 12), 8),
          fontWeight: "900",
        },
        text: formatPlinkoMultiplier(multiplier),
      });
      const maxLabelWidth = Math.max(bucket.width - 4, 4);

      if (label.width > maxLabelWidth) {
        label.scale.set(maxLabelWidth / label.width);
      }

      label.position.set(bucket.centerX, bucket.y + bucket.height / 2);
      boardLayer.addChild(label);
    }
  }

  async function startRoundAnimation(round: PlinkoRendererRound) {
    if (!geometry) {
      drawBoard();
    }

    if (!geometry) {
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    const activeGeometry = geometry;
    let motionPlan: PlinkoMotionPlan;

    try {
      motionPlan = createPlinkoMotionPlan({
        geometry: activeGeometry,
        results: round.result.results,
        rowsCount: round.result.rowsCount,
      });
    } catch {
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    let matterTrajectory: MatterPlinkoTrajectoryResult | null = null;

    try {
      matterTrajectory = await buildMatterPlinkoTrajectory({
        bucketIndex: motionPlan.bucketIndex,
        geometry: activeGeometry,
        results: round.result.results,
        rowsCount: round.result.rowsCount,
      });
    } catch {
      matterTrajectory = null;
    }

    if (destroyed) {
      return;
    }

    if (
      matterTrajectory?.valid &&
      matterTrajectory.bucketImpact &&
      matterTrajectory.samples.length > 1
    ) {
      startMatterTrajectoryAnimation(round, activeGeometry, matterTrajectory);
      return;
    }

    startMotionPlanAnimation(round, activeGeometry, motionPlan);
  }

  function startMotionPlanAnimation(
    round: PlinkoRendererRound,
    activeGeometry: PlinkoBoardGeometry,
    motionPlan: PlinkoMotionPlan,
  ) {
    const ball = new Graphics();
    const firedContactIds = new Set<string>();
    const view = container.ownerDocument.defaultView ?? window;
    const startTime = view.performance.now();
    let bucketImpactFired = false;
    let completed = false;

    drawBall(ball, motionPlan.segments[0]?.startPoint ?? activeGeometry.startPoint, activeGeometry.ballRadius, 0);
    ballLayer.addChild(ball);

    const completeAnimation = ({
      flashBucket,
      reason,
    }: {
      flashBucket: boolean;
      reason: PlinkoRendererSettlementReason;
    }) => {
      if (completed) {
        return;
      }

      completed = true;
      activeAnimations.delete(round.id);

      if (flashBucket && !bucketImpactFired) {
        drawBucketHitFlash(Graphics, motionPlan.bucketImpact);
      }

      options.onRoundSettled?.(round, reason);
      ball.destroy();
    };

    const tick = (time: number) => {
      if (destroyed) {
        return;
      }

      const elapsedMs = Math.max(time - startTime, 0);

      try {
        firePendingContactEffects(
          Graphics,
          motionPlan.contacts,
          elapsedMs,
          firedContactIds,
        );

        if (elapsedMs >= motionPlan.bucketImpact.timeMs && !bucketImpactFired) {
          bucketImpactFired = true;
          drawBucketHitFlash(Graphics, motionPlan.bucketImpact);
        }

        const frame = evaluateMotionPlan(motionPlan, elapsedMs);
        drawBall(
          ball,
          frame,
          activeGeometry.ballRadius,
          frame.contactPulse,
        );
      } catch {
        completeAnimation({ flashBucket: false, reason: "fallback" });
        return;
      }

      if (elapsedMs < motionPlan.durationMs) {
        const nextFrame = view.requestAnimationFrame(tick);
        activeAnimations.set(round.id, {
          frame: nextFrame,
          round,
        });
        return;
      }

      completeAnimation({ flashBucket: !bucketImpactFired, reason: "visual" });
    };

    activeAnimations.set(round.id, {
      frame: view.requestAnimationFrame(tick),
      round,
    });
  }

  function startMatterTrajectoryAnimation(
    round: PlinkoRendererRound,
    activeGeometry: PlinkoBoardGeometry,
    trajectory: MatterPlinkoTrajectoryResult,
  ) {
    const bucketImpact = trajectory.bucketImpact;

    if (!bucketImpact) {
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    const ball = new Graphics();
    const firedContactIds = new Set<string>();
    const view = container.ownerDocument.defaultView ?? window;
    const startTime = view.performance.now();
    let bucketImpactFired = false;
    let completed = false;

    drawBall(
      ball,
      trajectory.samples[0] ?? activeGeometry.startPoint,
      activeGeometry.ballRadius,
      0,
    );
    ballLayer.addChild(ball);

    const completeAnimation = ({
      flashBucket,
      reason,
    }: {
      flashBucket: boolean;
      reason: PlinkoRendererSettlementReason;
    }) => {
      if (completed) {
        return;
      }

      completed = true;
      activeAnimations.delete(round.id);

      if (flashBucket && !bucketImpactFired) {
        drawBucketHitFlash(Graphics, bucketImpact);
      }

      options.onRoundSettled?.(round, reason);
      ball.destroy();
    };

    const tick = (time: number) => {
      if (destroyed) {
        return;
      }

      const elapsedMs = Math.max(time - startTime, 0);

      try {
        firePendingContactEffects(
          Graphics,
          trajectory.contacts,
          elapsedMs,
          firedContactIds,
        );

        if (
          elapsedMs >= bucketImpact.timeMs &&
          !bucketImpactFired
        ) {
          bucketImpactFired = true;
          drawBucketHitFlash(Graphics, bucketImpact);
        }

        const frame = evaluateMatterTrajectory(trajectory, elapsedMs);
        drawBall(
          ball,
          frame,
          activeGeometry.ballRadius,
          frame.contactPulse,
        );
      } catch {
        completeAnimation({ flashBucket: false, reason: "fallback" });
        return;
      }

      if (elapsedMs < trajectory.durationMs) {
        const nextFrame = view.requestAnimationFrame(tick);
        activeAnimations.set(round.id, {
          frame: nextFrame,
          round,
        });
        return;
      }

      completeAnimation({ flashBucket: !bucketImpactFired, reason: "visual" });
    };

    activeAnimations.set(round.id, {
      frame: view.requestAnimationFrame(tick),
      round,
    });
  }

  function firePendingContactEffects(
    GraphicsCtor: typeof Graphics,
    contacts: readonly PlinkoContactEvent[],
    elapsedMs: number,
    firedContactIds: Set<string>,
  ) {
    for (const contact of contacts) {
      if (elapsedMs < contact.timeMs || firedContactIds.has(contact.id)) {
        continue;
      }

      firedContactIds.add(contact.id);
      drawPegContactPulse(GraphicsCtor, contact);
    }
  }

  function drawPegContactPulse(
    GraphicsCtor: typeof Graphics,
    contact: PlinkoContactEvent,
  ) {
    const pulse = new GraphicsCtor();
    const peg = contact.pegContact.peg;
    const ringAlpha = Math.min(0.58, 0.3 + contact.impactStrength * 0.2);

    pulse
      .circle(peg.x, peg.y, contact.pulseRadius * 0.56)
      .stroke({ width: 2, color: 0xc8ffe1, alpha: ringAlpha })
      .circle(peg.x, peg.y, Math.max(contact.pulseRadius * 0.14, 2))
      .fill({ color: 0xd9fff0, alpha: 0.14 });
    scheduleEffectDestroy(pulse, Math.min(contact.pulseDurationMs, 86));
  }

  function drawBucketHitFlash(
    GraphicsCtor: typeof Graphics,
    impact: PlinkoMotionPlan["bucketImpact"],
  ) {
    const bucket: PlinkoBucketGeometry = impact.bucket;
    const flash = new GraphicsCtor();

    flash
      .roundRect(
        bucket.x - 5,
        bucket.y - 5,
        bucket.width + 10,
        bucket.height + 10,
        bucket.radius + 5,
      )
      .fill({ color: 0x22c55e, alpha: 0.18 + impact.impactStrength * 0.04 })
      .roundRect(bucket.x, bucket.y, bucket.width, bucket.height, bucket.radius)
      .fill({ color: 0xffffff, alpha: 0.28 })
      .roundRect(
        bucket.x + 2,
        bucket.y + 2,
        Math.max(bucket.width - 4, 1),
        Math.max(bucket.height - 4, 1),
        Math.max(bucket.radius - 2, 1),
      )
      .stroke({ width: 2, color: 0xffffff, alpha: 0.44 });
    scheduleEffectDestroy(flash, impact.flashDurationMs);
  }

  function boardChanged(
    previous: PlinkoRendererOptions["board"],
    next: PlinkoRendererOptions["board"],
  ) {
    if (!previous && !next) {
      return false;
    }

    return (
      previous?.rowsCount !== next?.rowsCount ||
      previous?.risk !== next?.risk ||
      previous?.bucketMultipliers.length !== next?.bucketMultipliers.length ||
      previous?.bucketMultipliers.some(
        (multiplier, index) => multiplier !== next?.bucketMultipliers[index],
      ) === true
    );
  }

  drawBoard();

  return {
    destroy: () => {
      if (destroyed) {
        return;
      }

      destroyed = true;
      cancelAnimation({ settleActiveRounds: false });
      app.destroy(
        { releaseGlobalResources: false, removeView: true },
        { children: true, texture: true, textureSource: true },
      );
    },
    resize: () => {
      if (!destroyed) {
        cancelAnimation();
        app.renderer.resize(
          Math.max(container.clientWidth, 1),
          Math.max(container.clientHeight, 1),
        );
        drawBoard();
      }
    },
    setOptions: (nextOptions) => {
      const shouldRedraw = boardChanged(options.board, nextOptions.board);

      options = nextOptions;

      if (shouldRedraw) {
        cancelAnimation();
        drawBoard();
      }
    },
    visualizeRound: (round: PlinkoRendererRound) => {
      if (!destroyed) {
        void startRoundAnimation(round);
      }
    },
  };
}

function drawBall(
  ball: Graphics,
  position: PlinkoPoint,
  radius: number,
  contactPulse: number,
) {
  const pulseRadius = radius * (1 + contactPulse * 0.22);
  const contactRingRadius = pulseRadius * (1.08 + contactPulse * 0.16);

  ball.clear();

  if (contactPulse > 0.02) {
    ball
      .circle(position.x, position.y, contactRingRadius)
      .stroke({
        width: 1.4,
        color: 0x22c55e,
        alpha: Math.min(0.58, contactPulse * 0.46),
      });
  }

  ball
    .circle(position.x, position.y, pulseRadius)
    .fill({ color: 0xf8fafc, alpha: 1 })
    .stroke({ width: 2, color: 0x22c55e, alpha: 0.9 + contactPulse * 0.08 })
    .circle(
      position.x - pulseRadius * 0.25,
      position.y - pulseRadius * 0.3,
      pulseRadius * 0.28,
    )
    .fill({ color: 0xffffff, alpha: 0.72 });
}

function evaluateMotionPlan(
  motionPlan: PlinkoMotionPlan,
  elapsedMs: number,
): EvaluatedMotionFrame {
  const segment =
    motionPlan.segments.find(
      (candidate) =>
        elapsedMs <= candidate.startTimeMs + candidate.durationMs,
    ) ?? motionPlan.segments[motionPlan.segments.length - 1];

  if (!segment) {
    throw new Error("Plinko motion plan had no segments.");
  }

  const localProgress = clamp01(
    (elapsedMs - segment.startTimeMs) / segment.durationMs,
  );
  const contact = segment.contactId
    ? motionPlan.contacts.find((candidate) => candidate.id === segment.contactId)
    : null;
  const contactProgress = contact
    ? clamp01((contact.timeMs - segment.startTimeMs) / segment.durationMs)
    : 0.7;
  const contactPulse = contact
    ? Math.max(0, 1 - Math.abs(elapsedMs - contact.timeMs) / 118)
    : 0;

  if (localProgress <= contactProgress) {
    return {
      ...evaluateInboundSegment(segment, localProgress, contactProgress),
      contactPulse,
      segment,
    };
  }

  return {
    ...evaluateOutboundSegment(segment, localProgress, contactProgress),
    contactPulse,
    segment,
  };
}

function evaluateMatterTrajectory(
  trajectory: MatterPlinkoTrajectoryResult,
  elapsedMs: number,
): EvaluatedTrajectoryFrame {
  const samples = trajectory.samples;
  const lastSample = samples[samples.length - 1];

  if (!lastSample) {
    throw new Error("Matter Plinko trajectory had no samples.");
  }

  if (elapsedMs >= lastSample.timeMs) {
    return {
      contactPulse: getMatterContactPulse(trajectory.contacts, elapsedMs),
      x: lastSample.x,
      y: lastSample.y,
    };
  }

  const nextSampleIndex = samples.findIndex(
    (sample) => sample.timeMs >= elapsedMs,
  );
  const nextSample =
    nextSampleIndex >= 0 ? samples[nextSampleIndex] : lastSample;
  const previousSample =
    nextSampleIndex > 0 ? samples[nextSampleIndex - 1] : samples[0];
  const segmentDuration = Math.max(
    nextSample.timeMs - previousSample.timeMs,
    1,
  );
  const progress = smoothstep(
    (elapsedMs - previousSample.timeMs) / segmentDuration,
  );

  return {
    contactPulse: getMatterContactPulse(trajectory.contacts, elapsedMs),
    x: mix(previousSample.x, nextSample.x, progress),
    y: mix(previousSample.y, nextSample.y, progress),
  };
}

function getMatterContactPulse(
  contacts: readonly PlinkoContactEvent[],
  elapsedMs: number,
) {
  return contacts.reduce(
    (pulse, contact) =>
      Math.max(pulse, Math.max(0, 1 - Math.abs(elapsedMs - contact.timeMs) / 112)),
    0,
  );
}

function evaluateInboundSegment(
  segment: PlinkoMotionSegment,
  localProgress: number,
  contactProgress: number,
): PlinkoPoint {
  const progress = clamp01(localProgress / Math.max(contactProgress, 0.01));
  const fallProgress = easeInQuad(progress);
  const lateralProgress = smoothstep(progress) * 0.78 + progress * 0.22;
  const gravitySag = segment.gravity * 0.14 * progress * progress;

  return {
    x:
      mix(segment.startPoint.x, segment.contactPoint.x, lateralProgress) +
      segment.inboundVelocity.x * 0.018 * progress * (1 - progress),
    y:
      mix(segment.startPoint.y, segment.contactPoint.y, fallProgress) +
      gravitySag,
  };
}

function evaluateOutboundSegment(
  segment: PlinkoMotionSegment,
  localProgress: number,
  contactProgress: number,
): PlinkoPoint {
  const progress = clamp01(
    (localProgress - contactProgress) / Math.max(1 - contactProgress, 0.01),
  );
  const freeX =
    segment.contactPoint.x +
    segment.lateralImpulse *
      0.18 *
      progress *
      (1 - progress * (1 - segment.damping) * 0.22);
  const targetX = mix(
    segment.contactPoint.x,
    segment.endPoint.x,
    easeInOut(progress),
  );
  const correctionWeight = Math.min(
    1,
    smoothstep((progress - 0.16) / 0.84) * segment.correctionStrength +
      smoothstep((progress - 0.84) / 0.16) * 0.34,
  );
  const arcHeight = Math.min(
    Math.abs(segment.lateralImpulse) * 0.08 + segment.gravity * 0.08,
    16,
  );

  return {
    x: mix(freeX, targetX, correctionWeight),
    y:
      mix(segment.contactPoint.y, segment.endPoint.y, easeInQuad(progress)) -
      Math.sin(progress * Math.PI) * arcHeight +
      segment.gravity * 0.12 * progress * progress,
  };
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function easeInQuad(value: number) {
  return value * value;
}

function smoothstep(value: number) {
  const clampedValue = clamp01(value);

  return clampedValue * clampedValue * (3 - 2 * clampedValue);
}

function createBucketGradient(
  GradientCtor: PixiFillGradientConstructor,
  bucketStyle: PlinkoBucketVisualStyle,
) {
  return new GradientCtor({
    colorStops: [
      { offset: 0, color: bucketStyle.highlightColor },
      { offset: 0.46, color: bucketStyle.midColor },
      { offset: 1, color: bucketStyle.darkColor },
    ],
    end: { x: 1, y: 1 },
    start: { x: 0, y: 0 },
    type: "linear",
  });
}

function createDestroyedRenderer(): PlinkoRenderer {
  return {
    destroy: () => undefined,
    resize: () => undefined,
    setOptions: () => undefined,
    visualizeRound: () => undefined,
  };
}
