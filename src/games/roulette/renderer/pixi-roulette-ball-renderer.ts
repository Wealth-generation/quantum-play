import type { Application, Graphics, Sprite } from "pixi.js";
import { SPIN_DURATION_MS } from "./roulette-ball-phases";
import type {
  RouletteRenderer,
  RouletteRendererOptions,
  RouletteRendererSettlementReason,
  RouletteRendererSpin,
} from "./roulette-renderer-types";
import {
  DISC_OMEGA_RAD_PER_MS,
  pocketIndexForNumber,
} from "./roulette-wheel-geometry";
import {
  getSpinBallState,
  getIdleBallState,
  FOLLOW_DURATION_MS,
  SPRITE_ZERO_OFFSET_DEG,
  R_INNER,
  R_OUTER,
} from "../lib/roulette-ball-motion";
import type { SpinContext } from "../lib/roulette-ball-motion";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Wheel idle speed in deg/s, derived from the CSS disc animation (24 s/rev CCW).
// SYNC REQUIRED: if the roulette-disc-ccw animation-duration in globals.css changes,
// update DISC_OMEGA_RAD_PER_MS in roulette-wheel-geometry.ts; this value auto-follows.
const IDLE_DEG_PER_SEC = DISC_OMEGA_RAD_PER_MS * 1_000 * RAD_TO_DEG; // ≈ −15 °/s

// Disc visual proportions matching the CSS disc layer it replaces.
// SYNC REQUIRED: if roulette-wheel.tsx disc div dimensions change, update these.
const DISC_WIDTH_FRACTION = 0.917;
const DISC_ASPECT = 530 / 519; // height / width

// Maximum frame delta fed to the idle integrator.
// Caps the jump caused by tab-backgrounding or long GC pauses.
const MAX_IDLE_DT_MS = 100;

interface CreatePixiRouletteBallRendererOptions extends RouletteRendererOptions {
  container: HTMLElement;
  /** URL of wheel-disc.webp — import the asset in the stage component, pass .src here. */
  discImageUrl: string;
}

interface ActiveSpin {
  spin: RouletteRendererSpin;
  frame: number;
  spinCtx: SpinContext;
  /** Ball screen angle (deg) at raw = 1.0 — pre-computed at spin trigger. */
  finalBallAngleDeg: number;
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

  // ── Persistent idle ball state ───────────────────────────────────────────────
  // The idle integrator owns these across all frames (idle + follow + free-idle).
  // Seeded at mount; re-seeded from spin final state when each spin ends.
  let ballAngleDeg:     number = SPRITE_ZERO_OFFSET_DEG; // start at 12 o'clock
  let ballRadiusRatio:  number = R_OUTER;
  // Absolute timestamp (ms) when the post-spin follow window ends.
  // -Infinity means no follow window is active (free idle).
  let followWindowEndMs: number = -Infinity;
  // Last frame timestamp used by the idle integrator; NaN forces dt=0 on the first frame
  // after a seed (prevents large dt jumps from spin-duration gaps).
  let lastIdleNowMs: number = NaN;

  let activeSpin:  ActiveSpin | null = null;
  let idleFrameId: number | null = null;

