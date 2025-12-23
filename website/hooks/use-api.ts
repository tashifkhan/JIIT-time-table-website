"use client";

import { useQuery } from "@tanstack/react-query";

// Types
interface TimeTableInfo {
	semester: string;
	batches: string[];
}

interface AcademicYear {
	value: string;
	label: string;
}

interface MessMenu {
	menu: {
		[day: string]: {
			Breakfast: string;
			Lunch: string;
			Lunch128?: string;
			Dinner: string;
		};
	};
}

interface CalendarEvent {
	summary: string;
	start: { date: string };
	end: { date: string };
}

// API Functions
const fetchTimeTables = async (): Promise<TimeTableInfo[]> => {
	const res = await fetch("/api/time-table");
	if (!res.ok) throw new Error("Failed to fetch time tables");
	return res.json();
};

const fetchBatchMapping = async (
	semester: string,
	batch: string
): Promise<any> => {
	const res = await fetch(`/api/time-table/${semester}/${batch}`);
	if (!res.ok) throw new Error(`Failed to fetch batch ${batch}`);
	return res.json();
};

const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
	const res = await fetch("/api/academic-calendar");
	if (!res.ok) throw new Error("Failed to fetch academic years");
	return res.json();
};

const fetchAcademicCalendar = async (year: string): Promise<CalendarEvent[]> => {
	const res = await fetch(`/api/academic-calendar/${year}`);
	if (!res.ok) throw new Error("Failed to fetch calendar data");
	return res.json();
};

const fetchMessMenu = async (apiUrl: string = "/api/mess-menu"): Promise<MessMenu> => {
	const res = await fetch(apiUrl);
	if (!res.ok) throw new Error("Failed to fetch mess menu");
	return res.json();
};

// React Query Hooks

export function useTimeTables() {
	return useQuery({
		queryKey: ["time-tables"],
		queryFn: fetchTimeTables,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useBatchMapping(semester: string, batch: string) {
	return useQuery({
		queryKey: ["batch-mapping", semester, batch],
		queryFn: () => fetchBatchMapping(semester, batch),
		enabled: !!semester && !!batch,
		staleTime: 5 * 60 * 1000,
	});
}

export function useBatchMappings(semester: string, batches: string[]) {
	return useQuery({
		queryKey: ["batch-mappings", semester, batches],
		queryFn: async () => {
			const mappings: Record<string, any> = {};
			await Promise.all(
				batches.map(async (batch) => {
					try {
						mappings[batch] = await fetchBatchMapping(semester, batch);
					} catch (err) {
						console.error(`Failed to fetch batch ${batch}`, err);
					}
				})
			);
			return mappings;
		},
		enabled: !!semester && batches.length > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export function useAcademicYears() {
	return useQuery({
		queryKey: ["academic-years"],
		queryFn: fetchAcademicYears,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useAcademicCalendar(year: string) {
	return useQuery({
		queryKey: ["academic-calendar", year],
		queryFn: () => fetchAcademicCalendar(year),
		enabled: !!year,
		staleTime: 10 * 60 * 1000,
	});
}

export function useMessMenu(apiUrl: string = "/api/mess-menu") {
	return useQuery({
		queryKey: ["mess-menu", apiUrl],
		queryFn: () => fetchMessMenu(apiUrl),
		staleTime: 60 * 60 * 1000, // 1 hour
	});
}
