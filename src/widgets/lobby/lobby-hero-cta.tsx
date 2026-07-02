"use client";

import { useAuthSession } from "@/features/auth";
import { Button } from "@/shared/ui/primitives/button";
import { useAuthModal } from "@/widgets/auth-modal";

// Client island — keeps lobby-hero.tsx a Server Component.
export function LobbyHeroCta() {
  const { openToTab } = useAuthModal();
  const { data, isPending } = useAuthSession();

  // Hide during loading to avoid flicker; hide once authenticated.
  if (isPending || data?.authenticated) return null;

  // variant=primary inherits Pass-1 token gradient — no per-instance bg override.
  // Button size alternates per Figma frame (size="md" supplies the base h-10/rounded-md/
  // text-base; only height / width / text-size differ per tier):
  //   base (375)  : 120 × 40, text-base
  //   md   (768)  : 140 × 48, text-lg
  //   lg   (1024) : 120 × 40, text-base  (Figma "hero 1024" resets to the small button)
  //   xl   (1213) : 140 × 48, text-lg
  return (
    <Button
      variant="primary"
      size="md"
      className="w-[120px] md:h-12 md:w-[140px] md:text-lg lg:h-10 lg:w-[120px] lg:text-base xl:h-12 xl:w-[140px] xl:text-lg"
      onClick={() => openToTab("register")}
    >
      Register
    </Button>
  );
}
