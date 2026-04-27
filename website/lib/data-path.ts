import path from "path";
import fs from "fs";

/**
 * Absolute path to the shared data directory at the repository root.
 * This sits one level above the Next.js project (website/).
 */
const dataPathInCwd = path.join(process.cwd(), "data");
const dataPathInParent = path.join(process.cwd(), "..", "data");

export const DATA_DIR = fs.existsSync(dataPathInCwd)
	? dataPathInCwd
	: dataPathInParent;
