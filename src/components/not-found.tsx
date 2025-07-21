import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, Clock, ArrowLeft, Search } from "lucide-react";

const NotFoundPage: React.FC = () => {
	return (
		<main className="relative min-h-screen flex items-center justify-center">
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 text-center space-y-8">
				{/* 404 Animation */}
				<motion.div
					className="space-y-6"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					{/* Large 404 Text */}
					<div className="relative">
						<motion.h1
							className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-[#F0BB78]/20 select-none"
							initial={{ y: 20 }}
							animate={{ y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							404
						</motion.h1>

						{/* Floating clock icon */}
						<motion.div
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
							animate={{
								rotate: [0, 10, -10, 0],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center backdrop-blur-sm">
								<Search className="w-8 h-8 sm:w-10 sm:h-10 text-[#F0BB78]" />
							</div>
						</motion.div>
					</div>
				</motion.div>

				{/* Main message */}
				<motion.div
					className="space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<h2 className="text-2xl sm:text-4xl font-bold text-[#F0BB78]">
						Page Not Found
					</h2>
					<p className="text-lg sm:text-xl text-slate-300/80 max-w-2xl">
						Oops! The page you're looking for seems to have wandered off like a
						student late for class.
					</p>
				</motion.div>

				{/* Error details */}
				<motion.div
					className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl p-6 space-y-4 max-w-md"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<div className="flex items-center justify-center mb-4">
						<div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
							<svg
								className="w-6 h-6 text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
					</div>
					<h3 className="text-lg font-semibold text-[#F0BB78]">
						What happened?
					</h3>
					<p className="text-slate-300/80 text-sm">
						The URL you entered might be incorrect, the page might have been
						moved, or you might not have permission to access it.
					</p>
				</motion.div>

				{/* Navigation options */}
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					{/* Home button */}
					<Link
						to="/"
						className="group relative overflow-hidden rounded-xl bg-[#F0BB78] hover:bg-[#e0a85c] text-white font-semibold px-6 py-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
					>
						<div className="relative z-10 flex items-center justify-center gap-3">
							<Home className="w-5 h-5" />
							<span>Go Home</span>
						</div>
						<div className="absolute inset-0 bg-gradient-to-r from-[#F0BB78] to-[#543A14] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</Link>

					{/* Timeline button */}
					<Link
						to="/timeline"
						className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 px-6 py-4 transition-all duration-300 hover:border-[#F0BB78]/30 text-center"
					>
						<div className="flex items-center justify-center gap-3">
							<Clock className="w-5 h-5 text-[#F0BB78]" />
							<span className="font-medium text-[#F0BB78] group-hover:text-white transition-colors">
								Timeline
							</span>
						</div>
					</Link>

					{/* Calendar button */}
					<Link
						to="/academic-calendar"
						className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 px-6 py-4 transition-all duration-300 hover:border-[#F0BB78]/30 text-center"
					>
						<div className="flex items-center justify-center gap-3">
							<Calendar className="w-5 h-5 text-[#F0BB78]" />
							<span className="font-medium text-[#F0BB78] group-hover:text-white transition-colors">
								Calendar
							</span>
						</div>
					</Link>
				</motion.div>

				{/* Back button */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1.0 }}
				>
					<button
						onClick={() => window.history.back()}
						className="group flex items-center gap-2 text-slate-400 hover:text-[#F0BB78] transition-colors text-sm"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Go back to previous page
					</button>
				</motion.div>

				{/* Fun fact */}
				<motion.div
					className="text-center space-y-2 mt-8 max-w-md"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 1.2 }}
				>
					<p className="text-xs text-slate-500">
						💡 Fun fact: 404 errors are named after room 404 at CERN, where the
						World Wide Web was born!
					</p>
				</motion.div>
			</div>
		</main>
	);
};

export default NotFoundPage;
