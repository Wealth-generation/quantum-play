"use client";

import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/primitives/collapsible";

// Real FAQ copy must be supplied by the business owner.
// These are neutral structural placeholders only — do not ship as final copy.
const FAQ_ITEMS = [
  {
    question: "How do I get started on Quantum Play?",
    answer:
      "Create an account, verify your email, and you're ready to explore our games and earn rewards.",
  },
  {
    question: "What games are available on the platform?",
    answer:
      "We currently offer Roulette, Dice, Keno, and Plinko, with more titles planned for future releases.",
  },
  {
    question: "How does the rewards system work?",
    answer:
      "You earn rewards by playing games and participating in platform activities. Visit the Rewards page for full details.",
  },
  {
    question: "Is my account information kept secure?",
    answer:
      "Yes. All account data is protected with industry-standard encryption and secure session management.",
  },
  {
    question: "How do I contact support if I have an issue?",
    answer:
      "Reach our support team through the Help Centre link in your account menu. We aim to respond within 24 hours.",
  },
] as const;

/**
 * FAQ accordion section for the lobby.
 *
 * Structure mirrors src/widgets/rewards/rewards-faq.tsx — built directly on the
 * shared Collapsible primitive (no cross-widget import). Each item is independent:
 * multiple can be open simultaneously. First item opens by default (matches rewards).
 *
 * Figma reference: node 4593-5965 (Evoverse Copy) — layout/spacing only.
 */
export function FaqSection() {
  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto flex max-w-[1175px] flex-col gap-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="size-6 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-text">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col gap-2 max-w-[928px] mx-auto w-full">
          {FAQ_ITEMS.map((item, index) => (
            <Collapsible
              key={item.question}
              defaultOpen={index === 0}
              className="overflow-hidden rounded-lg bg-surface"
            >
              <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between p-4 text-left text-base font-semibold text-text">
                {item.question}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 pt-2">
                <p className="pr-4 text-sm text-text-muted">{item.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}
