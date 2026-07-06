import { Card } from "@/shared/ui/primitives";
import { type LegalSection } from "./privacy-data";

interface LegalSectionProps {
  section: LegalSection;
}

export function LegalSectionBlock({ section }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6">
      {/* Section header: numbered badge + heading */}
      <div className="flex items-center gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">
          {section.number}
        </span>
        <h2 className="text-[clamp(18px,1.8vw,20px)] font-bold text-text">{section.heading}</h2>
      </div>

      {/* Intro paragraph */}
      <p className="text-sm leading-6 text-text-muted">{section.intro}</p>

      {/* Pill rows */}
      <ul className="flex flex-col gap-2">
        {section.items.map((item, i) => (
          <li key={i}>
            <Card
              variant="surface"
              padding="none"
              className="flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span className="text-sm leading-5 text-text-muted">{item}</span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
