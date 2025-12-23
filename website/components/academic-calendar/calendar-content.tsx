"use client";
import { Calendar, Plus, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import { addAcademicCalendarEvents, downloadICalFile } from "../../utils/calendar-AC";
import { useState, useEffect, useRef } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

export default function CalendarContent() {
	const [isLoading, setIsLoading] = useState(false);
	const [calendarData, setCalendarData] = useState<any[]>([]);
	const [isDataLoading, setIsDataLoading] = useState(true);
	const [selectedYear, setSelectedYear] = useState("");
	const [visibleEventsCount, setVisibleEventsCount] = useState(0);
	const [showHolidaysOnly, setShowHolidaysOnly] = useState(false);
	const [availableYears, setAvailableYears] = useState<
		{ value: string; label: string }[]
	>([]);
	const eventRefs = useRef<HTMLDivElement[]>([]);
	const upcomingDividerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		document.title = "JIIT Academic Calender Simplified";
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		fetch("/api/academic-calendar")
			.then((res) => res.json())
			.then((years) => {
				setAvailableYears(years);
				if (years.length > 0) {
					setSelectedYear(years[0].value);
				} else {
					setIsDataLoading(false);
				}
			})
			.catch((error) => {
				console.error("Failed to fetch available years:", error);
				setIsDataLoading(false);
			});

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		if (!selectedYear) return;

		setIsDataLoading(true);

		fetch(`/api/academic-calendar/${selectedYear}`)
			.then((res) => res.json())
			.then((data) => setCalendarData(data))
			.catch((error) => {
				console.error("Failed to fetch calendar data:", error);
				setCalendarData([]);
			})
			.finally(() => setIsDataLoading(false));
	}, [selectedYear]);

	const sortedEvents = [...calendarData].sort(
		(a, b) =>
			new Date(a.start.date).getTime() - new Date(b.start.date).getTime()
	);

	// Filter events based on holiday filter
	const filteredEvents = showHolidaysOnly
		? sortedEvents.filter((event) => event.summary.startsWith("Holiday -"))
		: sortedEvents;

	// separate upcoming and past events
	const today = new Date();
	const upcomingEvents = filteredEvents.filter((event) => {
		const eventDate = new Date(event.start.date);
		return eventDate >= today;
	});

	const pastEvents = filteredEvents
		.filter((event) => {
			const eventDate = new Date(event.start.date);
			return eventDate < today;
		})
		.reverse(); // Show most recent past events first

	const eventsToShow = [
		...pastEvents.slice(0, visibleEventsCount).reverse(),
		...upcomingEvents,
	];

	useEffect(() => {
		if (eventsToShow.length === 0) return;

		let targetIndex = -1;
		try {
			targetIndex =
				eventsToShow.findIndex((event) => {
					const eventDate = new Date(event.start.date);
					return eventDate >= today;
				}) - 1;
		} catch (e) {
			targetIndex = eventsToShow.findIndex((event) => {
				const eventDate = new Date(event.start.date);
				return eventDate >= today;
			});
		}
		if (targetIndex >= 0 && eventRefs.current[targetIndex]) {
			eventRefs.current[targetIndex].scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedYear, calendarData]); // Added calendarData dependency to ensure scroll happens after data load

	const handleAddToCalendar = async () => {
		setIsLoading(true);
		try {
			console.log("Starting calendar event addition...");
			const result = await addAcademicCalendarEvents(calendarData);
			console.log("Calendar operation result:", result);

			if (result.success) {
				alert(result.message);
			} else {
				throw new Error(result.error || "Failed to add events to calendar");
			}
		} catch (error) {
			console.error("Calendar error:", error);
			alert(
				error instanceof Error
					? error.message
					: "Failed to add events to calendar"
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isDataLoading && availableYears.length === 0) {
		return (
			<main>
				<div className="bg-white/10 border border-[#F0BB78]/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
					<div className="mb-6 flex flex-row items-end gap-2 h-10">
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F0BB78]"
								initial={{ y: 0 }}
								animate={{ y: [0, -18, 0] }}
								transition={{
									repeat: Infinity,
									duration: 0.9,
									ease: "easeInOut",
									delay: i * 0.15,
								}}
							/>
						))}
					</div>
					<p className="text-lg font-semibold text-[#F0BB78] mb-1">
						Loading Academic Calendar...
					</p>
					<p className="text-slate-200/80 text-sm">
						This may take a few seconds
					</p>
				</div>
			</main>
		);
	}

	if (!isDataLoading && availableYears.length === 0) {
		return (
			<main>
				<div className="bg-white/10 border border-[#F0BB78]/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
					<Calendar className="w-12 h-12 text-[#F0BB78] mb-4" />
					<p className="text-lg font-semibold text-[#F0BB78] mb-2">
						No Academic Calendar Data Found
					</p>
					<p className="text-slate-200/80 text-sm">
						Please ensure the calendar data is available in
						public/data/calender.
					</p>
				</div>
			</main>
		);
	}

	return (
		<main>
			<div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
				<motion.div
					className="text-center space-y-3"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
						<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							JIIT Academic Calendar
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4 pb-2">
						Stay updated with the latest academic events and holidays at JIIT.
					</p>

					{/* Year Selector */}
					<div className="flex justify-center mt-4">
						<Select
							value={selectedYear}
							onValueChange={(value) => {
								setSelectedYear(value);
								setVisibleEventsCount(0);
							}}
						>
							<SelectTrigger className="w-[180px] bg-white/10 border-[#F0BB78]/30 text-[#F0BB78] font-semibold backdrop-blur-md focus:ring-[#F0BB78]/50">
								<SelectValue placeholder="Select Year" />
							</SelectTrigger>
							<SelectContent className="bg-[#131010] border-[#F0BB78]/30 text-[#F0BB78]">
								{availableYears.map((year) => (
									<SelectItem
										key={year.value}
										value={year.value}
										className="focus:bg-[#F0BB78]/20 focus:text-[#F0BB78] cursor-pointer"
									>
										{year.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Action Buttons - Compact row on mobile, Fixed column on desktop */}
					<div className="flex flex-row flex-wrap justify-center gap-2 mt-4 mb-4 md:fixed md:bottom-8 md:left-8 md:flex-col md:items-start md:m-0 md:z-50 md:gap-3">
						<motion.button
							onClick={() => {
								setShowHolidaysOnly(!showHolidaysOnly);
								setVisibleEventsCount(0);
							}}
							className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg backdrop-blur-lg border transition-all duration-300 shadow-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base ${
								showHolidaysOnly
									? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
									: "bg-white/10 border-white/20 text-[#F0BB78] hover:bg-white/20"
							}`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Filter className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
							<span className="hidden sm:inline">{showHolidaysOnly ? "All Events" : "Holidays Only"}</span>
							<span className="sm:hidden">{showHolidaysOnly ? "All" : "Holidays"}</span>
						</motion.button>

						<motion.button
							onClick={handleAddToCalendar}
							disabled={isLoading}
							className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
							<span className="hidden sm:inline">
								{isLoading ? "Adding..." : "Add to Google Calendar"}
							</span>
							<span className="sm:hidden">
								{isLoading ? "Adding..." : "Google"}
							</span>
						</motion.button>

						<motion.button
							onClick={() => {
								downloadICalFile(calendarData, `jiit-academic-calendar-${selectedYear}.ics`);
							}}
							disabled={calendarData.length === 0}
							className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Download className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
							<span className="hidden sm:inline">Download iCal File</span>
							<span className="sm:hidden">iCal</span>
						</motion.button>
					</div>
				</motion.div>

				<motion.div
					className="relative"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					{/* Load Previous Events Button at the top */}
					{pastEvents.length > visibleEventsCount && (
						<motion.div
							className="flex justify-center mb-8"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<button
								onClick={() => {
									setVisibleEventsCount(pastEvents.length);
									setTimeout(() => {
										if (upcomingDividerRef.current) {
											const rect =
												upcomingDividerRef.current.getBoundingClientRect();
											const scrollTop = window.scrollY + rect.top - 80; // 80px offset for header
											window.scrollTo({ top: scrollTop, behavior: "smooth" });
										}
									}, 200);
								}}
								className="px-6 py-3 bg-white/10 border border-[#F0BB78]/30 rounded-lg text-[#F0BB78] font-semibold backdrop-blur-md hover:bg-white/20 hover:border-[#F0BB78]/50 transition-all duration-300 flex items-center gap-2"
							>
								<Plus className="w-4 h-4" />
								Load All Previous Events (
								{pastEvents.length - visibleEventsCount} remaining)
							</button>
						</motion.div>
					)}

					{/* Show message when no events match the filter */}
					{eventsToShow.length === 0 && !isDataLoading && (
						<motion.div
							className="text-center py-12"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						>
							<p className="text-slate-300/80 text-lg">
								{showHolidaysOnly
									? "No holidays found for the selected year."
									: "No events found for the selected year."}
							</p>
						</motion.div>
					)}

					<div className="absolute left-4 sm:left-1/2 h-full w-px bg-[#F0BB78]/30" />

					{eventsToShow.map((event, index) => {
						const startDate = new Date(event.start.date);
						const endDate = new Date(event.end.date);
						const isEven = index % 2 === 0;
						const hasEndDate = event.start.date !== event.end.date;
						const isHoliday = event.summary.startsWith("Holiday -");
						const isPastEvent = startDate < today;

						// Check if this is the first upcoming event after past events
						const isFirstUpcoming =
							index > 0 &&
							isPastEvent === false &&
							eventsToShow[index - 1] &&
							new Date(eventsToShow[index - 1].start.date) < today;

						const formatDate = (date: Date) => {
							return date.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							});
						};

						return (
							<div key={index}>
								{/* Show "Upcoming Events" divider */}
								{isFirstUpcoming && (
									<motion.div
										ref={upcomingDividerRef}
										className="flex items-center justify-center mb-8"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
									>
										<div className="flex-1 h-px bg-[#F0BB78]/30"></div>
										<span className="px-4 py-2 bg-[#F0BB78]/10 text-[#F0BB78] text-sm font-semibold rounded-full border border-[#F0BB78]/20">
											Upcoming Events
										</span>
										<div className="flex-1 h-px bg-[#F0BB78]/30"></div>
									</motion.div>
								)}

								<motion.div
									ref={(el) => {
										if (el) eventRefs.current[index] = el;
									}}
									className={`relative flex flex-row items-start gap-4 sm:gap-8 mb-8 sm:mb-12 pl-8 sm:pl-0
	                                    ${
																				isEven
																					? "sm:flex-row"
																					: "sm:flex-row-reverse"
																			}`}
									initial={{ opacity: 0, x: 0, y: 20 }}
									animate={{ opacity: 1, x: 0, y: 0 }}
									transition={{ delay: index * 0.01, duration: 0.15 }}
								>
									<div
										className={`w-full sm:w-1/2 ${
											isEven ? "sm:text-right" : "sm:text-left"
										}`}
									>
										<div
											className={`backdrop-blur-md rounded-2xl p-4 sm:p-6 border shadow-2xl transition-all duration-300 
	                                        ${
																						isHoliday
																							? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
																							: isPastEvent
																							? "bg-white/5 border-white/10 hover:bg-white/10 opacity-75"
																							: "bg-white/5 border-white/10 hover:bg-white/10"
																					}`}
										>
											<div
												className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3
	                                            ${
																								isEven
																									? "sm:justify-end"
																									: "sm:justify-start"
																							}`}
											>
												<h3
													className={`text-base sm:text-lg font-semibold order-2 sm:order-none ${
														isPastEvent ? "text-[#F0BB78]/70" : "text-[#F0BB78]"
													}`}
												>
													{isHoliday
														? event.summary.replace("Holiday -", "").trim()
														: event.summary}
												</h3>
												{isHoliday && (
													<span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full order-1 sm:order-none">
														Holiday
													</span>
												)}
											</div>
											<time
												className={`text-lg sm:text-xl font-bold block ${
													isPastEvent ? "text-white/70" : "text-white"
												}`}
											>
												{formatDate(startDate)}
												{hasEndDate && (
													<>
														<span className="mx-2">→</span>
														{formatDate(endDate)}
													</>
												)}
											</time>
											<p className="text-xs sm:text-sm text-slate-300/60 mt-1">
												{startDate.getFullYear()}
											</p>
										</div>
									</div>

									<div
										className={`absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-4 border-[#131010] 
	                                    ${
																				isHoliday
																					? "bg-orange-500"
																					: "bg-[#F0BB78]"
																			}`}
									/>
								</motion.div>
							</div>
						);
					})}
				</motion.div>
			</div>
			{/* Floating Holiday Filter Button */}
		</main>
	);
}
