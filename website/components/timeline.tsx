"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import UserContext from "../context/userContext";
import { useSearchParams } from "next/navigation";

interface ScheduleEvent {
	subject_name: string;
	type: string;
	location: string;
	isCustom?: boolean;
}

interface TimeSlot {
	time: string;
	subject: string;
	type: string;
	location: string;
	day?: string;
}

export const TimelineView: React.FC = () => {
	const { editedSchedule, schedule } = React.useContext(UserContext);
	const displaySchedule = editedSchedule || schedule;
	const containerRef = useRef<HTMLDivElement>(null);
	// Add refs for each day column
	const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

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

	// Scroll to current time on mount for visitors (not download mode)
	useEffect(() => {
		if (!isDownloadMode && displaySchedule) {
			const currentTimePosition = getCurrentTimePosition();
			const currentDay = getCurrentDay();
			const isCurrentDayInSchedule = days.includes(currentDay);

			if (currentTimePosition !== null && isCurrentDayInSchedule) {
				// Calculate the scroll position to center the current time
				const timeSlotHeight = window.innerWidth >= 768 ? 12 * 16 : 9 * 16; // 12rem or 9rem in pixels
				const headerHeight = 80; // Account for day header
				const scrollPosition =
					currentTimePosition * timeSlotHeight +
					headerHeight -
					window.innerHeight / 2;

				// Smooth scroll to current time
				setTimeout(() => {
					window.scrollTo({
						top: Math.max(0, scrollPosition),
						left: 0,
						behavior: "smooth",
					});
				}, 100); // Small delay to ensure rendering is complete

				// Horizontal scroll to current day
				setTimeout(() => {
					const dayIndex = days.indexOf(currentDay);
					const dayNode = dayRefs.current[dayIndex];
					if (containerRef.current && dayNode) {
						const scrollLeft =
							dayNode.offsetLeft -
							containerRef.current.offsetLeft -
							containerRef.current.clientWidth / 2 +
							dayNode.clientWidth / 2;
						containerRef.current.scrollTo({
							left: Math.max(0, scrollLeft),
							behavior: "smooth",
						});
					}
				}, 200); // After vertical scroll
			} else {
				// Fallback to scroll to top if no current time or not a weekday
				window.scrollTo({ top: 0, left: 0, behavior: "auto" });
			}

			if (containerRef.current) {
				containerRef.current.scrollLeft = 0;
			}
		}
	}, [isDownloadMode, displaySchedule]);

	const days = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const getEventColor = (type: string) => {
		switch (type) {
			case "L":
				return {
					background:
						"linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.25))",
					border: "1px solid rgba(59, 130, 246, 0.3)",
					accent: "#3B82F6",
				};
			case "P":
				return {
					background:
						"linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))",
					border: "1px solid rgba(16, 185, 129, 0.3)",
					accent: "#10B981",
				};
			case "T":
				return {
					background:
						"linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.25))",
					border: "1px solid rgba(245, 158, 11, 0.3)",
					accent: "#F59E0B",
				};
			case "C":
				return {
					background:
						"linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.25))",
					border: "1px solid rgba(139, 92, 246, 0.3)",
					accent: "#8B5CF6",
				};
			default:
				return {
					background: "rgba(255, 240, 220, 0.1)",
					border: "1px solid rgba(255, 240, 220, 0.2)",
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
		const iconProps = "w-4 h-4 inline-block";
		switch (type) {
			case "L":
				// Book/Lecture icon
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
					</svg>
				);
			case "P":
				// Flask/Lab icon
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
				// Pencil/Tutorial icon
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
					</svg>
				);
			case "C":
				// Star/Custom icon
				return (
					<svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				);
			default:
				// Calendar icon
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
			backdropFilter: "blur(10px)",
			border: colors.border,
			borderRadius: "18px",
			padding: "0.75rem",
			height: "100%",
			display: "flex",
			flexDirection: "column" as const,
			gap: "0.5rem",
			boxShadow: `0 6px 18px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
			position: "relative" as const,
			overflow: "hidden" as const,
			transition: "all 0.2s ease-in-out",
			cursor: "pointer",
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

	const getScheduleStats = () => {
		if (!displaySchedule) return { total: 0, byType: {}, todayCount: 0 };

		let total = 0;
		let todayCount = 0;
		const byType: { [key: string]: number } = {};
		const currentDay = getCurrentDay();

		Object.entries(displaySchedule).forEach(([day, daySchedule]) => {
			Object.values(daySchedule).forEach((event) => {
				total++;
				byType[event.type] = (byType[event.type] || 0) + 1;
				if (day === currentDay) {
					todayCount++;
				}
			});
		});

		return { total, byType, todayCount };
	};

	const [selectedEvent, setSelectedEvent] = useState<{
		event: ScheduleEvent;
		timeSlot: string;
		day: string;
	} | null>(null);

	const closeModal = useCallback(() => setSelectedEvent(null), []);

	return (
		<div
			className="min-h-[50%] text-[#FFF0DC] p-0 md:p-8 overflow-scroll"
			style={isDownloadMode ? { minWidth: "2700px" } : {}}
		>
			{/* Page Title Header for visitors */}
			{!isDownloadMode && (
				<div className="mb-8 px-4 md:px-8 text-center">
					<div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-2">
						<h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-[#F0BB78]">
							Your Weekly Schedule
						</h1>
					</div>
					<div className="text-base md:text-xl text-[#FFF0DC]/70 font-normal">
						Today: {getCurrentDay()}
					</div>
				</div>
			)}

			{showWelcome && (
				<div className="mb-6 mx-4 md:mx-0 p-4 rounded-lg bg-gradient-to-r from-[#543A14]/40 to-[#F0BB78]/20 border border-[#F0BB78]/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
					<div>
						<h2 className="text-lg md:text-xl font-bold mb-1 text-[#F0BB78]">
							Welcome to Your Weekly Schedule!
						</h2>
						<ul className="text-sm text-[#FFF0DC]/80 list-disc pl-5 space-y-1">
							<li>View your classes for each day, color-coded by type.</li>
							<li>
								Hover over events for details. Today is highlighted for you.
							</li>
							<li>
								Moreover clicking on it will show you all the details of that
								particular class.
							</li>
							<li>
								Use the buttons below to download your schedule as PNG or PDF,
								or add to Google Calendar.
							</li>
							<li>
								Need to edit or create a new schedule? Use the navigation bar on
								the left.
							</li>
						</ul>
					</div>
					<button
						className="ml-auto mt-2 md:mt-0 px-3 py-1 rounded bg-[#543A14]/60 text-[#FFF0DC] hover:bg-[#543A14]/80 transition"
						onClick={dismissWelcome}
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Stats & Legend container for visitors */}
			{!isDownloadMode && (
				<div className="mb-6 mx-4 md:mx-0 p-4 rounded-lg bg-[#23201c]/60 border border-[#FFF0DC]/10 shadow flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-0">
					<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 w-full md:w-auto justify-center md:justify-start">
						<div className="text-sm flex items-center gap-2">
							<span className="text-[#FFF0DC]/70">Total Classes:</span>
							<span className="font-semibold text-blue-300">
								{getScheduleStats().total}
							</span>
						</div>
						<div className="flex gap-4 text-sm flex-wrap justify-center">
							{Object.entries(getScheduleStats().byType).map(
								([type, count]) => (
									<div key={type} className="flex items-center gap-2">
										<span className="flex-shrink-0">{getTypeIcon(type)}</span>
										<span className="text-[#FFF0DC]/70">
											{getTypeLabel(type)}:
										</span>
										<span
											className="font-semibold"
											style={{ color: getEventColor(type).accent }}
										>
											{count}
										</span>
									</div>
								)
							)}
						</div>
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs w-full md:w-auto justify-center md:justify-end">
						<span className="text-[#FFF0DC]/70">Legend:</span>
						<div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
							{["L", "P", "T", "C"].map((type) => (
								<div key={type} className="flex items-center gap-1">
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: getEventColor(type).accent }}
									></div>
									<span>{getTypeLabel(type)}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			<div
				id="schedule-display"
				ref={containerRef} // Move ref here
				className="max-w-8xl mx-auto backdrop-blur-lg bg-[rgba(255,240,220,0.05)] rounded-none md:rounded-xl p-0 md:p-6 shadow-xl overflow-x-auto"
				style={isDownloadMode ? { minWidth: "2550px" } : {}}
			>
				{/* Only show the title inside the grid in download mode */}
				{isDownloadMode && (
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-xl md:text-3xl font-bold text-center flex-1 flex items-center justify-center gap-3">
							<svg
								className="w-7 h-7 md:w-8 md:h-8"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clipRule="evenodd"
								/>
							</svg>
							Your Weekly Schedule
						</h1>
						<div className="text-right">
							<div className="text-sm text-[#FFF0DC]/70">
								Today: {getCurrentDay()}
							</div>
							{getScheduleStats().todayCount > 0 && (
								<div className="text-xs text-blue-300">
									{getScheduleStats().todayCount} classes today
								</div>
							)}
						</div>
					</div>
				)}

				{/* Schedule Statistics */}
				{/* This block is now moved outside the main display div */}

				<div className="min-w-[1500px] px-2 md:px-0">
					<div
						className={
							isDownloadMode
								? "grid grid-cols-[150px_repeat(6,1fr)] gap-4"
								: "grid grid-cols-[70px_repeat(6,1fr)] md:grid-cols-[110px_repeat(6,1fr)] gap-4"
						}
					>
						{/* Time column */}
						<div className="font-medium">
							<div className="h-20"></div> {/* Header spacer */}
							{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
								<div
									key={hour}
									className="h-36 md:h-48 flex items-center justify-center text-sm md:text-base relative"
									style={{ transform: "translateY(-50%)" }}
								>
									<div className="text-center">
										<div className="font-semibold">{`${hour}:00`}</div>
										<div className="text-xs opacity-60">
											{hour < 12 ? "AM" : "PM"}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Days columns */}
						{days.map((day, idx) => (
							<div
								key={day}
								className="relative"
								ref={(el) => {
									dayRefs.current[idx] = el;
								}}
							>
								<div
									className={`h-20 flex items-center justify-center font-medium border-b text-sm md:text-base rounded-t-lg ${
										!isDownloadMode && isToday(day)
											? "bg-gradient-to-r from-[#543A14]/40 to-[#F0BB78]/20 border-[rgba(255,240,220,0.1)] text-white"
											: "border-[rgba(255,240,220,0.1)]"
									}`}
								>
									<div className="text-center">
										<div className="font-semibold">{day}</div>
										{isToday(day) && (
											<div className="text-xs opacity-75">Today</div>
										)}
									</div>
								</div>

								{/* Time grid background */}
								<div className="grid grid-rows-[repeat(10,9rem)] md:grid-rows-[repeat(10,12rem)]">
									{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
										<div
											key={hour}
											className="border-b border-[rgba(255,240,220,0.05)] relative"
										>
											{/* Current time indicator */}
											{!isDownloadMode &&
												isToday(day) &&
												getCurrentTimePosition() !== null &&
												Math.floor(getCurrentTimePosition()!) === hour - 8 && (
													<div
														className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-lg z-20 animate-pulse"
														style={{
															top: `${
																(getCurrentTimePosition()! - (hour - 8)) * 100
															}%`,
															boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
														}}
													>
														<div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
														<div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
														<div className="absolute -right-8 -top-2 text-xs text-red-400 font-medium bg-black/30 px-1 rounded">
															Now
														</div>
													</div>
												)}
										</div>
									))}
								</div>

								{/* Events */}
								{displaySchedule?.[day] &&
									Object.entries(displaySchedule[day]).map(
										([timeSlot, event]: [string, ScheduleEvent]) => (
											<div
												key={timeSlot}
												className="absolute w-[calc(100%-1.2rem)] left-2.5 group transition-all duration-200 hover:scale-105 hover:-translate-y-1 cursor-pointer"
												style={{
													top: `${
														getEventPosition(timeSlot) *
															(window.innerWidth >= 768 ? 12 : 9) +
														4.5
													}rem`,
													height: `${
														getEventDuration(timeSlot) *
														(window.innerWidth >= 768 ? 12 : 9)
													}rem`,
													zIndex: 10,
												}}
												onClick={() =>
													setSelectedEvent({ event, timeSlot, day })
												}
											>
												<div
													style={getEventStyle(event as ScheduleEvent)}
													className="group-hover:shadow-2xl group-hover:shadow-black/20"
												>
													{/* Event Type Badge */}
													<div className="flex items-center justify-between mb-2">
														<span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-black/20 backdrop-blur-sm">
															{getTypeIcon(event.type)}{" "}
															{getTypeLabel(event.type)}
														</span>
														{event.isCustom && (
															<svg
																className="w-4 h-4 opacity-75"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
															</svg>
														)}
													</div>

													{/* Subject Name */}
													<div className="font-semibold text-sm md:text-base mb-1 leading-tight">
														{event.subject_name}
													</div>

													{/* Time and Location */}
													<div className="space-y-1 text-xs md:text-sm opacity-90">
														<div className="flex items-center gap-2">
															<svg
																className="w-3 h-3 flex-shrink-0"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
																	clipRule="evenodd"
																/>
															</svg>
															<span className="font-medium">{timeSlot}</span>
														</div>
														<div className="flex items-center gap-2">
															<svg
																className="w-3 h-3 flex-shrink-0"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
																	clipRule="evenodd"
																/>
															</svg>
															<span>{event.location}</span>
														</div>
													</div>

													{/* Duration indicator */}
													<div className="mt-auto pt-1 text-xs opacity-75">
														Duration: {getEventDuration(timeSlot)}h
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
				className="relative max-w-md w-full mx-2 rounded-2xl shadow-2xl p-6 animate-fade-in"
				style={{
					background: colors.background,
					border: colors.border,
					boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
					backdropFilter: "blur(16px)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					className="absolute top-3 right-3 text-[#FFF0DC]/70 hover:text-[#FFF0DC] bg-black/20 rounded-full p-1 transition"
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
				{/* Event Type Badge */}
				<div className="flex items-center gap-2 mb-4">
					<span
						className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-black/20 backdrop-blur-sm"
						style={{ color: colors.accent }}
					>
						{getTypeIcon(event.type)} {getTypeLabel(event.type)}
					</span>
					{event.isCustom && (
						<svg
							className="w-4 h-4 opacity-75"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
					)}
				</div>
				{/* Subject Name */}
				<div className="font-bold text-lg md:text-xl mb-2 text-[#FFF0DC]">
					{event.subject_name}
				</div>
				{/* Details Grid */}
				<div className="grid grid-cols-1 gap-2 text-sm text-[#FFF0DC]/90">
					<div className="flex items-center gap-2">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-medium">Day:</span> <span>{day}</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-medium">Time:</span> <span>{timeSlot}</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-medium">Location:</span>{" "}
						<span>{event.location}</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="font-medium">Duration:</span>{" "}
						<span>{getEventDuration(timeSlot)}h</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TimelineView;
