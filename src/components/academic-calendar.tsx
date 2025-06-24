import { Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { addAcademicCalendarEvents } from "../utils/calendar-AC";
import { useState, useEffect, useRef } from "react";

export function AcademicCalendar() {
	const [isLoading, setIsLoading] = useState(false);
	const [calendarData, setCalendarData] = useState<any[]>([]);
	const [isDataLoading, setIsDataLoading] = useState(true);
	const eventRefs = useRef<HTMLDivElement[]>([]);

	useEffect(() => {
		document.title = "JIIT Academic Calender Simplified";
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		// Fetch calendar data from public/data
		setIsDataLoading(true);
		fetch("/data/calendar.json")
			.then((res) => res.json())
			.then((data) => setCalendarData(data))
			.finally(() => setIsDataLoading(false));

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const sortedEvents = [...calendarData].sort(
		(a, b) =>
			new Date(a.start.date).getTime() - new Date(b.start.date).getTime()
	);

	useEffect(() => {
		const today = new Date();
		let targetIndex = -1;
		try {
			targetIndex =
				sortedEvents.findIndex((event) => {
					const eventDate = new Date(event.start.date);
					return eventDate >= today;
				}) - 1;
		} catch (e) {
			targetIndex = sortedEvents.findIndex((event) => {
				const eventDate = new Date(event.start.date);
				return eventDate >= today;
			});
		}
		if (targetIndex >= 0 && eventRefs.current[targetIndex]) {
			eventRefs.current[targetIndex].scrollIntoView({ behavior: "smooth" });
		}
	}, [sortedEvents]);

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

	if (isDataLoading) {
		return (
			<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-2 sm:p-8 flex items-center justify-center">
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

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-2 sm:p-8">
			<div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
				<motion.div
					className="text-center space-y-3"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
						<Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#F0BB78]" />
						<h1 className="text-xl sm:text-4xl font-bold text-[#F0BB78] text-center">
							Academic Calendar 2024-25
						</h1>
					</div>
				</motion.div>

				<motion.div
					className="relative"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<div className="absolute left-4 sm:left-1/2 h-full w-px bg-[#F0BB78]/30" />

					{sortedEvents.map((event, index) => {
						const startDate = new Date(event.start.date);
						const endDate = new Date(event.end.date);
						const isEven = index % 2 === 0;
						const hasEndDate = event.start.date !== event.end.date;
						const isHoliday = event.summary.startsWith("Holiday -");

						const formatDate = (date: Date) => {
							return date.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							});
						};

						return (
							<motion.div
								ref={(el) => {
									if (el) eventRefs.current[index] = el;
								}}
								key={index}
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
											<h3 className="text-base sm:text-lg font-semibold text-[#F0BB78] order-2 sm:order-none">
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
										<time className="text-lg sm:text-xl font-bold text-white block">
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
						);
					})}
				</motion.div>
			</div>
			<motion.button
				onClick={() => (window.location.href = "/")}
				className="fixed bottom-16 left-4 px-4 sm:px-6 py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 
        text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg
        flex items-center gap-2 text-sm sm:text-base"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
				Create your Timetable
			</motion.button>
			<motion.button
				onClick={handleAddToCalendar}
				disabled={isLoading}
				className="fixed bottom-4 left-4 px-4 sm:px-6 py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 
        text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg
        flex items-center gap-2 text-sm sm:text-base"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
				<span>{isLoading ? "Adding to Calendar..." : "Add to Calendar"}</span>
			</motion.button>
		</main>
	);
}
