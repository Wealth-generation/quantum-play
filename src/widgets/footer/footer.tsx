import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { aboutLinks, termsLinks, socialLinks, type SocialLink } from "./footer-data";

// ─── Social icon SVGs ─────────────────────────────────────────────────────────
// Brand icons were removed from lucide-react 1.x; minimal inline SVGs are used.

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  switch (icon) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.713 6.068zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M21.198 2.433a2.24 2.24 0 0 0-2.284-.295L3.487 9.435c-1.388.578-1.367 2.395.036 2.944l3.49 1.29 1.348 4.315c.17.543.834.74 1.268.38l1.898-1.564 3.79 2.895c.614.47 1.5.15 1.676-.593l3.168-14.386c.17-.766-.42-1.475-1.163-1.283zM10 15.5l-.5-3.5 8-6-9 5.5z" />
        </svg>
      );
    case "discord":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
      );
  }
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      {/* Single unified container — copyright row sits inside the footer body, not a sibling section */}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Main content row: brand block + link columns */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">

          {/* Brand block */}
          <div className="flex flex-col gap-4 md:w-56 md:shrink-0">
            <p className="text-lg font-black uppercase tracking-widest text-text">
              Quantum Play
            </p>
            <div className="flex items-center gap-2 text-text-muted">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">18+ Gamble Responsibly</span>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex flex-1 flex-wrap gap-8 md:justify-end">

            {/* ABOUT */}
            <div className="min-w-[120px]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text">
                About
              </h3>
              <ul className="space-y-2">
                {aboutLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* TERMS */}
            <div className="min-w-[160px]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text">
                Terms
              </h3>
              <ul className="space-y-2">
                {termsLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOCIALS */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text">
                Socials
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-3 text-text-muted transition-colors hover:bg-border-2 hover:text-text"
                  >
                    <SocialIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Copyright / legal — inside unified footer body, separated by a subtle divider */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs text-text-subtle">
            {/* Placeholder — real legal/licensing copy to be provided by the business owner */}
            &copy; 2025 Quantum Play. Licensing and regulatory information to be provided.
          </p>
        </div>

      </div>
    </footer>
  );
}
