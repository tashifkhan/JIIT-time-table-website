import fs from "node:fs";
import path from "node:path";

if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const cwdDataDir = path.join(process.cwd(), "data");
const parentDataDir = path.join(process.cwd(), "..", "data");

if (fs.existsSync(parentDataDir)) {
  fs.rmSync(cwdDataDir, { recursive: true, force: true });
  fs.cpSync(parentDataDir, cwdDataDir, { recursive: true });
  process.exit(0);
}

if (fs.existsSync(cwdDataDir)) {
  process.exit(0);
}

console.warn("[sync-data-dir] No data directory found at ../data or ./data");
