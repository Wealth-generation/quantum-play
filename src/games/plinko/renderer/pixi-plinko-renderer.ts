import type { Application, Container, Graphics } from "pixi.js";
import {
  getPlinkoBucketStyle,
  type PlinkoBucketVisualStyle,
} from "../lib/plinko-bucket-style";
import { formatPlinkoMultiplier } from "../lib/plinko-format";
import type { PlinkoBucketImpact } from "../lib/plinko-motion-plan";
import {
  createPlinkoBoardGeometry,
  type PlinkoBoardGeometry,
  type PlinkoBucketGeometry,
  type PlinkoPegGeometry,
  type PlinkoPoint,
} from "../lib/plinko-path";
import type {
  PlinkoPlaybackCancellationReason,
  PlinkoPlaybackFailureReason,
  PlinkoPlaybackLifecycleEvent,
  PlinkoRenderer,
  PlinkoRendererEnqueueResult,
  PlinkoRendererOptions,
  PlinkoRendererRound,
  PlinkoRendererSettlementReason,
} from "./plinko-renderer-types";
import type {
  PlinkoBounceContact,
  PlinkoBounceTrajectoryResult,
} from "./plinko-bounce-playback-types";
import {
  resolvePlinkoPlaybackTrajectory,
  type PlinkoPlaybackSourceSelection,
} from "./plinko-playback-trajectory-resolver";

interface CreatePixiPlinkoRendererOptions extends PlinkoRendererOptions {
  container: HTMLElement;
}

interface ActivePixiAnimation {
  context: PlaybackContext;
  frame: number;
}

interface PendingPixiPlayback {
  context: PlaybackContext;
  token: symbol;
}

interface PlaybackContext {
  playbackId: string;
  retryCount: number;
  round: PlinkoRendererRound;
  selection: PlinkoPlaybackSourceSelection | null;
}

interface EvaluatedTrajectoryFrame extends PlinkoPoint {
  contact: PlinkoBounceContact | null;
  contactPulse: number;
  elapsedMs: number;
  velocity: PlinkoPoint;
}

type PixiFillGradientConstructor = new (options: {
  colorStops: Array<{ offset: number; color: number }>;
  end: { x: number; y: number };
  start: { x: number; y: number };
  type: "linear";
}) => unknown;

