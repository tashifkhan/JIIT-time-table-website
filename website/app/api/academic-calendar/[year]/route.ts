import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../../../lib/data-path";

/**
 * @swagger
 * /api/academic-calendar/{year}:
 *   get:
 *     description: Returns the academic calendar data for a specific year
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: The year identifier (e.g., "2425")
 *     responses:
 *       200:
 *         description: The academic calendar data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   summary:
 *                     type: string
 *                     description: Event summary
 *                   start:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Start date (YYYY-MM-DD)
 *                   end:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: End date (YYYY-MM-DD)
 *       400:
 *         description: Year identifier is required
 *       404:
 *         description: Calendar not found
 *       500:
 *         description: Internal server error
 */
/**
 * Retrieves the academic calendar for a specific year.
 *
 * @param request - The incoming request object
 * @param params - The route parameters containing the year
 * @returns A JSON response containing the calendar data or an error message
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ year: string }> }
) {
	const { year } = await params;

	if (!year) {
		return NextResponse.json(
			{ error: "Year identifier is required" },
			{ status: 400 }
		);
	}

	try {
		const filePath = path.join(DATA_DIR, "calender", `${year}.json`);

		if (!fs.existsSync(filePath)) {
			return NextResponse.json(
				{ error: "Calendar not found for the specified year" },
				{ status: 404 }
			);
		}

		const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		return NextResponse.json(data);
	} catch (error) {
		console.error(`Error reading calendar for year ${year}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch calendar data" },
			{ status: 500 }
		);
	}
}
