import React from "react";
import UserContext from "../context/userContext";

interface ScheduleEvent {
	subject_name: string;
	type: "L" | "P" | "T" | "C";
	location: string;
}

const TimelinePage: React.FC = () => {
	const { editedSchedule, schedule, setSchedule } =
		React.useContext(UserContext);
	const displaySchedule = editedSchedule || schedule;

	// Load cached schedule from localStorage if not present in context
	React.useEffect(() => {
		if (!schedule && !editedSchedule) {
			const cached = localStorage.getItem("cachedSchedule");
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					if (parsed && typeof parsed === "object") {
						setSchedule(parsed);
					}
				} catch {}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!displaySchedule) {
		return (
			<div className="min-h-screen bg-[#131010] text-[#FFF0DC] p-8 flex items-center justify-center">
				<p>No schedule data available</p>
			</div>
		);
	}

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
				return "rgba(240, 187, 120, 0.2)";
			case "P":
				return "rgba(84, 58, 20, 0.3)";
			case "T":
				return "rgba(255, 240, 220, 0.15)";
			case "C":
				return "rgba(255, 155, 80, 0.2)";
			default:
				return "transparent";
		}
	};

	const getEventStyle = (event: ScheduleEvent) => {
		return {
			backgroundColor: getEventColor(event.type),
			backdropFilter: "blur(10px)",
			border: "1px solid rgba(255, 240, 220, 0.1)",
			borderRadius: "8px",
			padding: "0.5rem",
			height: "100%",
			display: "flex",
			flexDirection: "column" as const,
			gap: "0.25rem",
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

	return (
		<div
			className="min-h-[50%] bg-[#131010] text-[#FFF0DC] p-4 md:p-8 overflow-scroll"
			style={{ minWidth: "1600px" }}
		>
			<div
				id="schedule-display"
				className="max-w-8xl mx-auto backdrop-blur-lg bg-[rgba(255,240,220,0.05)] rounded-xl p-4 md:p-6 shadow-xl overflow-x-auto"
				style={{ minWidth: "1500px" }}
			>
				<h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
					Your Schedule
				</h1>

				<div className="min-w-[800px]">
					<div className="grid grid-cols-[60px_repeat(6,1fr)] gap-1">
						{/* Time column */}
						<div className="font-medium">
							<div className="h-12"></div> {/* Header spacer */}
							{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
								<div
									key={hour}
									className="h-20 md:h-28 flex items-center justify-center text-sm md:text-base"
									style={{ transform: "translateY(-50%)" }}
								>
									{`${hour}:00`}
								</div>
							))}
						</div>

						{/* Days columns */}
						{days.map((day) => (
							<div key={day} className="relative">
								<div className="h-12 flex items-center justify-center font-medium border-b border-[rgba(255,240,220,0.1)] text-sm md:text-base">
									{day}
								</div>

								{/* Time grid background */}
								<div className="grid grid-rows-[repeat(10,5rem)] md:grid-rows-[repeat(10,7rem)]">
									{Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
										<div
											key={hour}
											className="border-b border-[rgba(255,240,220,0.05)]"
										></div>
									))}
								</div>

								{/* Events */}
								{displaySchedule[day] &&
									Object.entries(displaySchedule[day]).map(
										([timeSlot, event]: [string, ScheduleEvent]) => (
											<div
												key={timeSlot}
												className="absolute w-[calc(100%-0.5rem)] left-1"
												style={{
													top: `${
														getEventPosition(timeSlot) *
															(window.innerWidth >= 768 ? 7 : 5) +
														3
													}rem`,
													height: `${
														getEventDuration(timeSlot) *
														(window.innerWidth >= 768 ? 7 : 5)
													}rem`,
												}}
											>
												<div style={getEventStyle(event as ScheduleEvent)}>
													<div className="font-medium text-xs md:text-sm">
														{event.subject_name}
														{event.type === "C" && " (Custom)"}
													</div>
													<div className="text-[10px] md:text-xs opacity-75">
														{timeSlot}
													</div>
													<div className="text-[10px] md:text-xs opacity-75">
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
	);
};

export default TimelinePage;
