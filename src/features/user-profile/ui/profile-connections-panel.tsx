import Image from "next/image";
import { cn } from "@/shared/lib";
import type { UserProfileData } from "../types/user-profile-types";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { SectionCard, StatusPill } from "./profile-ui-primitives";

type ConnectionIconTone = "default" | "kick";

function ConnectionCard({
  connected,
  description,
  iconTone = "default",
  label,
  src,
}: {
  connected: boolean;
  description: string;
  iconTone?: ConnectionIconTone;
  label: string;
  src: string;
}) {
  return (
    <Card
      className="grid gap-3 border-border bg-surface p-4 shadow-inset-hi md:grid-cols-[auto_minmax(0,1fr)_7.75rem] md:items-center"
      padding="none"
      variant="panel"
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border",
          iconTone === "kick"
            ? "border-primary/20 bg-primary/10"
            : "border-border bg-bg/40",
        )}
      >
        <Image
          alt={`${label} icon`}
          className={cn(
            "object-contain",
            iconTone === "kick" ? "h-9 w-9" : "h-8 w-8",
          )}
          height={36}
          src={src}
          width={36}
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-text">{label}</h2>
          <StatusPill
            active={connected}
            label={connected ? "Connected" : "Not connected"}
            tone={connected ? "success" : "danger"}
          />
        </div>
        <p className="mt-1 break-words text-sm font-semibold text-text-muted">
          {description}
        </p>
      </div>
      <Button
        className="w-full md:w-auto"
        disabled
        size="sm"
        type="button"
        variant="secondary"
      >
        Connect
      </Button>
    </Card>
  );
}

function hasAuthProvider(profile: UserProfileData, providerName: string): boolean {
  return profile.authProviders.some((provider) =>
    provider.provider.toLowerCase().includes(providerName.toLowerCase()),
  );
}

export function ProfileConnectionsPanel({
  profile,
}: {
  profile: UserProfileData;
}) {
  const degenCityValue = profile.degenCity.label ?? profile.degenCity.status;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Connections">
        <div className="grid gap-3 md:grid-cols-2">
          <ConnectionCard
            connected={profile.hasVerifiedRoleOnDiscord}
            description="Connect Discord to unlock community role verification."
            label="Discord"
            src="/images/Discord.svg"
          />
          <ConnectionCard
            connected={hasAuthProvider(profile, "kick")}
            description="Connect Kick to keep your casino profile in sync."
            iconTone="kick"
            label="Kick"
            src="/images/Kick.svg"
          />
          <ConnectionCard
            connected={hasAuthProvider(profile, "google")}
            description="Connect Google for a faster account sign-in option."
            label="Google"
            src="/images/Google.svg"
          />
          <ConnectionCard
            connected={hasAuthProvider(profile, "steam")}
            description="Connect Steam to link your gaming identity."
            label="Steam"
            src="/images/Steam.svg"
          />
        </div>
      </SectionCard>

      <SectionCard title="Casino Connections">
        <Card
          className="grid gap-4 border-border bg-surface p-4 shadow-inset-hi md:grid-cols-[auto_minmax(0,1fr)_minmax(18rem,0.9fr)] md:items-center"
          padding="none"
          variant="surface"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-base font-black text-primary-soft">
            DC
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-text">DegenCity</h2>
              <StatusPill
                active={profile.degenCity.connected}
                label={
                  profile.degenCity.connected ? "Connected" : "Not connected"
                }
                tone={profile.degenCity.connected ? "success" : "danger"}
              />
            </div>
            <p className="text-sm font-semibold text-text-muted">
              Connect DegenCity, unlock community features.
            </p>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-semibold text-text-muted">
              My DegenCity Username
            </p>
            <div className="flex h-11 min-w-0 overflow-hidden rounded-md border border-border bg-control">
              <div className="flex min-w-0 flex-1 items-center px-3 text-sm font-semibold text-text-muted">
                <span className="truncate">
                  {degenCityValue ?? "Enter username"}
                </span>
              </div>
              <Button
                className="h-full shrink-0 rounded-none border-0 bg-transparent px-4 text-primary-soft disabled:opacity-60"
                disabled
                size="sm"
                type="button"
                variant="ghost"
              >
                Apply
              </Button>
            </div>
          </div>
        </Card>
      </SectionCard>
    </div>
  );
}
