"use client";

import * as React from "react";
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
  verifyDice,
} from "@/features/provably-fair";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/primitives/tabs";

interface ProvablyFairModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CopyFieldProps {
  id: string;
  label: string;
  value: string;
}

type FairnessTab = "seeds" | "verify";

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

function VerifyTab({ open }: { open: boolean }) {
  const seedQuery = useFairnessSeedQuery(open);
  const [clientSeed, setClientSeed] = React.useState("");
  const [serverSeed, setServerSeed] = React.useState("");
  const [nonce, setNonce] = React.useState("0");
  const [result, setResult] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const effectiveClientSeed =
      clientSeed.trim() || seedQuery.data?.clientSeed.trim() || "";
    const parsedNonce = Number(nonce);

    if (!effectiveClientSeed || !serverSeed.trim()) {
      setError("Client seed and server seed are required.");
      return;
    }

    if (!Number.isInteger(parsedNonce) || parsedNonce < 0) {
      setError("Nonce must be a whole number.");
      return;
    }

    setPending(true);

    try {
      const diceResult = await verifyDice(
        serverSeed.trim(),
        effectiveClientSeed,
        parsedNonce,
      );
      setResult(diceResult);
    } catch (verifyError) {
      setError(errorMessage(verifyError, "Dice verification failed."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleVerify}>
      <DiceTrack value={result ?? 50.5} />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted" htmlFor="fair-game">
          Game
        </label>
        <div className="relative">
          <select
            className="h-11 w-full appearance-none rounded-md border border-border bg-control px-3 py-2 text-sm font-bold text-text outline-none focus-visible:border-primary focus-visible:shadow-glow"
            id="fair-game"
            value="dice"
            onChange={() => undefined}
          >
            <option value="dice">Dice</option>
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
          onChange={(event) => setClientSeed(event.target.value)}
          placeholder={seedQuery.data?.clientSeed ?? "Enter client seed"}
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
          onChange={(event) => setServerSeed(event.target.value)}
          placeholder="Enter revealed server seed"
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
          onChange={(event) => setNonce(event.target.value)}
          placeholder="0"
          value={nonce}
        />
      </div>

      <div className="rounded-md border border-border bg-surface-2 p-3 text-xs font-semibold text-text-muted">
        Server seed must be entered manually. The current seed endpoint returns
        only the hashed server seed until the pair is rotated.
      </div>

      <Button disabled={pending} type="submit" variant="primary">
        {pending ? "Verifying..." : "Verify Dice"}
      </Button>

      {result !== null ? (
        <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm font-bold text-text">
          Calculated Dice result: {result.toFixed(2)}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function ProvablyFairModal({
  open,
  onOpenChange,
}: ProvablyFairModalProps) {
  const [tab, setTab] = React.useState<FairnessTab>("seeds");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <DialogTitle className="text-xl font-black">Fairness</DialogTitle>
              <DialogDescription className="sr-only">
                View seed pair details or verify a Dice result.
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
            <VerifyTab open={open} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
