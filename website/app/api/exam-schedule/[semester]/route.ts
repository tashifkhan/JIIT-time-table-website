import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "../../../../lib/data-path";

type RawExamEntry = {
	subject_code?: string;
	subject_type?: "L" | "T" | "P";
	subject_name?: string;
	exam_date?: string;
	exam_time?: string;
	exam_day?: string;
	semester?: string;
};

type NormalizedExamEntry = {
	subject_code: string;
	subject_type: "L" | "T" | "P";
	subject_name: string;
	exam_date: string;
	exam_time: string;
	exam_day: string;
	semesters: number[];
	exam_type: string;
};

function parseSemesters(value: unknown): number[] {
	if (typeof value !== "string") return [];

	return Array.from(
		new Set(
			value
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean)
				.map((part) => Number.parseInt(part, 10))
				.filter((part) => Number.isInteger(part))
		)
	).sort((a, b) => a - b);
}

function normalizeExamEntry(
	entry: RawExamEntry,
	examType: string
): NormalizedExamEntry | null {
	if (
		typeof entry.subject_code !== "string" ||
		(entry.subject_type !== "L" &&
			entry.subject_type !== "T" &&
			entry.subject_type !== "P") ||
		typeof entry.subject_name !== "string" ||
		typeof entry.exam_date !== "string" ||
		typeof entry.exam_time !== "string" ||
		typeof entry.exam_day !== "string"
	) {
		return null;
	}

	return {
		subject_code: entry.subject_code,
		subject_type: entry.subject_type,
		subject_name: entry.subject_name,
		exam_date: entry.exam_date,
		exam_time: entry.exam_time,
		exam_day: entry.exam_day,
		semesters: parseSemesters(entry.semester),
		exam_type: examType,
	};
}

/**
 * @swagger
 * /api/exam-schedule/{semester}:
 *   get:
 *     description: Returns all normalized exam entries for a given session, merged from all available exam type files
 *     parameters:
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: The semester/session identifier (e.g. "EVEN26")
 *     responses:
 *       200:
 *         description: Array of normalized exam entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subject_code:
 *                     type: string
 *                   subject_type:
 *                     type: string
 *                     enum: [L, T, P]
 *                   subject_name:
 *                     type: string
 *                   exam_date:
 *                     type: string
 *                     description: DD-MM-YYYY
 *                   exam_time:
 *                     type: string
 *                   exam_day:
 *                     type: string
 *                   semesters:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: Parsed semester list split and stripped from the raw semester string
 *                   exam_type:
 *                     type: string
 *                     description: Source exam type file, e.g. T3
 *       400:
 *         description: Semester identifier is required
 *       404:
 *         description: Exam schedule not found for this semester
 *       500:
 *         description: Internal server error
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ semester: string }> }
) {
	const { semester } = await params;

	if (!semester) {
		return NextResponse.json(
			{ error: "Semester identifier is required" },
			{ status: 400 }
		);
	}

	try {
		const examDir = path.join(DATA_DIR, "exam");

		if (!fs.existsSync(examDir)) {
			return NextResponse.json(
				{ error: "Exam schedule not found for this semester" },
				{ status: 404 }
			);
		}

		const search = (dir: string): string | null => {
			for (const item of fs.readdirSync(dir)) {
				const itemPath = path.join(dir, item);

				if (!fs.statSync(itemPath).isDirectory()) continue;
				if (item === semester) return itemPath;

				if (/^\d{4}$/.test(item)) {
					const found = search(itemPath);
					if (found) return found;
				}
			}

			return null;
		};

		const semesterPath = search(examDir);

		if (!semesterPath) {
			return NextResponse.json(
				{ error: "Exam schedule not found for this semester" },
				{ status: 404 }
			);
		}

		const files = fs
			.readdirSync(semesterPath)
			.filter((file) => file.startsWith("T") && file.endsWith(".json"))
			.sort();

		const entries: NormalizedExamEntry[] = [];

		for (const file of files) {
			const examType = file.replace(".json", "");
			const raw = fs.readFileSync(path.join(semesterPath, file), "utf-8");
			const data: unknown = JSON.parse(raw);

			if (!Array.isArray(data)) continue;

			for (const item of data) {
				const normalized = normalizeExamEntry(item as RawExamEntry, examType);
				if (normalized) {
					entries.push(normalized);
				}
			}
		}

		if (entries.length === 0) {
			return NextResponse.json(
				{ error: "Exam schedule not found for this semester" },
				{ status: 404 }
			);
		}

		return NextResponse.json(entries);
	} catch (error) {
		console.error(`Error reading exam schedule for ${semester}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch exam schedule" },
			{ status: 500 }
		);
	}
}