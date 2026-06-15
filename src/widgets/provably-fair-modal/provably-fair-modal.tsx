"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  Dice5,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useChangeClientSeedMutation,
  useFairnessSeedQuery,
  type PlinkoFairnessResultSnapshot,
  verifyDice,
  verifyPlinkoResult,
} from "@/features/provably-fair";
import { getGameBySlug, type GameSlug } from "@/entities/game/model";
import {
  PLINKO_DEFAULT_RISK,
  PLINKO_DEFAULT_ROWS,
  PLINKO_RISKS,
  PLINKO_ROWS,
  getPlinkoMultiplier,
  isPlinkoRisk,
  plinkoMultipliers,
  type PlinkoRisk,
  type PlinkoRows,
} from "@/games/plinko/config";
import { getPlinkoBucketDomStyle } from "@/games/plinko/lib/plinko-bucket-style";
import { formatPlinkoMultiplier } from "@/games/plinko/lib/plinko-format";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { Slider } from "@/shared/ui/primitives/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/primitives/tabs";

interface ProvablyFairModalProps {
  gameLabel: string;
  gameSlug: GameSlug;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plinkoResult?: PlinkoFairnessResultSnapshot | null;
  portalContainer?: HTMLElement | null;
}

interface CopyFieldProps {
  id: string;
  label: string;
  value: string;
}

type FairnessTab = "seeds" | "verify";

type VerificationResult =
  | {
      game: "dice";
      value: number;
    }
  | {
      bucketIndex: number;
      comparison: PlinkoVerificationComparison | null;
      game: "plinko";
      multiplier: number | null;
      results: Array<0 | 1>;
      risk: PlinkoRisk;
      rowsCount: PlinkoRows;
    };

interface PlinkoVerificationComparison {
  bucketMatches: boolean;
  expectedBucketIndex: number;
  expectedResults: readonly (0 | 1)[];
  resultsMatch: boolean;
}

type VerificationCalculation =
  | {
      error: string;
      key: string;
      result?: never;
    }
  | {
      error?: never;
      key: string;
      result: VerificationResult;
    };

type VerificationValidation =
  | {
      kind: "incomplete";
      message: string;
      reason:
        | "missing-client-seed"
        | "missing-server-seed"
        | "unsupported-game";
    }
  | {
      kind: "invalid";
      message: string;
      reason: "invalid-nonce" | "invalid-plinko-config";
    }
  | {
      kind: "ready";
      message?: never;
      reason?: never;
    };

const BADGE_ANIMATION_DURATION = 0.16;
const PLINKO_ROWS_MIN = PLINKO_ROWS[0];
const PLINKO_ROWS_MAX = PLINKO_ROWS[PLINKO_ROWS.length - 1];
const VERIFY_GAME_OPTIONS = ([
  "dice",
  "keno",
  "plinko",
  "roulette",
] as const).map(getGameBySlug);

interface VerifyInputDraft {
  clientSeed: string;
  nonce: string;
  plinkoRisk: PlinkoRisk;
  plinkoRows: PlinkoRows;
  serverSeed: string;
}

const DEFAULT_VERIFY_INPUT_DRAFT: VerifyInputDraft = {
  clientSeed: "",
  nonce: "",
  plinkoRisk: PLINKO_DEFAULT_RISK,
  plinkoRows: PLINKO_DEFAULT_ROWS,
  serverSeed: "",
};

const plinkoVerifyRiskTone: Record<
  PlinkoRisk,
  {
    selected: string;
    unselected: string;
  }
