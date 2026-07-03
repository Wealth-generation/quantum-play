"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Info, RefreshCw, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";
import { useAuthSession, useLogoutMutation } from "@/features/auth";
import {
  type BalanceDisplayEvent,
  useBalanceDisplayProjection,
  useBalanceQuery,
} from "@/features/balance";
import { PointsExchangeModal } from "@/features/points-exchange";
import { useAuthModal } from "@/widgets/auth-modal";
import { AnimatedBalanceValue } from "./animated-balance-value";

interface TopBarProps {
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

const profileMenuItems = [
  { label: "Profile", href: "/user", icon: "/images/profile.svg" },
  {
    label: "Connections",
    href: "/user?tab=connections",
    icon: "/images/connections.svg",
  },
  {
    label: "Bet History",
    href: "/user?tab=bets-history",
    icon: "/images/bet-history.svg",
  },
  {
    label: "Seed History",
    href: "/user?tab=seed-history",
    icon: "/images/seed-history.svg",
  },
] as const;

const LOGO_WIDTH = 577;
const LOGO_HEIGHT = 433;

function QuantumPlayLogo({ className }: { className: string }) {
  return (
    <Image
      alt="Quantum Play"
      className={className}
      height={LOGO_HEIGHT}
      sizes="76px"
      src="/images/quantum-play-logo.webp"
      width={LOGO_WIDTH}
    />
  );
}

function BalancePill({
  alt,
  event,
  src,
  value,
}: {
  alt: string;
  event?: BalanceDisplayEvent;
  src: string;
  value: string;
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-md bg-surface-3 px-2 text-xs font-bold text-text shadow-inset-hi sm:h-9 sm:gap-2 sm:px-3 sm:text-sm">
      <Image
        alt={alt}
        className="h-4 w-4 sm:h-5 sm:w-5"
        height={20}
        src={src}
        width={20}
      />
      <AnimatedBalanceValue event={event} label={alt} value={value} />
    </span>
  );
}

function BalancePopoverRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface-3 px-3 py-2 shadow-inset-hi">
      <span className="flex min-w-0 items-center gap-2">
        <Image alt="" className="h-5 w-5 shrink-0" height={20} src={icon} width={20} />
        <span className="truncate text-sm font-bold text-text-muted">{label}</span>
        <Info className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      </span>
      <span className="shrink-0 text-sm font-black tabular-nums text-text">
        {value}
      </span>
    </div>
  );
}

