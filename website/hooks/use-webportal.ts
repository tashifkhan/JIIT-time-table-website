"use client";

import { useState, useCallback, useRef } from "react";
import { findMatchingSemester } from "../lib/constants";

// Types for portal data
interface PortalSemester {
	registration_id: string;
	registration_code: string;
}

interface PortalSubject {
	subject_code: string;
	subject_desc: string;
	subject_component_code: string;
	credits: number;
}

export interface StudentInfo {
	campus: string;
	year: string;
	batch: string;
	error?: string;
}

export interface WebPortalState {
	isLoading: boolean;
	isLoggedIn: boolean;
	error: string | null;
	semesters: PortalSemester[];
	subjects: PortalSubject[];
	selectedSemester: PortalSemester | null;
	studentInfo: StudentInfo | null;
}

export function useWebPortal() {
	const portalRef = useRef<any>(null);
	const [state, setState] = useState<WebPortalState>({
		isLoading: false,
		isLoggedIn: false,
		error: null,
		semesters: [],
		subjects: [],
		selectedSemester: null,
		studentInfo: null,
	});

	// Dynamic import of jsjiit (ESM module)
	const getPortal = useCallback(async () => {
		if (!portalRef.current) {
			const { WebPortal } = await import(
				// @ts-expect-error - jsjiit is an external ESM module
				"https://cdn.jsdelivr.net/npm/jsjiit@0.0.23/dist/jsjiit.esm.js"
			);
			portalRef.current = new WebPortal();
		}
		return portalRef.current;
	}, []);

	const login = useCallback(
		async (enrollment: string, password: string) => {
			setState((s) => ({ ...s, isLoading: true, error: null }));
			try {
				const portal = await getPortal();
				await portal.student_login(enrollment, password);

				// Fetch profile info for campus/year/batch derivation
				const profileData = await portal.get_personal_info();
				const profileInfo = profileData?.generalinformation || {};

				// Fetch semesters
				const semesters = await portal.get_registered_semesters();

				// Find semester matching DEFAULT_SEMESTER
				const matchingSem = findMatchingSemester(semesters);
				const selectedSem = matchingSem || semesters[0];

				// Fetch subjects for selected semester
				let subjects: PortalSubject[] = [];
				if (selectedSem) {
					const subjectData =
						await portal.get_registered_subjects_and_faculties(selectedSem);
					subjects = subjectData.subjects || [];
				}

				// Extract student info from profile
				const studentInfo = extractStudentInfo(enrollment, {
					programcode: profileInfo.programcode,
					semester: profileInfo.semester,
					batch: profileInfo.batch,
				});

				// Check for unsupported program error
				if (studentInfo.error) {
					setState((s) => ({
						...s,
						isLoading: false,
						error: studentInfo.error || null,
					}));
					return { success: false, error: studentInfo.error };
				}

				setState({
					isLoading: false,
					isLoggedIn: true,
					error: null,
					semesters,
					subjects,
					selectedSemester: selectedSem,
					studentInfo,
				});

				return {
					success: true,
					subjects,
					selectedSemester: selectedSem,
					studentInfo,
				};
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				const message = errorMessage.includes("temporarily unavailable")
					? "JIIT WebPortal is temporarily unavailable"
					: errorMessage.includes("Failed to fetch")
					? "Network error. Check your connection."
					: "Login failed. Check your credentials.";

				setState((s) => ({ ...s, isLoading: false, error: message }));
				return { success: false, error: message };
			}
		},
		[getPortal]
	);

	const reset = useCallback(() => {
		portalRef.current = null;
		setState({
			isLoading: false,
			isLoggedIn: false,
			error: null,
			semesters: [],
			subjects: [],
			selectedSemester: null,
			studentInfo: null,
		});
	}, []);

	return { ...state, login, reset };
}

// Helper to derive campus/year/batch from profile data
function extractStudentInfo(
	enrollment: string,
	profileInfo: {
		programcode?: string;
		semester?: string | number;
		batch?: string;
	}
): StudentInfo {
	const { programcode, semester, batch } = profileInfo;

	// Derive year from semester (semester 1-2 = year 1, 3-4 = year 2, etc.)
	const semNum = parseInt(String(semester)) || 1;
	const year = Math.ceil(semNum / 2).toString();

	// Derive campus from programcode and enrollment
	let campus: string;
	const program = (programcode || "").toUpperCase();

	if (program.includes("B.TECH") || program.includes("BTECH")) {
		// B.Tech: check enrollment prefix
		campus = enrollment.startsWith("99") ? "128" : "62";
	} else if (program.includes("BCA")) {
		campus = "BCA";
	} else {
		// Unsupported program
		return {
			campus: "",
			year,
			batch: batch || "",
			error: `Program "${programcode}" is not supported yet. Only B.Tech and BCA are currently supported.`,
		};
	}

	return {
		campus,
		year,
		batch: batch || "",
	};
}
