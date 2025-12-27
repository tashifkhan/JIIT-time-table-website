import { DEFAULT_SEMESTER } from "./constants";

export interface TimeTableInfo {
	semester: string;
	batches: string[];
}

export function getSmartSemester(timeTableData: TimeTableInfo[]): string {
	if (timeTableData.length === 0) return DEFAULT_SEMESTER;

	// FIX: Prioritize DEFAULT_SEMESTER if it exists in the data
	const defaultInList = timeTableData.find((d) => d.semester === DEFAULT_SEMESTER);
	if (defaultInList) {
		return DEFAULT_SEMESTER;
	}

	const now = new Date();
	const currentYear = now.getFullYear().toString().slice(-2);
	const currentMonth = now.getMonth(); // 0-11 (0 = Jan, 4 = May)

	// Filter for semesters matching current year
	const currentYearSemesters = timeTableData.filter((d) =>
		d.semester.endsWith(currentYear)
	);

	if (currentYearSemesters.length === 1) {
		return currentYearSemesters[0].semester;
	} else if (currentYearSemesters.length > 1) {
		// Jan-May is usually EVEN semester, July-Dec is ODD
		const isEven = currentMonth <= 4;
		const preferredPrefix = isEven ? "EVEN" : "ODD";
		const preferred = currentYearSemesters.find((d) =>
			d.semester.startsWith(preferredPrefix)
		);
		if (preferred) {
			return preferred.semester;
		} else {
			return currentYearSemesters[0].semester;
		}
	} else if (timeTableData.length > 0) {
		// If no matches for current year, try to find DEFAULT_SEMESTER
		const defaultSem = timeTableData.find(d => d.semester === DEFAULT_SEMESTER);
		if (defaultSem) return defaultSem.semester;
		
		// Otherwise return the first available (usually newest or oldest depending on sort)
		return timeTableData[0].semester;
	}

	return DEFAULT_SEMESTER;
}
