import type { Application, Graphics, Sprite } from "pixi.js";
import {
  radiusAtS,
  P1_END,
  P3_END,
  SPIN_DURATION_MS,
  R_RIM,
  R_POCKET_OUTER,
} from "./roulette-ball-phases";
import type {
  RouletteRenderer,
  RouletteRendererOptions,
  RouletteRendererSettlementReason,
  RouletteRendererSpin,
} from "./roulette-renderer-types";
import {
  DISC_OMEGA_RAD_PER_MS,
  POCKET_ZERO_INITIAL_ANGLE_RAD,
  pocketAngleRad,
  pocketIndexForNumber,
} from "./roulette-wheel-geometry";

// ── Tail-phase timing (appended after SPIN_DURATION_MS) ─────────────────────────
const DWELL_MS = 750;   // ball dwells visibly in the winning pocket (ms)
const RETURN_MS = 500;  // smoothstep from R_POCKET_OUTER back to R_RIM (ms)

// Angular convergence happens at P3_END (97 % of spin), not at 100 %, so that
// disc co-rotation tracking starts before the radial roll-in completes.
const CONVERGENCE_MS = P3_END * SPIN_DURATION_MS; // 3 880 ms

// ── Bounce-arc constants (C-3 angular redistribution) ───────────────────────────
// The ball covers almost all of its angular alignment while still on the rim
// (phase 1). It descends onto the disc only BOUNCE_POCKET_COUNT pockets before
// the winning pocket, then decelerates angularly across those few pockets with
// decaying forward hops before settling.
//
// BOUNCE_POCKET_COUNT: how many pockets ahead of the winner the ball first touches
// the disc. 4 pockets ≈ 38.9° — large enough for visible deceleration, small
// enough to never look like a fast sweep.
//
// bounceArc = BOUNCE_POCKET_COUNT × POCKET_ARC_RAD ≈ 0.680 rad (absolute, fixed).
// phase1Arc = totalArc − bounceArc (absorbs all arc variability: 1-vs-2-lap delta
// is entirely consumed in the rim phase, not in the bounce/settle).
const BOUNCE_POCKET_COUNT = 4;
const POCKET_ARC_RAD = (2 * Math.PI) / 37; // 9.73° per pocket

// Rim radius as a fraction of canvas height (derived from idle ball CSS top: 5.5 %).
// SYNC REQUIRED: if roulette-wheel-ball.tsx top value changes, update this.
const RIM_HEIGHT_FRACTION = 0.445;

// Disc visual proportions matching the CSS disc layer it replaces.
// SYNC REQUIRED: if roulette-wheel.tsx disc div dimensions change, update these.
const DISC_WIDTH_FRACTION = 0.917;
const DISC_ASPECT = 530 / 519; // height / width

interface CreatePixiRouletteBallRendererOptions extends RouletteRendererOptions {
  container: HTMLElement;
  /** URL of wheel-disc.webp — import the asset in the stage component, pass .src here. */
  discImageUrl: string;
}

interface ActiveSpin {
  spin: RouletteRendererSpin;
  frame: number;
  startBallAngleRad: number;
  /** Pocket's screen angle at t = 0 (trigger). Live angle = pocketScreenAngle0 + DISC_OMEGA × elapsed. */
  pocketScreenAngle0: number;
  /** Angular distance the ball travels in phase 1 (rim lap) — covers almost all of ccwArc. */
  phase1Arc: number;
  /** Angular distance the ball travels in phases 2–3 (bounce onto disc) — fixed ~4 pocket widths. */
  bounceArc: number;
  startTimeMs: number;
}