> = {
  HIGH: {
    selected: "border-danger/50 bg-danger/20 text-danger shadow-inset-hi",
    unselected: "border-transparent text-danger",
  },
  LOW: {
    selected: "border-primary/45 bg-primary/25 text-primary shadow-inset-hi",
    unselected: "border-transparent text-primary",
  },
  MEDIUM: {
    selected:
      "border-yellow-400/50 bg-yellow-400/20 text-yellow-300 shadow-inset-hi",
    unselected: "border-transparent text-yellow-300",
  },
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function CopyField({ id, label, value }: CopyFieldProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    if (!value || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-text-muted" htmlFor={id}>
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          className="font-mono text-xs"
          id={id}
          readOnly
          value={value}
        />
        <Button
          aria-label={`Copy ${label}`}
          disabled={!value}
          onClick={handleCopy}
          size="icon"
          type="button"
          variant="secondary"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function DiceTrack({ value = 50.5 }: { value?: number }) {
  const markerLeft = `${Math.min(Math.max(value, 2), 100)}%`;

  return (
    <div className="py-5">
      <div className="relative rounded-md border border-border-2 bg-surface-2 px-3 py-5 shadow-inset-hi">
        <div className="absolute -top-7 rounded-sm border border-danger/40 bg-surface-3 px-2 py-1 text-xs font-black text-text shadow-glow"
          style={{ left: markerLeft, transform: "translateX(-50%)" }}
        >
          {value.toFixed(2)}
        </div>
        <div className="flex h-3 overflow-hidden rounded-pill bg-surface-3">
          <div className="w-1/2 bg-danger" />
          <div className="w-1/2 bg-primary" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-border-2 text-xs font-black text-text-muted shadow-overlay">
          III
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 text-xs font-bold text-text-muted">
        <span>2</span>
        <span className="text-center">25</span>
        <span className="text-center">50</span>
        <span className="text-center">75</span>
        <span className="text-right">100</span>
      </div>
    </div>
  );
}

function VerificationResultBadge({
  calculation,
  isCalculating,
  validation,
}: {
  calculation: VerificationCalculation | null;
  isCalculating: boolean;
  validation: VerificationValidation;
}) {
  const result = calculation?.result;
  const badge = (() => {
    if (validation.kind === "invalid" || calculation?.error) {
      return {
        className:
          "border border-danger/40 bg-danger/15 text-danger shadow-inset-hi",
        key: `error-${calculation?.error ?? validation.message}`,
        label: "Error",
        style: undefined,
      };
    }

    if (validation.kind === "incomplete") {
      return {
        className:
          "border border-border bg-surface-2 text-text-muted shadow-inset-hi",
        key: `incomplete-${validation.message}`,
        label: "Result",
        style: undefined,
      };
    }

    if (isCalculating) {
      return {
        className:
          "border border-primary/25 bg-primary/10 text-primary shadow-inset-hi",
        key: "calculating",
        label: "Checking",
        style: undefined,
      };
    }

    if (result?.game === "dice") {
      return {
        className:
          "border border-primary/30 bg-primary/15 text-primary shadow-glow",
        key: `dice-${result.value.toFixed(2)}`,
        label: result.value.toFixed(2),
        style: undefined,
      };
    }

    if (result?.game === "plinko") {
      const comparisonMismatch = result.comparison
        ? !result.comparison.bucketMatches || !result.comparison.resultsMatch
        : false;
      const bucketCount = result.rowsCount + 1;
      const bucketStyle = getPlinkoBucketDomStyle(
        result.bucketIndex,
        bucketCount,
      );

      return {
        className: cn(
          "shadow-inset-hi",
          comparisonMismatch && "ring-2 ring-danger/70",
        ),
        key: `plinko-${result.risk}-${result.rowsCount}-${result.bucketIndex}-${result.multiplier ?? "missing"}`,
        label:
          result.multiplier === null
            ? "Unavailable"
            : formatPlinkoMultiplier(result.multiplier),
        style: bucketStyle,
      };
    }

    return {
      className:
        "border border-border bg-surface-2 text-text-muted shadow-inset-hi",
      key: "pending",
      label: "Result",
      style: undefined,
    };
  })();

  return (
    <div className="flex h-16 items-center justify-center">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={cn(
            "flex h-12 min-w-24 items-center justify-center rounded-md px-6 text-base font-black",
            badge.className,
          )}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          initial={{ opacity: 0, scale: 0.94, y: -4 }}
          key={badge.key}
          style={badge.style}
          transition={{
            duration: BADGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          {badge.label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function formatPlinkoRiskLabel(risk: PlinkoRisk) {
  return risk[0] + risk.slice(1).toLowerCase();
}

function formatPlinkoPath(results: readonly (0 | 1)[]) {
  return results.length > 0 ? results.join(" ") : "None";
}

function normalizePlinkoRisk(value: string): PlinkoRisk | null {
  const normalized = value.toUpperCase();

  return isPlinkoRisk(normalized) ? normalized : null;
}

function toPlinkoRows(value: number): PlinkoRows {
  return PLINKO_ROWS.includes(value as PlinkoRows)
    ? (value as PlinkoRows)
    : PLINKO_DEFAULT_ROWS;
}

function plinkoResultsMatch(
  left: readonly (0 | 1)[],
  right: readonly (0 | 1)[],
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function PlinkoBucketRow({
  activeBucketIndex,
  multipliers,
}: {
  activeBucketIndex: number | null;
  multipliers: readonly number[];
}) {
  if (multipliers.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface-2 p-3 text-center text-xs font-semibold text-text-muted">
        Multipliers are unavailable for this rows/risk selection.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="grid min-w-max gap-1 sm:min-w-0"
        style={{
          gridTemplateColumns: `repeat(${multipliers.length}, minmax(2.75rem, 1fr))`,
        }}
      >
        {multipliers.map((multiplier, bucketIndex) => (
          <div
            aria-current={
              activeBucketIndex === bucketIndex ? "true" : undefined
            }
            className={cn(
              "flex h-8 items-center justify-center rounded-md px-2 text-[11px] font-black shadow-inset-hi transition-transform",
              activeBucketIndex === bucketIndex &&
                "scale-105 ring-2 ring-text/70",
            )}
            key={`${bucketIndex}-${multiplier}`}
            style={getPlinkoBucketDomStyle(bucketIndex, multipliers.length)}
          >
            {formatPlinkoMultiplier(multiplier)}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlinkoComparisonSummary({
  calculation,
  plinkoResult,
}: {
  calculation: VerificationCalculation | null;
  plinkoResult?: PlinkoFairnessResultSnapshot | null;
}) {
  const result = calculation?.result;

  if (result?.game !== "plinko" || !plinkoResult) {
    return null;
  }

  const latestRisk = normalizePlinkoRisk(plinkoResult.risk);
  const latestMatchesSelection =
    latestRisk === result.risk && plinkoResult.rowsCount === result.rowsCount;

  if (!latestMatchesSelection) {
    return (
      <div className="rounded-md border border-border bg-surface-2 p-3 text-xs font-semibold text-text-muted">
        Latest accepted result uses {plinkoResult.rowsCount} /{" "}
        {latestRisk ? formatPlinkoRiskLabel(latestRisk) : plinkoResult.risk}.
        Match rows/risk to compare against it.
      </div>
    );
  }

  const comparison = result.comparison;

  if (!comparison) {
    return null;
  }

  const comparisonMatches =
    comparison.bucketMatches && comparison.resultsMatch;

  return (
    <div
      className={
        comparisonMatches
          ? "rounded-md border border-primary/30 bg-primary/10 p-3 text-sm font-bold text-text"
          : "rounded-md border border-danger/40 bg-danger/10 p-3 text-sm font-bold text-text"
      }
    >
      <p>
        Calculated bucket: {result.bucketIndex} / Backend bucket:{" "}
        {comparison.expectedBucketIndex}
      </p>
      <p className="mt-2 break-words font-mono text-xs">
        Calculated path: {formatPlinkoPath(result.results)}
      </p>
      <p className="mt-1 break-words font-mono text-xs">
        Backend path: {formatPlinkoPath(comparison.expectedResults)}
      </p>
      <p className="mt-2 text-xs">
        {comparisonMatches
          ? "Bucket and row path match the accepted backend result."
          : "Calculated result does not match the accepted backend result."}
      </p>
    </div>
  );
}

function SeedsTab({ open }: { open: boolean }) {
  const seedQuery = useFairnessSeedQuery(open);
  const changeSeedMutation = useChangeClientSeedMutation();
  const seed = seedQuery.data;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextClientSeed = String(formData.get("clientSeed") ?? "").trim();

    if (!nextClientSeed) {
      return;
    }

    try {
      await changeSeedMutation.mutateAsync({ clientSeed: nextClientSeed });
    } catch {
      // The mutation state renders the safe error message below.
    }
  }

  if (seedQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-semibold text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading seeds
      </div>
    );
  }

  if (seedQuery.isError || !seed) {
    return (
      <div className="rounded-md border border-border bg-surface-2 p-4 text-sm font-semibold text-text-muted">
        {errorMessage(
          seedQuery.error,
          "Fairness seed is unavailable. Sign in and try again.",
        )}
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CopyField
        id="active-client-seed"
        label="Active client seed"
        value={seed.clientSeed}
      />
      <CopyField
        id="active-server-seed-hash"
        label="Active server seed hash"
        value={seed.hashedServerSeed}
      />

      <div className="pt-2">
        <h3 className="text-base font-black text-text">Rotate Seed Pair</h3>
      </div>

      <CopyField
        id="seed-pair-nonce"
        label="Total Bets Made with Pair"
        value={String(seed.nonce)}
      />

      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold text-text-muted"
          htmlFor="new-client-seed"
        >
          New client seed
        </label>
        <div className="flex gap-2">
          <Input
            className="font-mono text-xs"
            defaultValue={seed.clientSeed}
            id="new-client-seed"
            key={seed.clientSeed}
            name="clientSeed"
          />
          <Button
            disabled={changeSeedMutation.isPending}
            type="submit"
            variant="secondary"
          >
            {changeSeedMutation.isPending ? "Changing..." : "Change"}
          </Button>
        </div>
      </div>

      <CopyField
        id="next-server-seed-hash"
        label="Next Server Seed (Hash)"
        value={seed.nextHashedServerSeed}
      />

      {changeSeedMutation.isError ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {errorMessage(
            changeSeedMutation.error,
            "Client seed could not be changed.",
          )}
        </p>
      ) : null}
    </form>
  );
}

function VerifyTab({
  gameLabel,
  gameSlug,
  onVerifyGameChange,
  onVerifyInputDraftChange,
  open,
  plinkoResult,
  verifyInputDraft,
}: {
  gameLabel: string;
  gameSlug: GameSlug;
  onVerifyGameChange: (gameSlug: GameSlug) => void;
  onVerifyInputDraftChange: (nextDraft: VerifyInputDraft) => void;
  open: boolean;
  plinkoResult?: PlinkoFairnessResultSnapshot | null;
  verifyInputDraft: VerifyInputDraft;
}) {
  const seedQuery = useFairnessSeedQuery(open);
  const { clientSeed, nonce, plinkoRisk, plinkoRows, serverSeed } =
    verifyInputDraft;
  const [calculation, setCalculation] =
    React.useState<VerificationCalculation | null>(null);
  const requestIdRef = React.useRef(0);
  const selectedPlinkoMultipliers = plinkoMultipliers[plinkoRisk][plinkoRows];
  const effectiveClientSeed =
    clientSeed.trim() || seedQuery.data?.clientSeed.trim() || "";
  const serverSeedValue = serverSeed.trim();
  const nonceValue = nonce.trim();
  const normalizedNonceValue = nonceValue === "" ? "0" : nonceValue;
  const parsedNonce = Number(normalizedNonceValue);
  const verificationSupported = gameSlug === "dice" || gameSlug === "plinko";
  const validation: VerificationValidation = (() => {
    if (!verificationSupported) {
      return {
        kind: "incomplete",
        message: `${gameLabel} verification is not available yet.`,
        reason: "unsupported-game",
      };
    }

    if (!effectiveClientSeed) {
      return {
        kind: "incomplete",
        message: "Client seed is required.",
        reason: "missing-client-seed",
      };
    }

    if (!serverSeedValue) {
      return {
        kind: "incomplete",
        message: "Server seed is required.",
        reason: "missing-server-seed",
      };
    }

    if (!Number.isInteger(parsedNonce) || parsedNonce < 0) {
      return {
        kind: "invalid",
        message: "Nonce must be a whole number.",
        reason: "invalid-nonce",
      };
    }

    if (gameSlug === "plinko") {
      if (selectedPlinkoMultipliers.length !== plinkoRows + 1) {
        return {
          kind: "invalid",
          message: "Plinko multipliers are unavailable for this selection.",
          reason: "invalid-plinko-config",
        };
      }
    }

    return {
      kind: "ready",
    };
  })();
  const inputKey = [
    gameSlug,
    effectiveClientSeed,
    serverSeedValue,
    normalizedNonceValue,
    gameSlug === "plinko" ? plinkoRows : "dice",
    gameSlug === "plinko" ? plinkoRisk : "dice",
    gameSlug === "plinko" ? (plinkoResult?.id ?? "no-result") : "dice",
    gameSlug === "plinko" ? (plinkoResult?.rowsCount ?? "no-rows") : "dice",
    gameSlug === "plinko" ? (plinkoResult?.risk ?? "no-risk") : "dice",
    gameSlug === "plinko"
      ? (plinkoResult?.bucketIndex ?? "no-bucket")
      : "dice",
    gameSlug === "plinko"
      ? (plinkoResult?.results.join("") ?? "no-path")
      : "dice",
  ].join("|");
  const activeCalculation =
    calculation?.key === inputKey ? calculation : null;
  const activeResult = activeCalculation?.result ?? null;
  const activeError =
    validation.kind === "invalid"
      ? validation.message
      : activeCalculation?.error ?? null;
  const incompleteMessage =
    validation.kind === "incomplete" &&
    validation.reason !== "missing-client-seed" &&
    validation.reason !== "missing-server-seed" &&
    validation.reason !== "unsupported-game"
      ? validation.message
      : null;
  const isCalculating =
    open && validation.kind === "ready" && activeCalculation === null;
  function updateVerifyInputDraft(
    field: keyof VerifyInputDraft,
    value: VerifyInputDraft[keyof VerifyInputDraft],
  ) {
    onVerifyInputDraftChange({
      ...verifyInputDraft,
      [field]: value,
    });
  }
  function updatePlinkoRows(value: number[]) {
    updateVerifyInputDraft("plinkoRows", toPlinkoRows(value[0] ?? plinkoRows));
  }

  React.useEffect(() => {
    if (!open || validation.kind !== "ready") {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    void (async () => {
      try {
        if (gameSlug === "plinko") {
          const plinkoVerification = await verifyPlinkoResult(
            serverSeedValue,
            effectiveClientSeed,
            parsedNonce,
            plinkoRows,
          );

          if (cancelled || requestIdRef.current !== requestId) {
            return;
          }

          const latestRisk = plinkoResult
            ? normalizePlinkoRisk(plinkoResult.risk)
            : null;
          const canCompareLatest =
            !!plinkoResult &&
            latestRisk === plinkoRisk &&
            plinkoResult.rowsCount === plinkoRows;
          const comparison = canCompareLatest
            ? {
                bucketMatches:
                  plinkoVerification.bucketIndex ===
                  plinkoResult.bucketIndex,
                expectedBucketIndex: plinkoResult.bucketIndex,
                expectedResults: plinkoResult.results,
                resultsMatch: plinkoResultsMatch(
                  plinkoVerification.results,
                  plinkoResult.results,
                ),
              }
            : null;

          setCalculation({
            key: inputKey,
            result: {
              bucketIndex: plinkoVerification.bucketIndex,
              comparison,
              game: "plinko",
              multiplier: getPlinkoMultiplier(
                plinkoRisk,
                plinkoRows,
                plinkoVerification.bucketIndex,
              ),
              results: plinkoVerification.results,
              risk: plinkoRisk,
              rowsCount: plinkoRows,
            },
          });
          return;
        }

        const diceResult = await verifyDice(
          serverSeedValue,
          effectiveClientSeed,
          parsedNonce,
        );

        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        setCalculation({
          key: inputKey,
          result: {
            game: "dice",
            value: diceResult,
          },
        });
      } catch (verifyError) {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        setCalculation({
          error: errorMessage(
            verifyError,
            `${gameLabel} verification failed.`,
          ),
          key: inputKey,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    effectiveClientSeed,
    gameLabel,
    gameSlug,
    inputKey,
    normalizedNonceValue,
    open,
    parsedNonce,
    plinkoResult,
    plinkoRisk,
    plinkoRows,
    serverSeedValue,
    validation.kind,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {gameSlug === "dice" ? (
        <>
          <VerificationResultBadge
            calculation={activeCalculation}
            isCalculating={isCalculating}
            validation={validation}
          />
          <DiceTrack
            value={activeResult?.game === "dice" ? activeResult.value : 50.5}
          />
        </>
      ) : gameSlug === "plinko" ? (
        <div className="space-y-3">
          {activeResult?.game === "plinko" || isCalculating || activeError ? (
            <VerificationResultBadge
              calculation={activeCalculation}
              isCalculating={isCalculating}
              validation={validation}
            />
          ) : null}
          <PlinkoBucketRow
            activeBucketIndex={
              activeResult?.game === "plinko" ? activeResult.bucketIndex : null
            }
            multipliers={selectedPlinkoMultipliers}
          />
        </div>
      ) : null}

      {gameSlug !== "dice" && gameSlug !== "plinko" ? (
        <div className="rounded-md border border-border bg-surface-2 p-3 text-sm font-semibold text-text-muted">
          {gameLabel} verification is not available yet.
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted" htmlFor="fair-game">
          Game
        </label>
        <div className="relative">
          <select
            className="h-11 w-full appearance-none rounded-md border border-border bg-control px-3 py-2 text-sm font-bold text-text outline-none focus-visible:border-primary focus-visible:shadow-glow"
            id="fair-game"
            value={gameSlug}
            onChange={(event) =>
              onVerifyGameChange(event.target.value as GameSlug)
            }
          >
            {VERIFY_GAME_OPTIONS.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.label}
              </option>
            ))}
          </select>
          <Dice5 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold text-text-muted"
          htmlFor="verify-client-seed"
        >
          Client seed
        </label>
        <Input
          className="font-mono text-xs"
          id="verify-client-seed"
          onChange={(event) =>
            updateVerifyInputDraft("clientSeed", event.target.value)
          }
          placeholder="Enter client seed"
          value={clientSeed}
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold text-text-muted"
          htmlFor="verify-server-seed"
        >
          Server seed
        </label>
        <Input
          className="font-mono text-xs"
          id="verify-server-seed"
          onChange={(event) =>
            updateVerifyInputDraft("serverSeed", event.target.value)
          }
          placeholder="Enter server seed"
          value={serverSeed}
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold text-text-muted"
          htmlFor="verify-nonce"
        >
          Nonce
        </label>
        <Input
          className="font-mono text-xs"
          id="verify-nonce"
          inputMode="numeric"
          onChange={(event) =>
            updateVerifyInputDraft("nonce", event.target.value)
          }
          placeholder="0"
          value={nonce}
        />
      </div>

      {gameSlug === "plinko" ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label
                className="text-xs font-semibold text-text-muted"
                htmlFor="verify-plinko-rows"
              >
                Rows
              </label>
              <span className="text-sm font-black tabular-nums text-text">
                {plinkoRows}
              </span>
            </div>
            <Slider
              id="verify-plinko-rows"
              max={PLINKO_ROWS_MAX}
              min={PLINKO_ROWS_MIN}
              onValueChange={updatePlinkoRows}
              step={1}
              value={[plinkoRows]}
            />
          </div>

          <div className="grid grid-cols-3 rounded-md bg-bg p-1">
            {PLINKO_RISKS.map((nextRisk) => (
              <button
                aria-pressed={plinkoRisk === nextRisk}
                className={cn(
                  "h-10 rounded-sm border text-sm font-black transition-colors",
                  plinkoRisk === nextRisk
                    ? plinkoVerifyRiskTone[nextRisk].selected
                    : plinkoVerifyRiskTone[nextRisk].unselected,
                )}
                key={nextRisk}
                onClick={() => updateVerifyInputDraft("plinkoRisk", nextRisk)}
                type="button"
              >
                {formatPlinkoRiskLabel(nextRisk)}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {incompleteMessage ? (
        <div className="rounded-md border border-border bg-surface-2 p-3 text-xs font-semibold text-text-muted">
          {incompleteMessage}
        </div>
      ) : null}

      {isCalculating ? (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs font-semibold text-primary">
          Recalculating locally
        </div>
      ) : null}

      {gameSlug === "plinko" ? (
        <PlinkoComparisonSummary
          calculation={activeCalculation}
          plinkoResult={plinkoResult}
        />
      ) : null}

      {activeError ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {activeError}
        </p>
      ) : null}
    </div>
  );
}

function ProvablyFairModalContent({
  gameLabel,
  gameSlug,
  open,
  onOpenChange,
  plinkoResult,
  portalContainer,
}: ProvablyFairModalProps) {
  const [tab, setTab] = React.useState<FairnessTab>("seeds");
  const [verifyGameSlug, setVerifyGameSlug] =
    React.useState<GameSlug>(gameSlug);
  const [verifyInputDraft, setVerifyInputDraft] =
    React.useState<VerifyInputDraft>(DEFAULT_VERIFY_INPUT_DRAFT);
  const verifyGameLabel = getGameBySlug(verifyGameSlug).label;

  return (
    <DialogContent
      className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto p-5 sm:p-6"
      portalContainer={portalContainer}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <DialogTitle className="text-xl font-black">Fairness</DialogTitle>
            <DialogDescription className="sr-only">
              View seed pair details or verify a {gameLabel} result.
            </DialogDescription>
          </div>
        </div>
        <Button
          aria-label="Close fairness modal"
          onClick={() => onOpenChange(false)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs
        className="flex flex-col"
        onValueChange={(value) => setTab(value as FairnessTab)}
        value={tab}
      >
        <TabsList className="mb-5 grid grid-cols-2 rounded-md border border-border bg-surface-2 p-1">
          <TabsTrigger
            className="rounded-sm border-0 data-[state=active]:bg-surface-3 data-[state=active]:shadow-inset-hi"
            value="seeds"
          >
            Seeds
          </TabsTrigger>
          <TabsTrigger
            className="rounded-sm border-0 data-[state=active]:bg-surface-3 data-[state=active]:shadow-inset-hi"
            value="verify"
          >
            Verify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seeds">
          <SeedsTab open={open} />
        </TabsContent>
        <TabsContent value="verify">
          <VerifyTab
            key={`${verifyGameSlug}-${plinkoResult?.id ?? "empty"}`}
            gameLabel={verifyGameLabel}
            gameSlug={verifyGameSlug}
            onVerifyGameChange={setVerifyGameSlug}
            onVerifyInputDraftChange={setVerifyInputDraft}
            open={open}
            plinkoResult={plinkoResult}
            verifyInputDraft={verifyInputDraft}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

export function ProvablyFairModal(props: ProvablyFairModalProps) {
  const modalStateKey = `${props.gameSlug}-${props.open ? "open" : "closed"}`;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <ProvablyFairModalContent key={modalStateKey} {...props} />
    </Dialog>
  );
}
