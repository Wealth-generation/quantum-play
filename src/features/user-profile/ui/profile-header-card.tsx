"use client";

import * as React from "react";
import Image from "next/image";
import { Ban, LockKeyhole, Pencil } from "lucide-react";
import { cn } from "@/shared/lib";
import { formatProfileDate } from "../lib/user-profile-format";
import { useUpdateUserProfileUsernameMutation } from "../model/user-profile-query";
import type { UserProfileData } from "../types/user-profile-types";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";

type HeaderStatusTone = "success" | "danger" | "muted";

const FALLBACK_AVATAR_SRC = "/images/avatar_11.png";

function avatarSource(value: string | null): string {
  return value?.startsWith("/") ? value : FALLBACK_AVATAR_SRC;
}

function headerStatusTone(tone: HeaderStatusTone): string {
  if (tone === "success") {
    return "bg-primary/10 text-primary-soft";
  }

  if (tone === "danger") {
    return "bg-danger/10 text-danger";
  }

  return "bg-surface-3/70 text-text-muted";
}

function HeaderStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: HeaderStatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-pill px-2.5 text-xs font-bold",
        headerStatusTone(tone),
      )}
    >
      {label}
    </span>
  );
}

function StaticToggle() {
  return (
    <span className="flex h-6 w-11 items-center rounded-pill bg-control p-1 opacity-80 shadow-inset-hi">
      <span className="h-5 w-5 rounded-pill bg-text-subtle" />
    </span>
  );
}

export function ProfileHeaderCard({ profile }: { profile: UserProfileData }) {
  const [avatarSrc, setAvatarSrc] = React.useState(() =>
    avatarSource(profile.profileImgUrl),
  );
  const [editingUsername, setEditingUsername] = React.useState(false);
  const [usernameDraft, setUsernameDraft] = React.useState(profile.username);
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const updateUsernameMutation = useUpdateUserProfileUsernameMutation();

  function startUsernameEdit() {
    setUsernameDraft(profile.username);
    setUsernameError(null);
    setEditingUsername(true);
  }

  function cancelUsernameEdit() {
    setUsernameDraft(profile.username);
    setUsernameError(null);
    setEditingUsername(false);
  }

  async function submitUsernameEdit() {
    const username = usernameDraft.trim();

    if (!username) {
      setUsernameError("Username is required.");
      return;
    }

    if (username === profile.username) {
      cancelUsernameEdit();
      return;
    }

    setUsernameError(null);

    try {
      await updateUsernameMutation.mutateAsync({ username });
      setEditingUsername(false);
    } catch (error) {
      setUsernameError(
        error instanceof Error
          ? error.message
          : "Username could not be updated. Please try again.",
      );
    }
  }

  function handleUsernameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitUsernameEdit();
  }

  function handleUsernameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelUsernameEdit();
    }
  }

  return (
    <Card
      className="overflow-hidden border-border bg-surface/80 shadow-inset-hi"
      padding="none"
      variant="panel"
    >
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-pill border border-primary/20 bg-surface-3 shadow-btn sm:h-24 sm:w-24">
            <Image
              alt=""
              aria-hidden="true"
              className="object-cover"
              fill
              onError={() => setAvatarSrc(FALLBACK_AVATAR_SRC)}
              sizes="(min-width: 640px) 96px, 80px"
              src={avatarSrc}
            />
            <span className="absolute bottom-0 right-0 hidden h-8 w-8 items-center justify-center rounded-pill border border-border-2 bg-surface-3 text-primary shadow-inset-hi md:flex">
              <Pencil aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            {editingUsername ? (
              <form
                className="flex min-w-0 flex-wrap items-center gap-2"
                onSubmit={handleUsernameSubmit}
              >
                <Input
                  aria-label="Username"
                  autoComplete="username"
                  autoFocus
                  className="h-9 min-w-0 flex-[1_1_13rem] text-base font-black sm:text-xl"
                  disabled={updateUsernameMutation.isPending}
                  onChange={(event) => {
                    setUsernameDraft(event.target.value);
                    setUsernameError(null);
                  }}
                  onKeyDown={handleUsernameKeyDown}
                  value={usernameDraft}
                />
                <Button
                  disabled={updateUsernameMutation.isPending}
                  size="sm"
                  type="submit"
                  variant="ghost"
                >
                  {updateUsernameMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  disabled={updateUsernameMutation.isPending}
                  onClick={cancelUsernameEdit}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-xl font-black text-text sm:text-3xl">
                  {profile.username}
                </h1>
                <button
                  aria-label="Edit username"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3 text-text-muted transition-colors hover:text-text sm:h-8 sm:w-8"
                  onClick={startUsernameEdit}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="mt-1 truncate text-sm font-semibold text-text-muted">
              {profile.email}
            </p>
            {usernameError ? (
              <p className="mt-2 text-sm font-semibold text-danger" role="alert">
                {usernameError}
              </p>
            ) : null}
            <div className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
              {profile.isBanned ? (
                <HeaderStatusBadge
                  label="Restricted"
                  tone="danger"
                />
              ) : (
                <HeaderStatusBadge label="Active" tone="success" />
              )}
              <HeaderStatusBadge
                label={
                  profile.hasVerifiedRoleOnDiscord
                    ? "Discord Verified"
                    : "Discord Unverified"
                }
                tone={
                  profile.hasVerifiedRoleOnDiscord ? "success" : "muted"
                }
              />
              <HeaderStatusBadge
                label={profile.hasPassword ? "Password Set" : "Password Missing"}
                tone={profile.hasPassword ? "success" : "danger"}
              />
              <span className="text-xs font-semibold text-text-subtle">
                Joined {formatProfileDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:min-w-64 md:rounded-md md:bg-surface-3/45 md:p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-text">Private Mode</span>
            <StaticToggle />
          </div>
          <Button
            className="h-auto w-fit justify-start border-0 bg-transparent p-0 text-primary-soft disabled:opacity-100 hover:bg-transparent md:h-8 md:w-full md:justify-center md:px-3 md:text-text-muted md:disabled:opacity-50"
            disabled
            size="sm"
            type="button"
            variant="ghost"
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
