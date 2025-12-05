import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
 *                     description: The directory name for the year (e.g., "2425")
 *                   label:
 *                     type: string
 *                     description: The formatted label for the year (e.g., "2024-25")
 *       500:
 *         description: Internal server error
 */
export async function GET() {
	try {
		const calendarDir = path.join(process.cwd(), "data/calender");
		
		if (!fs.existsSync(calendarDir)) {
			return NextResponse.json([], { status: 200 });
		}

		const years = fs.readdirSync(calendarDir).filter((file) => {
			return fs.statSync(path.join(calendarDir, file)).isDirectory();
		});

		// Format years for the frontend
		const formattedYears = years.map((year) => {
            // Assuming folder names like "2425" mean "2024-25"
            // If the folder name is 4 digits, we can try to format it
            let label = year;
            if (year.length === 4 && !isNaN(Number(year))) {
                const start = year.substring(0, 2);
                const end = year.substring(2, 4);
                label = `20${start}-${end}`;
            }
			return {
				value: year,
				label: label,
			};
		});
        
        // Sort years in descending order (newest first)
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
