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
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-start max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4">
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
				
				<motion.div 
					className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					{/* Timetable 1 Form */}
					<div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
						<div className="bg-gradient-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-6 py-4 border-b border-white/10">
							<h2 className="text-lg sm:text-xl font-semibold text-[#F0BB78]">
								Timetable 1
							</h2>
						</div>
						<div className="p-6 space-y-4">
							<div className="space-y-2">
								<label className="block text-white/90 font-medium text-sm">
									Campus
								</label>
								<select
									value={config1.campus}
									onChange={(e) =>
										handleConfigChange(1, "campus", e.target.value)
									}
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
								>
									<option value="" className="bg-gray-800">Select campus</option>
									<option value="62" className="bg-gray-800">Campus 62</option>
									<option value="128" className="bg-gray-800">Campus 128</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="block text-white/90 font-medium text-sm">
									Year
								</label>
								<select
									value={config1.year}
									onChange={(e) => handleConfigChange(1, "year", e.target.value)}
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
								>
									<option value="" className="bg-gray-800">Select year</option>
									<option value="1" className="bg-gray-800">1st Year</option>
									<option value="2" className="bg-gray-800">2nd Year</option>
									<option value="3" className="bg-gray-800">3rd Year</option>
									<option value="4" className="bg-gray-800">4th Year</option>
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
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
									placeholder="Enter batch (e.g. A6 or F4)"
								/>
							</div>
							{/* Electives UI for Timetable 1 */}
							{config1.year && config1.year !== "1" && (
								<div className="space-y-3">
									<label className="text-white/90 font-medium text-sm">
										Choose Your Subjects
									</label>
									<Button
										type="button"
										className="w-full h-12 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-lg"
										onClick={() => setShowSubjectModal1(true)}
									>
										{selectedSubjects1.length > 0
											? `Selected: ${selectedSubjects1.length} subject(s)`
											: "Select Subjects"}
									</Button>
									{selectedSubjects1.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{selectedSubjects1.map((code) => {
												const subj = getSubjects(config1.campus, config1.year).find(
													(s) => s.Code === code
												);
												return (
													<div
														key={code}
														className="flex items-center gap-2 px-3 py-2 bg-[#F0BB78]/20 rounded-lg text-[#F0BB78] text-xs group hover:bg-[#F0BB78]/30 transition-colors border border-[#F0BB78]/20"
													>
														<span className="truncate max-w-[120px] font-medium">
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
															className="ml-1 text-[#F0BB78]/60 hover:text-red-400 transition-colors text-sm font-bold"
															aria-label={`Remove ${subj?.Subject || code}`}
														>
															×
														</button>
													</div>
												);
											})}
										</div>
									)}
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
					</div>
					
					{/* Timetable 2 Form */}
					<div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
						<div className="bg-gradient-to-r from-[#543A14]/10 to-[#F0BB78]/10 px-6 py-4 border-b border-white/10">
							<h2 className="text-lg sm:text-xl font-semibold text-[#F0BB78]">
								Timetable 2
							</h2>
						</div>
						<div className="p-6 space-y-4">
							<div className="space-y-2">
								<label className="block text-white/90 font-medium text-sm">
									Campus
								</label>
								<select
									value={config2.campus}
									onChange={(e) =>
										handleConfigChange(2, "campus", e.target.value)
									}
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
								>
									<option value="" className="bg-gray-800">Select campus</option>
									<option value="62" className="bg-gray-800">Campus 62</option>
									<option value="128" className="bg-gray-800">Campus 128</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="block text-white/90 font-medium text-sm">
									Year
								</label>
								<select
									value={config2.year}
									onChange={(e) => handleConfigChange(2, "year", e.target.value)}
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
								>
									<option value="" className="bg-gray-800">Select year</option>
									<option value="1" className="bg-gray-800">1st Year</option>
									<option value="2" className="bg-gray-800">2nd Year</option>
									<option value="3" className="bg-gray-800">3rd Year</option>
									<option value="4" className="bg-gray-800">4th Year</option>
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
									className="w-full rounded-lg p-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all duration-200"
									placeholder="Enter batch (e.g. A6 or F4)"
								/>
							</div>
							{/* Electives UI for Timetable 2 */}
							{config2.year && config2.year !== "1" && (
								<div className="space-y-3">
									<label className="text-white/90 font-medium text-sm">
										Choose Your Subjects
									</label>
									<Button
										type="button"
										className="w-full h-12 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-lg"
										onClick={() => setShowSubjectModal2(true)}
									>
										{selectedSubjects2.length > 0
											? `Selected: ${selectedSubjects2.length} subject(s)`
											: "Select Subjects"}
									</Button>
									{selectedSubjects2.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{selectedSubjects2.map((code) => {
												const subj = getSubjects(config2.campus, config2.year).find(
													(s) => s.Code === code
												);
												return (
													<div
														key={code}
														className="flex items-center gap-2 px-3 py-2 bg-[#F0BB78]/20 rounded-lg text-[#F0BB78] text-xs group hover:bg-[#F0BB78]/30 transition-colors border border-[#F0BB78]/20"
													>
														<span className="truncate max-w-[120px] font-medium">
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
															className="ml-1 text-[#F0BB78]/60 hover:text-red-400 transition-colors text-sm font-bold"
															aria-label={`Remove ${subj?.Subject || code}`}
														>
															×
														</button>
													</div>
												);
											})}
										</div>
									)}
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
				</motion.div>
				
				<motion.div
					className="flex justify-center w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<Button
						onClick={generateAndCompare}
						disabled={
							!isConfigValid(config1) || !isConfigValid(config2) || loading
						}
						className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-xl border border-[#F0BB78]/20"
					>
						{loading ? (
							<span className="flex items-center gap-2">
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Comparing...
							</span>
						) : (
							"Compare Timetables"
						)}
					</Button>
				</motion.div>
				{compareResult && !compareResult.error && (
					<motion.div
						className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="bg-gradient-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-6 py-4 border-b border-white/10">
							<h2 className="text-xl sm:text-2xl font-bold text-[#F0BB78]">Comparison Results</h2>
						</div>
						<div className="p-6 space-y-8">
							{/* Common Free Slots Section */}
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="w-3 h-3 bg-gradient-to-r from-[#F0BB78] to-[#543A14] rounded-full"></div>
									<h3 className="text-lg font-semibold text-white">Common Free Slots</h3>
								</div>
								{Object.keys(compareResult.common_free_slots || {}).length === 0 ? (
									<div className="bg-white/5 rounded-xl p-6 border border-white/10">
										<p className="text-slate-300/80 text-center">No common free slots found.</p>
									</div>
								) : (
									<div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
										<div className="overflow-x-auto">
											<table className="min-w-full">
												<thead>
													<tr className="bg-white/5 border-b border-white/10">
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Day</th>
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Free Time Slots</th>
													</tr>
												</thead>
												<tbody>
													{Object.entries(compareResult.common_free_slots).map(
														([day, slots], index) => (
															<tr key={day} className={`border-b border-white/5 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
																<td className="px-6 py-4 font-medium text-white">{day}</td>
																<td className="px-6 py-4 text-slate-300">
																	<div className="flex flex-wrap gap-2">
																		{(slots as string[]).map((slot, i) => (
																			<span key={i} className="inline-flex items-center px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
																				{slot}
																			</span>
																		))}
																	</div>
																</td>
															</tr>
														)
													)}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>

							{/* Classes Together Section */}
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="w-3 h-3 bg-gradient-to-r from-[#543A14] to-[#F0BB78] rounded-full"></div>
									<h3 className="text-lg font-semibold text-white">Classes Together</h3>
								</div>
								{Object.keys(compareResult.classes_together || {}).length === 0 ? (
									<div className="bg-white/5 rounded-xl p-6 border border-white/10">
										<p className="text-slate-300/80 text-center">No classes together found.</p>
									</div>
								) : (
									<div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
										<div className="overflow-x-auto">
											<table className="min-w-full">
												<thead>
													<tr className="bg-white/5 border-b border-white/10">
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Day</th>
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Time Slot</th>
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Subject</th>
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Type</th>
														<th className="px-6 py-4 text-left text-sm font-semibold text-[#F0BB78]">Location</th>
													</tr>
												</thead>
												<tbody>
													{Object.entries(compareResult.classes_together).flatMap(
														([day, slots], dayIndex) =>
															Object.entries(slots as any).map(([time, info]: [string, any], timeIndex) => (
																<tr key={day + time} className={`border-b border-white/5 ${(dayIndex + timeIndex) % 2 === 0 ? 'bg-white/2' : ''}`}>
																	<td className="px-6 py-4 font-medium text-white">{day}</td>
																	<td className="px-6 py-4 text-slate-300">
																		<span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/30">
																			{time}
																		</span>
																	</td>
																	<td className="px-6 py-4 text-slate-300 font-medium">{info.subject_name}</td>
																	<td className="px-6 py-4">
																		<span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
																			info.type === 'L' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
																			info.type === 'T' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
																			info.type === 'P' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
																			'bg-gray-500/20 text-gray-400 border border-gray-500/30'
																		}`}>
																			{info.type === 'L' ? 'Lecture' : info.type === 'T' ? 'Tutorial' : info.type === 'P' ? 'Practical' : info.type}
																		</span>
																	</td>
																	<td className="px-6 py-4 text-slate-300">{info.location}</td>
																</tr>
															))
													)}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
				{compareResult && compareResult.error && (
					<motion.div
						className="w-full max-w-6xl bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 shadow-xl p-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-bold">!</span>
							</div>
							<h3 className="text-lg font-semibold text-red-400">Error</h3>
						</div>
						<p className="text-red-300 mt-2">{compareResult.error}</p>
					</motion.div>
				)}
			</div>
		</main>
	);
};

export default CompareTimetablePage;
