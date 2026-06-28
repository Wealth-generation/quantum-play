import { Ban, LockKeyhole, Pencil } from "lucide-react";
import { formatProfileDate } from "../lib/user-profile-format";
import type { UserProfileData } from "../types/user-profile-types";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { StatusPill } from "./profile-ui-primitives";

function initials(username: string): string {
  return username.slice(0, 1).toUpperCase();
}

function StaticToggle() {
  return (
    <span className="flex h-7 w-12 items-center rounded-pill border border-border-2 bg-control p-1 opacity-70">
      <span className="h-5 w-5 rounded-pill bg-text-subtle" />
    </span>
  );
}

export function ProfileHeaderCard({ profile }: { profile: UserProfileData }) {
  return (
    <Card
      className="overflow-hidden border-border-2 bg-surface shadow-inset-hi"
      padding="none"
      variant="panel"
    >
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-pill border border-border-2 bg-gradient-to-b from-primary-tint to-primary text-3xl font-black text-on-primary shadow-btn sm:h-24 sm:w-24">
            {initials(profile.username)}
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-pill border border-border-2 bg-surface-3 text-primary shadow-inset-hi">
              <Pencil aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-2xl font-black text-text sm:text-3xl">
                {profile.username}
              </h1>
              <button
                aria-label="Username edit unavailable"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3 text-text-muted"
                disabled
                type="button"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-text-muted">
              {profile.email}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {profile.isBanned ? (
                <StatusPill
                  active={false}
                  label="Restricted"
                  tone="danger"
                />
              ) : (
                <StatusPill active label="Active" />
              )}
              <StatusPill
                active={profile.hasVerifiedRoleOnDiscord}
                label={
                  profile.hasVerifiedRoleOnDiscord
                    ? "Discord Verified"
                    : "Discord Unverified"
                }
              />
              <StatusPill
                active={profile.hasPassword}
                label={profile.hasPassword ? "Password Set" : "Password Missing"}
              />
              <span className="text-xs font-semibold text-text-subtle">
                Joined {formatProfileDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-3 p-4 md:min-w-72">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-text">Private Mode</span>
            <StaticToggle />
          </div>
          <Button
            className="w-full justify-center"
            disabled
            size="sm"
            type="button"
            variant="secondary"
          >
            <LockKeyhole aria-hidden="true" className="h-4 w-4" />
            Reset Password
          </Button>
          {profile.isBanned ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-danger">
              <Ban aria-hidden="true" className="h-4 w-4" />
              Account actions are unavailable.
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
