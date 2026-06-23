"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import type { BalanceDisplayEvent } from "@/features/balance";

interface AnimatedBalanceValueProps {
  event?: BalanceDisplayEvent;
  label: string;
  value: string;
}

const FEEDBACK_DURATION_MS = 900;

function isDigit(value: string) {
  return value >= "0" && value <= "9";
}

function BalanceDigit({ index, value }: { index: number; value: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className="relative inline-flex h-[1.2em] w-[0.66em] overflow-hidden align-middle"
      style={{ perspective: "4em" }}
    >
      {reduceMotion ? (
        <span className="absolute inset-0 flex items-center justify-center">
          {value}
        </span>
      ) : (
        <AnimatePresence initial={false} mode="sync">
          <motion.span
            animate={{ opacity: 1, rotateX: 0, y: "0%" }}
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, rotateX: 72, y: "-92%" }}
            initial={{ opacity: 0, rotateX: -72, y: "92%" }}
            key={value}
            transition={{
              delay: Math.min(index * 0.025, 0.125),
              duration: 0.26,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}

export function AnimatedBalanceValue({
  event,
  label,
  value,
}: AnimatedBalanceValueProps) {
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const eventId = event?.id;
  const eventOutcome = event?.outcome;
  const eventReason = event?.reason;

  React.useEffect(() => {
    if (!eventId || !scope.current) {
      return;
    }

    if (eventReason === "bet-settlement" && eventOutcome) {
      const feedbackColor =
        eventOutcome === "win"
          ? "var(--color-primary)"
          : "var(--color-danger)";
      animate(
        scope.current,
        {
          color: ["var(--color-text)", feedbackColor, "var(--color-text)"],
        },
        { duration: FEEDBACK_DURATION_MS / 1000, ease: "easeInOut" },
      );

      return;
    }

    animate(
      scope.current,
      { color: "var(--color-text)" },
      { duration: reduceMotion ? 0 : 0.12 },
    );
  }, [animate, eventId, eventOutcome, eventReason, reduceMotion, scope]);

  return (
    <span
      aria-label={`${label}: ${value}`}
      className="inline-flex min-w-[11ch] items-center tabular-nums"
      ref={scope}
    >
      <span aria-hidden="true" className="inline-flex items-center">
        {Array.from(value, (character, index) => {
          if (!isDigit(character)) {
            return (
              <span
                className="inline-flex h-[1.2em] min-w-[0.34em] items-center justify-center"
                key={`${index}-${character}`}
              >
                {character}
              </span>
            );
          }

          const digitIndex = Array.from(value.slice(0, index)).filter(isDigit)
            .length;

          return (
            <BalanceDigit
              index={digitIndex}
              key={index}
              value={character}
            />
          );
        })}
      </span>
    </span>
  );
}
