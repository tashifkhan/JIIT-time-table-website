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

export const TimelineView: React.FC = () => {
	const { editedSchedule, schedule } = React.useContext(UserContext);
	const displaySchedule = editedSchedule || schedule;
	const containerRef = useRef<HTMLDivElement>(null);
	const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

	// State for view and date
	const [view, setView] = useState<"day" | "week">("week");
	const [currentDate, setCurrentDate] = useState(new Date());

	// Detect if download mode is active via query param
	const isDownloadMode = React.useMemo(() => {
		const params = new URLSearchParams(location.search);
		return params.get("download") === "1";
	}, [location.search]);

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
					background: "#3B82F6", // Solid blue
					text: "#FFFFFF",
					border: "none",
				};
			case "P":
				return {
					background: "#10B981", // Solid green
					text: "#FFFFFF",
					border: "none",
				};
			case "T":
				return {
					background: "#F59E0B", // Solid amber
					text: "#FFFFFF",
					border: "none",
				};
			case "C":
				return {
					background: "#8B5CF6", // Solid purple
					text: "#FFFFFF",
					border: "none",
				};
			default:
				return {
					background: "#543A14", // Dark brown/default
					text: "#FFF0DC",
					border: "1px solid rgba(255, 240, 220, 0.2)",
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
			borderRadius: "6px",
			padding: "4px 8px",
			height: "100%",
			display: "flex",
			flexDirection: "column" as const,
			gap: "2px",
			boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
			position: "relative" as const,
			overflow: "hidden" as const,
			transition: "all 0.2s ease-in-out",
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
			className="flex flex-col h-screen bg-[#23201c] text-[#FFF0DC] overflow-hidden"
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
				<div className="mx-4 mt-4 p-4 rounded-lg bg-gradient-to-r from-[#543A14]/40 to-[#F0BB78]/20 border border-[#F0BB78]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in flex-shrink-0">
					<div>
						<h2 className="text-lg font-bold mb-1 text-[#F0BB78]">
							Welcome to Your Weekly Schedule!
						</h2>
						<p className="text-sm text-[#FFF0DC]/80">
							View your classes for each day. Toggle between Day and Week views.
						</p>
					</div>
					<button
						className="px-3 py-1 rounded bg-[#543A14]/60 text-[#FFF0DC] hover:bg-[#543A14]/80 transition text-sm"
						onClick={dismissWelcome}
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Main Grid Container */}
			<div
				className="flex-1 overflow-y-auto overflow-x-auto relative"
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
					<div className="sticky top-0 z-30 bg-[#23201c] border-b border-[#FFF0DC]/10 flex">
						{/* Time Column Header Spacer */}
						<div className="w-16 md:w-20 flex-shrink-0 border-r border-[#FFF0DC]/10 bg-[#23201c]"></div>

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
									className={`py-3 text-center border-r border-[#FFF0DC]/10 last:border-r-0 ${
										isToday(day) ? "bg-[#FFF0DC]/5" : ""
									}`}
								>
									<div
										className={`text-sm font-medium ${
											isToday(day) ? "text-[#F0BB78]" : "text-[#FFF0DC]/70"
										}`}
									>
										{day.slice(0, 3).toUpperCase()}
									</div>
									<div
										className={`text-xl font-bold ${
											isToday(day) ? "text-[#F0BB78]" : "text-[#FFF0DC]"
										}`}
									>
										{/* Since we don't have real dates for the schedule, we just show the day name or a placeholder if needed. 
                                            But for "Day" view with currentDate, we could show the date number. 
                                            For "Week" view (recurring), maybe just the day name is enough. 
                                            Let's try to show the date number if we can derive it.
                                        */}
										{view === "day" ? currentDate.getDate() : ""}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Grid Body */}
					<div className="flex relative">
						{/* Time Column */}
						<div className="w-16 md:w-20 flex-shrink-0 border-r border-[#FFF0DC]/10 bg-[#23201c] z-20">
							{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
								<div key={hour} className="h-24 md:h-32 relative">
									<div className="absolute -top-3 right-2 text-xs text-[#FFF0DC]/50">
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
									className={`relative border-r border-[#FFF0DC]/10 last:border-r-0 ${
										isToday(day) ? "bg-[#FFF0DC]/[0.02]" : ""
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
											<div className="h-[2px] bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div>
											<div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
										</div>
									)}

									{/* Events */}
									{displaySchedule?.[day] &&
										Object.entries(displaySchedule[day]).map(
											([timeSlot, event]: [string, ScheduleEvent]) => (
												<div
													key={timeSlot}
													className="absolute left-1 right-1 z-10 hover:z-20"
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
													<div style={getEventStyle(event as ScheduleEvent)}>
														<div className="font-semibold truncate">
															{event.subject_name}
														</div>
														<div className="text-xs opacity-90 truncate">
															{timeSlot}
														</div>
														<div className="text-xs opacity-90 truncate">
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
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative max-w-md w-full mx-4 rounded-xl shadow-2xl p-6 animate-fade-in bg-[#23201c] border border-[#FFF0DC]/20"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					className="absolute top-4 right-4 text-[#FFF0DC]/50 hover:text-[#FFF0DC] transition"
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
				<div className="flex items-start gap-4 mb-4">
					<div
						className="w-4 h-4 rounded mt-1 flex-shrink-0"
						style={{ backgroundColor: colors.background }}
					></div>
					<div>
						<h2 className="text-xl font-bold text-[#FFF0DC] leading-tight">
							{event.subject_name}
						</h2>
						<div className="text-sm text-[#FFF0DC]/70 mt-1">
							{day}, {timeSlot}
						</div>
					</div>
				</div>

				{/* Details */}
				<div className="space-y-4 text-sm text-[#FFF0DC]/90 pl-8">
					<div className="flex items-center gap-3">
						<div className="w-5 flex justify-center text-[#FFF0DC]/50">
							{getTypeIcon(event.type)}
						</div>
						<div>
							<span className="block text-[#FFF0DC]/50 text-xs">Type</span>
							{getTypeLabel(event.type)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="w-5 flex justify-center text-[#FFF0DC]/50">
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
							<span className="block text-[#FFF0DC]/50 text-xs">Location</span>
							{event.location}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="w-5 flex justify-center text-[#FFF0DC]/50">
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
							<span className="block text-[#FFF0DC]/50 text-xs">Duration</span>
							{getEventDuration(timeSlot)} hours
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TimelineView;
