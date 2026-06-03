"use client";

import { Button } from "@/shared/ui/primitives/button";
import { useAuthModal } from "@/widgets/auth-modal";

export function LobbyHeroCta() {
  const { setOpen } = useAuthModal();

  return (
    <Button variant="primary" size="md" onClick={() => setOpen(true)}>
      Play Now
    </Button>
  );
}
