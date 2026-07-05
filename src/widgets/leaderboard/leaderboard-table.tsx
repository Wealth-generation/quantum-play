import Image, { type StaticImageData } from "next/image";

import avatar01 from "@/shared/assets/landing/leaderboard/images/avatar-01.webp";
import avatar02 from "@/shared/assets/landing/leaderboard/images/avatar-02.webp";
import avatar03 from "@/shared/assets/landing/leaderboard/images/avatar-03.webp";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";

import { tableRows, type TableRow } from "./leaderboard-data";

const TABLE_COLUMNS = ["Rank", "Username", "Wagered", "Prize"] as const;

const AVATARS: StaticImageData[] = [avatar02, avatar01, avatar03];

function getAvatar(rank: number) {
  return AVATARS[(rank - 1) % AVATARS.length];
}

function UsernameCell({
  rank,
  username,
}: Pick<TableRow, "rank" | "username">) {
  const avatar = getAvatar(rank);

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative size-5 shrink-0 overflow-hidden rounded-full"
        style={{
          // Not a token - one-off decorative avatar ring matching the Figma table row.
          background:
            "radial-gradient(circle at center, rgba(27,209,103,0.4) 0%, rgba(23,167,84,0.4) 25%, rgba(19,125,65,0.4) 50%, rgba(15,84,47,0.4) 75%, rgba(11,42,28,0.4) 100%)",
          // Not a token - one-off border value scoped to this avatar treatment.
          border: "0.667px solid #0A271A",
        }}
      >
        <Image
          src={avatar}
          alt=""
          fill
          sizes="20px"
          className="object-cover"
        />
      </div>
      <span className="truncate text-xs leading-4 font-normal text-text [font-feature-settings:'calt'_0]">
        {username}
      </span>
    </div>
  );
}

function AmountCell({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-on-primary"
      >
        $
      </span>
      <span className="text-xs leading-4 font-normal text-text [font-feature-settings:'calt'_0]">
        {value}
      </span>
    </div>
  );
}

export function LeaderboardTable() {
  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-5">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="min-w-[900px] w-full border-separate border-spacing-x-0 border-spacing-y-1 table-fixed">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>

            <thead>
              <tr className="h-11">
                {TABLE_COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs leading-4 font-normal text-text-muted [font-feature-settings:'calt'_0]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, index) => (
                <tr key={row.rank} className="h-11">
                  <td
                    className={cn(
                      "px-4 py-3 text-left text-xs leading-4 font-normal text-text [font-feature-settings:'calt'_0]",
                      index % 2 === 0 && "bg-surface",
                    )}
                  >
                    {row.rank}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-left",
                      index % 2 === 0 && "bg-surface",
                    )}
                  >
                    <UsernameCell rank={row.rank} username={row.username} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-left",
                      index % 2 === 0 && "bg-surface",
                    )}
                  >
                    <AmountCell value={row.wagered} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-left",
                      index % 2 === 0 && "bg-surface",
                    )}
                  >
                    <AmountCell value={row.prize} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-12 w-[138px] shrink-0 whitespace-nowrap rounded-md border-border bg-gradient-to-b from-surface-3 to-border-2 px-6 py-3 text-[18px] font-medium leading-6 text-text [font-feature-settings:'lnum'_1,'pnum'_1] hover:border-border hover:from-surface-3 hover:to-border-2"
        >
          Show more
        </Button>
      </div>
    </section>
  );
}
