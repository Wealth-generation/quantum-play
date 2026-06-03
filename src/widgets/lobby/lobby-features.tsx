import { Card } from "@/shared/ui/primitives/card";

const features = [
  {
    title: "Provably Fair",
    description:
      "Every game outcome is cryptographically verifiable. Audit any result independently at any time.",
  },
  {
    title: "Instant Payouts",
    description:
      "Winnings land in your wallet immediately. No delays, no manual review, no holds.",
  },
  {
    title: "Multiple Games",
    description:
      "Plinko, Keno, Dice, and Roulette available now, with more titles on the way.",
  },
];

export function LobbyFeatures() {
  return (
    <section className="bg-bg py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold text-text">
          Why Quantum Play?
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} variant="surface" padding="lg">
              <h3 className="mb-2 text-base font-semibold text-text">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
