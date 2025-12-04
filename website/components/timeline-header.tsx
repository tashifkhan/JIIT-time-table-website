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
		<div className="sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-[#F0BB78]/10 bg-[#23201c]/80 backdrop-blur-md gap-4 md:gap-0 transition-all duration-300">
			<div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
				<h1 className="text-xl md:text-2xl font-light text-[#FFF0DC] flex items-center gap-3 tracking-tight">
					<span className="font-bold text-[#F0BB78]">JIIT</span>
					<span className="opacity-60 text-sm md:text-xl uppercase tracking-widest">
						Calendar
					</span>
				</h1>
				<button
					onClick={onToday}
					className="px-5 py-2 text-sm font-semibold text-[#23201c] bg-gradient-to-r from-[#F0BB78] to-[#D4A366] rounded-full shadow-lg shadow-[#F0BB78]/20 hover:shadow-[#F0BB78]/40 hover:scale-105 transition-all duration-200 md:ml-8 active:scale-95"
				>
					Today
				</button>
			</div>

			<div className="flex items-center gap-4 md:gap-6">
				<div className="flex items-center gap-2 bg-[#FFF0DC]/5 rounded-full p-1 border border-[#FFF0DC]/5">
					<button
						onClick={() => onNavigate("prev")}
						className="p-2 text-[#FFF0DC]/70 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition-all duration-200 active:scale-90"
						aria-label="Previous"
					>
						<svg
							className="w-5 h-5"
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
						className="p-2 text-[#FFF0DC]/70 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition-all duration-200 active:scale-90"
						aria-label="Next"
					>
						<svg
							className="w-5 h-5"
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
				<h2 className="text-lg md:text-xl font-medium text-[#FFF0DC] min-w-[160px] text-center tracking-wide">
					{monthYear}
				</h2>
			</div>

			<div className="flex items-center gap-2 w-full md:w-auto justify-end">
				<div className="relative inline-flex bg-[#000]/20 backdrop-blur-sm rounded-lg p-1 border border-[#FFF0DC]/5">
					<button
						onClick={() => onViewChange("day")}
						className={`px-6 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
							view === "day"
								? "bg-[#F0BB78] text-[#23201c] shadow-md"
								: "text-[#FFF0DC]/60 hover:text-[#FFF0DC] hover:bg-[#FFF0DC]/5"
						}`}
					>
						Day
					</button>
					<button
						onClick={() => onViewChange("week")}
						className={`px-6 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
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
