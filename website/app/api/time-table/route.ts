import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
	try {
		const timeTableDir = path.join(process.cwd(), "data/time-table");

		if (!fs.existsSync(timeTableDir)) {
			return NextResponse.json([], { status: 200 });
		}

		const items = fs.readdirSync(timeTableDir);
		const result: { semester: string; batches: string[] }[] = [];

		for (const item of items) {
			const itemPath = path.join(timeTableDir, item);
			const stats = fs.statSync(itemPath);

			if (stats.isDirectory()) {
				// Check if it's a year directory (4 digits)
				if (/^\d{4}$/.test(item)) {
					const yearDir = itemPath;
					const semesters = fs.readdirSync(yearDir).filter((subItem) => {
						return fs.statSync(path.join(yearDir, subItem)).isDirectory();
					});

					for (const semester of semesters) {
						const semesterDir = path.join(yearDir, semester);
						const batches = fs
							.readdirSync(semesterDir)
							.filter((file) => file.endsWith(".json"))
							.map((file) => file.replace(".json", ""));

						result.push({
							semester,
							batches,
						});
					}
				} else {
					// It's a semester directory directly in root (legacy support or mixed)
					const semester = item;
					const semesterDir = itemPath;
					const batches = fs
						.readdirSync(semesterDir)
						.filter((file) => file.endsWith(".json"))
						.map((file) => file.replace(".json", ""));

					result.push({
						semester,
						batches,
					});
				}
			}
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error reading time table directory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch time tables" },
			{ status: 500 }
		);
	}
}
