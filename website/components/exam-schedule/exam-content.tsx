"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Calendar,
	CalendarDays,
	ChevronDown,
	Clock,
	Search,
	Sparkles,
	User,
	X,
} from "lucide-react";
import Fuse from "fuse.js";

import UserContext, { UserContextType } from "../../context/userContext";
import { useExamSchedule, useExamSemesters } from "../../hooks/use-api";
import { useHaptic } from "../../hooks/use-haptic";
import { ExamEntry } from "../../types/exam";
import { Button } from "../ui/button";
import { Calendar as CalendarPicker } from "../ui/calendar";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

// ── Date helpers ─────────────────────────────────────────────────────────────

function parseExamDate(dateStr: string): Date {
	const [day, month, year] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDisplayDate(dateStr: string): string {
	return parseExamDate(dateStr).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

// ── Entry helpers ─────────────────────────────────────────────────────────────

/**
 * Backward-compatible semester extractor.
 * Supports new API format { semesters: number[] } and legacy { semester: "2, 4" }.
 */
function getEntrySemesters(entry: ExamEntry): number[] {
	const newField = (entry as ExamEntry & { semesters?: unknown }).semesters;
	if (Array.isArray(newField) && newField.length > 0) {
		return (newField as unknown[])
			.map((v) => Number(v))
			.filter((v) => Number.isFinite(v) && Number.isInteger(v))
			.sort((a, b) => a - b);
	}
	const legacyField = (entry as ExamEntry & { semester?: unknown }).semester;
	if (typeof legacyField === "string" && legacyField.trim()) {
		return Array.from(
			new Set(
				legacyField
					.split(",")
					.map((p) => Number(p.trim()))
					.filter((v) => Number.isFinite(v) && Number.isInteger(v))
			)
		).sort((a, b) => a - b);
	}
	return [];
}

/**
 * Collect subject names from the user's timetable.
 * Prefers editedSchedule but falls back to auto-generated schedule.
 */
function getScheduleSubjectNames(
	schedule: UserContextType["schedule"],
	editedSchedule: UserContextType["editedSchedule"]
): Set<string> {
	const names = new Set<string>();
	const src = editedSchedule ?? schedule;
	if (!src) return names;
	for (const day of Object.values(src)) {
		for (const slot of Object.values(day)) {
			if (slot.subject_name) names.add(slot.subject_name.toLowerCase().trim());
		}
	}
	return names;
}

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<"L" | "T" | "P", { label: string; cls: string }> = {
	L: { label: "Theory",   cls: "border-blue-500/25 bg-blue-500/10 text-blue-300" },
	P: { label: "Practical", cls: "border-green-500/25 bg-green-500/10 text-green-300" },
	T: { label: "Tutorial", cls: "border-purple-500/25 bg-purple-500/10 text-purple-300" },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
	return (
		<div className="flex animate-pulse flex-col gap-3 rounded-xl border border-white/8 bg-white/2 p-4 sm:flex-row sm:items-center">
			<div className="flex-1 space-y-2">
				<div className="h-4 w-3/4 rounded-lg bg-white/10" />
				<div className="h-3 w-1/3 rounded-lg bg-white/8" />
			</div>
			<div className="flex gap-2">
				<div className="h-8 w-20 rounded-lg bg-white/10" />
				<div className="h-8 w-16 rounded-lg bg-white/10" />
				<div className="h-8 w-14 rounded-lg bg-white/10" />
			</div>
		</div>
	);
}

// ── Calendar Popover ──────────────────────────────────────────────────────────

interface CalendarPopoverProps {
	pickedDate: Date | null;
	onPickedDateChange: (d: Date | null) => void;
}

function CalendarPopover({ pickedDate, onPickedDateChange }: CalendarPopoverProps) {
	const haptic = useHaptic();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		if (open) document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	useEffect(() => {
function handler(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		if (open) document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open]);

	const formattedDate = pickedDate
		? pickedDate.toLocaleDateString("en-IN", {
				day: "numeric",
				month: "short",
				year: "numeric",
		  })
		: "All dates";

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => {
					haptic("selection");
					setOpen((v) => !v);
				}}
				className={`flex h-10 w-[140px] items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-all duration-150 ${
					pickedDate
						? "border-[#F0BB78]/40 bg-[#F0BB78]/10 text-[#F0BB78]"
						: "border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
				}`}
			>
				<div className="flex items-center gap-2 overflow-hidden">
					<CalendarDays className="h-4 w-4 shrink-0" />
					<span className="truncate">{formattedDate}</span>
				</div>
				{pickedDate ? (
					<span
						role="button"
						tabIndex={0}
						onClick={(e) => {
							e.stopPropagation();
							haptic("light");
							onPickedDateChange(null);
							setOpen(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
								onPickedDateChange(null);
								setOpen(false);
							}
						}}
						className="rounded p-0.5 text-[#F0BB78]/60 transition-colors hover:text-[#F0BB78]"
					>
						<X className="h-3 w-3" />
					</span>
				) : (
					<ChevronDown
						className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					/>
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.97 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full z-50 mt-2 w-[280px]"
					>
						<CalendarPicker
							selected={pickedDate}
							onSelect={(date) => {
								haptic("selection");
								onPickedDateChange(date);
								if (date) setOpen(false);
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExamContent() {
	const { schedule, editedSchedule } = useContext(UserContext);
	const haptic = useHaptic();

	// ─ Data ─────────────────────────────────────────────────────────────────
	const { data: semesterList = [], isLoading: semestersLoading } = useExamSemesters();
	const defaultSession = semesterList[0]?.semester ?? "";
	const [selectedSession, setSelectedSession] = useState("");
	const activeSession = selectedSession || defaultSession;
	const activeSessionInfo = semesterList.find((s) => s.semester === activeSession);

	const { data: examData = [], isLoading: examLoading } = useExamSchedule(activeSession);

	// ─ Filters ──────────────────────────────────────────────────────────────
	const [semesterFilter, setSemesterFilter] = useState("all");
	const [pickedDate, setPickedDate] = useState<Date | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showMyExams, setShowMyExams] = useState(false);

	// ─ My Exams ─────────────────────────────────────────────────────────────
	const scheduleSubjectNames = useMemo(
		() => getScheduleSubjectNames(schedule, editedSchedule),
		[schedule, editedSchedule]
	);
	const hasSchedule = scheduleSubjectNames.size > 0;

	// ─ Available semesters ──────────────────────────────────────────────────
	const availableSemesters = useMemo(() => {
		const all = new Set<number>();
		for (const entry of examData) {
			for (const s of getEntrySemesters(entry)) all.add(s);
		}
		return Array.from(all).sort((a, b) => a - b);
	}, [examData]);

	// ─ Filter pipeline ───────────────────────────────────────────────────────
	const afterSemFilter = useMemo(() => {
		if (semesterFilter === "all") return examData;
		const n = Number(semesterFilter);
		return examData.filter((e) => getEntrySemesters(e).includes(n));
	}, [examData, semesterFilter]);

	const afterDateFilter = useMemo(() => {
		if (pickedDate) {
			const picked = startOfDay(pickedDate);
			return afterSemFilter.filter((e) => {
				const exam = parseExamDate(e.exam_date);
				return isSameDay(exam, picked);
			});
		}
		return afterSemFilter;
	}, [afterSemFilter, pickedDate]);

	const afterMyFilter = useMemo(() => {
		if (!showMyExams || !hasSchedule) return afterDateFilter;
		return afterDateFilter.filter((e) =>
			scheduleSubjectNames.has(e.subject_name.toLowerCase().trim())
		);
	}, [afterDateFilter, showMyExams, hasSchedule, scheduleSubjectNames]);

	const fuse = useMemo(
		() =>
			new Fuse(afterMyFilter, {
				keys: ["subject_name", "subject_code"],
				threshold: 0.35,
				ignoreLocation: true,
			}),
		[afterMyFilter]
	);

	const filtered = useMemo(() => {
		if (!searchQuery.trim()) return afterMyFilter;
		return fuse.search(searchQuery).map((r) => r.item);
	}, [afterMyFilter, fuse, searchQuery]);

	// ─ Group by date ────────────────────────────────────────────────────────
	const grouped = useMemo(() => {
		const map = new Map<string, ExamEntry[]>();
		for (const entry of filtered) {
			if (!map.has(entry.exam_date)) map.set(entry.exam_date, []);
			map.get(entry.exam_date)!.push(entry);
		}
		return Array.from(map.entries()).sort(
			([a], [b]) => parseExamDate(a).getTime() - parseExamDate(b).getTime()
		);
	}, [filtered]);

	const isLoading = semestersLoading || examLoading;
	const assessedLabel = activeSessionInfo?.types?.join(", ") ?? "";

	function clearFilters() {
		haptic("light");
		setSemesterFilter("all");
		setPickedDate(null);
		setShowMyExams(false);
		setSearchQuery("");
	}

	const hasActiveFilter =
		semesterFilter !== "all" || pickedDate !== null || showMyExams || searchQuery.trim().length > 0;

	// ─ Render ────────────────────────────────────────────────────────────────

	return (
		<main>
			<div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 mb-16">
				{/* ── Hero header ─────────────────────────────────────────────── */}
				<motion.div
					className="text-center space-y-3"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-0">
						<h1 className="text-2xl sm:text-4xl font-bold text-[#F0BB78]">
							JIIT Exam Schedule
						</h1>
					</div>

					{/* Toolbar */}
					<div className="flex flex-col items-center gap-4 mt-6 px-4">
						<div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 w-full max-w-3xl">
							<Select
								value={activeSession}
								onValueChange={(v) => {
									haptic("selection");
									setSelectedSession(v);
									setSemesterFilter("all");
								}}
								disabled={semesterList.length === 0}
							>
								<SelectTrigger className="w-[140px] h-10 bg-white/10 border-white/10 text-slate-200 hover:bg-white/20 focus:ring-[#F0BB78]/30 transition-all">
									<SelectValue placeholder="Session" />
								</SelectTrigger>
								<SelectContent className="bg-[#131010]/95 border-[#F0BB78]/20 text-white backdrop-blur-2xl">
									{semesterList.map((item) => (
										<SelectItem
											key={item.semester}
											value={item.semester}
											className="focus:bg-[#F0BB78]/20 focus:text-white"
										>
											{item.semester}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={semesterFilter}
								onValueChange={(v) => {
									haptic("selection");
									setSemesterFilter(v);
								}}
								disabled={availableSemesters.length === 0}
							>
								<SelectTrigger className={`w-[140px] h-10 border-white/10 transition-all hover:bg-white/20 focus:ring-[#F0BB78]/30 ${
									semesterFilter !== "all" ? "bg-[#F0BB78]/10 border-[#F0BB78]/30 text-[#F0BB78]" : "bg-white/10 text-slate-200"
								}`}>
									<SelectValue placeholder="All Semesters" />
								</SelectTrigger>
								<SelectContent className="bg-[#131010]/95 border-[#F0BB78]/20 text-white backdrop-blur-2xl">
									<SelectItem value="all" className="focus:bg-[#F0BB78]/20 focus:text-white">
										All semesters
									</SelectItem>
									{availableSemesters.map((s) => (
										<SelectItem
											key={s}
											value={String(s)}
											className="focus:bg-[#F0BB78]/20 focus:text-white"
										>
											Semester {s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<CalendarPopover pickedDate={pickedDate} onPickedDateChange={setPickedDate} />

							<Button
								type="button"
								variant="outline"
								disabled={!hasSchedule}
								onClick={() => setShowMyExams((v) => !v)}
								className={`h-10 px-4 gap-2 transition-all ${
									showMyExams
										? "bg-[#F0BB78]/10 border-[#F0BB78]/40 text-[#F0BB78] hover:bg-[#F0BB78]/20"
										: "bg-white/10 border-white/10 text-slate-200 hover:bg-white/20 disabled:opacity-35"
								}`}
							>
								<User className="h-4 w-4" />
								<span className="hidden sm:inline">My Exams Only</span>
								<span className="sm:hidden">My Exams</span>
							</Button>
						</div>

						{/* Search Input */}
						<div className="w-full max-w-md relative mt-2">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subject name or code..."
								className="h-10 w-full bg-white/10 border-white/10 pl-9 pr-9 text-slate-200 placeholder:text-slate-400 hover:bg-white/20 focus:bg-white/10 focus-visible:ring-[#F0BB78]/30 transition-all rounded-full"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right
-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>

						{/* Active Status */}
						<div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-xs font-medium text-slate-400">
							{assessedLabel && (
								<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
									<Sparkles className="h-3.5 w-3.5 text-[#F0BB78]" />
									Assessed: {assessedLabel}
								</span>
							)}
							{!isLoading && examData.length > 0 && (
								<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
									{filtered.length} / {examData.length} exams shown
								</span>
							)}
							{hasActiveFilter && (
								<button
									onClick={clearFilters}
									className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
								>
									Clear Filters
								</button>
							)}
						</div>
					</div>
				</motion.div>

				{/* ── Content ──────────────────────────────────────────────────── */}
				<div className="max-w-4xl mx-auto px-4">
					{isLoading ? (
						<div className="flex flex-col gap-2.5">
							{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
						</div>
					) : grouped.length === 0 ? (
						<div className="flex flex-col items-center gap-4 py-20 text-center border border-white/10 bg-white/3 rounded-2xl backdrop-blur-xl">
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<BookOpen className="h-8 w-8 text-slate-600" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold text-slate-300">No exams found</p>
								<p className="text-xs text-slate-500">
									{searchQuery.trim()
										? `Nothing matches "${searchQuery.trim()}"`
										: showMyExams
										? "Your timetable subjects have no matching exams"
										: pickedDate
										? `No exams on ${pickedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
										: semesterFilter !== "all"
										? `No exams in Semester ${semesterFilter}`
										: "No exam schedule data available"}
								</p>
							</div>
						</div>
					) : (
						<AnimatePresence mode="popLayout">
							{grouped.map(([date, entries], gi) => (
								<motion.div
									key={date}
									initial={{ opacity: 0, y: 14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.22, delay: gi * 0.03 }}
									className="flex flex-col gap-2.5 mb-6"
								>
									{/* Date header */}
									<div className="flex items-center gap-3 mb-1">
										<div className="flex items-center gap-2 rounded-xl border border-[#F0BB78]/20 bg-[#F0BB78]/8 px-3 py-1.5">
											<Calendar className="h-3.5 w-3.5 text-[#F0BB78]" />
											<span className="text-xs font-bold text-[#F0BB78]">
												{entries[0]?.exam_day}, {formatDisplayDate(date)}
											</span>
										</div>
										<div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
										<span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
											{entries.length} exam{entries.length !== 1 ? "s" : ""}
										</span>
									</div>

									{/* Exam cards */}
									<div className="flex flex-col gap-2">
										{entries.map((entry, ei) => {
											const isMySubject =
												hasSchedule &&
												scheduleSubjectNames.has(entry.subject_name.toLowerCase().trim());
											const sems = getEntrySemesters(entry);
											const typeCfg = TYPE_CONFIG[entry.subject_type] ?? TYPE_CONFIG.L;

											return (
												<motion.div
													key={`${entry.subject_code}-${entry.exam_date}-${ei}`}
													initial={{ opacity: 0, x: -8 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.17, delay: ei * 0.025 }}
												>
													<div
														className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center ${
															isMySubject
																? "border-[#F0BB78]/20 bg-[#F0BB78]/5 shadow-[inset_0_1px_0_rgba(240,187,120,0.07)]"
																: "border-white/8 bg-white/2 hover:border-white/14 hover:bg-white/4"
														}`}
													>
														{/* Left accent bar for matched exams */}
														{isMySubject && (
															<div className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-linear-to-b from-[#F0BB78]/80 to-[#F0BB78]/30" />
														)}

														{/* Subject info */}
														<div className="min-w-0 flex-1 sm:pl-1">
															<div className="flex items-start justify-between gap-2">
																<div className="min-w-0 flex-1">
																	<p className="text-sm font-semibold leading-snug text-slate-100">
																		{entry.subject_name}
																	</p>
																	<p className="mt-0.5 font-mono text-[11px] tracking-wide text-slate-500">
																		{entry.subject_code}
																	</p>
																</div>
																{isMySubject && (
																	<span className="ml-2 mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#F0BB78]/25 bg-[#F0BB78]/10 px-2 py-0.5 text-[11px] font-bold text-[#F0BB78]">
																		<User className="h-2.5 w-2.5" />
																		Yours
																	</span>
																)}
															</div>
														</div>

														{/* Meta chips */}
														<div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
															{/* Time */}
															<div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
																<Clock className="h-3.5 w-3.5 text-slate-500" />
																<span className="text-xs font-semibold tabular-nums text-slate-300">
																	{entry.exam_time}
																</span>
															</div>

															{/* Semester numbers */}
															{sems.length > 0 && (
																<div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
																	<span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
																		Sem
																	</span>
																	<span className="text-xs font-semibold text-slate-200">
																		{sems.join(", ")}
																	</span>
																</div>
															)}

															{/* Subject type */}
															<span className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${typeCfg.cls}`}>
																{typeCfg.label}
															</span>
														</div>
													</div>
												</motion.div>
											);
										})}
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					)}
				</div>
			</div>
		</main>
	);
}
