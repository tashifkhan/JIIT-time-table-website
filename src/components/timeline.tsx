import React from "react";
import UserContext from "../context/userContext";

interface ScheduleEvent {
	subject_name: string;
	type: "L" | "P" | "T";
	location: string;
}

interface DailySchedule {
	[timeSlot: string]: ScheduleEvent;
}

interface WeeklySchedule {
	[day: string]: DailySchedule;
}

const TimelinePage: React.FC = () => {
	// const { schedule } = useUserContext();

	const { schedule } = React.useContext(UserContext);

	if (!schedule) {
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
	const hours = Array.from({ length: 9 }, (_, i) => i + 8); // 8:00 to 16:00

	const getEventColor = (type: string) => {
		switch (type) {
			case "L":
				return "rgba(240, 187, 120, 0.2)";
			case "P":
				return "rgba(84, 58, 20, 0.3)";
			case "T":
				return "rgba(255, 240, 220, 0.15)";
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
		<div className="min-h-screen bg-[#131010] text-[#FFF0DC] p-8">
			<div className="max-w-7xl mx-auto backdrop-blur-lg bg-[rgba(255,240,220,0.05)] rounded-xl p-6 shadow-xl">
				<h1 className="text-2xl font-bold mb-6 text-center">Your Schedule</h1>

				<div className="grid grid-cols-[60px_repeat(6,1fr)] gap-1">
					{/* Time column */}
					<div className="font-medium">
						<div className="h-12"></div> {/* Header spacer */}
						{hours.map((hour) => (
							<div key={hour} className="h-24 flex items-center justify-center">
								{`${hour}:00`}
							</div>
						))}
					</div>

					{/* Days columns */}
					{days.map((day) => (
						<div key={day} className="relative">
							<div className="h-12 flex items-center justify-center font-medium border-b border-[rgba(255,240,220,0.1)]">
								{day}
							</div>

							{/* Time grid background */}
							<div className="grid grid-rows-[repeat(8,6rem)]">
								{hours.map((hour) => (
									<div
										key={hour}
										className="border-b border-[rgba(255,240,220,0.05)]"
									></div>
								))}
							</div>

							{/* Events */}
							{schedule[day] &&
								Object.entries(schedule[day]).map(
									([timeSlot, event]: [string, ScheduleEvent]) => (
										<div
											key={timeSlot}
											className="absolute w-[calc(100%-0.5rem)] left-1"
											style={{
												top: `${getEventPosition(timeSlot) * 6 + 3}rem`,
												height: `${getEventDuration(timeSlot) * 6}rem`,
											}}
										>
											<div style={getEventStyle(event as ScheduleEvent)}>
												<div className="font-medium text-sm">
													{event.subject_name}
												</div>
												<div className="text-xs opacity-75">{timeSlot}</div>
												<div className="text-xs opacity-75">
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
	);
};

export default TimelinePage;
