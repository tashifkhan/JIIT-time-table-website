import { DEFAULT_ACADEMIC_YEAR } from "./constants";

export interface AcademicYear {
	value: string;
	label: string;
}

export function getSmartAcademicYear(availableYears: AcademicYear[]): string {
	if (availableYears.length === 0) return DEFAULT_ACADEMIC_YEAR;

	// FIX: Prioritize DEFAULT_ACADEMIC_YEAR if it exists in the list
	const defaultInList = availableYears.find((y) => y.value === DEFAULT_ACADEMIC_YEAR);
	if (defaultInList) {
		return DEFAULT_ACADEMIC_YEAR;
	}

	// Since formattedYears in the API is sorted descending (newest first),
	// the first one is likely the most appropriate default.
	return availableYears[0].value;
}