const MAX_ACTIVE_EFFECTS = 42;
const MAX_INTERNAL_RESIZE_RETRIES = 1;
const PLINKO_NORMAL_REPLAY_SPEED_MULTIPLIER = 0.75;
const PLINKO_TURBO_REPLAY_SPEED_MULTIPLIER = 1;

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
  let geometryRevision = 0;
  let playbackSequence = 0;
  const activeAnimations = new Map<string, ActivePixiAnimation>();
  const pendingPlaybacks = new Map<symbol, PendingPixiPlayback>();
  const playbackContexts = new Map<string, PlaybackContext>();
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
  const pegLayer: Container = new Container();
  const effectsLayer: Container = new Container();
  const ballLayer: Container = new Container();
  const pegViews = new Map<string, Graphics>();
  const pegResponseTimeouts = new Map<
    Graphics,
    Set<ReturnType<typeof setTimeout>>
  >();

  root.addChild(boardLayer, pegLayer, effectsLayer, ballLayer);
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

    for (const [peg, timeouts] of pegResponseTimeouts) {
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
      peg.scale.set(1);
      peg.alpha = 1;
    }

    pegResponseTimeouts.clear();
  }

  function emitPlaybackLifecycle(
    context: PlaybackContext,
    phase: PlinkoPlaybackLifecycleEvent["phase"],
    {
      cancellationReason = null,
      failureReason = null,
      selection = context.selection,
      terminal = false,
    }: {
      cancellationReason?: PlinkoPlaybackCancellationReason | null;
      failureReason?: PlinkoPlaybackFailureReason | null;
      selection?: PlinkoPlaybackSourceSelection | null;
      terminal?: boolean;
    } = {},
  ) {
    const event: PlinkoPlaybackLifecycleEvent = {
      backendBetId: context.round.result.betId,
      cancellationReason,
      elapsedSinceAcceptedMs: Math.max(
        Date.now() - context.round.acceptedAt,
        0,
      ),
      failureReason,
      geometryRevision: geometry ? geometryRevision : null,
      phase,
      playbackId: context.playbackId,
      retryCount: context.retryCount,
      roundId: context.round.id,
      rowsCount: context.round.result.rowsCount,
      risk: context.round.result.risk,
      selection,
      targetBucket: selection?.targetBucket ?? context.round.result.bucketIndex,
      terminal,
      turboEnabled: options.turboEnabled === true,
    };

    options.onPlaybackLifecycle?.(event);

    if (process.env.NODE_ENV === "development") {
      console.debug(`[Plinko playback:${event.playbackId}] ${phase}`, event);
    }
  }

  function finishPlaybackContext(context: PlaybackContext) {
    playbackContexts.delete(context.round.id);
  }

  function startPlaybackContext(context: PlaybackContext) {
    void startRoundAnimation(context).catch(() => {
      if (playbackContexts.get(context.round.id) !== context) {
        return;
      }

      for (const [token, pendingPlayback] of pendingPlaybacks) {
        if (pendingPlayback.context === context) {
          finishPendingPlayback(token);
        }
      }

      emitPlaybackLifecycle(context, "start-failed", {
        failureReason: "production-playback-unexpected-error",
        terminal: true,
      });
      finishPlaybackContext(context);
      options.onRoundSettled?.(context.round, "fallback");
    });
  }

  function cancelAnimation({
    cancellationReason,
    settleExternal = cancellationReason !== "teardown",
  }: {
    cancellationReason: PlinkoPlaybackCancellationReason;
    settleExternal?: boolean;
  }): PlaybackContext[] {
    const cancelled = new Map<string, PlaybackContext>();

    for (const pendingPlayback of pendingPlaybacks.values()) {
      cancelled.set(
        pendingPlayback.context.playbackId,
        pendingPlayback.context,
      );
    }

    pendingPlaybacks.clear();

    for (const activeAnimation of activeAnimations.values()) {
      cancelAnimationFrame(activeAnimation.frame);
      cancelled.set(
        activeAnimation.context.playbackId,
        activeAnimation.context,
      );
    }

    activeAnimations.clear();
    clearEffectTimeouts();
    clearLayer(ballLayer);
    clearLayer(effectsLayer);

    const resizeRetries: PlaybackContext[] = [];

    for (const context of cancelled.values()) {
      if (
        cancellationReason === "resize" &&
        context.retryCount < MAX_INTERNAL_RESIZE_RETRIES
      ) {
        context.retryCount += 1;
        emitPlaybackLifecycle(context, "cancelled", {
          cancellationReason,
        });
        resizeRetries.push(context);
        continue;
      }

      const terminalCancellationReason =
        cancellationReason === "resize"
          ? "resize-retry-exhausted"
          : cancellationReason;
      emitPlaybackLifecycle(context, "cancelled", {
        cancellationReason: terminalCancellationReason,
        failureReason:
          terminalCancellationReason === "resize-retry-exhausted"
            ? "resize-retry-exhausted"
            : null,
        terminal: true,
      });
      finishPlaybackContext(context);

      if (settleExternal) {
        options.onRoundSettled?.(context.round, "cancelled");
      }
    }

    return resizeRetries;
  }

  function drawBoard() {
    clearLayer(boardLayer);
    clearLayer(pegLayer);
    pegViews.clear();
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
    geometryRevision += 1;

    const graphics: Graphics = new Graphics();

    for (const pegRow of geometry.pegRows) {
      for (const peg of pegRow) {
        drawPeg(peg, geometry.pegRadius);
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

    for (const bucket of geometry.buckets.slice(0, -1)) {
      const dividerX = bucket.x + bucket.width + geometry.bucketGap * 0.5;

      graphics
        .rect(
          dividerX - geometry.pocketDividerThickness * 0.5,
          geometry.pocketEntryY,
          geometry.pocketDividerThickness,
          geometry.pocketFloorY - geometry.pocketEntryY,
        )
        .fill({ color: 0x08110d, alpha: 0.72 });
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

  function drawPeg(peg: PlinkoPegGeometry, radius: number) {
    const view = new Graphics();

    view
      .circle(0, 0, radius)
      .stroke({ width: Math.max(Math.min(radius * 0.42, 2), 0.9), color: 0x607083, alpha: 0.94 })
      .circle(0, 0, Math.max(radius * 0.5, 0.8))
      .fill({ color: 0x101823, alpha: 0.62 });
    view.position.set(peg.x, peg.y);
    pegViews.set(getPegKey(peg), view);
    pegLayer.addChild(view);
  }

  async function startRoundAnimation(context: PlaybackContext) {
    const { round } = context;
    const playbackToken = Symbol(context.playbackId);
    pendingPlaybacks.set(playbackToken, { context, token: playbackToken });
    emitPlaybackLifecycle(context, "queued");

    if (!geometry) {
      drawBoard();
    }

    if (!geometry) {
      finishPendingPlayback(playbackToken);
      emitPlaybackLifecycle(context, "start-failed", {
        failureReason: "board-geometry-missing",
        terminal: true,
      });
      finishPlaybackContext(context);
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    const activeGeometry = geometry;
    let playbackResolution;

    try {
      playbackResolution = await resolvePlinkoPlaybackTrajectory({
        geometry: activeGeometry,
        round,
        turboEnabled: options.turboEnabled,
      });
    } catch {
      if (!isPendingPlayback(context, playbackToken)) {
        return;
      }

      finishPendingPlayback(playbackToken);
      emitPlaybackLifecycle(context, "start-failed", {
        failureReason: "production-resolver-unexpected-error",
        terminal: true,
      });
      finishPlaybackContext(context);
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    if (!isPendingPlayback(context, playbackToken)) {
      return;
    }

    context.selection = playbackResolution.selection;
    emitPlaybackLifecycle(context, "simulated");

    if (playbackResolution.kind === "production-bounce-core") {
      finishPendingPlayback(playbackToken);
      startMatterTrajectoryAnimation(context, activeGeometry, playbackResolution.trajectory);
      return;
    }

    finishPendingPlayback(playbackToken);
    emitPlaybackLifecycle(context, "no-valid", {
      failureReason: playbackResolution.selection.failureReason,
      terminal: true,
    });
    finishPlaybackContext(context);
    // Keep accepted-round settlement behavior intact. No legacy path is used.
    options.onRoundSettled?.(round, "fallback");
  }

  function finishPendingPlayback(token: symbol) {
    pendingPlaybacks.delete(token);
  }

  function isPendingPlayback(context: PlaybackContext, token: symbol) {
    return !destroyed && pendingPlaybacks.get(token)?.context === context;
  }

  function startMatterTrajectoryAnimation(
    context: PlaybackContext,
    activeGeometry: PlinkoBoardGeometry,
    trajectory: PlinkoBounceTrajectoryResult,
  ) {
    const { round } = context;
    const bucketImpact = trajectory.bucketImpact;

    if (!bucketImpact) {
      emitPlaybackLifecycle(context, "start-failed", {
        failureReason: "trajectory-bucket-impact-missing",
        terminal: true,
      });
      finishPlaybackContext(context);
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    const ball = new Graphics();
    const firedContactIds = new Set<string>();
    const view = container.ownerDocument.defaultView ?? window;
    const startTime = view.performance.now();
    const replaySpeedMultiplier = getReplaySpeedMultiplier(options);
    let bucketImpactFired = false;
    let completed = false;
    const initialSample = trajectory.samples[0];

    try {
      drawBall(
        ball,
        {
          contact: null,
          contactPulse: 0,
          elapsedMs: 0,
          velocity: initialSample?.velocity ?? { x: 0, y: 0 },
          x: initialSample?.x ?? activeGeometry.startPoint.x,
          y: initialSample?.y ?? activeGeometry.startPoint.y,
        },
        activeGeometry,
      );
      ballLayer.addChild(ball);
    } catch {
      ball.destroy();
      emitPlaybackLifecycle(context, "start-failed", {
        failureReason: "pixi-ball-start-failed",
        terminal: true,
      });
      finishPlaybackContext(context);
      options.onRoundSettled?.(round, "fallback");
      return;
    }

    emitPlaybackLifecycle(context, "started");

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
      activeAnimations.delete(context.playbackId);

      if (flashBucket && !bucketImpactFired) {
        drawBucketHitFlash(Graphics, bucketImpact);
      }

      emitPlaybackLifecycle(
        context,
        reason === "visual" ? "completed" : "playback-failed",
        {
          failureReason:
            reason === "visual" ? null : "pixi-playback-render-failed",
          terminal: true,
        },
      );
      finishPlaybackContext(context);
      options.onRoundSettled?.(round, reason);
      ball.destroy();
    };

    const tick = (time: number) => {
      if (destroyed) {
        return;
      }

      const elapsedMs = Math.max(time - startTime, 0) * replaySpeedMultiplier;

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
        drawBall(ball, frame, activeGeometry);
      } catch {
        completeAnimation({ flashBucket: false, reason: "fallback" });
        return;
      }

      if (elapsedMs < trajectory.durationMs) {
        const nextFrame = view.requestAnimationFrame(tick);
        activeAnimations.set(context.playbackId, {
          context,
          frame: nextFrame,
        });
        return;
      }

      completeAnimation({ flashBucket: !bucketImpactFired, reason: "visual" });
    };

    activeAnimations.set(context.playbackId, {
      context,
      frame: view.requestAnimationFrame(tick),
    });
  }

  function firePendingContactEffects(
    GraphicsCtor: typeof Graphics,
    contacts: readonly PlinkoBounceContact[],
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
    contact: PlinkoBounceContact,
  ) {
    const pulse = new GraphicsCtor();
    const peg = contact.peg;
    const ringAlpha = Math.min(0.82, 0.38 + contact.impactStrength * 0.42);
    const responseDurationMs = getPegResponseDuration(contact);

    pulse
      .circle(peg.x, peg.y, contact.pulseRadius)
      .stroke({
        width: 1.6 + contact.impactStrength * 1.4,
        color: 0x8dffbd,
        alpha: ringAlpha,
      })
      .circle(peg.x, peg.y, contact.pulseRadius * 0.46)
      .stroke({ width: 1.4, color: 0xf4fff8, alpha: ringAlpha * 0.78 })
      .circle(peg.x, peg.y, Math.max(contact.pulseRadius * 0.18, 1.6))
      .fill({ color: 0xd9fff0, alpha: 0.2 + contact.impactStrength * 0.18 });
    scheduleEffectDestroy(pulse, Math.min(responseDurationMs, 220));
    animatePegResponse(peg, contact);
    drawNeighborPegResponse(GraphicsCtor, peg, contact);
  }

  function animatePegResponse(
    peg: PlinkoPegGeometry,
    contact: PlinkoBounceContact,
  ) {
    const view = pegViews.get(getPegKey(peg));

    if (!view) {
      return;
    }

    const existingTimeouts = pegResponseTimeouts.get(view);

    if (existingTimeouts) {
      for (const timeout of existingTimeouts) {
        clearTimeout(timeout);
      }
    }

    const scale = getPegResponseScale(contact);
    const durationMs = getPegResponseDuration(contact);

    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const schedule = (callback: () => void, delayMs: number) => {
      const timeout = setTimeout(() => {
        timeouts.delete(timeout);
        callback();
      }, delayMs);

      timeouts.add(timeout);
    };

    view.scale.set(scale);
    view.alpha = Math.min(1, 0.9 + contact.impactStrength * 0.16);
    schedule(() => {
      view.scale.set(1.04);
    }, Math.round(durationMs * 0.38));
    schedule(() => {
      view.scale.set(1);
      view.alpha = 1;
      pegResponseTimeouts.delete(view);
    }, durationMs);

    pegResponseTimeouts.set(view, timeouts);
  }

  function drawNeighborPegResponse(
    GraphicsCtor: typeof Graphics,
    peg: PlinkoPegGeometry,
    contact: PlinkoBounceContact,
  ) {
    if (!geometry || contact.impactStrength < 0.28) {
      return;
    }

    const activeGeometry = geometry;
    const neighbors = activeGeometry.pegRows
      .flat()
      .filter((candidate) => candidate !== peg)
      .map((candidate) => ({
        candidate,
        distance: Math.hypot(candidate.x - peg.x, candidate.y - peg.y),
      }))
      .filter(({ distance }) => distance <= activeGeometry.laneSpacing * 1.18)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 3);

    for (const { candidate, distance } of neighbors) {
      const strength =
        contact.impactStrength *
        Math.max(0.22, 1 - distance / (activeGeometry.laneSpacing * 1.34));
      const response = new GraphicsCtor();

      response
        .circle(
          candidate.x,
          candidate.y,
          activeGeometry.pegRadius * (1.18 + strength * 0.38),
        )
        .stroke({ width: 1.1, color: 0x74f7a8, alpha: strength * 0.34 });
      scheduleEffectDestroy(response, Math.round(78 + strength * 88));
    }
  }

  function getPegResponseScale(contact: PlinkoBounceContact) {
    return Math.min(1.3, contact.responseScale);
  }

  function getPegResponseDuration(contact: PlinkoBounceContact) {
    return Math.min(220, contact.responseDurationMs + (contact.microStallMs ?? 0));
  }

  function drawBucketHitFlash(
    GraphicsCtor: typeof Graphics,
    impact: PlinkoBucketImpact,
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
      cancelAnimation({
        cancellationReason: "teardown",
        settleExternal: false,
      });
      app.destroy(
        { releaseGlobalResources: false, removeView: true },
        { children: true, texture: true, textureSource: true },
      );
    },
    resize: () => {
      if (!destroyed) {
        const resizeRetries = cancelAnimation({
          cancellationReason: "resize",
        });
        app.renderer.resize(
          Math.max(container.clientWidth, 1),
          Math.max(container.clientHeight, 1),
        );
        drawBoard();

        for (const context of resizeRetries) {
          context.selection = null;
          startPlaybackContext(context);
        }
      }
    },
    setOptions: (nextOptions) => {
      const shouldRedraw = boardChanged(options.board, nextOptions.board);

      options = nextOptions;

      if (shouldRedraw) {
        cancelAnimation({ cancellationReason: "board-change" });
        drawBoard();
      }
    },
    visualizeRound: (round: PlinkoRendererRound): PlinkoRendererEnqueueResult => {
      if (destroyed) {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[Plinko playback:plinko-playback-rejected-${round.id}] renderer-enqueue-rejected`,
            {
              backendBetId: round.result.betId,
              elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
              failureReason: "renderer-destroyed",
              roundId: round.id,
            },
          );
        }

        return {
          playbackId: null,
          reason: "renderer-destroyed",
          retryable: false,
          status: "rejected",
        };
      }

      const activeContext = playbackContexts.get(round.id);

      if (activeContext) {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[Plinko playback:${activeContext.playbackId}] renderer-enqueue-rejected`,
            {
              backendBetId: round.result.betId,
              elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
              failureReason: "renderer-duplicate-already-active",
              playbackId: activeContext.playbackId,
              roundId: round.id,
            },
          );
        }

        return {
          playbackId: activeContext.playbackId,
          reason: "renderer-duplicate-already-active",
          retryable: false,
          status: "already-active",
        };
      }

      if (!geometry || !options.board) {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[Plinko playback:plinko-playback-pending-${round.id}] renderer-enqueue-rejected`,
            {
              backendBetId: round.result.betId,
              elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
              failureReason: "board-geometry-missing",
              roundId: round.id,
            },
          );
        }

        return {
          playbackId: null,
          reason: "board-geometry-missing",
          retryable: true,
          status: "not-ready",
        };
      }

      const context: PlaybackContext = {
        playbackId: `plinko-playback-${++playbackSequence}-${round.id}`,
        retryCount: 0,
        round,
        selection: null,
      };
      playbackContexts.set(round.id, context);
      emitPlaybackLifecycle(context, "accepted");
      startPlaybackContext(context);

      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[Plinko playback:${context.playbackId}] renderer-enqueue-accepted`,
          {
            backendBetId: round.result.betId,
            elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
            playbackId: context.playbackId,
            roundId: round.id,
          },
        );
      }

      return {
        playbackId: context.playbackId,
        reason: null,
        retryable: false,
        status: "accepted",
      };
    },
  };
}

