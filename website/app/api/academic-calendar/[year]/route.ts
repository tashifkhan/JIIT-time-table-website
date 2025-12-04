import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
		const calendarDir = path.join(
			process.cwd(),
			"data/calender",
			year
		);

		if (!fs.existsSync(calendarDir)) {
			return NextResponse.json(
				{ error: "Calendar not found for the specified year" },
				{ status: 404 }
			);
		}

		// Check for both spellings: calendar.json and calender.json
		let filePath = path.join(calendarDir, "calendar.json");
		if (!fs.existsSync(filePath)) {
			filePath = path.join(calendarDir, "calender.json");
		}

		if (!fs.existsSync(filePath)) {
			return NextResponse.json(
				{ error: "Calendar data file not found" },
				{ status: 404 }
			);
		}

		const fileContent = fs.readFileSync(filePath, "utf-8");
		const data = JSON.parse(fileContent);

		return NextResponse.json(data);
	} catch (error) {
		console.error(`Error reading calendar for year ${year}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch calendar data" },
			{ status: 500 }
		);
	}
}
