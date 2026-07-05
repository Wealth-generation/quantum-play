"use client";

import * as React from "react";
import Image from "next/image";
import { useAuthSession } from "@/features/auth";
import { cn } from "@/shared/lib";
import dailyClaimerBg from "@/shared/assets/nav/images/daily-claimer-bg.webp";
import {
  formatDailyClaimCountdown,
  hasDailyClaimCountdown,
  useDailyClaimCountdown,
} from "../model/daily-claim-countdown";
import {
  useDailyClaimMutation,
  useDailyClaimStatusQuery,
} from "../model/daily-claim-query";

function DailyClaimChipIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="dc-chip-g0"
          x1="7"
          x2="7"
          y1="0"
          y2="14"
        >
          <stop stopColor="#1B1F26" />
          <stop offset="1" stopColor="#2B303B" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="dc-chip-g1"
          x1="6.99998"
          x2="6.99998"
          y1="4.78644"
          y2="9.21363"
        >
          <stop stopColor="#1B1F26" />
          <stop offset="1" stopColor="#2B303B" />
        </linearGradient>
      </defs>
      <circle cx="7.00003" cy="7" fill="#14532D" fillOpacity="0.5" r="6.61805" />
      <circle cx="6.99997" cy="6.99999" fill="#22C55E" r="4.3911" />
      <path
        d="M6.97199 3.58435e-05C5.58944 0.00557009 4.23949 0.420389 3.0924 1.19217C1.94531 1.96396 1.05245 3.05814 0.526436 4.33673C0.000420537 5.61531 -0.135193 7.02103 0.136698 8.37659C0.40859 9.73215 1.07581 10.9768 2.05421 11.9537C3.0326 12.9305 4.27836 13.5958 5.63435 13.8655C6.99034 14.1352 8.39584 13.9974 9.67359 13.4693C10.9513 12.9412 12.0441 12.0466 12.814 10.8983C13.584 9.75 13.9967 8.3994 14 7.01684C14.0015 6.09402 13.8206 5.18 13.4678 4.32729C13.115 3.47457 12.5972 2.69996 11.9442 2.04795C11.2911 1.39593 10.5157 0.87937 9.66239 0.527926C8.80911 0.176482 7.8948 -0.00291601 6.97199 3.58435e-05ZM8.39999 0.739236C9.67313 1.0306 10.8275 1.70249 11.7096 2.66564L10.2032 3.53364C9.68811 3.0514 9.07215 2.68986 8.39999 2.47524V0.739236ZM5.59999 0.739236V2.45844C4.90635 2.67034 4.2704 3.03812 3.74078 3.53364L2.23998 2.66564C3.13403 1.68954 4.30735 1.01293 5.59999 0.728036V0.739236ZM0.828783 8.96004C0.432913 7.70246 0.432913 6.35362 0.828783 5.09604L2.33518 5.96404C2.17068 6.66194 2.17068 7.38854 2.33518 8.08644L0.828783 8.96004ZM5.59999 13.3056C4.30735 13.0208 3.13403 12.3441 2.23998 11.368L3.74078 10.5C4.2704 10.9956 4.90635 11.3633 5.59999 11.5752V13.3056ZM2.79998 7.01684C2.79998 6.18616 3.04631 5.37413 3.50781 4.68344C3.96931 3.99276 4.62527 3.45443 5.39272 3.13654C6.16017 2.81866 7.00465 2.73548 7.81937 2.89754C8.63409 3.0596 9.38246 3.45961 9.96984 4.04699C10.5572 4.63437 10.9572 5.38274 11.1193 6.19746C11.2813 7.01218 11.1982 7.85666 10.8803 8.62411C10.5624 9.39156 10.0241 10.0475 9.33338 10.509C8.6427 10.9705 7.83067 11.2168 6.99999 11.2168C5.88653 11.2154 4.81911 10.7724 4.03177 9.98506C3.24444 9.19772 2.80147 8.1303 2.79998 7.01684ZM8.39999 13.2944V11.5584C9.07215 11.3438 9.68811 10.9823 10.2032 10.5L11.704 11.368C10.8234 12.3302 9.67112 13.002 8.39999 13.2944ZM11.6088 8.08084C11.7733 7.38294 11.7733 6.65634 11.6088 5.95844L13.1152 5.09044C13.5099 6.34629 13.5099 7.69299 13.1152 8.94884L11.6088 8.08084Z"
        fill="url(#dc-chip-g0)"
      />
      <path
        d="M4.25047 8.25356H5.2841C5.41139 8.25356 5.55523 8.18227 5.61379 8.06453C5.68698 7.91687 5.76018 7.76857 5.83401 7.62091C5.95112 7.38541 6.06759 7.14928 6.1847 6.91379L6.2649 6.75149C6.03195 6.72094 5.79964 6.69039 5.56669 6.66048L5.65643 6.88579C5.72835 7.06654 5.80027 7.2473 5.87219 7.42742C5.95939 7.647 6.04722 7.86659 6.13442 8.08617C6.20952 8.2752 6.28526 8.46423 6.36037 8.65326C6.39728 8.74555 6.43356 8.8372 6.47047 8.92949C6.47111 8.93076 6.47175 8.93203 6.47175 8.93331C6.48448 8.96386 6.49721 8.99441 6.50994 9.02432C6.53412 9.06887 6.56658 9.10452 6.60859 9.13125C6.67287 9.18089 6.75625 9.21717 6.84026 9.21335C6.90837 9.21017 6.97329 9.19299 7.03311 9.16116C7.11522 9.11788 7.18523 9.02114 7.20878 8.93267L7.30616 8.56606C7.38317 8.27456 7.46018 7.98306 7.5372 7.69219C7.63012 7.34023 7.72368 6.98826 7.81661 6.63629C7.89744 6.33206 7.97763 6.02719 8.05846 5.72296C8.09793 5.57466 8.13866 5.42636 8.17621 5.27743C8.17685 5.27552 8.17748 5.27361 8.17748 5.2717H7.44109L7.5251 5.54093C7.59193 5.75606 7.6594 5.97182 7.72623 6.18694C7.80706 6.44662 7.88789 6.70567 7.96872 6.96535C8.03873 7.19066 8.10874 7.41596 8.17939 7.64127C8.21376 7.75075 8.24622 7.86086 8.28186 7.96969C8.2825 7.97097 8.2825 7.97287 8.28314 7.97415C8.33342 8.13517 8.47981 8.25419 8.65165 8.25419H9.74956C9.84758 8.25419 9.95005 8.21155 10.0194 8.14218C10.0856 8.07598 10.1353 7.96715 10.1314 7.87231C10.127 7.77366 10.0945 7.67119 10.0194 7.60245C9.94496 7.53308 9.85331 7.4898 9.74956 7.4898H8.65165C8.77449 7.58336 8.89733 7.67692 9.02017 7.76984L8.93615 7.50062C8.86933 7.28549 8.80186 7.06973 8.73503 6.8546C8.6542 6.59492 8.57337 6.33588 8.49254 6.0762C8.42252 5.85089 8.35251 5.62558 8.28186 5.40027C8.2475 5.2908 8.21504 5.18069 8.17939 5.07185C8.17876 5.07058 8.17876 5.06867 8.17812 5.0674C8.1533 4.9872 8.10811 4.92037 8.04128 4.86882C7.977 4.81917 7.89362 4.78289 7.8096 4.78671C7.7415 4.7899 7.67658 4.80708 7.61676 4.8389C7.53465 4.88218 7.46464 4.97893 7.44109 5.0674L7.34371 5.434C7.2667 5.7255 7.18968 6.01701 7.11267 6.30787C7.01975 6.65984 6.92619 7.01181 6.83326 7.36377C6.75243 7.66801 6.67224 7.97288 6.5914 8.27711C6.55194 8.4254 6.51121 8.5737 6.47366 8.72264C6.47302 8.72454 6.47238 8.72645 6.47238 8.72836H7.20878L7.11904 8.50305C7.04712 8.3223 6.97519 8.14154 6.90327 7.96142C6.81608 7.74184 6.72824 7.52226 6.64105 7.30267C6.56595 7.11364 6.49021 6.92461 6.4151 6.73558C6.37819 6.64329 6.34191 6.55164 6.30499 6.45935C6.30436 6.45808 6.30372 6.45681 6.30372 6.45553C6.2789 6.3938 6.25344 6.33461 6.2057 6.28687C6.18025 6.26714 6.15415 6.24677 6.12869 6.22704C6.08477 6.19904 6.03768 6.18376 5.98676 6.18185C5.95303 6.17294 5.91929 6.17294 5.88492 6.18185C5.85055 6.18185 5.81809 6.19076 5.78882 6.20795C5.7169 6.2385 5.64179 6.29196 5.60615 6.36388C5.53296 6.51154 5.45976 6.65984 5.38593 6.8075C5.26882 7.04299 5.15235 7.27912 5.03524 7.51462L4.95504 7.67692C5.06515 7.61391 5.17462 7.5509 5.28473 7.48789H4.25111C4.15309 7.48789 4.05062 7.53053 3.98125 7.5999C3.91442 7.66801 3.86414 7.77684 3.86859 7.87168C3.87305 7.97033 3.90551 8.0728 3.98061 8.14154C4.05508 8.21028 4.14673 8.25356 4.25047 8.25356Z"
        fill="url(#dc-chip-g1)"
      />
    </svg>
  );
}

function DailyClaimPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "absolute bottom-[12px] left-[12px] flex h-[32px] max-w-[calc(100%-24px)] items-center rounded-[8px] bg-surface-3 px-[12px] py-[6px] text-sm font-semibold text-text shadow-btn",
        className,
      )}
    >
      <span className="truncate">{children}</span>
    </div>
  );
}

export function DailyClaimCard() {
  const { data: session, isLoading: authLoading } = useAuthSession();
  const authenticated = session?.authenticated === true;
  const statusQuery = useDailyClaimStatusQuery(authenticated);
  const claimMutation = useDailyClaimMutation();
  const status = statusQuery.data;
  const refetchStatus = statusQuery.refetch;
  const remainingSeconds = useDailyClaimCountdown(
    status,
    React.useCallback(() => {
      void refetchStatus();
    }, [refetchStatus]),
  );

  const canClaim =
    authenticated &&
    Boolean(status?.available) &&
    status?.enabled === true &&
    status.invalidConfig === false &&
    !claimMutation.isPending;
  const hasCountdown = hasDailyClaimCountdown(status);

  return (
    <div
      className="relative h-[124px] w-full overflow-hidden rounded-[7.619px]"
      style={{
        // One-off decorative shadow from the existing Daily Claimer artwork.
        boxShadow:
          "0px 0.862px 0px 0px #08923a, inset 0px 0.802px 0px 0px rgba(211,255,243,0.1)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          // One-off dark base matched to the Daily Claimer image edges.
          background: "#09110e",
        }}
      />

      <div className="absolute inset-0 overflow-hidden rounded-[7.619px]">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 195px, 154px"
          src={dailyClaimerBg}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[28px]"
        style={{
          // One-off artwork overlay; not reused as a design token.
          right: "-7px",
          backgroundImage: "linear-gradient(to top, #0e3c1e, transparent)",
        }}
      />

      <p className="absolute left-[12px] top-[12px] w-[100px] text-base font-semibold leading-5 text-text">
        DAILY CLAIMER!
      </p>

      {authLoading || (authenticated && statusQuery.isLoading) ? (
        <DailyClaimPill className="animate-pulse text-text-muted">
          Loading
        </DailyClaimPill>
      ) : !authenticated ? (
        <DailyClaimPill className="bg-gradient-to-b from-primary-tint to-primary text-on-primary">Log in</DailyClaimPill>
      ) : statusQuery.isError ? (
        <DailyClaimPill className="text-text-muted">Unavailable</DailyClaimPill>
      ) : !status?.enabled || status.invalidConfig ? (
        <DailyClaimPill className="text-text-muted">Unavailable</DailyClaimPill>
      ) : status.available ? (
        <button
          aria-label={`Claim ${status.pointsAmount} daily points`}
          className="absolute bottom-[12px] left-[12px] flex h-[32px] max-w-[calc(100%-24px)] cursor-pointer items-center gap-[4px] rounded-[8px] bg-gradient-to-b from-primary-tint to-primary px-[12px] py-[6px] text-sm font-medium text-on-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!canClaim}
          onClick={() => claimMutation.mutate()}
          type="button"
        >
          <span>{claimMutation.isPending ? "Claiming" : "Claim"}</span>
          <span className="flex min-w-0 items-center gap-[2px]">
            <DailyClaimChipIcon className="h-[14px] w-[14px] shrink-0" />
            <span className="truncate">{status.pointsAmount}</span>
          </span>
        </button>
      ) : hasCountdown ? (
        <DailyClaimPill>
          {formatDailyClaimCountdown(remainingSeconds)}
        </DailyClaimPill>
      ) : (
        <DailyClaimPill className="text-text-muted">Unavailable</DailyClaimPill>
      )}
    </div>
  );
}
