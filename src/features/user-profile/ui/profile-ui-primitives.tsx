import * as React from "react";
import Image from "next/image";
import { CircleOff } from "lucide-react";
import { cn } from "@/shared/lib";
import { Card } from "@/shared/ui/primitives/card";
import { Checkbox } from "@/shared/ui/primitives/checkbox";

type StatusTone = "success" | "danger" | "muted";

function statusTone(tone: StatusTone): string {
  if (tone === "success") {
    return "border-primary/40 bg-primary/10 text-primary-soft";
  }

  if (tone === "danger") {
    return "border-danger/50 bg-danger/10 text-danger";
  }

  return "border-border-2 bg-surface-3 text-text-muted";
}

export function LoadingBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-3", className)} />;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card
      className="border-danger/40 bg-surface p-6 text-sm font-semibold text-danger"
      padding="none"
      variant="panel"
    >
      {message}
    </Card>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-border bg-surface p-6 text-sm font-semibold text-text-subtle">
      <CircleOff aria-hidden="true" className="h-5 w-5" />
      <span>{label}</span>
    </div>
  );
}

export function SectionCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        className,
      )}
    >
      <h2 className="text-xl font-black text-text">{title}</h2>
      {children}
    </section>
  );
}

export function StatusPill({
  active,
  label,
  tone,
}: {
  active: boolean;
  label: string;
  tone?: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-pill border px-3 text-xs font-bold",
        statusTone(tone ?? (active ? "success" : "muted")),
      )}
    >
      {label}
    </span>
  );
}

export function MetricCard({
  className,
  icon,
  label,
  value,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border-2 bg-surface-3 p-4 shadow-inset-hi",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-primary/10"
      />
      <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-bg/60 text-primary">
        {icon}
      </div>
      <p className="relative text-xs font-semibold uppercase text-text-subtle">
        {label}
      </p>
      <p className="relative mt-1 truncate text-2xl font-black text-text">
        {value}
      </p>
    </div>
  );
}

export function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-3 p-4">
      <p className="text-xs font-semibold uppercase text-text-subtle">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-text">{value}</p>
    </div>
  );
}

export function DisabledControl({
  checked,
  label,
}: {
  checked?: boolean;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-3 p-4 text-sm font-semibold text-text-muted">
      <span>{label}</span>
      <Checkbox checked={checked} disabled readOnly />
    </label>
  );
}

export function BetValue({
  className,
  value,
}: {
  className?: string;
  value: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-text",
        className,
      )}
    >
      <Image
        alt=""
        aria-hidden="true"
        height={18}
        src="/images/game-point.svg"
        width={18}
      />
      {value}
    </span>
  );
}
