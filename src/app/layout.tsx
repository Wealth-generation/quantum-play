import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/widgets/app-shell";
import { AuthModalProvider } from "@/widgets/auth-modal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum Play",
  description: "iGaming platform — Plinko, Keno, Dice, Roulette",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <AuthModalProvider>
          <AppShell>{children}</AppShell>
        </AuthModalProvider>
      </body>
    </html>
  );
}
