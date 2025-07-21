import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Plus } from "lucide-react";

const TimelineLanding: React.FC = () => {
	return (
		<main className="relative min-h-screen flex items-center justify-center">
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 text-center space-y-8">
				{/* Main heading */}
				<motion.div
					className="space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="flex items-center justify-center mb-6">
						<div className="w-20 h-20 rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center">
							<Clock className="w-10 h-10 text-[#F0BB78]" />
						</div>
					</div>
					<h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
						Timeline View
					</h1>
					<p className="text-lg sm:text-xl text-slate-300/80 max-w-2xl">
						View your schedule in a beautiful timeline format with current time
						tracking
					</p>
				</motion.div>

				{/* No schedule message */}
				<motion.div
					className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl p-8 space-y-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<div className="flex items-center justify-center mb-4">
						<div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
							<Calendar className="w-8 h-8 text-orange-400" />
						</div>
					</div>
					<h2 className="text-xl sm:text-2xl font-semibold text-[#F0BB78]">
						No Schedule Found
					</h2>
					<p className="text-slate-300/80 text-base sm:text-lg max-w-md">
						You need to create a timetable first to view it in timeline format.
					</p>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Link
						to="/"
						className="flex-1 group relative overflow-hidden rounded-xl bg-[#F0BB78] hover:bg-[#e0a85c] text-white font-semibold px-6 py-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
					>
						<div className="relative z-10 flex items-center justify-center gap-3">
							<Plus className="w-5 h-5" />
							<span>Create Timetable</span>
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</div>
						<div className="absolute inset-0 bg-gradient-to-r from-[#F0BB78] to-[#543A14] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</Link>
				</motion.div>

				{/* Navigation links */}
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<Link
						to="/academic-calendar"
						className="group bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 p-4 transition-all duration-300 hover:border-[#F0BB78]/30"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-[#F0BB78]/10 border-blue-500/30 flex items-center justify-center">
								<Calendar className="w-5 h-5 text-[#F0BB78]" />
							</div>
							<div className="text-left">
								<h3 className="font-medium text-[#F0BB78] group-hover:text-white transition-colors">
									Academic Calendar
								</h3>
								<p className="text-sm text-slate-400">View important dates</p>
							</div>
						</div>
					</Link>

					<Link
						to="/compare-timetables"
						className="group bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 p-4 transition-all duration-300 hover:border-[#F0BB78]/30"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-[#F0BB78]/10 border border-[#F0BB78]-500/30 flex items-center justify-center">
								<svg
									className="w-5 h-5 text-[#F0BB78]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<div className="text-left">
								<h3 className="font-medium text-[#F0BB78] group-hover:text-white transition-colors">
									Compare Timetables
								</h3>
								<p className="text-sm text-slate-400">Compare schedules</p>
							</div>
						</div>
					</Link>
				</motion.div>

				{/* Additional info */}
				<motion.div
					className="text-center space-y-2 mt-8"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					<p className="text-sm text-slate-400">
						Timeline view shows your daily schedule with:
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
						<span className="flex items-center gap-1">
							<div className="w-2 h-2 bg-[#F0BB78] rounded-full" />
							Current time indicator
						</span>
						<span className="flex items-center gap-1">
							<div className="w-2 h-2 bg-green-400 rounded-full" />
							Class locations
						</span>
						<span className="flex items-center gap-1">
							<div className="w-2 h-2 bg-blue-400 rounded-full" />
							Subject types
						</span>
					</div>
				</motion.div>
			</div>
		</main>
	);
};

export default TimelineLanding;
