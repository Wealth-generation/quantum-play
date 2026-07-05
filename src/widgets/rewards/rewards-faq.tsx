import { ChevronDown } from "lucide-react";
import QuestionBubbleIcon from "@/shared/assets/rewards/icons/icon-question.svg";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/primitives/collapsible";

import { faqItems } from "./rewards-data";

export function RewardsFaq() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <QuestionBubbleIcon className="size-6 text-primary" aria-hidden="true" />
        <h4 className="text-xl font-semibold text-text">
          Frequently asked questions
        </h4>
      </div>

      <div className="flex flex-col gap-[10px] max-w-[928px] mx-auto">
        {faqItems.map((item, index) => (
          <Collapsible
            key={item.title}
            defaultOpen={index === 0}
            className="bg-surface rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger className="group flex w-full items-center justify-between p-4 text-left text-base font-semibold text-text">
              {item.title}
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 pb-4">
              <p className="text-sm text-text-muted pr-4">{item.content}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}
