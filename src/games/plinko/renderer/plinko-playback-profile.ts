export type PlinkoPlaybackMode = "normal" | "turbo";

export interface PlinkoPlaybackProfile {
  candidateBudget: "production";
  contactResponse: "production";
  launchVariation: "expressive";
  microStalls: "allowed" | "suppressed";
  mode: PlinkoPlaybackMode;
  pacing: "cinematic" | "turbo";
  restitution: "production";
}

const normalPlaybackProfile: PlinkoPlaybackProfile = {
  candidateBudget: "production",
  contactResponse: "production",
  launchVariation: "expressive",
  microStalls: "allowed",
  mode: "normal",
  pacing: "cinematic",
  restitution: "production",
};

const turboPlaybackProfile: PlinkoPlaybackProfile = {
  candidateBudget: "production",
  contactResponse: "production",
  launchVariation: "expressive",
  microStalls: "suppressed",
  mode: "turbo",
  pacing: "turbo",
  restitution: "production",
};

export function getPlinkoPlaybackProfile(
  turboEnabled: boolean,
): PlinkoPlaybackProfile {
  return turboEnabled ? turboPlaybackProfile : normalPlaybackProfile;
}
