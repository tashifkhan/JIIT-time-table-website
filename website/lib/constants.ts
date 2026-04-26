export const DEFAULT_SEMESTER = "EVEN26";
export const DEFAULT_ACADEMIC_YEAR = "2526";
export const DEFAULT_PORTAL_SEMESTER= ""


/**
 * Converts portal semester format to app format
 * @example "EVEN 2025-26" → "EVEN26"
 */
export function normalizePortalSemester(portalCode: string): string {
	// "EVEN 2025-26" → ["EVEN", "2025-26"] → "EVEN" + "26"
	const parts = portalCode.split(" ");
	if (parts.length === 2) {
		const yearPart = parts[1].split("-")[1]; // "26" from "2025-26"
		return `${parts[0]}${yearPart}`;
	}
	return portalCode;
}

export function findMatchingSemester<T extends { registration_code: string }>(
	semesters: T[],
	targetCode: string = DEFAULT_SEMESTER
): T | undefined {
	return semesters.find(
		(sem) => normalizePortalSemester(sem.registration_code) === targetCode
	);
}