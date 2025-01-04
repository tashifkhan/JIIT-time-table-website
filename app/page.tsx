"use client";

import { useState } from "react";
import { ScheduleForm } from "@/components/schedule-form";
import { ScheduleDisplay } from "@/components/schedule-display";
import { motion } from "framer-motion";
import subjects from "@/data/subjects.json";
import { Calendar } from "lucide-react";

export default function Home() {
	const [schedule, setSchedule] = useState<{
		[day: string]: {
			[time: string]: {
				subject_name: string;
				type: "L" | "T" | "P";
				location: string;
			};
		};
	} | null>(null);

	const handleFormSubmit = async (data: {
		year: string;
		batch: string;
		electives: string[];
	}) => {
		const mockSchedule: {
			[key: string]: {
				[key: string]: {
					subject_name: string;
					type: "L" | "T" | "P";
					location: string;
				};
			};
		} = {
			Monday: {
				"08:00-09:00": {
					subject_name: "MOBILE COMMUNICATION",
					type: "L",
					location: "CS4",
				},
				"09:00-10:00": {
					subject_name: "GLOBAL POLITICS",
					type: "T",
					location: "FF1",
				},
				"10:00-11:00": {
					subject_name: "VLSI Design",
					type: "L",
					location: "G6",
				},
				"11:00-12:00": {
					subject_name: "Telecommunication Networks",
					type: "L",
					location: "FF9",
				},
			},
			Tuesday: {
				"08:00-09:00": {
					subject_name: "Fundamentals of Electric Vehicle",
					type: "L",
					location: "CS5",
				},
				"09:00-10:00": {
					subject_name: "Popular Literature",
					type: "L",
					location: "CS5",
				},
				"10:00-12:00": {
					subject_name: "Telecommunication Networks Lab",
					type: "P",
					location: "ACL",
				},
				"14:00-15:00": {
					subject_name: "VLSI Design",
					type: "L",
					location: "CS3",
				},
				"15:00-16:00": {
					subject_name: "Telecommunication Networks",
					type: "L",
					location: "CS3",
				},
			},
			Wednesday: {
				"08:00-09:00": {
					subject_name: "GLOBAL POLITICS",
					type: "L",
					location: "CS7",
				},
				"09:00-10:00": {
					subject_name: "MOBILE COMMUNICATION",
					type: "L",
					location: "CS6",
				},
				"14:00-15:00": {
					subject_name: "VLSI Design",
					type: "L",
					location: "CS2",
				},
				"15:00-16:00": {
					subject_name: "Telecommunication Networks",
					type: "L",
					location: "CS2",
				},
			},
			Thursday: {
				"08:00-09:00": {
					subject_name: "Popular Literature",
					type: "L",
					location: "CS5",
				},
				"09:00-10:00": {
					subject_name: "Fundamentals of Electric Vehicle",
					type: "L",
					location: "CS8",
				},
				"14:00-15:00": {
					subject_name: "Basics of Creative Writing",
					type: "L",
					location: "FF4",
				},
			},
			Friday: {
				"08:00-09:00": {
					subject_name: "MOBILE COMMUNICATION",
					type: "L",
					location: "CS6",
				},
				"09:00-10:00": {
					subject_name: "GLOBAL POLITICS",
					type: "L",
					location: "CS7",
				},
				"10:00-12:00": {
					subject_name: "VLSI Design Lab II",
					type: "P",
					location: "VDA",
				},
				"15:00-16:00": {
					subject_name: "VLSI Design",
					type: "T",
					location: "F10",
				},
			},
			Saturday: {
				"09:00-10:00": {
					subject_name: "Popular Literature",
					type: "L",
					location: "CS5",
				},
			},
		};
		setSchedule(mockSchedule);
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-8 relative overflow-hidden">
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full">
				<div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#F0BB78]/30 rounded-full blur-[128px]" />
				<div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-[#543A14]/30 rounded-full blur-[128px]" />
			</div>

			<div className="max-w-7xl mx-auto space-y-8 relative z-10">
				<motion.div
					className="text-center space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-3 mb-4">
						<Calendar className="w-10 h-10 text-[#F0BB78]" />
						<h1 className="text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							JIIT Schedule Creator
						</h1>
					</div>
					<p className="text-lg text-slate-300/80">
						Create your personalized class schedule in minutes
					</p>
				</motion.div>

				<motion.div
					className="flex justify-center rounded-2xl p-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<ScheduleForm
						subjects={subjects.electives}
						onSubmit={handleFormSubmit}
					/>
				</motion.div>

				{schedule && (
					<motion.div
						className="mt-8 backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
					>
						<ScheduleDisplay schedule={schedule} />
					</motion.div>
				)}
			</div>
		</main>
	);
}
