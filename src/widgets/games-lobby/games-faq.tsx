"use client";

import * as React from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/primitives/collapsible";
import { cn } from "@/shared/lib";

const faqItems = [
  {
    title: "Rules",
    text: "Players are ranked by eligible game activity during the active campaign period. Rewards are issued after results are reviewed.",
  },
  {
    title: "How to claim",
    text: "Connect your account, verify your username, and follow the claim instructions announced by the Quantum Play team.",
  },
  {
    title: "How to join",
    text: "Play eligible games during an eligible Quantum Play promotion to enter automatically.",
  },
  {
    title: "Disclaimer",
    text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Responsible gambling",
    text: "Only play if you are of legal age in your jurisdiction and never wager more than you can afford to lose.",
  },
  {
    title: "Self-Exclusion Policy & Giveaway eligibility",
    text: "Users who are self-excluded, restricted, or otherwise ineligible under platform terms cannot participate in giveaways.",
  },
];

export function GamesFaq() {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-center gap-3 text-center">
        <CircleHelp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-black text-text">
          Competition Rules &amp; Eligibility
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {faqItems.map((item) => {
          const open = openItem === item.title;

          return (
            <Collapsible
              key={item.title}
              onOpenChange={(nextOpen) =>
                setOpenItem(nextOpen ? item.title : null)
              }
              open={open}
            >
              <CollapsibleTrigger className="flex min-h-16 w-full items-center justify-between gap-4 rounded-md border border-border bg-surface px-5 py-4 text-left text-base font-black text-text transition-colors hover:bg-surface-3">
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-text-muted transition-transform",
                    open && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="-mt-1 rounded-b-md border border-t-0 border-border bg-surface px-5 pb-5 pt-2 text-sm leading-6 text-text-muted">
                  {item.text}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </section>
  );
}
