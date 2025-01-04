import React, { useState } from "react";
import { callPythonFunction } from "./utils/pyodide";
import { ScheduleForm } from "./components/schedule-form";
import { ScheduleDisplay } from "./components/schedule-display";
import { motion } from "framer-motion";
import timetableMapping from "./data/timetable-mapping.json";
import { Calendar } from "lucide-react";

interface YourTietable {
	[key: string]: {
		[key: string]: {
			subject_name: string;
			type: "L" | "T" | "P";
			location: string;
		};
	};
}

const App: React.FC = () => {
	const [schedule, setSchedule] = useState<{
		[day: string]: {
			[time: string]: {
				subject_name: string;
				type: "L" | "T" | "P";
				location: string;
			};
		};
	} | null>(null);

	const evaluteTimeTable = async (
		time_table_json: any,
		subject_json: any,
		batch: string,
		electives_subject_codes: any[]
	) => {
		try {
			const output = await callPythonFunction("time_table_creator", [
				time_table_json,
				subject_json,
				batch,
				electives_subject_codes,
			]);
			return output;
		} catch (error) {
			return "Error executing Python function";
		}
	};

	const handleFormSubmit = async (data: {
		year: string;
		batch: string;
		electives: string[];
	}) => {
		const { year, batch, electives } = data;
		const subjectJSON = timetableMapping[
			year as keyof typeof timetableMapping
		].subjects.sort((a, b) => a.Subject.localeCompare(b.Subject));
		const timeTableJSON =
			timetableMapping[year as keyof typeof timetableMapping].timetable;
		const Schedule = await evaluteTimeTable(
			timeTableJSON,
			subjectJSON,
			batch,
			electives
		);
		console.log(Schedule);
		const mockSchedule: YourTietable = {
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
		if (Schedule === "Error executing Python function") {
			setSchedule(mockSchedule);
			console.log(schedule);
		} else {
			setSchedule(Schedule);
			console.log(schedule);
		}
	};

	// console.log(timetableMapping);

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-4 sm:p-8 relative overflow-hidden flex items-center justify-center">
			{/* Background effects - adjusted for mobile */}
			<div className="absolute inset-0 w-full h-full">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>

			<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
				<motion.div
					className="text-center space-y-3 sm:space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
						<Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#F0BB78]" />
						<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							JIIT Schedule Creator
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4">
						Create your personalized class schedule in minutes
					</p>
				</motion.div>

				<motion.div
					className="flex justify-center rounded-xl sm:rounded-2xl p-3 sm:p-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<ScheduleForm
						mapping={timetableMapping}
						onSubmit={handleFormSubmit}
					/>
				</motion.div>

				{schedule && (
					<motion.div
						className="mt-6 sm:mt-8 backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl p-0 sm:p-6 border border-white/10 shadow-xl overflow-x-auto"
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
};

// 	return (
// 		<div className="flex flex-col items-center justify-center h-screen bg-gray-100">
// 			<h1 className="text-2xl font-bold mb-4">
// 				React + Pyodide + Python Module
// 			</h1>
// 			<input
// 				type="text"
// 				value={functionName}
// 				onChange={(e) => setFunctionName(e.target.value)}
// 				placeholder="Function name (e.g., add)"
// 				className="border rounded p-2 w-96 mb-4"
// 			/>
// 			<input
// 				type="text"
// 				value={args}
// 				onChange={(e) => setArgs(e.target.value)}
// 				placeholder="Arguments (comma-separated, e.g., 1, 2)"
// 				className="border rounded p-2 w-96 mb-4"
// 			/>
// 			<button
// 				onClick={executeFunction}
// 				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// 			>
// 				Call Python Function
// 			</button>
// 			<pre className="mt-4 bg-gray-200 p-4 rounded w-96">Output: {result}</pre>
// 		</div>
// 	);
// };

export default App;
