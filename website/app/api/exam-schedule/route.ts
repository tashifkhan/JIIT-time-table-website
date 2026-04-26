import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../../lib/data-path";

/**
 * @swagger
 * /api/exam-schedule:
 *   get:
 *     description: Returns a list of available exam semesters and their exam types
 *     responses:
 *       200:
 *         description: A list of semesters with available exam schedule files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   semester:
 *                     type: string
 *                     description: The semester identifier (e.g. "EVEN26")
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Available exam types (e.g. ["T3"])
 *       500:
 *         description: Internal server error
 */
export async function GET() {
	try {
		const examDir = path.join(DATA_DIR, "exam");

		if (!fs.existsSync(examDir)) {
			return NextResponse.json([], { status: 200 });
		}

		const result: { semester: string; types: string[] }[] = [];

		const collectSemesters = (dir: string) => {
			const items = fs.readdirSync(dir);
			for (const item of items) {
				const itemPath = path.join(dir, item);
				if (!fs.statSync(itemPath).isDirectory()) continue;

				// Year directory (4 digits) — recurse
				if (/^\d{4}$/.test(item)) {
					collectSemesters(itemPath);
					continue;
				}

				// Semester directory — collect T*.json files
				const types = fs
					.readdirSync(itemPath)
					.filter((f) => f.startsWith("T") && f.endsWith(".json"))
					.map((f) => f.replace(".json", ""));

				if (types.length > 0) {
					result.push({ semester: item, types });
				}
			}
		};

		collectSemesters(examDir);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error reading exam schedule directory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch exam schedules" },
			{ status: 500 }
		);
	}
}