export async function createPixiRouletteBallRenderer({
  container,
  discImageUrl,
  ...initialOptions
}: CreatePixiRouletteBallRendererOptions): Promise<RouletteRenderer> {
  const { Application, Assets, Graphics, Sprite } = await import("pixi.js");
  const app: Application = new Application();
  let destroyed = false;
  let options: RouletteRendererOptions = initialOptions;

  const view = container.ownerDocument.defaultView ?? window;

  await app.init({
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    resizeTo: container,
  });

  // StrictMode double-effect guard (before Assets.load — no managed texture yet).
  if (destroyed) {
    app.destroy(
      { releaseGlobalResources: false, removeView: true },
      { children: true, texture: false, textureSource: false },
    );
    return createDestroyedRenderer();
  }

  const discTexture = await Assets.load(discImageUrl);

  if (destroyed) {
    // Do NOT call Assets.unload here — the disc texture is a shared, app-lifetime
    // resource in the global Pixi Assets cache. Unloading it would evict the entry
    // for ALL consumers (other overlay mounts, the desktop inline wheel, future spins).
    app.destroy(
      { releaseGlobalResources: false, removeView: true },
      { children: true, texture: false, textureSource: false },
    );
    return createDestroyedRenderer();
  }

  // ── Disc sprite (bottom of Pixi stage) ──────────────────────────────────────
  // Replaces the CSS-animated disc div. Rotates at DISC_OMEGA_RAD_PER_MS continuously.
  const discSprite: Sprite = new Sprite(discTexture);
  discSprite.anchor.set(0.5);
  app.stage.addChild(discSprite);

  // ── Ball graphics (top of Pixi stage) ───────────────────────────────────────
  const ball: Graphics = new Graphics();
  app.stage.addChild(ball);

  app.canvas.style.display = "block";
  app.canvas.style.height = "100%";
  app.canvas.style.inset = "0";
  app.canvas.style.position = "absolute";
  app.canvas.style.width = "100%";
  container.appendChild(app.canvas);

  // Time reference for continuous disc rotation — fixed at factory creation.
  const mountTimeMs = view.performance.now();

  let activeSpin: ActiveSpin | null = null;
  let idleFrameId: number | null = null;

  function rimPx(): number {
    return app.renderer.height * RIM_HEIGHT_FRACTION;
  }

  function repositionDisc(): void {
    const w = app.renderer.width * DISC_WIDTH_FRACTION;
    discSprite.width = w;
    discSprite.height = w * DISC_ASPECT;
    discSprite.x = app.renderer.width / 2;
    discSprite.y = app.renderer.height / 2;
  }

  function discAngleAt(absMs: number): number {
    return DISC_OMEGA_RAD_PER_MS * (absMs - mountTimeMs);
  }

  repositionDisc();

  function drawBall(angleRad: number, radius: number): void {
    const rim = rimPx();
    // 6 CSS px radius — matches the idle CSS ball (12 px diameter).
    // SYNC REQUIRED: if roulette-wheel-ball.tsx width/height changes, update the 6 here.
    const r = 6 * app.renderer.resolution;
    const px = radius * rim;
    const cx = app.renderer.width / 2;
    const cy = app.renderer.height / 2;
    const x = cx + Math.cos(angleRad) * px;
    const y = cy + Math.sin(angleRad) * px;

    ball.clear();
    ball.circle(x + r * 0.2, y + r * 0.3, r * 1.15).fill({ color: 0x000000, alpha: 0.25 });
    ball.circle(x, y, r).fill({ color: 0xf0f0f0 }).stroke({ color: 0x999999, alpha: 0.45, width: 1 });
    ball.circle(x - r * 0.28, y - r * 0.32, r * 0.32).fill({ color: 0xffffff, alpha: 0.92 });
  }

  // ── Idle disc loop — runs whenever no spin is active ────────────────────────
  function runIdleDisc(now: number): void {
    if (destroyed || activeSpin) return;
    discSprite.rotation = discAngleAt(now);
    idleFrameId = view.requestAnimationFrame(runIdleDisc);
  }

  idleFrameId = view.requestAnimationFrame(runIdleDisc);

  function startIdleDisc(): void {
    if (idleFrameId !== null) return;
    idleFrameId = view.requestAnimationFrame(runIdleDisc);
  }

  function stopIdleDisc(): void {
    if (idleFrameId !== null) {
      view.cancelAnimationFrame(idleFrameId);
      idleFrameId = null;
    }
  }

  function cancelActiveSpin(reason: RouletteRendererSettlementReason): void {
    if (!activeSpin) return;
    const spin = activeSpin;
    view.cancelAnimationFrame(spin.frame);
    activeSpin = null;
    ball.clear();
    startIdleDisc();
    options.onSpinSettled?.(spin.spin, reason);
  }

  /**
   * Angular position of the ball at normalised time s ∈ [0, P3_END].
   *
   * Phase 1 (s ≤ P1_END — rim lap):
   *   Linear CCW sweep covering phase1Arc. Almost all of the angular alignment
   *   happens here; the ball finishes phase 1 only ~4 pockets ahead of the winner.
   *
   * Phases 2–3 (P1_END < s ≤ P3_END — bounce onto disc):
   *   Cubic ease-out over bounceArc (~4 pocket widths). Fast initially as the ball
   *   first touches the disc, decelerating to nearly zero at P3_END so the
   *   transition to disc co-rotation is seamless. Forward-only (monotonically CCW).
   *
   * After P3_END the caller switches to live disc tracking; this function is not
   * called for s > P3_END.
   */
  function ballAngleAtS(
    s: number,
    startAngle: number,
    phase1Arc: number,
    bounceArc: number,
  ): number {
    if (s <= P1_END) {
      return startAngle - (s / P1_END) * phase1Arc;
    }
    // Cubic ease-out: f(t) = 1 − (1−t)³  →  f'(1) = 0 (smooth stop at P3_END).
    // Forward-only: eased is monotonically increasing, so angle is monotonically
    // decreasing (CCW). No backward oscillation.
    const t23 = (s - P1_END) / (P3_END - P1_END);
    const eased = 1 - Math.pow(1 - t23, 3);
    return (startAngle - phase1Arc) - eased * bounceArc;
  }

  return {
    clearBall(): void {
      ball.clear();
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      stopIdleDisc();
      if (activeSpin) {
        view.cancelAnimationFrame(activeSpin.frame);
        activeSpin = null;
      }
      ball.clear();
      // Do NOT call Assets.unload — the disc texture is a shared, app-lifetime
      // resource in the global Pixi Assets cache. Unloading it would evict the
      // entry for ALL consumers (repeated overlay spins, StrictMode remount, the
      // desktop inline wheel). Leave it cached; each new mount's Assets.load()
      // returns the cached texture immediately with no re-download.
      // texture/textureSource: false — the TextureSource must also stay alive in
      // the cache, so app.destroy must not cascade-destroy it.
      app.destroy(
        { releaseGlobalResources: false, removeView: true },
        { children: true, texture: false, textureSource: false },
      );
    },

    resize(): void {
      if (destroyed) return;
      // Re-layout only — does NOT cancel an active spin.
      // rimPx() is re-derived from renderer.height on every tick, so the
      // in-flight ball position adapts automatically after resize.
      app.renderer.resize(
        Math.max(container.clientWidth, 1),
        Math.max(container.clientHeight, 1),
      );
      repositionDisc();
    },

    setOptions(nextOptions: RouletteRendererOptions): void {
      options = nextOptions;
    },

    visualizeSpin(spin: RouletteRendererSpin): void {
      if (destroyed) return;
      if (activeSpin) cancelActiveSpin("cancelled");
      stopIdleDisc();

      const pocketIndex = pocketIndexForNumber(spin.result.randomPosition);
      const pocketOffset = pocketAngleRad(pocketIndex);

      // Disc angle at trigger time — read directly from the Pixi sprite.
      const discAngle0 = discSprite.rotation;

      // Pocket screen angle at trigger time (t = 0). Advances CCW at DISC_OMEGA.
      const pocketScreenAngle0 =
        POCKET_ZERO_INITIAL_ANGLE_RAD + discAngle0 + pocketOffset;

      // Pocket's live screen angle at angular convergence (s = P3_END = 3 880 ms).
      const livePocketAtConvergence =
        pocketScreenAngle0 + DISC_OMEGA_RAD_PER_MS * CONVERGENCE_MS;

      const startBallAngleRad = spin.startBallAngleRad;
      const TWO_PI = 2 * Math.PI;

      // Full CCW arc from ball start to the convergence pocket position.
      // Guaranteed ≥ 2π so the ball completes at least one full rim lap.
      const ccwArcToConvergence =
        ((startBallAngleRad - livePocketAtConvergence) % TWO_PI + TWO_PI) % TWO_PI;
      const ccwArc = TWO_PI + ccwArcToConvergence;

      // ── C-3 arc split ────────────────────────────────────────────────────────
      // bounceArc is FIXED (absolute angular distance, ~4 pocket widths ≈ 38.9°).
      // phase1Arc absorbs all arc variability — whether the total spin is 1 or 2
      // revolutions, the bounce phase always covers the same small angle, so
      // the bounce speed is always natural and never a fast lateral sweep.
      const bounceArc = BOUNCE_POCKET_COUNT * POCKET_ARC_RAD; // ≈ 0.680 rad
      const phase1Arc = ccwArc - bounceArc; // always > 0 because ccwArc ≥ 2π > bounceArc

      const startTimeMs = view.performance.now();

      const tick = (now: number): void => {
        if (destroyed) return;
        const current = activeSpin;
        if (!current) return;

        const elapsedMs = Math.max(now - current.startTimeMs, 0);

        // Update disc sprite every frame (spin and tail phases).
        discSprite.rotation = discAngleAt(now);

        // Live pocket angle: tracks disc continuously.
        const livePocketNow =
          current.pocketScreenAngle0 + DISC_OMEGA_RAD_PER_MS * elapsedMs;

        // ── Active spin (0 → SPIN_DURATION_MS) ──────────────────────────────
        if (elapsedMs < SPIN_DURATION_MS) {
          const s = Math.max(0, elapsedMs / SPIN_DURATION_MS);
          const radius = radiusAtS(s);

          const angleRad =
            s <= P3_END
              ? ballAngleAtS(s, current.startBallAngleRad, current.phase1Arc, current.bounceArc)
              : livePocketNow; // phase 4: purely radial, co-rotate with disc

          drawBall(angleRad, radius);
          current.frame = view.requestAnimationFrame(tick);
          return;
        }

        const tailMs = elapsedMs - SPIN_DURATION_MS;

        // ── Tail: dwell in pocket — co-rotates with disc ─────────────────────
        if (tailMs < DWELL_MS) {
          drawBall(livePocketNow, R_POCKET_OUTER);
          current.frame = view.requestAnimationFrame(tick);
          return;
        }

        // Mobile/overlay path: skip return-to-rim tail; settle right after dwell.
        if (options.skipReturnTail) {
          ball.clear();
          const completedSpin: RouletteRendererSpin = {
            ...current.spin,
            exitBallAngleRad: livePocketNow,
          };
          activeSpin = null;
          startIdleDisc();
          options.onSpinSettled?.(completedSpin, "visual");
          return;
        }

        // ── Tail: return to rim — still co-rotating ──────────────────────────
        const returnMs = tailMs - DWELL_MS;
        if (returnMs < RETURN_MS) {
          const t = returnMs / RETURN_MS;
          const tSmooth = t * t * (3 - 2 * t);
          const radius = R_POCKET_OUTER + (R_RIM - R_POCKET_OUTER) * tSmooth;
          drawBall(livePocketNow, radius);
          current.frame = view.requestAnimationFrame(tick);
          return;
        }

        // ── Tail complete: hand off to CSS idle orbit ────────────────────────
        // exitBallAngleRad is the live pocket angle at this exact moment so the
        // CSS orbit seamlessly resumes at the ball's current rim position.
        ball.clear();
        const completedSpin: RouletteRendererSpin = {
          ...current.spin,
          exitBallAngleRad: livePocketNow,
        };
        activeSpin = null;
        startIdleDisc();
        options.onSpinSettled?.(completedSpin, "visual");
      };

      activeSpin = {
        spin,
        frame: view.requestAnimationFrame(tick),
        startBallAngleRad,
        pocketScreenAngle0,
        phase1Arc,
        bounceArc,
        startTimeMs,
      };
    },
  };
}

function createDestroyedRenderer(): RouletteRenderer {
  return {
    clearBall: () => undefined,
    destroy: () => undefined,
    resize: () => undefined,
    setOptions: () => undefined,
    visualizeSpin: () => undefined,
  };
}
