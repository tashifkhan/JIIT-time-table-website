"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Calendar,
	ChevronDown,
	Clock,
	Filter,
	Plus,
	Search,
	Sparkles,
	Trash2,
	User,
	X,
} from "lucide-react";
import Fuse from "fuse.js";

import {
	useBatchMapping,
	useDefaultSemester,
	useExamSchedule,
	useExamSemesters,
} from "../../hooks/use-api";
import { useHaptic } from "../../hooks/use-haptic";
import { ExamEntry } from "../../types/exam";
import { Button } from "../ui/button";
import { Calendar as CalendarPicker } from "../ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

// ── Date helpers ──────────────────────────────────────────────────────────────

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

// ── Semester extractor ────────────────────────────────────────────────────────

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

// ── Storage types & helpers ───────────────────────────────────────────────────

type SavedClassConfig = {
	year?: string;
	batch?: string;
	campus?: string;
	selectedSubjects?: string[];
};

type SavedExamConfig = {
	name: string;
	subjectCodes: string[];
};

type SubjectRow = {
	Code?: string;
	"Full Code"?: string;
	Subject?: string;
};

type MineSelection =
	| { type: "none" }
	| { type: "config"; name: string }
	| { type: "custom"; id: string };

const CUSTOM_EXAM_CONFIGS_KEY = "examSubjectConfigs";

function readStoredRecord<T>(key: string): Record<string, T> {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return {};
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
		return parsed as Record<string, T>;
	} catch {
		return {};
	}
}

function writeStoredRecord<T>(key: string, data: Record<string, T>): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(data));
	} catch {
		// quota exceeded or private browsing
	}
}

function normalizeCode(code: string | null | undefined): string {
	return (code ?? "").trim().toUpperCase();
}

