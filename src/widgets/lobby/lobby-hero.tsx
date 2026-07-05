import Image from "next/image";
import { LobbyHeroCta } from "./lobby-hero-cta";

// Art assets — static imports give Next.js intrinsic dimensions + blur placeholder.
import heroBanknoteBack from "@/shared/assets/landing/hero/hero-banknote-back.webp";
import heroChipBack from "@/shared/assets/landing/hero/hero-chip-back.webp";
import heroBanknoteFront from "@/shared/assets/landing/hero/hero-banknote-front.webp";
import heroChipFront from "@/shared/assets/landing/hero/hero-chip-front.webp";
import heroBcgroundSigns from "@/shared/assets/landing/hero/hero-bcground-signs.png";

/**
 * Hero section — four responsive tiers, each matched to its own Figma frame:
 *   base (<md , <768)  → "hero 375"  node 4603:10893 — art 391×282 centered; 26px head;
 *                        button 120×40.
 *   md   (768–1023)    → "hero 768"  node 4599:9641 — art 682×271 right:-45; 36px head;
 *                        294px text; pl-32 pr-0; button 140×48.
 *   lg   (1024–1279)   → "hero 1024" node 5312:64275 — art 763×303 right:-45; 36px head;
 *                        503px text; pl-40 pr-0; button 120×40.
 *   xl   (≥1280)       → desktop 1213 frame — art 763×303 right:0; 48px head; 654px text;
 *                        18px subtitle; button 140×48.
 *
 * lg & xl share identical art-child positions (763×303 frame); they differ only in the
 * frame's right offset (-45 vs 0), headline size, text width, subtitle size, and button.
 *
 * Background gradient + glow are CSS-only. Glow colour #1dba4b is intentionally not a
 * @theme token — a one-off decorative value scoped here.
 *
 * Art z-order (back → front):
 *   1 bcground-signs  2 glow  3 chip-back  4 banknote-back  5 banknote-front  6 chip-front
 *
 * TODO (ui-qa): bcground-signs md/lg positions are approximate (single png stands in for
 *   Figma's scattered sign groups). Gradient angle is a single 47° for all tiers.
 */
