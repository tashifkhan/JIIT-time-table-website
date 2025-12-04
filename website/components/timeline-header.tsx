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
		<div className="flex flex-col md:flex-row items-center justify-between px-4 py-4 border-b border-[#F0BB78]/20 bg-[#23201c] gap-4 md:gap-0">
			<div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
				<h1 className="text-xl md:text-2xl font-normal text-[#FFF0DC] flex items-center gap-2">
					<span className="font-bold text-[#F0BB78]">JIIT</span>
					<span className="opacity-70">Calendar</span>
				</h1>
				<button
					onClick={onToday}
					className="px-4 py-2 text-sm font-medium text-[#23201c] bg-[#F0BB78] rounded hover:bg-[#F0BB78]/90 transition md:ml-8"
				>
					Today
				</button>
			</div>

			<div className="flex items-center gap-2 md:gap-4">
				<div className="flex items-center gap-1">
					<button
						onClick={() => onNavigate("prev")}
						className="p-2 text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition"
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
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						onClick={() => onNavigate("next")}
						className="p-2 text-[#FFF0DC] hover:bg-[#FFF0DC]/10 rounded-full transition"
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
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
				<h2 className="text-lg md:text-xl font-medium text-[#FFF0DC] min-w-[150px] text-center">
					{monthYear}
				</h2>
			</div>

			<div className="flex items-center gap-2 w-full md:w-auto justify-end">
				<div className="relative inline-flex bg-[#FFF0DC]/10 rounded-lg p-1">
					<button
						onClick={() => onViewChange("day")}
						className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
							view === "day"
								? "bg-[#F0BB78] text-[#23201c] shadow-sm"
								: "text-[#FFF0DC]/70 hover:text-[#FFF0DC]"
						}`}
					>
						Day
					</button>
					<button
						onClick={() => onViewChange("week")}
						className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
							view === "week"
								? "bg-[#F0BB78] text-[#23201c] shadow-sm"
								: "text-[#FFF0DC]/70 hover:text-[#FFF0DC]"
						}`}
					>
						Week
					</button>
				</div>
			</div>
		</div>
	);
};