function drawBall(
  ball: Graphics,
  frame: EvaluatedTrajectoryFrame,
  geometry: PlinkoBoardGeometry,
) {
  const speed = Math.hypot(frame.velocity.x, frame.velocity.y);
  const normalizedSpeed = clamp01(speed / Math.max(geometry.laneSpacing * 0.72, 1));
  const contactNormal = frame.contact?.normal ?? getVelocityNormal(frame.velocity);
  const contactAngle = Math.atan2(contactNormal.y, contactNormal.x);
  const compression = frame.contactPulse * 0.18;
  const travelStretch = normalizedSpeed * (1 - frame.contactPulse) * 0.07;
  const radiusX =
    geometry.ballRadius * Math.max(0.78, 1 - compression + travelStretch * 0.3);
  const radiusY =
    geometry.ballRadius * (1 + compression * 0.84 + travelStretch);
  const haloAlpha = 0.08 + normalizedSpeed * 0.08;
  const spin = frame.elapsedMs * 0.014 + frame.velocity.x * 0.12;

  ball.clear();
  ball.position.set(frame.x, frame.y);
  ball.rotation = contactAngle;

  ball
    .circle(0, 0, geometry.ballHaloRadius)
    .fill({ color: 0x54f59b, alpha: haloAlpha });

  if (frame.contactPulse > 0.02) {
    ball
      .circle(0, 0, geometry.ballImpactHaloRadius)
      .stroke({
        width: 1.2 + frame.contactPulse,
        color: 0x96ffc0,
        alpha: Math.min(0.62, frame.contactPulse * 0.54),
      });
  }

  ball
    .ellipse(0, 0, radiusX, radiusY)
    .fill({ color: 0xe8fff1, alpha: 1 })
    .stroke({
      width: 1.25,
      color: 0x2ddc78,
      alpha: 0.86 + frame.contactPulse * 0.12,
    })
    .ellipse(
      Math.cos(spin) * radiusX * 0.24,
      -radiusY * 0.32 + Math.sin(spin) * radiusY * 0.1,
      radiusX * 0.24,
      radiusY * 0.16,
    )
    .fill({ color: 0xffffff, alpha: 0.78 });
}

