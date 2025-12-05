import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { ClassType } from "../../types/schedule";
import { Clock, MapPin, User, Edit2, Plus } from "lucide-react";
import { ActionButtons } from "../timeline/action-buttons";
import { EditEventDialog } from "../timeline/edit-event-dialog";
import UserContext from "../../context/userContext";
import { Button } from "../ui/button";
import { YourTietable } from "../../types";

interface ScheduleDisplayProps {
	schedule: YourTietable;
}

export function ScheduleDisplay({ schedule }: ScheduleDisplayProps) {
	const { editedSchedule } = useContext(UserContext);
	// Also get schedule from context for passing to EditEventDialog
	const userContext = useContext(UserContext);
	const [editingEvent, setEditingEvent] = useState<{
		day: string;
		time: string;
		event?: any;
	} | null>(null);

	const typeColors: Record<ClassType | "C", string> = {
		L: "bg-[#F0BB78]/10 border-[#F0BB78]/20 hover:bg-[#F0BB78]/20",
		T: "bg-[#543A14]/10 border-[#543A14]/20 hover:bg-[#543A14]/20",
		P: "bg-[#FFF0DC]/10 border-[#FFF0DC]/20 hover:bg-[#FFF0DC]/20",
		C: "bg-[#FF9B50]/10 border-[#FF9B50]/20 hover:bg-[#FF9B50]/20",
	};

	const typeLabels = {
		L: "Lecture",
		T: "Tutorial",
		P: "Practical",
		C: "Custom",
	};

	const displaySchedule = editedSchedule || schedule;

	const formatTime = (time: string) => {
		return time.replace("-", " - "); // Just add spaces around the hyphen for readability
	};

	return (
		<>
			<div
				id="schedule-display"
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1 sm:p-6 relative"
			>
				{displaySchedule &&
					typeof displaySchedule === "object" &&
					Object.entries(displaySchedule).map(([day, slots]) => (
						<motion.div
							key={day}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="backdrop-blur-lg bg-[#131010]/50 rounded-xl border border-[#F0BB78]/20 shadow-xl"
						>
							<div className="p-6">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-xl font-semibold text-slate-100">
										{day}
									</h3>
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											setEditingEvent({ day, time: "", event: null })
										}
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
								<div className="space-y-4">
									{slots &&
										typeof slots === "object" &&
										Object.entries(slots)
											.sort(([timeA], [timeB]) =>
												(timeA || "").localeCompare(timeB || "")
											)
											.map(([time, class_]) => {
												if (!class_ || typeof class_ !== "object") return null;
												return (
													<Card
														key={time}
														className={`${
															typeColors[class_.type]
														} backdrop-blur-sm border p-4 relative group cursor-pointer`}
														onClick={() =>
															setEditingEvent({ day, time, event: class_ })
														}
													>
														<Button
															variant="ghost"
															size="sm"
															className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
															onClick={(e) => {
																e.stopPropagation();
																setEditingEvent({ day, time, event: class_ });
															}}
														>
															<Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-100" />
														</Button>
														<h4 className="font-medium mb-2">
															{class_.subject_name}
														</h4>
														<div className="space-y-2 text-sm opacity-80">
															<div className="flex items-center gap-2">
																<Clock className="w-4 h-4" />
																<span>
																	{typeof time === "string"
																		? formatTime(time)
																		: ""}
																</span>
															</div>
															<div className="flex items-center gap-2">
																<MapPin className="w-4 h-4" />
																<span>{class_.location}</span>
															</div>
															<div className="flex items-center gap-2">
																<User className="w-4 h-4" />
																<span>
																	{typeLabels[class_.type as ClassType]}
																</span>
															</div>
														</div>
													</Card>
												);
											})}
								</div>
							</div>
						</motion.div>
					))}
			</div>
			{editingEvent && (
				<EditEventDialog
					isOpen={true}
					onClose={() => setEditingEvent(null)}
					day={editingEvent.day}
					time={editingEvent.time}
					currentEvent={editingEvent.event}
					schedule={userContext.schedule}
				/>
			)}
			<ActionButtons schedule={displaySchedule} />
		</>
	);
}