function checkCodeMatch(examCode: string, mineSet: Set<string>): boolean {
	const code = normalizeCode(examCode);
	if (!code) return false;
	if (mineSet.has(code)) return true;
	// fallback: exam full code ends with short code (e.g. 18B11CS411 ends with CS411)
	for (const mc of mineSet) {
		if (mc && code.endsWith(mc)) return true;
	}
	return false;
}

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<"L" | "T" | "P", { label: string; cls: string }> = {
	L: { label: "Theory", cls: "border-blue-500/25 bg-blue-500/10 text-blue-300" },
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

// ── Filter Popover ────────────────────────────────────────────────────────────

interface FilterPopoverProps {
	yearFilter: string;
	setYearFilter: (v: string) => void;
	availableYears: string[];
	sessionFilter: string;
	setSessionFilter: (v: string) => void;
	availableSessions: string[];
	semesterFilter: string;
	setSemesterFilter: (v: string) => void;
	availableSemesters: number[];
	examTypeFilter: string;
	setExamTypeFilter: (v: string) => void;
	availableExamTypes: string[];
	pickedDate: Date | null;
	onPickedDateChange: (d: Date | null) => void;
	onClearAll: () => void;
	defaultYear: string;
	defaultSession: string;
}

function FilterPopover({
	yearFilter,
	setYearFilter,
	availableYears,
	sessionFilter,
	setSessionFilter,
	availableSessions,
	semesterFilter,
	setSemesterFilter,
	availableSemesters,
	examTypeFilter,
	setExamTypeFilter,
	availableExamTypes,
	pickedDate,
	onPickedDateChange,
	onClearAll,
	defaultYear,
	defaultSession,
}: FilterPopoverProps) {
	const haptic = useHaptic();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node))
				setOpen(false);
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

	const yearChanged = yearFilter !== defaultYear;
	const sessionChanged = sessionFilter !== defaultSession;
	const hasFilter =
		yearChanged ||
		sessionChanged ||
		semesterFilter !== "all" ||
		examTypeFilter !== "all" ||
		pickedDate !== null;

	const filterLabel: string[] = [];
	if (yearChanged && yearFilter) filterLabel.push(yearFilter);
	if (sessionChanged && sessionFilter) filterLabel.push(sessionFilter);
	if (semesterFilter !== "all") filterLabel.push(`Sem ${semesterFilter}`);
	if (examTypeFilter !== "all") filterLabel.push(examTypeFilter);
	if (pickedDate)
		filterLabel.push(
			pickedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
		);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => { haptic("selection"); setOpen((v) => !v); }}
				className={`px-3 py-1.5 h-auto rounded-lg backdrop-blur-lg border transition-all duration-300 shadow-lg flex items-center gap-1.5 text-xs ${
					hasFilter
						? "bg-white/20 border-[#F0BB78]/40 text-[#F0BB78]"
						: "bg-white/10 border-white/20 text-[#F0BB78] hover:bg-white/20"
				}`}
			>
				<Filter className="w-3.5 h-3.5 shrink-0" />
				<span className="max-w-[140px] truncate">{hasFilter ? filterLabel.join(" · ") : "Filter"}</span>
				{hasFilter ? (
					<span
						role="button"
						tabIndex={0}
						onClick={(e) => { e.stopPropagation(); haptic("light"); onClearAll(); }}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClearAll(); }
						}}
						className="rounded p-0.5 text-[#F0BB78]/60 transition-colors hover:text-[#F0BB78]"
					>
						<X className="h-3 w-3" />
					</span>
				) : (
					<ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.97 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#1a1614] shadow-xl backdrop-blur-xl"
					>
						<div className="p-3 space-y-3">
							{/* Year (calendar year) */}
							{availableYears.length > 0 && (
								<div className="space-y-1.5">
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Year</p>
									<Select
										value={yearFilter || undefined}
										onValueChange={(v) => { haptic("selection"); setYearFilter(v); }}
										disabled={availableYears.length <= 1}
									>
										<SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-[#F0BB78] text-xs focus:ring-[#F0BB78]/30">
											<SelectValue placeholder="Select year" />
										</SelectTrigger>
										<SelectContent className="bg-[#131010] border-[#F0BB78]/30 text-[#F0BB78]">
											{availableYears.map((y) => (
												<SelectItem key={y} value={y} className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
													{y}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Session (e.g. EVEN26) */}
							{availableSessions.length > 0 && (
								<div className="space-y-1.5">
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Session</p>
									<Select
										value={sessionFilter || undefined}
										onValueChange={(v) => { haptic("selection"); setSessionFilter(v); }}
										disabled={availableSessions.length <= 1}
									>
										<SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-[#F0BB78] text-xs focus:ring-[#F0BB78]/30">
											<SelectValue placeholder="Select session" />
										</SelectTrigger>
										<SelectContent className="bg-[#131010] border-[#F0BB78]/30 text-[#F0BB78]">
											{availableSessions.map((s) => (
												<SelectItem key={s} value={s} className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
													{s}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Semester (student sem 1-8) */}
							<div className="space-y-1.5">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Semester</p>
								<Select
									value={semesterFilter}
									onValueChange={(v) => { haptic("selection"); setSemesterFilter(v); }}
									disabled={availableSemesters.length === 0}
								>
									<SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-[#F0BB78] text-xs focus:ring-[#F0BB78]/30">
										<SelectValue placeholder="All Semesters" />
									</SelectTrigger>
									<SelectContent className="bg-[#131010] border-[#F0BB78]/30 text-[#F0BB78]">
										<SelectItem value="all" className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
											All Semesters
										</SelectItem>
										{availableSemesters.map((s) => (
											<SelectItem key={s} value={String(s)} className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
												Semester {s}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Exam Type */}
							<div className="space-y-1.5">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Exam Type</p>
								<Select
									value={examTypeFilter}
									onValueChange={(v) => { haptic("selection"); setExamTypeFilter(v); }}
									disabled={availableExamTypes.length === 0}
								>
									<SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-[#F0BB78] text-xs focus:ring-[#F0BB78]/30">
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent className="bg-[#131010] border-[#F0BB78]/30 text-[#F0BB78]">
										<SelectItem value="all" className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
											All Types
										</SelectItem>
										{availableExamTypes.map((t) => (
											<SelectItem key={t} value={t} className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer">
												{t}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Date */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</p>
									{pickedDate && (
										<button
											type="button"
											onClick={() => { haptic("light"); onPickedDateChange(null); }}
											className="text-[10px] text-[#F0BB78]/60 hover:text-[#F0BB78] transition-colors"
										>
											Clear
										</button>
									)}
								</div>
								<CalendarPicker
									selected={pickedDate}
									onSelect={(date) => {
										haptic("selection");
										onPickedDateChange(date);
										if (date) setOpen(false);
									}}
								/>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ── Mine Picker Popover ───────────────────────────────────────────────────────

interface MinePickerPopoverProps {
	mineSelection: MineSelection;
	onSelect: (sel: MineSelection) => void;
	savedClassConfigs: Record<string, SavedClassConfig>;
	customExamConfigs: Record<string, SavedExamConfig>;
	onDeleteCustom: (id: string) => void;
	onCreateCustom: () => void;
}

function MinePickerPopover({
	mineSelection,
	onSelect,
	savedClassConfigs,
	customExamConfigs,
	onDeleteCustom,
	onCreateCustom,
}: MinePickerPopoverProps) {
	const haptic = useHaptic();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node))
				setOpen(false);
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

	const isActive = mineSelection.type !== "none";

	const activeLabel =
		mineSelection.type === "config"
			? mineSelection.name
			: mineSelection.type === "custom"
			? (customExamConfigs[mineSelection.id]?.name ?? mineSelection.id)
			: "";

	const savedEntries = Object.entries(savedClassConfigs);
	const customEntries = Object.entries(customExamConfigs);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => { haptic("selection"); setOpen((v) => !v); }}
				className={`px-3 py-1.5 h-auto rounded-lg backdrop-blur-lg border transition-all duration-300 shadow-lg flex items-center gap-1.5 text-xs ${
					isActive
						? "bg-[#F0BB78]/20 border-[#F0BB78]/50 text-[#F0BB78]"
						: "bg-white/10 border-white/20 text-[#F0BB78] hover:bg-white/20"
				}`}
			>
				<User className="w-3.5 h-3.5 shrink-0" />
				<span className="max-w-[120px] truncate">{isActive ? activeLabel : "Mine"}</span>
				{isActive ? (
					<span
						role="button"
						tabIndex={0}
						onClick={(e) => {
							e.stopPropagation();
							haptic("light");
							onSelect({ type: "none" });
							setOpen(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation();
								onSelect({ type: "none" });
								setOpen(false);
							}
						}}
						className="rounded p-0.5 text-[#F0BB78]/60 transition-colors hover:text-[#F0BB78]"
					>
						<X className="h-3 w-3" />
					</span>
				) : (
					<ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
				)}
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.97 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#1a1614] shadow-xl backdrop-blur-xl"
					>
						<div className="p-3 space-y-3">

							{/* Saved timetable configs */}
							<div className="space-y-1.5">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Saved Timetable Configs
								</p>
								{savedEntries.length === 0 ? (
									<p className="text-[11px] text-slate-600 px-1 py-1">
										No saved configs yet. Save a timetable config on the home page.
									</p>
								) : (
									<div className="space-y-1 max-h-40 overflow-y-auto">
										{savedEntries.map(([name, cfg]) => {
											const isSelected =
												mineSelection.type === "config" && mineSelection.name === name;
											return (
												<button
													key={name}
													type="button"
													onClick={() => {
														haptic("selection");
														onSelect(isSelected ? { type: "none" } : { type: "config", name });
														setOpen(false);
													}}
													className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
														isSelected
															? "bg-[#F0BB78]/20 border border-[#F0BB78]/30"
															: "hover:bg-white/5 border border-transparent"
													}`}
												>
													<div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
														isSelected ? "border-[#F0BB78] bg-[#F0BB78]" : "border-white/30"
													}`}>
														{isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1a1614]" />}
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-slate-200 truncate">{name}</p>
														<p className="text-[10px] text-slate-500 truncate">
															{[
																cfg.campus && `Sector ${cfg.campus}`,
																cfg.year && `Year ${cfg.year}`,
																cfg.selectedSubjects?.length && `${cfg.selectedSubjects.length} subjects`,
															]
																.filter(Boolean)
																.join(" · ")}
														</p>
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>

							{/* Custom exam configs */}
							<div className="space-y-1.5">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
									Custom Configs
								</p>
								{customEntries.length > 0 && (
									<div className="space-y-1 max-h-32 overflow-y-auto">
										{customEntries.map(([id, cfg]) => {
											const isSelected =
												mineSelection.type === "custom" && mineSelection.id === id;
											return (
												<div key={id} className="flex items-center gap-1">
													<button
														type="button"
														onClick={() => {
															haptic("selection");
															onSelect(isSelected ? { type: "none" } : { type: "custom", id });
															setOpen(false);
														}}
														className={`flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
															isSelected
																? "bg-[#F0BB78]/20 border border-[#F0BB78]/30"
																: "hover:bg-white/5 border border-transparent"
														}`}
													>
														<div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
															isSelected ? "border-[#F0BB78] bg-[#F0BB78]" : "border-white/30"
														}`}>
															{isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1a1614]" />}
														</div>
														<div className="min-w-0 flex-1">
															<p className="text-xs font-medium text-slate-200 truncate">{cfg.name}</p>
															<p className="text-[10px] text-slate-500">
																{cfg.subjectCodes.length} subject code{cfg.subjectCodes.length !== 1 ? "s" : ""}
															</p>
														</div>
													</button>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															haptic("light");
															if (isSelected) onSelect({ type: "none" });
															onDeleteCustom(id);
														}}
														className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
														title="Delete config"
													>
														<Trash2 className="h-3 w-3" />
													</button>
												</div>
											);
										})}
									</div>
								)}
								<button
									type="button"
									onClick={() => {
										haptic("selection");
										setOpen(false);
										onCreateCustom();
									}}
									className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-white/20 text-[11px] text-slate-400 hover:border-[#F0BB78]/40 hover:text-[#F0BB78] transition-colors"
								>
									<Plus className="h-3.5 w-3.5" />
									New Custom Config
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ── Custom Config Dialog ──────────────────────────────────────────────────────

interface CustomConfigDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (id: string, config: SavedExamConfig) => void;
	existingIds: Set<string>;
	examData: ExamEntry[];
}

function CustomConfigDialog({
	open,
	onClose,
	onSave,
	existingIds,
	examData,
}: CustomConfigDialogProps) {
	const haptic = useHaptic();
	const [name, setName] = useState("");
	const [codeInput, setCodeInput] = useState("");
	const [codes, setCodes] = useState<string[]>([]);
	const [nameError, setNameError] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const searchContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) {
			setName("");
			setCodeInput("");
			setCodes([]);
			setNameError("");
			setSearchInput("");
			setSearchOpen(false);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(e.target as Node)
			) {
				setSearchOpen(false);
			}
		}
		if (searchOpen) document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [searchOpen]);

	// Deduped subjects from exam schedule for search
	const uniqueSubjects = useMemo(() => {
		const map = new Map<string, { code: string; name: string }>();
		for (const e of examData) {
			const code = normalizeCode(e.subject_code);
			if (code && !map.has(code)) {
				map.set(code, { code, name: e.subject_name });
			}
		}
		return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [examData]);

	const subjectFuse = useMemo(
		() =>
			new Fuse(uniqueSubjects, {
				keys: ["name", "code"],
				threshold: 0.35,
				ignoreLocation: true,
			}),
		[uniqueSubjects]
	);

	const searchResults = useMemo(() => {
		const q = searchInput.trim();
		if (!q) return uniqueSubjects.slice(0, 8);
		return subjectFuse.search(q).slice(0, 12).map((r) => r.item);
	}, [searchInput, subjectFuse, uniqueSubjects]);

	function addSubjectCode(code: string) {
		const c = normalizeCode(code);
		if (!c) return;
		setCodes((prev) => (prev.includes(c) ? prev : [...prev, c]));
		haptic("selection");
	}

	function addCode() {
		const trimmed = normalizeCode(codeInput);
		if (!trimmed) return;
		const parts = trimmed.split(/[\s,]+/).filter(Boolean);
		setCodes((prev) => {
			const next = [...prev];
			for (const p of parts) {
				if (!next.includes(p)) next.push(p);
			}
			return next;
		});
		setCodeInput("");
	}

	function removeCode(code: string) {
		setCodes((prev) => prev.filter((c) => c !== code));
	}

	function handleSave() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			setNameError("Please enter a name.");
			inputRef.current?.focus();
			return;
		}
		if (existingIds.has(trimmedName)) {
			setNameError("A config with this name already exists.");
			inputRef.current?.focus();
			return;
		}
		if (codes.length === 0) {
			setNameError("Add at least one subject code.");
			return;
		}
		const id = `custom_${Date.now()}`;
		haptic("selection");
		onSave(id, { name: trimmedName, subjectCodes: codes });
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-md bg-[#1a1614] border-white/10 text-slate-200">
				<DialogHeader>
					<DialogTitle className="text-[#F0BB78]">New Custom Exam Config</DialogTitle>
					<DialogDescription className="text-slate-500 text-xs">
						Add subject codes exactly as shown in the exam schedule (e.g. 18B11CS411).
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-2">
					{/* Config name */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-400">Config Name</label>
						<Input
							ref={inputRef}
							value={name}
							onChange={(e) => { setName(e.target.value); setNameError(""); }}
							placeholder="e.g. My 5th Sem Subjects"
							className="h-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-[#F0BB78]/30 text-sm"
						/>
						{nameError && (
							<p className="text-xs text-red-400">{nameError}</p>
						)}
					</div>

					{/* Search subjects from schedule */}
					{uniqueSubjects.length > 0 && (
						<div className="space-y-1.5" ref={searchContainerRef}>
							<label className="text-xs font-medium text-slate-400">
								Search Subjects
							</label>
							<div className="relative">
								<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
								<Input
									value={searchInput}
									onChange={(e) => { setSearchInput(e.target.value); setSearchOpen(true); }}
									onFocus={() => setSearchOpen(true)}
									placeholder="Search by subject name or code..."
									className="h-9 pl-8 pr-8 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-[#F0BB78]/30 text-sm"
								/>
								{searchInput && (
									<button
										type="button"
										onClick={() => setSearchInput("")}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1"
									>
										<X className="h-3 w-3" />
									</button>
								)}
								{searchOpen && searchResults.length > 0 && (
									<div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[#1a1614] shadow-xl">
										{searchResults.map((s) => {
											const isAdded = codes.includes(s.code);
											return (
												<button
													type="button"
													key={s.code}
													onClick={() => addSubjectCode(s.code)}
													disabled={isAdded}
													className={`w-full flex items-center gap-2 text-left px-3 py-2 transition-colors border-b border-white/5 last:border-b-0 ${
														isAdded
															? "opacity-50 cursor-not-allowed"
															: "hover:bg-white/5"
													}`}
												>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-slate-200 truncate">
															{s.name}
														</p>
														<p className="text-[10px] font-mono text-[#F0BB78]/70">
															{s.code}
														</p>
													</div>
													{isAdded ? (
														<span className="text-[10px] text-slate-500 shrink-0">Added</span>
													) : (
														<Plus className="h-3.5 w-3.5 text-[#F0BB78]/70 shrink-0" />
													)}
												</button>
											);
										})}
									</div>
								)}
								{searchOpen && searchInput.trim() && searchResults.length === 0 && (
									<div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg border border-white/10 bg-[#1a1614] shadow-xl px-3 py-3">
										<p className="text-[11px] text-slate-500">
											No subjects match &ldquo;{searchInput.trim()}&rdquo;
										</p>
									</div>
								)}
							</div>
							<p className="text-[10px] text-slate-600">
								Pick subjects directly from the exam schedule.
							</p>
						</div>
					)}

					{/* Manual subject code input */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-slate-400">
							Add Code Manually
							{codes.length > 0 && (
								<span className="ml-2 text-[#F0BB78]">{codes.length} added</span>
							)}
						</label>
						<div className="flex gap-2">
							<Input
								value={codeInput}
								onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
								onKeyDown={(e) => {
									if (e.key === "Enter") { e.preventDefault(); addCode(); }
								}}
								placeholder="e.g. 18B11CS411, MA223"
								className="h-9 flex-1 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-[#F0BB78]/30 text-sm font-mono"
							/>
							<Button
								type="button"
								onClick={addCode}
								disabled={!codeInput.trim()}
								className="h-9 px-3 bg-[#F0BB78]/20 border border-[#F0BB78]/30 text-[#F0BB78] hover:bg-[#F0BB78]/30 text-xs"
								variant="outline"
							>
								<Plus className="h-3.5 w-3.5" />
							</Button>
						</div>
						<p className="text-[10px] text-slate-600">
							Comma or space separated codes. Press Enter or + to add.
						</p>
					</div>

					{/* Code chips */}
					{codes.length > 0 && (
						<div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rounded-lg border border-white/8 bg-white/3 p-2">
							{codes.map((code) => (
								<div
									key={code}
									className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#F0BB78]/10 border border-[#F0BB78]/20 text-[11px] font-mono text-[#F0BB78]"
								>
									{code}
									<button
										type="button"
										onClick={() => removeCode(code)}
										className="text-[#F0BB78]/50 hover:text-red-400 transition-colors ml-0.5"
									>
										<X className="h-2.5 w-2.5" />
									</button>
								</div>
							))}
						</div>
					)}

					{codes.length === 0 && (
						<div className="rounded-lg border border-dashed border-white/10 bg-white/2 p-4 text-center">
							<p className="text-xs text-slate-600">No codes added yet.</p>
						</div>
					)}

					<div className="flex gap-2 pt-1">
						<Button
							type="button"
							onClick={handleSave}
							className="flex-1 h-9 bg-gradient-to-r from-[#543A14] to-[#F0BB78] text-sm text-white hover:opacity-90"
						>
							Save Config
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={onClose}
							className="flex-1 h-9 border border-white/10 text-slate-400 hover:text-slate-200 text-sm"
						>
							Cancel
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExamContent() {
	const haptic = useHaptic();

	// ─ Exam data ─────────────────────────────────────────────────────────────
	const { data: semesterList = [], isLoading: semestersLoading } = useExamSemesters();

	// Derive available calendar years (newest first)
	const availableYears = useMemo(() => {
		const set = new Set<string>();
		for (const s of semesterList) if (s.year) set.add(s.year);
		return Array.from(set).sort((a, b) => Number(b) - Number(a));
	}, [semesterList]);

	const defaultYear = availableYears[0] ?? "";
	const defaultSession =
		semesterList.find((s) => s.year === defaultYear)?.semester ??
		semesterList[0]?.semester ??
		"";

	// ─ Filters ───────────────────────────────────────────────────────────────
	const [yearFilter, setYearFilter] = useState<string>("");
	const [sessionFilter, setSessionFilter] = useState<string>("");
	const [semesterFilter, setSemesterFilter] = useState("all");
	const [examTypeFilter, setExamTypeFilter] = useState("all");
	const [pickedDate, setPickedDate] = useState<Date | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Initialize/reconcile yearFilter when semesterList loads
	useEffect(() => {
		if (!yearFilter && defaultYear) setYearFilter(defaultYear);
	}, [defaultYear, yearFilter]);

	// Sessions available for the selected year
	const availableSessions = useMemo(() => {
		const set = new Set<string>();
		for (const s of semesterList) {
			if (!yearFilter || s.year === yearFilter) set.add(s.semester);
		}
		return Array.from(set).sort();
	}, [semesterList, yearFilter]);

	// Reconcile sessionFilter with year change
	useEffect(() => {
		if (availableSessions.length === 0) return;
		if (!sessionFilter || !availableSessions.includes(sessionFilter)) {
			setSessionFilter(availableSessions[0]);
		}
	}, [availableSessions, sessionFilter]);

	const activeSession = sessionFilter || defaultSession;
	const activeSessionInfo = semesterList.find((s) => s.semester === activeSession);
	const { data: examData = [], isLoading: examLoading } = useExamSchedule(activeSession);

	// ─ Mine selection ─────────────────────────────────────────────────────────
	const [mineSelection, setMineSelection] = useState<MineSelection>({ type: "none" });
	const [showCustomDialog, setShowCustomDialog] = useState(false);

	const [savedClassConfigs, setSavedClassConfigs] = useState<Record<string, SavedClassConfig>>(
		() => readStoredRecord<SavedClassConfig>("classConfigs")
	);
	const [customExamConfigs, setCustomExamConfigs] = useState<Record<string, SavedExamConfig>>(
		() => readStoredRecord<SavedExamConfig>(CUSTOM_EXAM_CONFIGS_KEY)
	);

	// Re-read configs from localStorage when component mounts (handles SSR)
	useEffect(() => {
		setSavedClassConfigs(readStoredRecord<SavedClassConfig>("classConfigs"));
		setCustomExamConfigs(readStoredRecord<SavedExamConfig>(CUSTOM_EXAM_CONFIGS_KEY));
	}, []);

	// ─ Batch mapping for resolving short codes → full codes ──────────────────
	const timetableSemester = useDefaultSemester();
	const activeConfigCampus =
		mineSelection.type === "config"
			? (savedClassConfigs[mineSelection.name]?.campus ?? "")
			: "";
	const { data: batchMappingData } = useBatchMapping(
		timetableSemester ?? "",
		activeConfigCampus
	);

	// ─ Resolved subject codes for "Mine" filter ──────────────────────────────
	const mineSubjectCodes = useMemo((): Set<string> => {
		if (mineSelection.type === "none") return new Set();

		if (mineSelection.type === "custom") {
			const cfg = customExamConfigs[mineSelection.id];
			return new Set((cfg?.subjectCodes ?? []).map(normalizeCode).filter(Boolean));
		}

		// type === "config"
		const cfg = savedClassConfigs[mineSelection.name];
		if (!cfg?.selectedSubjects?.length) return new Set();

		const shortCodes = cfg.selectedSubjects.map(normalizeCode).filter(Boolean);
		const codeSet = new Set<string>(shortCodes);

		// Resolve short codes → full codes using batch mapping
		if (batchMappingData && cfg.year && typeof batchMappingData === "object") {
			const yearData = (
				batchMappingData as Record<string, { subjects?: SubjectRow[] }>
			)[cfg.year];
			if (Array.isArray(yearData?.subjects)) {
				for (const subj of yearData.subjects) {
					const short = normalizeCode(subj.Code);
					const full = normalizeCode(subj["Full Code"]);
					if (short && codeSet.has(short) && full) codeSet.add(full);
				}
			}
		}

		return codeSet;
	}, [mineSelection, customExamConfigs, savedClassConfigs, batchMappingData]);

	// ─ Save/delete custom configs ─────────────────────────────────────────────
	function handleSaveCustomConfig(id: string, config: SavedExamConfig) {
		const updated = { ...customExamConfigs, [id]: config };
		setCustomExamConfigs(updated);
		writeStoredRecord(CUSTOM_EXAM_CONFIGS_KEY, updated);
		setMineSelection({ type: "custom", id });
	}

	function handleDeleteCustomConfig(id: string) {
		const updated = { ...customExamConfigs };
		delete updated[id];
		setCustomExamConfigs(updated);
		writeStoredRecord(CUSTOM_EXAM_CONFIGS_KEY, updated);
	}

	// ─ Available filter options ───────────────────────────────────────────────
	const availableSemesters = useMemo(() => {
		const all = new Set<number>();
		for (const entry of examData)
			for (const s of getEntrySemesters(entry)) all.add(s);
		return Array.from(all).sort((a, b) => a - b);
	}, [examData]);

	const availableExamTypes = useMemo(() => {
		const all = new Set<string>();
		for (const entry of examData) if (entry.exam_type) all.add(entry.exam_type);
		if (all.size === 0 && activeSessionInfo?.types)
			for (const t of activeSessionInfo.types) all.add(t);
		return Array.from(all).sort();
	}, [examData, activeSessionInfo]);

	// ─ Filter pipeline ────────────────────────────────────────────────────────
	const afterSemFilter = useMemo(() => {
		let result = examData;
		if (semesterFilter !== "all") {
			const n = Number(semesterFilter);
			result = result.filter((e) => getEntrySemesters(e).includes(n));
		}
		if (examTypeFilter !== "all")
			result = result.filter((e) => e.exam_type === examTypeFilter);
		return result;
	}, [examData, semesterFilter, examTypeFilter]);

	const afterDateFilter = useMemo(() => {
		if (!pickedDate) return afterSemFilter;
		const picked = startOfDay(pickedDate);
		return afterSemFilter.filter((e) => isSameDay(parseExamDate(e.exam_date), picked));
	}, [afterSemFilter, pickedDate]);

	const afterMyFilter = useMemo(() => {
		if (mineSelection.type === "none") return afterDateFilter;
		return afterDateFilter.filter((e) => checkCodeMatch(e.subject_code, mineSubjectCodes));
	}, [afterDateFilter, mineSelection, mineSubjectCodes]);

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

	// ─ Group by date ──────────────────────────────────────────────────────────
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

	function clearFilters() {
		haptic("light");
		setYearFilter(defaultYear);
		setSessionFilter(defaultSession);
		setSemesterFilter("all");
		setExamTypeFilter("all");
		setPickedDate(null);
		setMineSelection({ type: "none" });
		setSearchQuery("");
	}

	const hasActiveFilter =
		(yearFilter && yearFilter !== defaultYear) ||
		(sessionFilter && sessionFilter !== defaultSession) ||
		semesterFilter !== "all" ||
		examTypeFilter !== "all" ||
		pickedDate !== null ||
		mineSelection.type !== "none" ||
		searchQuery.trim().length > 0;

	const hasSavedConfigs =
		Object.keys(savedClassConfigs).length > 0 ||
		Object.keys(customExamConfigs).length > 0;

	// ─ Empty state message ────────────────────────────────────────────────────
	function emptyMessage(): string {
		if (searchQuery.trim()) return `Nothing matches "${searchQuery.trim()}"`;
		if (mineSelection.type === "config")
			return `No exams found for "${mineSelection.name}" subjects`;
		if (mineSelection.type === "custom") {
			const cfg = customExamConfigs[mineSelection.id];
			return `No exams found for "${cfg?.name ?? "custom"}" subjects`;
		}
		if (pickedDate)
			return `No exams on ${pickedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
		if (examTypeFilter !== "all") return `No ${examTypeFilter} exams`;
		if (semesterFilter !== "all") return `No exams in Semester ${semesterFilter}`;
		return "No exam schedule data available";
	}

	// ─ Render ─────────────────────────────────────────────────────────────────

	return (
		<main>
			<div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 mb-16">
				{/* ── Hero header ──────────────────────────────────────────────── */}
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
					<div className="flex flex-col items-center gap-3 mt-6">
						<div className="flex flex-row items-center justify-center gap-2">
							{/* Filter: year + session + semester + type + date */}
							<FilterPopover
								yearFilter={yearFilter}
								setYearFilter={setYearFilter}
								availableYears={availableYears}
								sessionFilter={sessionFilter}
								setSessionFilter={setSessionFilter}
								availableSessions={availableSessions}
								semesterFilter={semesterFilter}
								setSemesterFilter={setSemesterFilter}
								availableSemesters={availableSemesters}
								examTypeFilter={examTypeFilter}
								setExamTypeFilter={setExamTypeFilter}
								availableExamTypes={availableExamTypes}
								pickedDate={pickedDate}
								onPickedDateChange={setPickedDate}
								onClearAll={() => {
									setYearFilter(defaultYear);
									setSessionFilter(defaultSession);
									setSemesterFilter("all");
									setExamTypeFilter("all");
									setPickedDate(null);
								}}
								defaultYear={defaultYear}
								defaultSession={defaultSession}
							/>

							{/* Mine picker */}
							<MinePickerPopover
								mineSelection={mineSelection}
								onSelect={setMineSelection}
								savedClassConfigs={savedClassConfigs}
								customExamConfigs={customExamConfigs}
								onDeleteCustom={handleDeleteCustomConfig}
								onCreateCustom={() => setShowCustomDialog(true)}
							/>
						</div>

						{/* Search */}
						<div className="w-full max-w-md relative mt-2">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search subject name or code..."
								className="h-10 text-sm w-full bg-white/5 border-white/10 pl-9 pr-9 text-slate-200 placeholder:text-slate-400 hover:bg-white/10 focus:bg-white/10 focus-visible:ring-[#F0BB78]/30 transition-all rounded-xl"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>

						{/* Status bar */}
						<div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-xs font-medium text-slate-400">
							{activeSessionInfo?.types && activeSessionInfo.types.length > 0 && (
								<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
									<Sparkles className="h-3 w-3 text-[#F0BB78]" />
									Assessed: {activeSessionInfo.types.join(", ")}
								</span>
							)}
							{!isLoading && examData.length > 0 && (
								<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
									{filtered.length} / {examData.length} exams shown
								</span>
							)}
							{!hasSavedConfigs && mineSelection.type === "none" && !isLoading && (
								<span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500">
									Save a timetable config or create a custom one to use Mine filter
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

				{/* ── Content ───────────────────────────────────────────────────── */}
				<div className="max-w-4xl mx-auto">
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
								<p className="text-xs text-slate-500">{emptyMessage()}</p>
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
												mineSubjectCodes.size > 0 &&
												checkCodeMatch(entry.subject_code, mineSubjectCodes);
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
															<div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
																<Clock className="h-3.5 w-3.5 text-slate-500" />
																<span className="text-xs font-semibold tabular-nums text-slate-300">
																	{entry.exam_time}
																</span>
															</div>

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

			{/* Custom config creation dialog */}
			<CustomConfigDialog
				open={showCustomDialog}
				onClose={() => setShowCustomDialog(false)}
				onSave={handleSaveCustomConfig}
				existingIds={new Set(Object.values(customExamConfigs).map((c) => c.name))}
				examData={examData}
			/>
		</main>
	);
}
