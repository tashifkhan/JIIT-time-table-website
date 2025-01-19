import { Calendar } from "lucide-react";
import calendarData from "../data/calendar.json";
import { motion } from "framer-motion";
// import { createGoogleCalendarEvents } from "../utils/calendar";

export function AcademicCalendar() {
	const sortedEvents = [...calendarData].sort(
		(a, b) =>
			new Date(a.start.date).getTime() - new Date(b.start.date).getTime()
	);

	const handleAddToCalendar = async () => {
		try {
			// const events = await createGoogleCalendarEvents(calendarData);
			// Google Calendar implementation will be handled here
			console.log("Adding events to calendar:");
		} catch (error) {
			console.error("Error adding events to calendar:", error);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-4 sm:p-8">
			<div className="max-w-5xl mx-auto space-y-12">
				<motion.div
					className="text-center space-y-3 sm:space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
						<Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#F0BB78]" />
						<h1 className="text-2xl sm:text-4xl font-bold text-[#F0BB78] bg-clip-text bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							Academic Calendar 2024-25
						</h1>
					</div>
					<div className="flex justify-center">
						<motion.button
							onClick={handleAddToCalendar}
							className="mt-4 px-6 py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 
                                text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg
                                flex items-center gap-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Calendar className="w-5 h-5" />
							<span>Add All Events to Google Calendar</span>
						</motion.button>
					</div>
				</motion.div>

				<motion.div
					className="relative"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<div className="absolute left-1/2 h-full w-px bg-[#F0BB78]/30" />

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
								key={index}
								className={`relative flex items-center gap-8 mb-12 ${
									isEven ? "flex-row" : "flex-row-reverse"
								}`}
								initial={{ opacity: 0, x: isEven ? -50 : 50 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<div className={`w-1/2 ${isEven ? "text-right" : "text-left"}`}>
									<div
										className={`backdrop-blur-md rounded-2xl p-6 border shadow-2xl transition-all duration-300 
										${
											isHoliday
												? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
												: "bg-white/5 border-white/10 hover:bg-white/10"
										}`}
									>
										<div
											className={`flex items-center gap-2 mb-3 ${
												isEven ? "justify-end" : "justify-start"
											}`}
										>
											{isHoliday && (
												<span
													className={`px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full ${
														isEven ? "" : "hidden"
													}`}
												>
													Holiday
												</span>
											)}
											<h3 className="text-lg font-semibold text-[#F0BB78]">
												{isHoliday
													? event.summary.replace("Holiday -", "").trim()
													: event.summary}
											</h3>
											{isHoliday && (
												<span
													className={`px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full ${
														isEven ? "hidden" : ""
													}`}
												>
													Holiday
												</span>
											)}
										</div>
										<time className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-[#FFF]">
											{formatDate(startDate)}
											{hasEndDate && (
												<>
													<span className="mx-2 text-[#FFF]">→</span>
													{formatDate(endDate)}
												</>
											)}
										</time>
										<p className="text-sm text-slate-300/60 mt-1">
											{startDate.getFullYear()}
										</p>
									</div>
								</div>

								<div
									className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-[#131010] 
									${isHoliday ? "bg-orange-500" : "bg-[#F0BB78]"}`}
								/>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</main>
	);
}
