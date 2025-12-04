import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ semester: string; batch: string }> }
) {
	const { semester, batch } = await params;

	if (!semester || !batch) {
		return NextResponse.json(
			{ error: "Semester and Batch identifiers are required" },
			{ status: 400 }
		);
	}

	try {
		const timeTableDir = path.join(process.cwd(), "data/time-table");
		let semesterPath = path.join(timeTableDir, semester);

		// If not found in root, check year directories
		if (!fs.existsSync(semesterPath)) {
			const items = fs.readdirSync(timeTableDir);
			for (const item of items) {
				const itemPath = path.join(timeTableDir, item);
				if (
					fs.statSync(itemPath).isDirectory() &&
					/^\d{4}$/.test(item)
				) {
					const potentialPath = path.join(itemPath, semester);
					if (fs.existsSync(potentialPath)) {
						semesterPath = potentialPath;
						break;
					}
				}
			}
		}

		const filePath = path.join(semesterPath, `${batch}.json`);

		if (!fs.existsSync(filePath)) {
			return NextResponse.json(
				{ error: "Time table not found" },
				{ status: 404 }
			);
		}

		const fileContent = fs.readFileSync(filePath, "utf-8");
		const data = JSON.parse(fileContent);

		return NextResponse.json(data);
	} catch (error) {
		console.error(
			`Error reading time table for ${semester}/${batch}:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to fetch time table data" },
			{ status: 500 }
		);
	}
}
