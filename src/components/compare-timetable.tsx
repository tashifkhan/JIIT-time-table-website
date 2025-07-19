import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import timetableMapping from "../../public/data/time-table/EVEN25/62.json";
import mapping128 from "../../public/data/time-table/EVEN25/128.json";
import {
	initializePyodide,
	callPythonFunction,
	usePyodideStatus,
} from "../utils/pyodide";
import { Button } from "./ui/button";
import type { PyodideInterface } from "pyodide";
import { SubjectSelector, Subject } from "./schedule-form";

const initialConfig = { campus: "", year: "", batch: "", electives: [] };

const CompareTimetablePage: React.FC = () => {
	const [config1, setConfig1] = useState<any>({ ...initialConfig });
	const [config2, setConfig2] = useState<any>({ ...initialConfig });
	const [_timetable1, setTimetable1] = useState<any>(null);
	const [_timetable2, setTimetable2] = useState<any>(null);
	const [compareResult, setCompareResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const { loaded: pyodideLoaded } = usePyodideStatus();

	// Subject selection state for both configs
	const [selectedSubjects1, setSelectedSubjects1] = useState<string[]>([]);
	const [showSubjectModal1, setShowSubjectModal1] = useState(false);
	const [selectedSubjects2, setSelectedSubjects2] = useState<string[]>([]);
	const [showSubjectModal2, setShowSubjectModal2] = useState(false);

	// Update electives in config when selectedSubjects changes
	useEffect(() => {
		setConfig1((prev: any) => ({ ...prev, electives: selectedSubjects1 }));
	}, [selectedSubjects1]);
	useEffect(() => {
		setConfig2((prev: any) => ({ ...prev, electives: selectedSubjects2 }));
	}, [selectedSubjects2]);

	const isConfigValid = (cfg: any) =>
		cfg.campus &&
		cfg.year &&
		cfg.batch &&
		(cfg.year === "1" || cfg.electives.length > 0);

	// Handlers for input changes
	const handleConfigChange = (idx: 1 | 2, field: string, value: any) => {
		if (idx === 1) setConfig1((prev: any) => ({ ...prev, [field]: value }));
		else setConfig2((prev: any) => ({ ...prev, [field]: value }));
	};

	// TODO: Add electives UI and logic later

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
			const args1 = getMappingAndArgs(config1);
			const args2 = getMappingAndArgs(config2);
			// Conditionally call the correct timetable generator as in App.tsx
			let tt1, tt2;

			const getFunctionName = (params: any) => {
				if (params.year === "1") {
					return params.campus === "62"
						? "time_table_creator"
						: "bando128_year1";
				} else {
					return params.campus === "62" ? "time_table_creator_v2" : "banado128";
				}
			};

			const fnName1 = getFunctionName(config1);
			const fnName2 = getFunctionName(config2);

			[tt1, tt2] = await Promise.all([
				callPythonFunction(fnName1, args1),
				callPythonFunction(fnName2, args2),
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

	// Helper to get subjects array for a config
	const getSubjects = (campus: string, year: string): Subject[] => {
		if (!campus || !year) return [];
		const mapping = campus === "62" ? timetableMapping : mapping128;
		return (mapping as Record<string, any>)[year]?.subjects || [];
	};

	return (
		<main>
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
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Campus
							</label>
							<select
								value={config1.campus}
								onChange={(e) =>
									handleConfigChange(1, "campus", e.target.value)
								}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
							>
								<option value="">Select campus</option>
								<option value="62">62</option>
								<option value="128">128</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Year
							</label>
							<select
								value={config1.year}
								onChange={(e) => handleConfigChange(1, "year", e.target.value)}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
							>
								<option value="">Select year</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Batch
							</label>
							<input
								type="text"
								value={config1.batch}
								onChange={(e) =>
									handleConfigChange(1, "batch", e.target.value.toUpperCase())
								}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
								placeholder="Enter batch (e.g. A6 or F4)"
							/>
						</div>
						{/* Electives UI for Timetable 1 */}
						{config1.year && config1.year !== "1" && (
							<div className="space-y-2">
								<label className="text-white/90 font-medium text-sm">
									Choose Your Subjects
								</label>
								<Button
									type="button"
									className="w-full h-9 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
									onClick={() => setShowSubjectModal1(true)}
								>
									{selectedSubjects1.length > 0
										? `Selected: ${selectedSubjects1.length} subject(s)`
										: "Select Subjects"}
								</Button>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedSubjects1.map((code) => {
										const subj = getSubjects(config1.campus, config1.year).find(
											(s) => s.Code === code
										);
										return (
											<div
												key={code}
												className="flex items-center gap-1 px-2 py-1 bg-[#F0BB78]/20 rounded text-[#F0BB78] text-xs group hover:bg-[#F0BB78]/30 transition-colors"
											>
												<span className="truncate max-w-[120px]">
													{subj?.Subject || code}
												</span>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedSubjects1((prev) =>
															prev.filter((c) => c !== code)
														);
													}}
													className="ml-1 text-[#F0BB78]/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
													aria-label={`Remove ${subj?.Subject || code}`}
												>
													×
												</button>
											</div>
										);
									})}
								</div>
								<SubjectSelector
									subjects={getSubjects(config1.campus, config1.year)}
									selectedSubjects={selectedSubjects1}
									setSelectedSubjects={setSelectedSubjects1}
									open={showSubjectModal1}
									setOpen={setShowSubjectModal1}
									year={config1.year}
								/>
							</div>
						)}
					</div>
					<div className="flex-1 bg-white/5 rounded-xl border border-white/10 shadow-xl p-4">
						<h2 className="text-lg font-semibold text-[#F0BB78] mb-2">
							Timetable 2
						</h2>
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Campus
							</label>
							<select
								value={config2.campus}
								onChange={(e) =>
									handleConfigChange(2, "campus", e.target.value)
								}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
							>
								<option value="">Select campus</option>
								<option value="62">62</option>
								<option value="128">128</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Year
							</label>
							<select
								value={config2.year}
								onChange={(e) => handleConfigChange(2, "year", e.target.value)}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
							>
								<option value="">Select year</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
						<div className="space-y-2">
							<label className="block text-white/90 font-medium text-sm">
								Batch
							</label>
							<input
								type="text"
								value={config2.batch}
								onChange={(e) =>
									handleConfigChange(2, "batch", e.target.value.toUpperCase())
								}
								className="w-full rounded p-2 bg-white/10 border border-white/20"
								placeholder="Enter batch (e.g. A6 or F4)"
							/>
						</div>
						{/* Electives UI for Timetable 2 */}
						{config2.year && config2.year !== "1" && (
							<div className="space-y-2">
								<label className="text-white/90 font-medium text-sm">
									Choose Your Subjects
								</label>
								<Button
									type="button"
									className="w-full h-9 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
									onClick={() => setShowSubjectModal2(true)}
								>
									{selectedSubjects2.length > 0
										? `Selected: ${selectedSubjects2.length} subject(s)`
										: "Select Subjects"}
								</Button>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedSubjects2.map((code) => {
										const subj = getSubjects(config2.campus, config2.year).find(
											(s) => s.Code === code
										);
										return (
											<div
												key={code}
												className="flex items-center gap-1 px-2 py-1 bg-[#F0BB78]/20 rounded text-[#F0BB78] text-xs group hover:bg-[#F0BB78]/30 transition-colors"
											>
												<span className="truncate max-w-[120px]">
													{subj?.Subject || code}
												</span>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedSubjects2((prev) =>
															prev.filter((c) => c !== code)
														);
													}}
													className="ml-1 text-[#F0BB78]/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
													aria-label={`Remove ${subj?.Subject || code}`}
												>
													×
												</button>
											</div>
										);
									})}
								</div>
								<SubjectSelector
									subjects={getSubjects(config2.campus, config2.year)}
									selectedSubjects={selectedSubjects2}
									setSelectedSubjects={setSelectedSubjects2}
									open={showSubjectModal2}
									setOpen={setShowSubjectModal2}
									year={config2.year}
								/>
							</div>
						)}
					</div>
				</div>
				<Button
					onClick={generateAndCompare}
					disabled={
						!isConfigValid(config1) || !isConfigValid(config2) || loading
					}
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
