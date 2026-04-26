import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../../lib/data-path";

/**
 * @swagger
 * /api/academic-calendar:
 *   get:
 *     description: Returns a list of available academic calendar years
 *     responses:
 *       200:
 *         description: A list of years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                     description: The year identifier (e.g., "2425")
 *                   label:
 *                     type: string
 *                     description: The formatted label for the year (e.g., "2024-25")
 *       500:
 *         description: Internal server error
 */
/**
 * Retrieves a list of available academic calendar years.
 *
 * @returns A JSON response containing an array of available years
 */
export async function GET() {
	try {
		const calendarDir = path.join(DATA_DIR, "calender");

		if (!fs.existsSync(calendarDir)) {
			return NextResponse.json([], { status: 200 });
		}

		const years = fs
			.readdirSync(calendarDir)
			.filter((file) => file.endsWith(".json"))
			.map((file) => file.replace(".json", ""));

		const formattedYears = years.map((year) => {
			let label = year;
			if (year.length === 4 && !isNaN(Number(year))) {
				const start = year.substring(0, 2);
				const end = year.substring(2, 4);
				label = `20${start}-${end}`;
			}
			return { value: year, label };
		});

		formattedYears.sort((a, b) => b.value.localeCompare(a.value));

		return NextResponse.json(formattedYears);
	} catch (error) {
		console.error("Error reading calendar directory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch calendar years" },
			{ status: 500 }
		);
	}
}
