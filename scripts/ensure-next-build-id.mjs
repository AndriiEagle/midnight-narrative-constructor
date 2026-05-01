import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BUILD_ID = "midnight-narrative-constructor";
const nextDir = join(process.cwd(), ".next");
const buildIdPath = join(nextDir, "BUILD_ID");

if (!existsSync(nextDir)) {
  throw new Error("Cannot ensure BUILD_ID because the .next directory does not exist.");
}

mkdirSync(nextDir, { recursive: true });
writeFileSync(buildIdPath, BUILD_ID, "utf8");

console.log(`[build] ensured .next/BUILD_ID = ${BUILD_ID}`);
