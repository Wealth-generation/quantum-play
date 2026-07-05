import { liveBetsResponse } from "../../_lib/live-bets-backend";

export async function GET() {
  return liveBetsResponse("/bets/latest/lucky");
}
