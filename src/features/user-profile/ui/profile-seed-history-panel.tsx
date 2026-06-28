import { Copy, Lock } from "lucide-react";
import { SectionCard } from "./profile-ui-primitives";

export function ProfileSeedHistoryPanel() {
  return (
    <SectionCard title="Seed History">
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px] rounded-md border border-border-2 bg-surface p-2 shadow-inset-hi">
          <div className="grid grid-cols-[1.4fr_1.4fr_0.6fr_1fr] gap-4 px-3 py-3 text-xs font-semibold text-text-subtle">
            <span>Client Seed</span>
            <span>Server Seed</span>
            <span>Nonce</span>
            <span>Date</span>
          </div>
          <div className="grid min-h-28 place-items-center rounded-sm bg-surface-3 px-4 py-8 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg/50 text-primary">
                <Lock aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-text">Seed history unavailable</h3>
              <p className="mt-1 text-sm font-semibold text-text-muted">
                No seed history contract is implemented.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-control px-3 py-2 text-xs font-bold text-text-subtle">
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy actions are disabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