export function LobbyHero() {
  return (
    <section
      aria-label="Hero"
      className="relative min-h-[420px] overflow-hidden md:min-h-0"
      style={{
        // Not a token — one-off Figma gradient scoped to this section.
        background:
          "linear-gradient(47deg, rgba(15,22,26,1) 2%, rgba(19,21,23,1) 99%)",
      }}
    >
      {/* ── Content container ──────────────────────────────────────────────────────
          base: column centered, px-4 pb-8 pt-6
          md  : row, pt-48 pb-32 pl-32 pr-0 (Figma 768), min-h-280
          lg  : row, pt-60 pb-40 pl-40 pr-0 (Figma 1024), min-h-300                  */}
      <div className="md:relative mx-auto flex max-w-[1213px] flex-col items-center gap-2 px-4 pb-8 pt-6 text-center md:min-h-[280px] md:flex-row md:items-center md:gap-0 md:pl-8 md:pr-0 md:pt-12 md:text-left lg:min-h-[300px] lg:pl-10 lg:pr-0 lg:pb-10 lg:pt-[60px]">

        {/* ── Text column ──────────────────────────────────────────────────────────
            base: centered, gap-2 (8px)
            md  : left, 294px, gap-8 (32px)
            lg  : left, 503px
            xl  : left, 654px                                                         */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-center md:w-[294px] md:shrink-0 md:items-start md:gap-8 md:text-left lg:w-[503px] xl:w-[654px]">
          <div className="flex flex-col gap-2">
            {/* STATIC PLACEHOLDER: headline. base 26px · md+lg 36/40 · xl 48/60. */}
            <h1 className="text-[26px] font-black uppercase leading-tight text-text md:text-[36px] md:leading-[40px] xl:text-[48px] xl:leading-[60px]">
              WELCOME TO QUANTUM PLAY
            </h1>
            {/* STATIC PLACEHOLDER: subtitle. base..lg 16/20 · xl 18/24. */}
            <p className="text-base leading-5 text-text-muted xl:max-w-[542px] xl:text-[18px] xl:leading-[24px]">
              Discover exciting games, earn rewards, and enjoy exclusive bonuses.
            </p>
          </div>

          {/* CTA — variant=primary inherits token gradient; no local bg override */}
          <LobbyHeroCta />
        </div>

        {/* ── Art block ──────────────────────────────────────────────────────────
            base: 391×282 centered, bottom-0.
            md  : 682×271, right-[-45px].
            lg  : 763×303, right-[-45px].
            xl  : 763×303, right-0.                                                   */}
        <div className="absolute bottom-0 left-1/2 h-[282px] w-[391px] -translate-x-1/2 overflow-visible md:left-auto md:right-[-45px] md:h-[271px] md:w-[682px] md:translate-x-0 lg:h-[303px] lg:w-[763px] xl:right-0">

          {/* z=1 — bcground-signs (decorative pattern, aria-hidden) */}
          <Image
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-[70px] top-[51px] opacity-50 md:left-[200px] md:top-[10px] lg:left-[210px] lg:top-[10px]"
            height={206}
            src={heroBcgroundSigns}
            width={298}
          />

          {/* z=2 — glow ellipse (CSS only; #1dba4b scoped inline, not in @theme)
              base 30/210 (675×203) · md 181/202 (648×195) · lg 203/226 (725×218)     */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[30px] top-[210px] h-[203px] w-[675px] rounded-full bg-[#1dba4b] md:left-[181px] md:top-[202px] md:h-[195px] md:w-[648px] lg:left-[203px] lg:top-[226px] lg:h-[218px] lg:w-[725px]"
            style={{
              // Not a token — Figma one-off glow, scoped to art block only.
              filter: "blur(293.69px)",
            }}
          />

          {/* z=3 — chip back (blurred, flipped)
              base 39/104 · md 212/119 (77×81) · lg 237/133 (86×90)                   */}
          <Image
            alt=""
            className="absolute left-[39px] top-[104px] md:left-[212px] md:top-[119px] md:h-[81px] md:w-[77px] lg:left-[237px] lg:top-[133px] lg:h-[90px] lg:w-[86px]"
            height={77}
            src={heroChipBack}
            style={{
              // Not a token — Figma decorative blur + flip-rotate transform.
              filter: "blur(3.14px)",
              transform: "matrix(-0.99, 0.12, 0.12, 0.99, 0, 0)",
            }}
            width={73}
          />

          {/* z=4 — banknote back (blurred, right-anchored)
              base right-21/65 · md right-16/27 (143×112) · lg right-18/30 (160×125)   */}
          <Image
            alt=""
            className="absolute right-[21px] top-[65px] md:left-auto md:right-[16px] md:top-[27px] md:h-[112px] md:w-[143px] lg:right-[18px] lg:top-[30px] lg:h-[125px] lg:w-[160px]"
            height={83}
            src={heroBanknoteBack}
            style={{
              // Not a token — Figma decorative blur + rotation.
              filter: "blur(7.09px)",
              transform: "rotate(0.51deg)",
            }}
            width={106}
          />

          {/* z=5 — banknote front (sharp)
              base -6/207 (144×113) · md 174/204 (128×94) · lg 194/228 (143×105)       */}
          <Image
            alt=""
            className="absolute -left-1.5 top-[207px] md:left-[174px] md:top-[204px] md:h-[94px] md:w-[128px] lg:left-[194px] lg:top-[228px] lg:h-[105px] lg:w-[143px]"
            height={113}
            src={heroBanknoteFront}
            width={144}
          />

          {/* z=6 — chip front
              base right-[-22]/bottom-[-40] · md right-20/top-179 (148×154)
              lg right-23/top-200 (165×172)                                           */}
          <Image
            alt=""
            className="absolute bottom-[-40px] right-[-22px] md:left-auto md:bottom-auto md:right-[20px] md:top-[179px] md:h-[154px] md:w-[148px] lg:right-[23px] lg:top-[200px] lg:h-[172px] lg:w-[165px]"
            height={124}
            src={heroChipFront}
            width={119}
          />
        </div>
      </div>
    </section>
  );
}