function getReplaySpeedMultiplier(options: PlinkoRendererOptions) {
  return options.turboEnabled
    ? PLINKO_TURBO_REPLAY_SPEED_MULTIPLIER
    : PLINKO_NORMAL_REPLAY_SPEED_MULTIPLIER;
}

function evaluateMatterTrajectory(
  trajectory: PlinkoBounceTrajectoryResult,
  elapsedMs: number,
): EvaluatedTrajectoryFrame {
  const samples = trajectory.samples;
  const lastSample = samples[samples.length - 1];

  if (!lastSample) {
    throw new Error("Matter Plinko trajectory had no samples.");
  }

  if (elapsedMs >= lastSample.timeMs) {
    return {
      contact: getActiveContact(trajectory.contacts, elapsedMs),
      contactPulse: getMatterContactPulse(trajectory.contacts, elapsedMs),
      elapsedMs,
      velocity: lastSample.velocity,
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
  const rawProgress = clamp01(
    (elapsedMs - previousSample.timeMs) / segmentDuration,
  );
  return {
    contact: getActiveContact(trajectory.contacts, elapsedMs),
    contactPulse: getMatterContactPulse(trajectory.contacts, elapsedMs),
    elapsedMs,
    velocity: {
      x: mix(previousSample.velocity.x, nextSample.velocity.x, rawProgress),
      y: mix(previousSample.velocity.y, nextSample.velocity.y, rawProgress),
    },
    x: mix(previousSample.x, nextSample.x, rawProgress),
    y: mix(previousSample.y, nextSample.y, rawProgress),
  };
}

function getMatterContactPulse(
  contacts: readonly PlinkoBounceContact[],
  elapsedMs: number,
) {
  return contacts.reduce(
    (pulse, contact) => {
      const durationMs = Math.max(112, contact.responseDurationMs);
      const strength = contact.isGlancing
        ? contact.impactStrength * 0.55
        : contact.impactStrength;

      return Math.max(
        pulse,
        Math.max(0, 1 - Math.abs(elapsedMs - contact.timeMs) / durationMs) * strength,
      );
    },
    0,
  );
}

function getActiveContact(
  contacts: readonly PlinkoBounceContact[],
  elapsedMs: number,
) {
  return contacts.find(
    (contact) => Math.abs(elapsedMs - contact.timeMs) <= contact.responseDurationMs,
  ) ?? null;
}

function getVelocityNormal(velocity: PlinkoPoint) {
  const velocityLength = Math.hypot(velocity.x, velocity.y);

  if (velocityLength < 0.001) {
    return { x: 0, y: 1 };
  }

  return { x: velocity.x / velocityLength, y: velocity.y / velocityLength };
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
    visualizeRound: () => ({
      playbackId: null,
      reason: "renderer-destroyed",
      retryable: false,
      status: "rejected",
    }),
  };
}

function getPegKey(peg: PlinkoPegGeometry) {
  return `${peg.row}:${peg.index}`;
}
