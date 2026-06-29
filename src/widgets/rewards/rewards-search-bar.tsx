import { ChevronDown } from "lucide-react";
import RewardsSearchIcon from "@/shared/assets/rewards/icons/rewards-search.svg";

export function RewardsSearchBar() {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-3 px-4 h-12 bg-surface border border-border rounded-md w-full">
        <RewardsSearchIcon className="size-5 text-text-subtle" aria-hidden="true" />
        <input
          type="text"
          placeholder="Enter text"
          readOnly
          className="flex-1 bg-transparent outline-none text-sm text-text-subtle placeholder:text-text-subtle"
        />
      </div>

      <div className="flex gap-4 shrink-0">
        <div className="flex items-center gap-2 h-12 px-4 bg-surface border border-border-2 rounded-md">
          <span className="text-text-subtle text-sm">Sort by:</span>
          <span className="text-primary text-sm font-medium">Newest</span>
          <div className="rounded bg-surface-3 p-1">
            <ChevronDown size={16} className="text-text-muted" />
          </div>
        </div>

        <div className="flex items-center gap-2 h-12 px-4 bg-surface border border-border-2 rounded-md">
          <span className="text-text-subtle text-sm">Sort by:</span>
          <span className="text-primary text-sm font-medium">Active</span>
          <div className="rounded bg-surface-3 p-1">
            <ChevronDown size={16} className="text-text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
