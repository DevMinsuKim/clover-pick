import { spawnSync } from "node:child_process";

// Local-only credentials match compose.yaml. Override inherited production URLs.
const localUrl =
  "postgresql://cloverpick:cloverpick_test@127.0.0.1:54329/cloverpick_test?sslmode=disable";
const args = process.argv.slice(2);
if (!args.length) throw new Error("실행할 Bun 명령이 필요합니다.");
const result = spawnSync(process.execPath, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    POSTGRES_PRISMA_URL: localUrl,
    POSTGRES_URL_NON_POOLING: localUrl,
    TEST_DATABASE_URL: localUrl,
  },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
