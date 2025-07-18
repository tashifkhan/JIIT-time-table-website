import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScheduleForm } from "./schedule-form";
import timetableMapping from "../../public/data/time-table/EVEN25/62.json";
import mapping128 from "../../public/data/time-table/EVEN25/128.json";
import {
	initializePyodide,
	callPythonFunction,
	usePyodideStatus,
} from "../utils/pyodide";
import { Button } from "./ui/button";
import type { PyodideInterface } from "pyodide";

const CompareTimetablePage: React.FC = () => {
	const [params1, setParams1] = useState<any>(null);
	const [params2, setParams2] = useState<any>(null);
	const [timetable1, setTimetable1] = useState<any>(null);
	const [timetable2, setTimetable2] = useState<any>(null);
	const [compareResult, setCompareResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const { loaded: pyodideLoaded } = usePyodideStatus();

	const handleSubmit1 = async (data: any) => {
		setParams1(data);
	};
	const handleSubmit2 = async (data: any) => {
		setParams2(data);
	};

	const canCompare = params1 && params2;

	const generateAndCompare = async () => {
		setLoading(true);
		setCompareResult(null);
		setTimetable1(null);
		setTimetable2(null);
		try {
			if (!pyodideLoaded) {
				await initializePyodide();
			}
			// Helper to get mapping and args
			const getMappingAndArgs = (params: any) => {
				const mapping: Record<string, any> =
					params.campus === "62" ? timetableMapping : mapping128;
				const yearData = mapping && params.year && mapping[params.year];
				if (!yearData || typeof yearData !== "object") {
					return {
						time_table_json: {},
						subject_json: [],
						batch: params.batch,
						electives_subject_codes: params.electives || [],
					};
				}
				return {
					time_table_json: yearData.timetable,
					subject_json: yearData.subjects,
					batch: params.batch,
					electives_subject_codes: params.electives || [],
				};
			};
			// Always use time_table_creator_v2 for comparison
			const args1 = getMappingAndArgs(params1);
			const args2 = getMappingAndArgs(params2);
			const [tt1, tt2] = await Promise.all([
				callPythonFunction("time_table_creator_v2", args1),
				callPythonFunction("time_table_creator_v2", args2),
			]);
			setTimetable1(tt1);
			setTimetable2(tt2);
			// Now compare
			// compare_timetables expects only two arguments
			const pyodide = (await initializePyodide()) as PyodideInterface;
			const compareFn = pyodide.globals.get("compare_timetables");
			const pyTT1 = pyodide.toPy(tt1);
			const pyTT2 = pyodide.toPy(tt2);
			const result = compareFn(pyTT1, pyTT2).toJs();
			setCompareResult(result);
		} catch (e) {
			setCompareResult({ error: "Failed to compare timetables." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-4 sm:p-8 relative overflow-hidden">
			<div className="relative z-10 flex flex-col items-center justify-start max-w-7xl mx-auto space-y-6 sm:space-y-8">
				<motion.div
					className="text-center space-y-3 sm:space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
						Compare Timetables
					</h1>
					<p className="text-base sm:text-lg text-slate-300/80 px-4">
						Find common free slots and classes together between two schedules
					</p>
				</motion.div>
				<div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl">
					<div className="flex-1 bg-white/5 rounded-xl border border-white/10 shadow-xl p-4">
						<h2 className="text-lg font-semibold text-[#F0BB78] mb-2">
							Timetable 1
						</h2>
						<ScheduleForm
							mapping={timetableMapping}
							mapping128={mapping128}
							onSubmit={handleSubmit1}
							savedConfigs={{}}
							useLocalState={true}
						/>
					</div>
					<div className="flex-1 bg-white/5 rounded-xl border border-white/10 shadow-xl p-4">
						<h2 className="text-lg font-semibold text-[#F0BB78] mb-2">
							Timetable 2
						</h2>
						<ScheduleForm
							mapping={timetableMapping}
							mapping128={mapping128}
							onSubmit={handleSubmit2}
							savedConfigs={{}}
							useLocalState={true}
						/>
					</div>
				</div>
				<Button
					onClick={generateAndCompare}
					disabled={!canCompare || loading}
					className="mt-4 px-8 py-3 text-lg bg-[#F0BB78]/30 border border-[#F0BB78]/20 shadow-lg hover:bg-[#F0BB78]/40 transition-all duration-300"
				>
					{loading ? "Comparing..." : "Compare"}
				</Button>
				{compareResult && !compareResult.error && (
					<motion.div
						className="w-full max-w-4xl bg-white/5 rounded-xl border border-white/10 shadow-xl p-6 mt-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h2 className="text-xl font-bold text-[#F0BB78] mb-4">Results</h2>
						<div className="mb-6">
							<h3 className="text-lg font-semibold mb-2">Common Free Slots</h3>
							{Object.keys(compareResult.common_free_slots || {}).length ===
							0 ? (
								<p className="text-slate-300/80">No common free slots found.</p>
							) : (
								<div className="overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead>
											<tr>
												<th className="px-2 py-1 text-left">Day</th>
												<th className="px-2 py-1 text-left">Free Slots</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(compareResult.common_free_slots).map(
												([day, slots]: any) => (
													<tr key={day}>
														<td className="px-2 py-1 font-medium">{day}</td>
														<td className="px-2 py-1">
															{(slots as string[]).join(", ")}
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
						<div>
							<h3 className="text-lg font-semibold mb-2">Classes Together</h3>
							{Object.keys(compareResult.classes_together || {}).length ===
							0 ? (
								<p className="text-slate-300/80">No classes together found.</p>
							) : (
								<div className="overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead>
											<tr>
												<th className="px-2 py-1 text-left">Day</th>
												<th className="px-2 py-1 text-left">Time Slot</th>
												<th className="px-2 py-1 text-left">Subject</th>
												<th className="px-2 py-1 text-left">Type</th>
												<th className="px-2 py-1 text-left">Location</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(compareResult.classes_together).flatMap(
												([day, slots]: any) =>
													Object.entries(slots).map(([time, info]: any) => (
														<tr key={day + time}>
															<td className="px-2 py-1 font-medium">{day}</td>
															<td className="px-2 py-1">{time}</td>
															<td className="px-2 py-1">{info.subject_name}</td>
															<td className="px-2 py-1">{info.type}</td>
															<td className="px-2 py-1">{info.location}</td>
														</tr>
													))
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</motion.div>
				)}
				{compareResult && compareResult.error && (
					<div className="text-red-400 font-semibold mt-4">
						{compareResult.error}
					</div>
				)}
			</div>
		</main>
	);
};

export default CompareTimetablePage;
