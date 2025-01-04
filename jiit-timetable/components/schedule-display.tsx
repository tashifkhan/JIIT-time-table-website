"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { WeekSchedule, ClassType } from "../../src/types/schedule";
import { Clock, MapPin, User } from "lucide-react";
import { ActionButtons } from "./action-buttons";

interface ScheduleDisplayProps {
	schedule: WeekSchedule;
}

export function ScheduleDisplay({ schedule }: ScheduleDisplayProps) {
	const typeColors: Record<ClassType, string> = {
		L: "bg-[#F0BB78]/10 border-[#F0BB78]/20 hover:bg-[#F0BB78]/20",
		T: "bg-[#543A14]/10 border-[#543A14]/20 hover:bg-[#543A14]/20",
		P: "bg-[#FFF0DC]/10 border-[#FFF0DC]/20 hover:bg-[#FFF0DC]/20",
	};

	const typeLabels = {
		L: "Lecture",
		T: "Tutorial",
		P: "Practical",
	};

	return (
		<>
			<div
				id="schedule-display"
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1 sm:p-6 relative"
			>
				{Object.entries(schedule).map(([day, slots]) => (
					<motion.div
						key={day}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="backdrop-blur-lg bg-[#FFF0DC]/10 dark:bg-[#131010]/50 rounded-xl border border-[#F0BB78]/20 shadow-xl"
					>
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
								{day}
							</h3>
							<div className="space-y-4">
								{Object.entries(slots).map(([time, class_]) => (
									<Card
										key={time}
										className={`${
											typeColors[class_.type as ClassType]
										} backdrop-blur-sm border p-4 transition-all duration-300`}
									>
										<h4 className="font-medium mb-2">{class_.subject_name}</h4>
										<div className="space-y-2 text-sm opacity-80">
											<div className="flex items-center gap-2">
												<Clock className="w-4 h-4" />
												<span>{time}</span>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="w-4 h-4" />
												<span>{class_.location}</span>
											</div>
											<div className="flex items-center gap-2">
												<User className="w-4 h-4" />
												<span>{typeLabels[class_.type as ClassType]}</span>
											</div>
										</div>
									</Card>
								))}
							</div>
						</div>
					</motion.div>
				))}
			</div>
			<ActionButtons schedule={schedule} />
		</>
	);
}
