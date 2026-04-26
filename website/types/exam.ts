export interface ExamEntry {
	subject_code: string;
	subject_type: "L" | "T" | "P";
	subject_name: string;
	exam_date: string; // DD-MM-YYYY
	exam_time: string; // e.g. "10.00 AM" | "02.30 PM"
	exam_day: string;
	semesters: number[]; // normalized parsed values, e.g. [2, 4]
	exam_type: string; // e.g. "T3"
}

export interface ExamSemesterInfo {
	semester: string; // e.g. "EVEN26"
	types: string[]; // e.g. ["T3"]
}