export function TopBar({ drawerOpen, onCloseDrawer }: TopBarProps) {
  const reduceMotion = useReducedMotion();
  const { setOpen } = useAuthModal();
  const [balancePopoverOpen, setBalancePopoverOpen] = React.useState(false);
  const [pointsExchangeOpen, setPointsExchangeOpen] = React.useState(false);
  const { data: session, isLoading } = useAuthSession();
  const logoutMutation = useLogoutMutation();
  const authenticated = session?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const balanceProjection = useBalanceDisplayProjection();
  const gamePoints =
    balanceProjection?.gamePoints ?? balanceQuery.data?.gamePoints ?? "0.00";
  const watchPoints =
    balanceProjection?.watchPoints ?? balanceQuery.data?.watchPoints ?? "0.00";
  const gamePointsEvent =
    balanceProjection?.event?.balanceType === "GAME_POINTS" &&
      balanceProjection.event.nextValue === gamePoints
      ? balanceProjection.event
      : undefined;

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-3 sm:px-8">
      {/*
        Mobile logo area: X close button + logo, both in a flex row.
        The X slides in from the left when the drawer is open using a CSS transition.
        The logo slides right to make room using the same transition.
        Desktop (lg+): this entire block is hidden; desktop logo rendered separately below.
      */}
      <div className="flex min-w-0 shrink-0 items-center lg:hidden">
        {/* X close button — occupies space (w-8 + mr-2) only when drawer is open */}
        <button
          aria-label="Close navigation"
          className={[
            "flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-[opacity,transform] duration-400 ease-in-out hover:text-text",
            drawerOpen
              ? "mr-2 translate-x-0 opacity-100"
              : "mr-0 -translate-x-4 opacity-0 pointer-events-none",
          ].join(" ")}
          onClick={onCloseDrawer}
          tabIndex={drawerOpen ? 0 : -1}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo — link to Lobby; also closes drawer if open */}
        <Link
          aria-label="Quantum Play — go to Lobby"
          className="transition-transform duration-400 ease-in-out"
          href="/"
          onClick={onCloseDrawer}
        >
          <QuantumPlayLogo className="h-auto w-[70px]" />
        </Link>
      </div>

      {/* Desktop: logo on the left, link to Lobby */}
      <Link
        aria-label="Quantum Play — go to Lobby"
        className="hidden shrink-0 items-center lg:flex"
        href="/"
      >
        <QuantumPlayLogo className="h-auto w-[76px]" />
      </Link>

      {/* Spacer — pushes right-side controls to the far right on all breakpoints */}
      <div className="flex-1" />

      {authenticated ? (
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Balance popover — shown on mobile and desktop; wiring preserved exactly */}
          <Popover open={balancePopoverOpen} onOpenChange={setBalancePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Open points balances"
                className="flex items-center gap-0.5 rounded-md bg-bg/30 p-0.5 outline-none transition-colors hover:bg-bg/50 focus-visible:shadow-glow sm:gap-1 sm:p-1"
                type="button"
              >
                <BalancePill
                  alt="Game points"
                  event={gamePointsEvent}
                  src="/images/game-point.svg"
                  value={gamePoints}
                />
                <BalancePill
                  alt="Watch points"
                  src="/images/watch-point.svg"
                  value={watchPoints}
                />
                <span className="flex h-8 w-6 items-center justify-center rounded-md bg-surface-3 text-text-muted sm:h-9 sm:w-7">
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(calc(100vw-1rem),288px)] p-3"
              sideOffset={8}
            >
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
              >
                <p className="text-sm font-black text-text">Points Balances</p>
                <div className="space-y-2">
                  <BalancePopoverRow
                    icon="/images/game-point.svg"
                    label="Game Points"
                    value={gamePoints}
                  />
                  <BalancePopoverRow
                    icon="/images/watch-point.svg"
                    label="Watch Points"
                    value={watchPoints}
                  />
                </div>
                <Button
                  className="h-10 w-full gap-2 font-black"
                  onClick={() => {
                    setBalancePopoverOpen(false);
                    setPointsExchangeOpen(true);
                  }}
                  type="button"
                  variant="secondary"
                >
                  <RefreshCw className="h-4 w-4" />
                  Exchange Points
                </Button>
              </motion.div>
            </PopoverContent>
          </Popover>
          <PointsExchangeModal
            gamePoints={gamePoints}
            onOpenChange={setPointsExchangeOpen}
            open={pointsExchangeOpen}
            watchPoints={watchPoints}
          />

          {/* Desktop-only controls */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="mx-2 h-8 w-px bg-border-2" />
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-3 text-text-muted">
              <Bell className="h-4 w-4" />
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  aria-label="Open profile menu"
                  className="h-9 max-w-56 gap-2 px-2 text-text hover:text-text"
                  type="button"
                  variant="ghost"
                >
                  <Image alt="" height={20} src="/images/profile.svg" width={20} />
                  <span className="truncate text-xs font-medium">
                    {session.user.username}
                  </span>
                  <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 overflow-hidden p-1" sideOffset={8}>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
                >
                  {profileMenuItems.map((item) => (
                    <Link
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-primary"
                      href={item.href}
                      key={item.href}
                    >
                      <Image alt="" height={20} src={item.icon} width={20} />
                      {item.label}
                    </Link>
                  ))}
                  <div aria-hidden="true" className="my-1 h-px bg-border" />
                  <button
                    className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm font-medium text-text-muted transition-colors hover:bg-surface-3 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                    disabled={logoutMutation.isPending}
                    onClick={() => logoutMutation.mutate()}
                    type="button"
                  >
                    <Image alt="" height={20} src="/images/logout.svg" width={20} />
                    Logout
                  </button>
                </motion.div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : (
        <Button
          disabled={isLoading}
          onClick={() => setOpen(true)}
          variant="primary"
          className="h-[40px] w-[120px] cursor-pointer py-0"
        >
          Log In
        </Button>
      )}
    </header>
  );
}
