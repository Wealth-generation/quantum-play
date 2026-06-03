import { Card } from "@/shared/ui/primitives/card";

const steps = [
  {
    step: "01",
    title: "Create an Account",
    description: "Sign up in seconds with your email address.",
  },
  {
    step: "02",
    title: "Add Funds",
    description: "Deposit using your preferred payment method.",
  },
  {
    step: "03",
    title: "Start Playing",
    description: "Choose a game, place your bet, and enjoy provably fair outcomes.",
  },
];

export function LobbyHowTo() {
  return (
    <section id="how-to-get-started" className="bg-surface-2 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold text-text">
          How to Get Started
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.step} variant="panel" padding="lg">
              <span className="mb-3 block text-4xl font-black text-primary">
                {s.step}
              </span>
              <h3 className="mb-2 text-base font-semibold text-text">{s.title}</h3>
              <p className="text-sm text-text-muted">{s.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
