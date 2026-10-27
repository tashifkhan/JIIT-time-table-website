export const DEFAULT_SEMESTER = "ODD26";
export const DEFAULT_ACADEMIC_YEAR = "2627";
export const DEFAULT_PORTAL_SEMESTER= ""

export const MESS_MENU_62_URI =
	"https://raw.githubusercontent.com/life2harsh/mess-schedular/main/mess_menu.json";
export const MESS_MENU_128_URI =
	"https://raw.githubusercontent.com/life2harsh/mess-schedular/main/mess_128_menu.json";


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