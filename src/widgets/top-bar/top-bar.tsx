"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
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
import { useAuthModal } from "@/widgets/auth-modal";
import { AnimatedBalanceValue } from "./animated-balance-value";

interface TopBarProps {
  onOpenDrawer: () => void;
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

export function TopBar({ onOpenDrawer }: TopBarProps) {
  const reduceMotion = useReducedMotion();
  const { setOpen } = useAuthModal();
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
      {/* Mobile: drawer toggle */}
      <Button
        aria-label="Open navigation"
        className="mr-2 flex h-8 w-8 lg:hidden"
        onClick={onOpenDrawer}
        size="icon"
        variant="ghost"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile: centered wordmark */}
      <span className="min-w-0 flex-1 truncate text-center text-xs font-bold uppercase tracking-widest text-text sm:text-sm lg:hidden">
        Quantum Play
      </span>

      {/* Desktop: logo on the left */}
      <span className="hidden text-sm font-bold uppercase tracking-widest text-text lg:block">
        Quantum Play
      </span>

      {/* Desktop spacer */}
      <div className="hidden flex-1 lg:block" />

      {authenticated ? (
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            aria-label="Account balances"
            className="flex items-center gap-0.5 rounded-md bg-bg/30 p-0.5 sm:gap-1 sm:p-1"
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
          </div>
          <span className="mx-2 hidden h-8 w-px bg-border-2 md:block" />
          <span className="hidden max-w-40 truncate rounded-pill bg-control px-3 py-1 text-xs font-medium text-text-muted sm:inline lg:hidden">
            {session.user.username}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-3 text-text-muted lg:hidden">
            <Bell className="h-4 w-4" />
          </span>
          <Button
            aria-label="Log out"
            className="lg:hidden"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <div className="hidden items-center gap-2 lg:flex">
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
