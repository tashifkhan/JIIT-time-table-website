"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/** 0 = Monday … 6 = Sunday */
function firstWeekdayOfMonth(year: number, month: number): number {
	return (new Date(year, month, 1).getDay() + 6) % 7;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface CalendarProps {
	/** Currently selected date, or null/undefined for no selection. */
	selected?: Date | null;
	/**
	 * Called when the user clicks a day.
	 * Clicking the already-selected day passes `null` (deselects).
	 */
	onSelect?: (date: Date | null) => void;
	/** Extra class names applied to the root element. */
	className?: string;
	/** Dates before this are disabled. */
	minDate?: Date;
	/** Dates after this are disabled. */
	maxDate?: Date;
}

// ── Component ────────────────────────────────────────────────────────────────

export function Calendar({
	selected,
	onSelect,
	className,
	minDate,
	maxDate,
}: CalendarProps) {
	const today = startOfDay(new Date());

	// The "page" we're viewing — always the 1st of a month
	const [viewing, setViewing] = React.useState<Date>(() => {
		const ref = selected ?? new Date();
		return new Date(ref.getFullYear(), ref.getMonth(), 1);
	});

	const year = viewing.getFullYear();
	const month = viewing.getMonth();

	// Sync viewing month when selected changes from outside
	React.useEffect(() => {
		if (selected) {
			setViewing(new Date(selected.getFullYear(), selected.getMonth(), 1));
		}
	}, [selected]);

	function prevMonth() {
		setViewing((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
	}

	function nextMonth() {
		setViewing((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
	}

	function handleDayClick(day: number) {
		const clicked = new Date(year, month, day);
		if (selected && isSameDay(startOfDay(selected), clicked)) {
			onSelect?.(null);
		} else {
			onSelect?.(clicked);
		}
	}

	function isDisabled(day: number): boolean {
		const d = new Date(year, month, day);
		if (minDate && d < startOfDay(minDate)) return true;
		if (maxDate && d > startOfDay(maxDate)) return true;
		return false;
	}

	// Build the cell array: null = empty leading/trailing cell
	const leadingBlanks = firstWeekdayOfMonth(year, month);
	const daysInMonth = getDaysInMonth(year, month);

	const cells: (number | null)[] = [
		...Array<null>(leadingBlanks).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];
	// Pad to a full set of rows
	while (cells.length % 7 !== 0) cells.push(null);

	const canGoPrev =
		!minDate || new Date(year, month - 1, 1) >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);

	const canGoNext =
		!maxDate || new Date(year, month + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

	return (
		<div
			className={cn(
				"select-none rounded-2xl border border-white/10 bg-[#0e0c0c]/95 p-4 shadow-2xl backdrop-blur-2xl",
				className
			)}
		>
			{/* ── Month navigation ──────────────────────────────── */}
			<div className="mb-3 flex items-center justify-between">
				<button
					type="button"
					onClick={prevMonth}
					disabled={!canGoPrev}
					aria-label="Previous month"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-25"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>

				<div className="text-center">
					<p className="text-sm font-bold text-white">{MONTH_NAMES[month]}</p>
					<p className="text-[11px] font-medium text-slate-500">{year}</p>
				</div>

				<button
					type="button"
					onClick={nextMonth}
					disabled={!canGoNext}
					aria-label="Next month"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-white/8 hover:text-white disabled:pointer-events-none disabled:opacity-25"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			{/* ── Day-of-week headers ──────────────────────────── */}
			<div className="mb-1 grid grid-cols-7">
				{DAY_NAMES.map((d) => (
					<div
						key={d}
						className="py-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600"
					>
						{d}
					</div>
				))}
			</div>

			{/* ── Day cells ────────────────────────────────────── */}
			<div className="grid grid-cols-7 gap-y-0.5">
				{cells.map((day, idx) => {
					if (!day) {
						return <div key={`blank-${idx}`} className="h-9 w-full" />;
					}

					const date = new Date(year, month, day);
					const isToday = isSameDay(date, today);
					const isSelected =
						selected != null && isSameDay(startOfDay(selected), date);
					const disabled = isDisabled(day);

					return (
						<div key={`day-${day}`} className="flex items-center justify-center">
							<button
								type="button"
								onClick={() => !disabled && handleDayClick(day)}
								disabled={disabled}
								aria-label={`${day} ${MONTH_NAMES[month]} ${year}`}
								aria-pressed={isSelected}
								className={cn(
									"relative flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-150",
									// disabled
									disabled && "cursor-not-allowed opacity-20",
									// selected — gold fill
									isSelected &&
										"bg-[#F0BB78] font-bold text-[#0a0a0a] shadow-[0_0_14px_rgba(240,187,120,0.45)] hover:bg-[#e6aa60]",
									// today — gold ring, no fill
									!isSelected &&
										isToday &&
										"border border-[#F0BB78]/40 text-[#F0BB78] hover:bg-[#F0BB78]/15",
									// normal day
									!isSelected &&
										!isToday &&
										!disabled &&
										"text-slate-300 hover:bg-white/8 hover:text-white",
								)}
							>
								{day}
								{/* Today dot (when not selected) */}
								{isToday && !isSelected && (
									<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F0BB78]" />
								)}
							</button>
						</div>
					);
				})}
			</div>

			{/* ── Footer: selected date display + clear ────────── */}
			{selected && (
				<div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
					<span className="text-xs font-medium text-slate-400">
						{selected.toLocaleDateString("en-IN", {
							weekday: "short",
							day: "numeric",
							month: "short",
							year: "numeric",
						})}
					</span>
					<button
						type="button"
						onClick={() => onSelect?.(null)}
						className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-white/8 hover:text-slate-200"
					>
						Clear
					</button>
				</div>
			)}
		</div>
	);
}