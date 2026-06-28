import Image from "next/image";
import { Pencil } from "lucide-react";
import type { UserProfileData } from "../types/user-profile-types";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { SectionCard, StatusPill } from "./profile-ui-primitives";

function ConnectionCard({
  connected,
  description,
  label,
  src,
}: {
  connected: boolean;
  description: string;
  label: string;
  src: string;
}) {
  return (
    <Card
      className="flex min-h-44 flex-col justify-between gap-5 border-border-2 bg-surface p-4 shadow-inset-hi"
      padding="none"
      variant="panel"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3">
          <Image alt={`${label} icon`} height={28} src={src} width={28} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
      </div>
      <Button className="w-full" disabled size="sm" type="button" variant="secondary">
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
  const degenCityValue =
    profile.degenCity.label ??
    profile.degenCity.status ??
    "DegenCity username";

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
          className="grid gap-4 border-border-2 bg-surface-3 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
          padding="none"
          variant="surface"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg/50 text-primary">
            <Pencil aria-hidden="true" className="h-5 w-5" />
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
            <p className="rounded-md border border-border bg-control px-3 py-2 text-sm font-semibold text-text-muted">
              {degenCityValue}
            </p>
          </div>
          <Button disabled size="sm" type="button" variant="secondary">
            Apply
          </Button>
        </Card>
      </SectionCard>
    </div>
  );
}
