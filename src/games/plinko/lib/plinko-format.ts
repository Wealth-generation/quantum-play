export function formatPlinkoMultiplier(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : String(value)}x`;
}
