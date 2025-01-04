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
