"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import QuestionIcon from "@/shared/assets/leaderboard/icons/icon-question.svg";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/primitives/collapsible";
import { cn } from "@/shared/lib";

import { rulesItems } from "./leaderboard-data";

export function RulesAccordion() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section className="w-full px-4 md:px-8">
      <div className="mx-auto flex w-full max-w-[928px] flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <QuestionIcon
            aria-hidden="true"
            className="size-6 shrink-0"
          />
          <h2 className="text-[20px] font-semibold leading-6 text-text">
            Competition Rules &amp; Eligibility
          </h2>
        </div>

        <div className="flex w-full flex-col gap-[10px]">
          {rulesItems.map((item) => {
            const isOpen = openItem === item.title;

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={(nextOpen) =>
                  setOpenItem(nextOpen ? item.title : null)
                }
              >
                <div className="overflow-hidden rounded-lg bg-surface p-4">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 text-left">
                    <span className="text-base font-semibold leading-5 text-text [font-feature-settings:'lnum'_1,'pnum'_1]">
                      {item.title}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 text-text transition-transform",
                        isOpen && "rotate-180",
                      )}
                      strokeWidth={1.75}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="pt-2 pr-4">
                    <p className="text-sm leading-[18px] font-normal text-text-muted [font-feature-settings:'calt'_0]">
                      {item.content}
                    </p>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
