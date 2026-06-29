import { UserRound } from "lucide-react";
import { Card } from "@/shared/ui/primitives/card";
import { LoadingBlock } from "./profile-ui-primitives";

export function AuthRequiredState() {
  return (
    <Card className="p-6 text-center" padding="none" variant="panel">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-surface-3 text-primary">
        <UserRound aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-black text-text">Profile unavailable</h1>
      <p className="mt-2 text-sm font-semibold text-text-muted">
        Log in to view account details.
      </p>
    </Card>
  );
}

export function ProfileLoadingState() {
  return (
    <div className="flex flex-col gap-5">
      <LoadingBlock className="h-44" />
      <div className="grid gap-3 md:grid-cols-3">
        <LoadingBlock className="h-32" />
        <LoadingBlock className="h-32" />
        <LoadingBlock className="h-32" />
      </div>
      <LoadingBlock className="h-56" />
    </div>
  );
}
