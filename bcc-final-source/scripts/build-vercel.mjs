import { spawnSync } from "node:child_process";

const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(
  packageManager,
  ["exec", "vite", "build", "--config", "vite.vercel.config.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NITRO_PRESET: "vercel" },
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
