"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const LOADER_DURATION_MS = 1200;
const LOGO_WIDTH = 577;
const LOGO_HEIGHT = 433;
const LOADER_OVERLAY_CLASS =
  "fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 px-8 backdrop-blur-md";
const LOADER_LOGO_WRAP_CLASS =
  "quantum-loader-logo-wrap flex w-[min(58vw,260px)] origin-center transform-gpu items-center justify-center sm:w-[min(34vw,320px)]";
const LOGO_GLOW = "drop-shadow(0 0 14px rgba(255, 255, 255, 0.24))";
const SHADOW_CLASS =
  "quantum-loader-shadow mt-7 h-3 w-[min(34vw,180px)] rounded-pill bg-bg/70 blur-md sm:w-[210px]";

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ""}?${searchParams.toString()}`;

  return <TimedPageLoader key={routeKey} routeKey={routeKey} />;
}

export function PageLoaderFallback() {
  return (
    <div
      aria-label="Loading Quantum Play"
      className={LOADER_OVERLAY_CLASS}
      role="status"
    >
      <LoaderLogoShell />
    </div>
  );
}

function LoaderLogoShell() {
  return (
    <>
      <LoaderAnimationStyles />
      <div className="flex flex-col items-center">
        <div className={LOADER_LOGO_WRAP_CLASS}>
          <Image
            alt="Quantum Play"
            className="h-auto w-full"
            height={LOGO_HEIGHT}
            loading="eager"
            sizes="(max-width: 640px) 58vw, 320px"
            src="/images/quantum-play-logo.webp"
            width={LOGO_WIDTH}
          />
        </div>
        <div aria-hidden="true" className={SHADOW_CLASS} />
      </div>
    </>
  );
}

function LoaderAnimationStyles() {
  return (
    <style>
      {`
        @keyframes quantum-loader-logo-lift {
          from {
            filter: ${LOGO_GLOW};
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            filter: ${LOGO_GLOW};
            transform: translate3d(0, -8px, 0) scale(1.07);
          }
        }

        @keyframes quantum-loader-shadow-lift {
          from {
            opacity: 0.38;
            transform: scaleX(1);
          }
          to {
            opacity: 0.24;
            transform: scaleX(0.86);
          }
        }

        .quantum-loader-logo-wrap {
          animation: quantum-loader-logo-lift ${LOADER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform;
        }

        .quantum-loader-shadow {
          animation: quantum-loader-shadow-lift ${LOADER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: opacity, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .quantum-loader-logo-wrap,
          .quantum-loader-shadow {
            animation: none;
          }
        }
      `}
    </style>
  );
}

function TimedPageLoader({ routeKey }: { routeKey: string }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, LOADER_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label="Loading Quantum Play"
          className={LOADER_OVERLAY_CLASS}
          exit={{ opacity: 0 }}
          initial={false}
          key={routeKey}
          role="status"
          transition={{ duration: reduceMotion ? 0.12 : 0.18, ease: "easeOut" }}
        >
          <motion.div
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1 }
            }
            initial={reduceMotion ? { opacity: 0 } : false}
            transition={
              reduceMotion
                ? { duration: 0.18, ease: "easeOut" }
                : { duration: 0 }
            }
          >
            <LoaderLogoShell />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
