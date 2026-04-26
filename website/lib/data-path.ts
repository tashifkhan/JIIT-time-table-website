import path from "path";

/**
 * Absolute path to the shared data directory at the repository root.
 * This sits one level above the Next.js project (website/).
 */
export const DATA_DIR = path.join(process.cwd(), "..", "data");
