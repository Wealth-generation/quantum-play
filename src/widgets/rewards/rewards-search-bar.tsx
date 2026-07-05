import { ChevronDown } from "lucide-react";
import RewardsSearchIcon from "@/shared/assets/rewards/icons/rewards-search.svg";

export function RewardsSearchBar() {
  return (
    <div className="flex flex-col gap-2 w-full lg:flex-row lg:items-center lg:gap-4">
      <div className="flex items-center gap-1 h-12 bg-surface border border-border rounded-md p-3 lg:flex-1 lg:gap-3 lg:px-4 lg:py-0">
        <RewardsSearchIcon className="size-5 shrink-0 text-text-subtle" aria-hidden="true" />
        <input
          type="text"
          placeholder="Enter text"
          readOnly
          className="flex-1 bg-transparent outline-none text-sm text-text-subtle placeholder:text-text-subtle"
        />
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:gap-4 lg:shrink-0">
        <div className="flex items-center justify-between h-12 bg-surface border border-border rounded-md px-4 lg:justify-start lg:gap-2 lg:border-border-2">
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="text-text-subtle">Sort by:</span>
            <span className="text-primary">Active</span>
          </div>
          <div className="size-6 flex items-center justify-center bg-surface-3 rounded-md shrink-0">
            <ChevronDown size={16} className="text-text-muted" />
          </div>
        </div>

        <div className="flex items-center justify-between h-12 bg-surface border border-border rounded-md px-4 lg:justify-start lg:gap-2 lg:border-border-2">
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="text-text-subtle">Sort by:</span>
            <span className="text-primary">Newest</span>
          </div>
          <div className="size-6 flex items-center justify-center bg-surface-3 rounded-md shrink-0">
            <ChevronDown size={16} className="text-text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
