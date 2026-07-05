import { spawnSync } from "node:child_process";

const checks = [
  ["git", ["diff", "--check"]],
  ["pnpm", ["lint"]],
  ["pnpm", ["build"]],
  ["pnpm", ["check:docs"]],
];

for (const [command, args] of checks) {
  const label = [command, ...args].join(" ");
  console.log(`\n> ${label}`);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`Validation failed to start: ${label}`);
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Validation failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nValidation passed.");
