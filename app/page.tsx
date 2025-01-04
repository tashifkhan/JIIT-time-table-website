"use client";

import { useState } from "react";
import { ScheduleForm } from "@/components/schedule-form";
import { ScheduleDisplay } from "@/components/schedule-display";
import { motion } from "framer-motion";
import subjects from "@/data/subjects.json";
import { Calendar } from "lucide-react";

export default function Home() {
	const [schedule, setSchedule] = useState<{
		[key: string]: {
			[time: string]: {
				time: string;
				subject: string;
				type: "L" | "T" | "P";
				location: string;
				faculty: string;
			}[];
		};
	} | null>(null);

	const handleFormSubmit = async (data: {
		year: string;
		batch: string;
		electives: string[];
	}) => {
		const mockSchedule = {
			MON: {
				"8:00-9:00": [
					{
						time: "8:00-9:00",
						subject: "Data Structures",
						type: "L" as const,
						location: "LT-1",
						faculty: "Dr. Smith",
					},
				],
				"9:00-10:00": [
					{
						time: "9:00-10:00",
						subject: "Computer Networks",
						type: "T" as const,
						location: "CR-301",
						faculty: "Prof. Johnson",
					},
				],
			},
		};

		setSchedule(mockSchedule);
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				<motion.div
					className="text-center space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-3 mb-4">
						<Calendar className="w-10 h-10 text-purple-400" />
						<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
							JIIT Schedule Creator
						</h1>
					</div>
					<p className="text-lg text-slate-400">
						Create your personalized class schedule in minutes
					</p>
				</motion.div>

				<motion.div
					className="flex justify-center"
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
						className="mt-8"
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