  /** Wheel radius in pixels: half of the smaller canvas dimension. */
  function wheelRadiusPx(): number {
    return Math.min(app.renderer.width, app.renderer.height) / 2;
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

  /**
   * Render the ball at a polar position.
   * angleDeg: screen angle in degrees (0° = 3 o'clock, increases CW).
   * radiusRatio: fraction of wheelRadiusPx().
   */
  function drawBall(angleDeg: number, radiusRatio: number): void {
    const R = wheelRadiusPx();
    const px = radiusRatio * R;
    const angleRad = angleDeg * DEG_TO_RAD;
    // 6 CSS px radius — matches the retired CSS ball (12 px diameter).
    const r = 6 * app.renderer.resolution;
    const cx = app.renderer.width / 2;
    const cy = app.renderer.height / 2;
    const x = cx + Math.cos(angleRad) * px;
    const y = cy + Math.sin(angleRad) * px;

    ball.clear();
    ball.circle(x + r * 0.2, y + r * 0.3, r * 1.15).fill({ color: 0x000000, alpha: 0.25 });
    ball.circle(x, y, r).fill({ color: 0xf0f0f0 }).stroke({ color: 0x999999, alpha: 0.45, width: 1 });
    ball.circle(x - r * 0.28, y - r * 0.32, r * 0.32).fill({ color: 0xffffff, alpha: 0.92 });
  }

  // ── Idle ball loop ───────────────────────────────────────────────────────────
  // Runs whenever no spin is active. Advances the stateful integrator each frame
  // and draws both the disc and the ball, covering idle + post-spin follow/return.
  function runIdleBall(now: number): void {
    if (destroyed || activeSpin) return;

    discSprite.rotation = discAngleAt(now);

    const dtMs = isNaN(lastIdleNowMs) ? 0 : Math.min(now - lastIdleNowMs, MAX_IDLE_DT_MS);
    lastIdleNowMs = now;

    const discDeltaDeg  = IDLE_DEG_PER_SEC * (dtMs / 1_000);
    const inFollowWindow = now < followWindowEndMs;

    const next = getIdleBallState({
      prevAngleDeg:    ballAngleDeg,
      prevRadiusRatio: ballRadiusRatio,
      dtMs,
      idleDegPerSec:   IDLE_DEG_PER_SEC,
      discDeltaDeg,
      inFollowWindow,
    });
    ballAngleDeg    = next.angleDeg;
    ballRadiusRatio = next.radiusRatio;

    drawBall(ballAngleDeg, ballRadiusRatio);
    idleFrameId = view.requestAnimationFrame(runIdleBall);
  }

  // Start idle immediately so the ball is visible from mount.
  idleFrameId = view.requestAnimationFrame(runIdleBall);

  function startIdleBall(): void {
    if (idleFrameId !== null) return;
    idleFrameId = view.requestAnimationFrame(runIdleBall);
  }

  function stopIdleBall(): void {
    if (idleFrameId !== null) {
      view.cancelAnimationFrame(idleFrameId);
      idleFrameId = null;
    }
  }

  function cancelActiveSpin(reason: RouletteRendererSettlementReason): void {
    if (!activeSpin) return;
    const spin = activeSpin;
    view.cancelAnimationFrame(spin.frame);

    // Seed idle from wherever the spin was interrupted — no home snap.
    const elapsedMs = Math.max(view.performance.now() - spin.startTimeMs, 0);
    const raw = Math.min(1, elapsedMs / SPIN_DURATION_MS);
    const { angleDeg, radiusRatio } = getSpinBallState(raw, spin.spinCtx);
    ballAngleDeg    = angleDeg;
    ballRadiusRatio = radiusRatio;
    followWindowEndMs = -Infinity; // skip follow window; go straight to free idle
    lastIdleNowMs = NaN;

    activeSpin = null;
    startIdleBall();
    options.onSpinSettled?.(spin.spin, reason);
  }

  return {
    clearBall(): void {
      // No-op: the Pixi idle ball is continuous; clearing it would cause a one-frame
      // flicker before runIdleBall redraws on the next rAF. Let it run.
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      stopIdleBall();
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
      app.destroy(
        { releaseGlobalResources: false, removeView: true },
        { children: true, texture: false, textureSource: false },
      );
    },

    resize(): void {
      if (destroyed) return;
      // Re-layout only — does NOT cancel an active spin.
      // wheelRadiusPx() and discAngleAt() are re-derived on every tick.
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
      stopIdleBall();

      // Use the Pixi-owned ballAngleDeg as the start angle — the CSS orbit is retired,
      // so spin.startBallAngleRad (read from the CSS orbit's transform) is not used.
      const cellIndex       = pocketIndexForNumber(spin.result.randomPosition);
      const discAngle0Deg   = discSprite.rotation * RAD_TO_DEG;
      const spinDurationSec = SPIN_DURATION_MS / 1_000;

      const spinCtx: SpinContext = {
        startAngleDeg:  ballAngleDeg, // seeded from persistent idle state
        cellIndex,
        wheelAngleDeg:  discAngle0Deg,
        idleDegPerSec:  IDLE_DEG_PER_SEC,
        spinDurationSec,
      };

      // Pre-compute the ball's exact screen angle at raw = 1.0.
      const { angleDeg: finalBallAngleDeg } = getSpinBallState(1.0, spinCtx);

      const startTimeMs = view.performance.now();

      const tick = (now: number): void => {
        if (destroyed) return;
        const current = activeSpin;
        if (!current) return;

        const elapsedMs = Math.max(now - current.startTimeMs, 0);

        // Disc rotates continuously throughout the spin.
        discSprite.rotation = discAngleAt(now);

        // ── Active spin ──────────────────────────────────────────────────────
        if (elapsedMs < SPIN_DURATION_MS) {
          const raw = elapsedMs / SPIN_DURATION_MS;
          const { angleDeg, radiusRatio } = getSpinBallState(raw, current.spinCtx);
          drawBall(angleDeg, radiusRatio);
          current.frame = view.requestAnimationFrame(tick);
          return;
        }

        // ── Spin complete: seed idle from final spin state ───────────────────
        // Hand off to the idle integrator. The follow window (FOLLOW_DURATION_MS)
        // is tracked by followWindowEndMs inside the idle loop.
        ballAngleDeg    = current.finalBallAngleDeg;
        ballRadiusRatio = R_INNER;
        followWindowEndMs = now + FOLLOW_DURATION_MS;
        lastIdleNowMs = NaN; // reset dt seed so first idle frame gets dt = 0

        const exitBallAngleRad = current.finalBallAngleDeg * DEG_TO_RAD;
        const completedSpin: RouletteRendererSpin = {
          ...current.spin,
          exitBallAngleRad,
        };
        activeSpin = null;
        startIdleBall();
        options.onSpinSettled?.(completedSpin, "visual");
      };

      activeSpin = {
        spin,
        frame: view.requestAnimationFrame(tick),
        spinCtx,
        finalBallAngleDeg,
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
