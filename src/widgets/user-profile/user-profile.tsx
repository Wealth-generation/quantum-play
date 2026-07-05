"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import type { UserProfileTab } from "@/features/user-profile/model/profile-tabs";
import {
  useUserProfileQuery,
  useUserProfileStatsQuery,
} from "@/features/user-profile/model/user-profile-query";
import { ProfileBetsHistoryPanel } from "@/features/user-profile/ui/profile-bets-history-panel";
import { ProfileConnectionsPanel } from "@/features/user-profile/ui/profile-connections-panel";
import { ProfileHeaderCard } from "@/features/user-profile/ui/profile-header-card";
import { ProfileOverviewPanel } from "@/features/user-profile/ui/profile-overview-panel";
import { ProfileSeedHistoryPanel } from "@/features/user-profile/ui/profile-seed-history-panel";
import {
  AuthRequiredState,
  ProfileLoadingState,
} from "@/features/user-profile/ui/profile-states";
import { ProfileTabNavigation } from "@/features/user-profile/ui/profile-tab-navigation";
import { ErrorState } from "@/features/user-profile/ui/profile-ui-primitives";

interface UserProfileProps {
  activeTab: UserProfileTab;
}

export function UserProfile({ activeTab }: UserProfileProps) {
  const sessionQuery = useAuthSession();
  const authenticated = sessionQuery.data?.authenticated === true;
  const profileQuery = useUserProfileQuery(authenticated);
  const statsQuery = useUserProfileStatsQuery(authenticated);
  const profile = profileQuery.data;

  let content: React.ReactNode;

  if (sessionQuery.isLoading) {
    content = <ProfileLoadingState />;
  } else if (!authenticated) {
    content = <AuthRequiredState />;
  } else if (profileQuery.isLoading) {
    content = <ProfileLoadingState />;
  } else if (profileQuery.isError || !profile) {
    content = (
      <ErrorState
        message={
          profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "Profile is unavailable."
        }
      />
    );
  } else {
    let activePanel: React.ReactNode;

    if (activeTab === "connections") {
      activePanel = <ProfileConnectionsPanel profile={profile} />;
    } else if (activeTab === "bets-history") {
      activePanel = (
        <ProfileBetsHistoryPanel
          authenticated={authenticated}
          profile={profile}
        />
      );
    } else if (activeTab === "seed-history") {
      activePanel = <ProfileSeedHistoryPanel />;
    } else {
      activePanel = (
        <ProfileOverviewPanel
          profile={profile}
          stats={statsQuery.data}
          statsError={statsQuery.isError}
          statsLoading={statsQuery.isLoading}
        />
      );
    }

    content = (
      <>
        <ProfileHeaderCard profile={profile} />
        <ProfileTabNavigation activeTab={activeTab} />
        {activePanel}
      </>
    );
  }

  return (
    <div className="min-h-full bg-bg">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 md:py-8 xl:px-8">
        {content}
      </section>
    </div>
  );
}
