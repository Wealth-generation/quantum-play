const DECIMAL_SCALE_DIGITS = 12;
const DECIMAL_SCALE = BigInt("1000000000000");
const ZERO = BigInt(0);
const TWO = BigInt(2);
const HUNDRED = BigInt(100);

function parseDecimalUnits(value: string): bigint | null {
  const source = value.trim();

  if (!source) {
    return null;
  }

  if (/[eE]/.test(source)) {
    const numeric = Number(source);

    if (!Number.isFinite(numeric)) {
      return null;
    }

    return parseDecimalUnits(numeric.toFixed(DECIMAL_SCALE_DIGITS));
  }

  const negative = source.startsWith("-");
  const unsigned = source.replace(/^[+-]/, "");
  const [integerSource = "0", fractionSource = ""] = unsigned.split(".");
  const integerPart = integerSource || "0";
  const fractionPart = fractionSource
    .padEnd(DECIMAL_SCALE_DIGITS, "0")
    .slice(0, DECIMAL_SCALE_DIGITS);

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionSource)) {
    return null;
  }

  const units =
    BigInt(integerPart) * DECIMAL_SCALE + BigInt(fractionPart || "0");

  return negative ? -units : units;
}

function formatHundredths(value: bigint): string {
  const negative = value < ZERO;
  const absolute = negative ? -value : value;
  const integerPart = absolute / HUNDRED;
  const fraction = (absolute % HUNDRED).toString().padStart(2, "0");

  return `${negative ? "-" : ""}${integerPart.toString()}.${fraction}`;
}

export function formatBetMultiplier(
  payout: string,
  betSize: string,
): string {
  const payoutUnits = parseDecimalUnits(payout);
  const betUnits = parseDecimalUnits(betSize);

  if (
    payoutUnits === null ||
    betUnits === null ||
    payoutUnits < ZERO ||
    betUnits <= ZERO
  ) {
    return "\u2014";
  }

  const hundredths = (payoutUnits * HUNDRED + betUnits / TWO) / betUnits;

  return `${formatHundredths(hundredths)}x`;
}

export function isPositiveDecimal(value: string): boolean {
  const units = parseDecimalUnits(value);

  return units !== null && units > ZERO;
}

export function formatProfileDate(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatProfileDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function shortenAddress(value: string | null): string {
  if (!value) {
    return "Not connected";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function shortenIdentifier(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}
