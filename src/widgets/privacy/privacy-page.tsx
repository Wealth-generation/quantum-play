import { SectionReveal } from "@/shared/ui/section-reveal";
import { privacySections } from "./privacy-data";
import { LegalSectionBlock } from "./legal-section";

export function PrivacyPage() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_55%),radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_55%)]"
      />
      <main className="mx-auto max-w-[1175px] px-4 py-10">
        <SectionReveal eager>
          <div className="mb-10 text-center">
            <h1 className="text-[clamp(26px,3vw,48px)] font-black uppercase tracking-wide text-text">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              Your privacy matters to us. Learn how we collect and use your data.
            </p>
          </div>
        </SectionReveal>

        <div className="flex flex-col gap-10">
          {privacySections.map((section, i) => (
            <SectionReveal key={section.number} delay={i * 0.05}>
              <LegalSectionBlock section={section} />
            </SectionReveal>
          ))}
        </div>
      </main>
    </div>
  );
}
