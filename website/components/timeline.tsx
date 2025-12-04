"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import UserContext from "../context/userContext";
import { useSearchParams } from "next/navigation";
import { TimelineHeader } from "./timeline-header";

interface ScheduleEvent {
	subject_name: string;
	type: string;
	location: string;
	isCustom?: boolean;
}

interface CalendarEvent {
	summary: string;
	start: { date: string };
	end: { date: string };
}

export const TimelineView: React.FC = () => {
	const { editedSchedule, schedule } = React.useContext(UserContext);
	const displaySchedule = editedSchedule || schedule;
	const containerRef = useRef<HTMLDivElement>(null);
	const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

	// State for view and date
	const [view, setView] = useState<"day" | "week">("week");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
	const [filteredCalendarEvents, setFilteredCalendarEvents] = useState<
		CalendarEvent[]
	>([]);

	// Set default view to day on mobile
	useEffect(() => {
		if (window.innerWidth < 768) {
			setView("day");
		}
	}, []);

	// Detect if download mode is active via query param
	const isDownloadMode = React.useMemo(() => {
		const params = new URLSearchParams(location.search);
		return params.get("download") === "1";
	}, [location.search]);

	// Force week view in download mode
	useEffect(() => {
		if (isDownloadMode) {
			setView("week");
		}
	}, [isDownloadMode]);

	// Welcome banner state
	const [showWelcome, setShowWelcome] = useState(false);
	useEffect(() => {
		if (!isDownloadMode && !localStorage.getItem("timelineWelcomeDismissed")) {
			setShowWelcome(true);
		}
	}, [isDownloadMode]);

	const dismissWelcome = () => {
		setShowWelcome(false);
		localStorage.setItem("timelineWelcomeDismissed", "1");
	};

	// Scroll to current time on mount
	useEffect(() => {
		if (!isDownloadMode && displaySchedule) {
			const currentTimePosition = getCurrentTimePosition();
			const currentDay = getCurrentDay();
			const isCurrentDayInSchedule = days.includes(currentDay);

			if (currentTimePosition !== null && isCurrentDayInSchedule) {
				// If in day view and it's today, or in week view
				if (view === "week" || (view === "day" && isToday(currentDay))) {
					const timeSlotHeight = window.innerWidth >= 768 ? 12 * 16 : 9 * 16;
					const headerHeight = 80;
					const scrollPosition =
						currentTimePosition * timeSlotHeight +
						headerHeight -
						window.innerHeight / 2;

					setTimeout(() => {
						window.scrollTo({
							top: Math.max(0, scrollPosition),
							left: 0,
							behavior: "smooth",
						});
					}, 100);
				}
			}
		}
	}, [isDownloadMode, displaySchedule, view]);

	// Fetch Academic Calendar Data
	useEffect(() => {
		if (isDownloadMode) return;

		const fetchCalendarData = async () => {
			try {
				// 1. Get available years
				const yearsRes = await fetch("/api/academic-calendar");
				const years = await yearsRes.json();

				if (years.length > 0) {
					// 2. Get data for the latest year (assuming sorted)
					const latestYear = years[0].value;
					const eventsRes = await fetch(`/api/academic-calendar/${latestYear}`);
					const events = await eventsRes.json();
					setCalendarEvents(events);
				}
			} catch (error) {
				console.error("Failed to fetch calendar data:", error);
			}
		};

		fetchCalendarData();
	}, [isDownloadMode]);

	// Filter calendar events for the current view
	useEffect(() => {
		if (calendarEvents.length === 0) return;

		const getWeekRange = (date: Date) => {
			const start = new Date(date);
			const day = start.getDay();
			const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
			start.setDate(diff);
			start.setHours(0, 0, 0, 0);

			const end = new Date(start);
			end.setDate(start.getDate() + 6);
			end.setHours(23, 59, 59, 999);

			return { start, end };
		};

		const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);

		const filtered = calendarEvents.filter((event) => {
			const eventStart = new Date(event.start.date);
			const eventEnd = new Date(event.end.date);
			// Check if event overlaps with the current week
			return eventStart <= weekEnd && eventEnd >= weekStart;
		});

		setFilteredCalendarEvents(filtered);
	}, [calendarEvents, currentDate, view]);

	const days = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const handleNavigate = (direction: "prev" | "next") => {
		const newDate = new Date(currentDate);
		if (view === "week") {
			newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
		} else {
			newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
		}
		setCurrentDate(newDate);
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const getDaysToDisplay = () => {
		if (view === "day") {
			return [currentDate.toLocaleDateString("en-US", { weekday: "long" })];
		}
		return days;
	};

	const displayedDays = getDaysToDisplay();

	const getEventColor = (type: string) => {
		switch (type) {
			case "L":
				return {
					background: "rgba(59, 130, 246, 0.15)", // Blue glass
					text: "#60A5FA",
					border: "1px solid rgba(59, 130, 246, 0.3)",
					accent: "#3B82F6",
				};
			case "P":
				return {
					background: "rgba(16, 185, 129, 0.15)", // Green glass
					text: "#34D399",
					border: "1px solid rgba(16, 185, 129, 0.3)",
					accent: "#10B981",
				};
			case "T":
				return {
					background: "rgba(245, 158, 11, 0.15)", // Amber glass
					text: "#FBBF24",
					border: "1px solid rgba(245, 158, 11, 0.3)",
					accent: "#F59E0B",
				};
			case "C":
				return {
					background: "rgba(139, 92, 246, 0.15)", // Purple glass
					text: "#A78BFA",
					border: "1px solid rgba(139, 92, 246, 0.3)",
					accent: "#8B5CF6",
				};
			default:
				return {
					background: "rgba(255, 240, 220, 0.05)", // Default glass
					text: "#FFF0DC",
					border: "1px solid rgba(255, 240, 220, 0.1)",
					accent: "#FFF0DC",
				};
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "L":
				return "Lecture";
			case "P":
				return "Practical";
			case "T":
				return "Tutorial";
			case "C":
				return "Custom";
			default:
				return type;
		}
	};

	const getTypeIcon = (type: string) => {
		const iconProps = "w-3 h-3 inline-block opacity-80";
		switch (type) {
			case "L":
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
					</svg>
				);
			case "P":
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.010-3.231 2.121-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
							clipRule="evenodd"
						/>
					</svg>
				);
			case "T":
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
					</svg>
				);
			case "C":
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				);
			default:
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
							clipRule="evenodd"
						/>
					</svg>
				);
		}
	};

	const getEventStyle = (event: ScheduleEvent) => {
		const colors = getEventColor(event.type);
		return {
			background: colors.background,
			color: colors.text,
			border: colors.border,
			borderLeft: `3px solid ${colors.accent}`,
			borderRadius: "4px",
			padding: "4px 8px",
			height: "100%",
			display: "flex",
			flexDirection: "column" as const,
			gap: "2px",
			boxShadow:
				"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
			backdropFilter: "blur(4px)",
			position: "relative" as const,
			overflow: "hidden" as const,
			transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
			cursor: "pointer",
			fontSize: "0.85rem",
		};
	};

	const getEventPosition = (timeSlot: string) => {
		const [start] = timeSlot.split("-");
		const hour = parseInt(start.split(":")[0]);
		return hour - 8;
	};

	const getEventDuration = (timeSlot: string) => {
		const [start, end] = timeSlot.split("-");
		const startHour = parseInt(start.split(":")[0]);
		const endHour = parseInt(end.split(":")[0]);
		return endHour - startHour;
	};

	const getCurrentTimePosition = () => {
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		if (currentHour < 8 || currentHour > 18) return null;

		const position = currentHour - 8 + currentMinute / 60;
		return position;
	};

	const getCurrentDay = () => {
		const today = new Date();
		const dayNames = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		return dayNames[today.getDay()];
	};

	const isToday = (day: string) => {
		return getCurrentDay() === day;
	};

	const [selectedEvent, setSelectedEvent] = useState<{
		event: ScheduleEvent;
		timeSlot: string;
		day: string;
	} | null>(null);

	const closeModal = useCallback(() => setSelectedEvent(null), []);

	return (
		<div
			id="schedule-display"
			className="flex flex-col h-screen bg-[#1a1816] text-[#FFF0DC] overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#23201c] via-[#1a1816] to-[#12110f]"
			style={isDownloadMode ? { minWidth: "2700px", height: "auto" } : {}}
		>
			{/* Header */}
			{!isDownloadMode && (
				<TimelineHeader
					currentDate={currentDate}
					view={view}
					onViewChange={setView}
					onNavigate={handleNavigate}
					onToday={handleToday}
				/>
			)}

			{/* Welcome Banner */}
			{showWelcome && !isDownloadMode && (
				<div className="mx-6 mt-6 p-6 rounded-xl bg-gradient-to-r from-[#543A14]/30 to-[#F0BB78]/10 border border-[#F0BB78]/20 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in flex-shrink-0 backdrop-blur-sm">
					<div>
						<h2 className="text-xl font-bold mb-1 text-[#F0BB78] tracking-tight">
							Welcome to Your Weekly Schedule
						</h2>
						<p className="text-sm text-[#FFF0DC]/70 font-light">
							View your classes for each day. Toggle between Day and Week views.
						</p>
					</div>
					<button
						className="px-4 py-1.5 rounded-full bg-[#543A14]/40 text-[#FFF0DC] hover:bg-[#543A14]/60 transition-all duration-200 text-sm border border-[#F0BB78]/10 hover:border-[#F0BB78]/30"
						onClick={dismissWelcome}
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Main Grid Container */}
			<div
				className="flex-1 overflow-y-auto overflow-x-auto relative custom-scrollbar"
				ref={containerRef}
			>
				<div
					className="min-w-full"
					style={{
						width:
							view === "week" ? (isDownloadMode ? "2500px" : "100%") : "100%",
						minWidth: view === "week" ? "800px" : "auto",
					}}
				>
					{/* Grid Header (Days) */}
					<div className="sticky top-0 z-30 bg-[#1a1816]/95 backdrop-blur-sm border-b border-[#FFF0DC]/5 flex shadow-sm">
						{/* Time Column Header Spacer */}
						<div className="w-16 md:w-20 flex-shrink-0 border-r border-[#FFF0DC]/5 bg-[#1a1816]/95"></div>

						{/* Days Headers */}
						<div
							className="flex-1 grid"
							style={{
								gridTemplateColumns: `repeat(${displayedDays.length}, 1fr)`,
							}}
						>
							{displayedDays.map((day, idx) => (
								<div
									key={day}
									className={`py-4 text-center border-r border-[#FFF0DC]/5 last:border-r-0 transition-colors duration-300 ${
										isToday(day) ? "bg-[#F0BB78]/5" : ""
									}`}
								>
									<div
										className={`text-xs font-semibold tracking-wider mb-1 ${
											isToday(day) ? "text-[#F0BB78]" : "text-[#FFF0DC]/50"
										}`}
									>
										{day.slice(0, 3).toUpperCase()}
									</div>
									<div
										className={`text-2xl font-light ${
											isToday(day) ? "text-[#F0BB78]" : "text-[#FFF0DC]/90"
										}`}
									>
										{/* Show date number if possible, or just a placeholder/nothing for recurring schedule */}
										{view === "day" ? currentDate.getDate() : ""}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Academic Calendar Events Section */}
					{!isDownloadMode && filteredCalendarEvents.length > 0 && (
						<div className="relative border-b border-[#FFF0DC]/5 bg-[#1a1816]/30">
							<div className="flex">
								{/* Spacer for time column */}
								<div className="w-16 md:w-20 flex-shrink-0 border-r border-[#FFF0DC]/5 bg-[#1a1816]/50 backdrop-blur-[2px]"></div>

								{/* Events Grid */}
								<div
									className="flex-1 grid relative py-1"
									style={{
										gridTemplateColumns: `repeat(${displayedDays.length}, 1fr)`,
									}}
								>
									{filteredCalendarEvents.map((event, idx) => {
										const eventStart = new Date(event.start.date);
										const eventEnd = new Date(event.end.date);

										// Calculate start and end indices for the grid
										let startIndex = -1;
										let span = 0;

										if (view === "day") {
											// In day view, check if event includes this day
											const dayDate = new Date(currentDate);
											dayDate.setHours(0, 0, 0, 0);
											if (eventStart <= dayDate && eventEnd >= dayDate) {
												startIndex = 0;
												span = 1;
											}
										} else {
											// In week view
											const weekStart = new Date(currentDate);
											const day = weekStart.getDay();
											const diff =
												weekStart.getDate() - day + (day === 0 ? -6 : 1);
											weekStart.setDate(diff);
											weekStart.setHours(0, 0, 0, 0);

											// Find start index (0-6 for Mon-Sun)
											// We need to map event dates to grid columns
											// This is a simplified logic assuming standard week view
											const dayMs = 24 * 60 * 60 * 1000;

											// Iterate through displayed days to find overlap
											displayedDays.forEach((dayName, dayIdx) => {
												const currentDayDate = new Date(weekStart);
												currentDayDate.setDate(weekStart.getDate() + dayIdx);

												// Check if this day is within event range
												if (
													currentDayDate >= eventStart &&
													currentDayDate <= eventEnd
												) {
													if (startIndex === -1) startIndex = dayIdx;
													span++;
												}
											});
										}

										if (startIndex === -1) return null;

										return (
											<div
												key={idx}
												className="relative mx-1 mb-1 last:mb-0"
												style={{
													gridColumnStart: startIndex + 1,
													gridColumnEnd: `span ${span}`,
												}}
											>
												<div className="bg-[#543A14]/40 border border-[#F0BB78]/30 rounded px-2 py-1 text-xs text-[#F0BB78] truncate flex items-center gap-1.5 shadow-sm hover:bg-[#543A14]/60 transition-colors cursor-default">
													<div className="w-1.5 h-1.5 rounded-full bg-[#F0BB78] flex-shrink-0 animate-pulse"></div>
													<span className="font-medium truncate">
														{event.summary.replace("Holiday -", "").trim()}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* Grid Body */}
					<div className="flex relative">
						{/* Time Column */}
						<div className="w-16 md:w-20 flex-shrink-0 border-r border-[#FFF0DC]/5 bg-[#1a1816]/50 z-20 backdrop-blur-[2px]">
							{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
								<div key={hour} className="h-24 md:h-32 relative">
									<div className="absolute -top-3 right-3 text-xs font-medium text-[#FFF0DC]/40">
										{hour === 12
											? "12 PM"
											: hour > 12
											? `${hour - 12} PM`
											: `${hour} AM`}
									</div>
								</div>
							))}
						</div>

						{/* Days Columns */}
						<div
							className="flex-1 grid relative"
							style={{
								gridTemplateColumns: `repeat(${displayedDays.length}, 1fr)`,
							}}
						>
							{/* Horizontal Grid Lines */}
							<div className="absolute inset-0 z-0 pointer-events-none">
								{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
									<div
										key={hour}
										className="h-24 md:h-32 border-b border-[#FFF0DC]/5"
									></div>
								))}
							</div>

							{displayedDays.map((day, idx) => (
								<div
									key={day}
									className={`relative border-r border-[#FFF0DC]/5 last:border-r-0 ${
										isToday(day)
											? "bg-gradient-to-b from-[#F0BB78]/[0.02] to-transparent"
											: ""
									}`}
									ref={(el) => {
										dayRefs.current[idx] = el;
									}}
								>
									{/* Current Time Indicator Line */}
									{isToday(day) && getCurrentTimePosition() !== null && (
										<div
											className="absolute left-0 right-0 z-20 pointer-events-none"
											style={{
												top: `${
													getCurrentTimePosition()! *
													(window.innerWidth >= 768 ? 8 : 6)
												}rem`, // 8rem = 32 * 4px = 128px (h-32)
											}}
										>
											<div className="h-[2px] bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
											<div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-[#EF4444] rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]"></div>
										</div>
									)}

									{/* Events */}
									{displaySchedule?.[day] &&
										Object.entries(displaySchedule[day]).map(
											([timeSlot, event]: [string, ScheduleEvent]) => (
												<div
													key={timeSlot}
													className="absolute left-1 right-1 z-10 hover:z-30 group"
													style={{
														top: `${
															getEventPosition(timeSlot) *
															(window.innerWidth >= 768 ? 8 : 6)
														}rem`,
														height: `${
															getEventDuration(timeSlot) *
																(window.innerWidth >= 768 ? 8 : 6) -
															0.125
														}rem`, // Subtract small gap
													}}
													onClick={() =>
														setSelectedEvent({ event, timeSlot, day })
													}
												>
													<div
														style={getEventStyle(event as ScheduleEvent)}
														className="group-hover:scale-[1.02] group-hover:shadow-xl transition-all duration-200"
													>
														<div className="font-semibold truncate text-sm leading-tight">
															{event.subject_name}
														</div>
														<div className="text-[10px] md:text-xs opacity-80 truncate mt-0.5 font-medium">
															{timeSlot}
														</div>
														<div className="text-[10px] md:text-xs opacity-70 truncate flex items-center gap-1 mt-auto pb-0.5">
															<svg
																className="w-3 h-3 opacity-60"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
																/>
															</svg>
															{event.location}
														</div>
													</div>
												</div>
											)
										)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Event Detail Modal */}
			{selectedEvent && (
				<EventDetailModal
					event={selectedEvent.event}
					timeSlot={selectedEvent.timeSlot}
					day={selectedEvent.day}
					onClose={closeModal}
					getEventColor={getEventColor}
					getTypeIcon={getTypeIcon}
					getTypeLabel={getTypeLabel}
					getEventDuration={getEventDuration}
				/>
			)}
		</div>
	);
};

function EventDetailModal({
	event,
	timeSlot,
	day,
	onClose,
	getEventColor,
	getTypeIcon,
	getTypeLabel,
	getEventDuration,
}: {
	event: ScheduleEvent;
	timeSlot: string;
	day: string;
	onClose: () => void;
	getEventColor: (type: string) => any;
	getTypeIcon: (type: string) => React.ReactElement;
	getTypeLabel: (type: string) => string;
	getEventDuration: (slot: string) => number;
}) {
	const colors = getEventColor(event.type);
	// ESC key and click outside to close
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
			onClick={onClose}
		>
			<div
				className="relative max-w-md w-full mx-4 rounded-2xl shadow-2xl p-6 animate-fade-in bg-[#23201c] border border-[#FFF0DC]/10"
				onClick={(e) => e.stopPropagation()}
				style={{
					boxShadow: `0 0 0 1px ${colors.border}, 0 20px 50px -12px rgba(0, 0, 0, 0.5)`,
				}}
			>
				{/* Close button */}
				<button
					className="absolute top-4 right-4 text-[#FFF0DC]/40 hover:text-[#FFF0DC] transition-colors p-1 hover:bg-[#FFF0DC]/10 rounded-full"
					onClick={onClose}
					aria-label="Close"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Header with Color Strip */}
				<div className="flex items-start gap-4 mb-6">
					<div
						className="w-1.5 self-stretch rounded-full flex-shrink-0"
						style={{ backgroundColor: colors.accent }}
					></div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span
								className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-opacity-20"
								style={{
									backgroundColor: colors.background,
									color: colors.text,
								}}
							>
								{getTypeLabel(event.type)}
							</span>
						</div>
						<h2 className="text-2xl font-bold text-[#FFF0DC] leading-tight mb-1">
							{event.subject_name}
						</h2>
						<div className="text-sm text-[#FFF0DC]/60 font-medium">
							{day}, {timeSlot}
						</div>
					</div>
				</div>

				{/* Details */}
				<div className="space-y-4 text-sm text-[#FFF0DC]/80 pl-6 border-l border-[#FFF0DC]/10 ml-0.5">
					<div className="flex items-center gap-4 group">
						<div className="w-8 h-8 rounded-full bg-[#FFF0DC]/5 flex items-center justify-center text-[#FFF0DC]/50 group-hover:bg-[#FFF0DC]/10 group-hover:text-[#FFF0DC] transition-colors">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<div>
							<span className="block text-[#FFF0DC]/40 text-xs font-medium uppercase tracking-wide mb-0.5">
								Location
							</span>
							<span className="text-base">{event.location}</span>
						</div>
					</div>

					<div className="flex items-center gap-4 group">
						<div className="w-8 h-8 rounded-full bg-[#FFF0DC]/5 flex items-center justify-center text-[#FFF0DC]/50 group-hover:bg-[#FFF0DC]/10 group-hover:text-[#FFF0DC] transition-colors">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<span className="block text-[#FFF0DC]/40 text-xs font-medium uppercase tracking-wide mb-0.5">
								Duration
							</span>
							<span className="text-base">
								{getEventDuration(timeSlot)} hours
							</span>
						</div>
					</div>
				</div>

				{/* Footer Actions (Optional placeholder for future) */}
				<div className="mt-8 pt-4 border-t border-[#FFF0DC]/10 flex justify-end">
					<button
						className="text-sm font-medium text-[#F0BB78] hover:text-[#D4A366] transition-colors"
						onClick={onClose}
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
}

export default TimelineView;
