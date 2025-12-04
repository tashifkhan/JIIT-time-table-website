import React from "react";

interface TimelineHeaderProps {
	currentDate: Date;
	view: "day" | "week";
	onViewChange: (view: "day" | "week") => void;
	onNavigate: (direction: "prev" | "next") => void;
	onToday: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
	currentDate,
	view,
	onViewChange,
	onNavigate,
	onToday,
}) => {
	const monthYear = currentDate.toLocaleString("default", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#F0BB78]/10 bg-[#23201c]/80 backdrop-blur-md gap-3 md:gap-0 transition-all duration-300">
			{/* Top Row on Mobile: Logo and Today Button */}
			<div className="flex items-center justify-between w-full md:w-auto gap-6">
				<h1 className="text-lg md:text-2xl font-light text-[#FFF0DC] flex items-center gap-2 md:gap-3 tracking-tight">
					<span className="font-bold text-[#F0BB78]">JIIT</span>
					<span className="opacity-60 text-xs md:text-xl uppercase tracking-widest">
						Calendar
					</span>
				</h1>
				<button
					onClick={onToday}
					className="px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold text-[#23201c] bg-gradient-to-r from-[#F0BB78] to-[#D4A366] rounded-full shadow-lg shadow-[#F0BB78]/20 hover:shadow-[#F0BB78]/40 hover:scale-105 transition-all duration-200 md:ml-8 active:scale-95"
				>
					Today
				</button>
			</div>

			{/* Middle Row on Mobile: Navigation and Date */}
			<div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 bg-[#FFF0DC]/5 md:bg-transparent rounded-lg p-2 md:p-0">
				<div className="flex items-center gap-1 md:bg-[#FFF0DC]/5 md:rounded-full md:p-1 md:border md:border-[#FFF0DC]/5">
					<button
						onClick={() => onNavigate("prev")}
						className="p-1.5 md:p-2 text-[#FFF0DC]/70 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition-all duration-200 active:scale-90"
						aria-label="Previous"
					>
						<svg
							className="w-4 h-4 md:w-5 md:h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						onClick={() => onNavigate("next")}
						className="p-1.5 md:p-2 text-[#FFF0DC]/70 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition-all duration-200 active:scale-90"
						aria-label="Next"
					>
						<svg
							className="w-4 h-4 md:w-5 md:h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
				<h2 className="text-base md:text-xl font-medium text-[#FFF0DC] flex-1 text-center tracking-wide">
					{monthYear}
				</h2>
			</div>

			{/* Bottom Row on Mobile: View Switcher */}
			<div className="flex items-center gap-2 w-full md:w-auto justify-end">
				<div className="relative flex w-full md:w-auto bg-[#000]/20 backdrop-blur-sm rounded-lg p-1 border border-[#FFF0DC]/5">
					<button
						onClick={() => onViewChange("day")}
						className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
							view === "day"
								? "bg-[#F0BB78] text-[#23201c] shadow-md"
								: "text-[#FFF0DC]/60 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/5"
						}`}
					>
						Day
					</button>
					<button
						onClick={() => onViewChange("week")}
						className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
							view === "week"
								? "bg-[#F0BB78] text-[#23201c] shadow-md"
								: "text-[#FFF0DC]/60 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/5"
						}`}
					>
						Week
					</button>
				</div>
			</div>
		</div>
	);
};
