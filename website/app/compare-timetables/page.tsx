"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Trash } from "lucide-react";
import {
	initializePyodide,
	callPythonFunction,
	usePyodideStatus,
} from "../../utils/pyodide";
import { Button } from "../../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import type { PyodideInterface } from "pyodide";
import {
	SubjectSelector,
	Subject,
} from "../../components/schedule/schedule-form";
import Loading from "@/components/common/loading";
import {
	useTimeTables,
	useBatchMappings,
	useDefaultSemester,
} from "../../hooks/use-api";

const initialConfig = { campus: "", year: "", batch: "", electives: [] };

export default function CompareTimetables() {
	// Dynamic Data State using React Query
	const { data: timeTableData = [], isLoading: isTimeTableLoading } =
		useTimeTables();
	const [selectedSemester, setSelectedSemester] = useState<string>("");

	// Get batches for the selected semester
	const semesterInfo = useMemo(
		() => timeTableData.find((d) => d.semester === selectedSemester),
		[timeTableData, selectedSemester]
	);
	const batches = semesterInfo?.batches || [];

	// Fetch all batch mappings for the selected semester
	const { data: mappings = {} } = useBatchMappings(selectedSemester, batches);

	// Saved configs state (shared with App.tsx)
	const [savedConfigs, setSavedConfigs] = useState<{ [key: string]: any }>({});
	const [isConfigLoaded, setIsConfigLoaded] = useState(false);
	const [isConfigOpen1, setIsConfigOpen1] = useState(false);
	const [isConfigOpen2, setIsConfigOpen2] = useState(false);
	const [selectedConfig1, setSelectedConfig1] = useState<string>("");
	const [selectedConfig2, setSelectedConfig2] = useState<string>("");

	// Load savedConfigs from localStorage on mount
	useEffect(() => {
		const configs = localStorage.getItem("classConfigs");
		if (configs) {
			try {
				setSavedConfigs(JSON.parse(configs));
			} catch (e) {
				console.error("Failed to parse saved configs", e);
			}
		}
		setIsConfigLoaded(true);
	}, []);

	// Persist savedConfigs to localStorage
	useEffect(() => {
		if (isConfigLoaded) {
			localStorage.setItem("classConfigs", JSON.stringify(savedConfigs));
		}
	}, [savedConfigs, isConfigLoaded]);

	const defaultSemester = useDefaultSemester();
	useEffect(() => {
		if (defaultSemester && !selectedSemester) {
			setSelectedSemester(defaultSemester);
		}
	}, [defaultSemester, selectedSemester]);

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
				// Use dynamic mappings
				const mapping = mappings[params.campus];

				// Access year data correctly from nested structure: mapping[year]
				// Note: The structure of mapping[batch] is { "1": {...}, "2": {...} }
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
						: params.campus === "BCA"
						? "bca_creator_year1"
						: "bando128_year1";
				} else {
					return params.campus === "62"
						? "time_table_creator_v2"
						: params.campus === "BCA"
						? "bca_creator"
						: "banado128";
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

	// Handler to load a config into Timetable 1 or 2
	const handleSelectConfig = (idx: 1 | 2, name: string) => {
		const config = savedConfigs[name];
		if (!config) return;
		if (idx === 1) {
			setConfig1({
				campus: config.campus || "",
				year: config.year || "",
				batch: config.batch || "",
				electives: config.selectedSubjects || [],
			});
			setSelectedSubjects1(config.selectedSubjects || []);
			setSelectedConfig1(name);
			setIsConfigOpen1(false);
		} else {
			setConfig2({
				campus: config.campus || "",
				year: config.year || "",
				batch: config.batch || "",
				electives: config.selectedSubjects || [],
			});
			setSelectedSubjects2(config.selectedSubjects || []);
			setSelectedConfig2(name);
			setIsConfigOpen2(false);
		}
	};

	const handleDeleteConfig = (name: string) => {
		setSavedConfigs((prev) => {
			const newConfigs = { ...prev };
			delete newConfigs[name];
			return newConfigs;
		});
		if (selectedConfig1 === name) setSelectedConfig1("");
		if (selectedConfig2 === name) setSelectedConfig2("");
	};

	// Helper to get subjects array for a config
	const getSubjects = (campus: string, year: string): Subject[] => {
		if (!campus || !year) return [];
		const mapping = mappings[campus];
		return (mapping as Record<string, any>)?.[year]?.subjects || [];
	};

	// Only allow actions when mappings are loaded
	if (Object.keys(mappings).length === 0) {
		return <Loading />;
	}

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
					<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-linear-to-r from-[#F0BB78] to-[#543A14]">
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
					{/* Timetable 1: Config Dropdown + Form vertically */}
					<div className="flex-1 flex flex-col gap-2">
						{Object.keys(savedConfigs).length > 0 && (
							<div className="mb-0 w-full max-w-md mx-auto">
								<div className="bg-white/5 rounded-xl border border-white/10 shadow-xl overflow-hidden">
									<button
										onClick={() => setIsConfigOpen1((prev) => !prev)}
										className="w-full flex items-center justify-between px-6 py-3 bg-transparent hover:bg-white/10 transition-all duration-200 focus:outline-none cursor-pointer select-none"
									>
										<span className="text-base font-semibold text-[#F0BB78]">
											Load Saved Config for Timetable 1
										</span>
										<ChevronDown
											className={`w-6 h-6 text-[#F0BB78] transition-transform duration-300 ${
												isConfigOpen1 ? "rotate-180" : "rotate-0"
											}`}
										/>
									</button>
									{isConfigOpen1 && (
										<div className="px-6 pb-4 pt-2 flex flex-col gap-2">
											{Object.keys(savedConfigs).map((name) => (
												<div
													key={name}
													className="flex items-center justify-between gap-2"
												>
													<button
														onClick={() => handleSelectConfig(1, name)}
														className={`flex-1 text-left px-4 py-2 rounded-lg bg-[#FFF0DC]/10 border border-[#F0BB78]/10 hover:bg-[#F0BB78]/20 text-[#F0BB78] font-medium transition-all duration-200`}
													>
														{name}
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteConfig(name);
														}}
														className="ml-2 p-1 rounded hover:bg-red-100/20 transition-colors"
														title="Delete config"
													>
														<Trash className="w-4 h-4 text-red-400" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}
						{/* Timetable 1 Form */}
						<div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
							<div className="bg-linear-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-6 py-4 border-b border-white/10">
								<h2 className="text-lg sm:text-xl font-semibold text-[#F0BB78]">
									Timetable 1
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Campus
									</label>
									<Select
										value={config1.campus}
										onValueChange={(value) =>
											handleConfigChange(1, "campus", value)
										}
									>
										<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
											<SelectValue placeholder="Select campus" />
										</SelectTrigger>
										<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
											{Object.keys(mappings).map((campus) => (
												<SelectItem
													key={campus}
													value={campus}
													className="hover:bg-white/20"
												>
													{campus === "62"
														? "Campus 62"
														: campus === "128"
														? "Campus 128"
														: campus}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Year
									</label>
									<Select
										value={config1.year}
										onValueChange={(value) =>
											handleConfigChange(1, "year", value)
										}
									>
										<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
											<SelectValue placeholder="Select year" />
										</SelectTrigger>
										<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
											<SelectItem value="1" className="hover:bg-white/20">
												1st Year
											</SelectItem>
											<SelectItem value="2" className="hover:bg-white/20">
												2nd Year
											</SelectItem>
											<SelectItem value="3" className="hover:bg-white/20">
												3rd Year
											</SelectItem>
											{config1.campus !== "BCA" && (
												<SelectItem value="4" className="hover:bg-white/20">
													4th Year
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Batch
									</label>
									<input
										type="text"
										value={config1.batch}
										onChange={(e) =>
											handleConfigChange(
												1,
												"batch",
												e.target.value.toUpperCase()
											)
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
											className="w-full h-12 text-sm bg-linear-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-lg"
											onClick={() => setShowSubjectModal1(true)}
										>
											{selectedSubjects1.length > 0
												? `Selected: ${selectedSubjects1.length} subject(s)`
												: "Select Subjects"}
										</Button>
										{selectedSubjects1.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{selectedSubjects1.map((code) => {
													const subj = getSubjects(
														config1.campus,
														config1.year
													).find((s) => s.Code === code);
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
					</div>

					{/* Timetable 2: Config Dropdown + Form vertically */}
					<div className="flex-1 flex flex-col gap-2">
						{Object.keys(savedConfigs).length > 0 && (
							<div className="mb-0 w-full max-w-md mx-auto">
								<div className="bg-white/5 rounded-xl border border-white/10 shadow-xl overflow-hidden">
									<button
										onClick={() => setIsConfigOpen2((prev) => !prev)}
										className="w-full flex items-center justify-between px-6 py-3 bg-transparent hover:bg-white/10 transition-all duration-200 focus:outline-none cursor-pointer select-none"
									>
										<span className="text-base font-semibold text-[#F0BB78]">
											Load Saved Config for Timetable 2
										</span>
										<ChevronDown
											className={`w-6 h-6 text-[#F0BB78] transition-transform duration-300 ${
												isConfigOpen2 ? "rotate-180" : "rotate-0"
											}`}
										/>
									</button>
									{isConfigOpen2 && (
										<div className="px-6 pb-4 pt-2 flex flex-col gap-2">
											{Object.keys(savedConfigs).map((name) => (
												<div
													key={name}
													className="flex items-center justify-between gap-2"
												>
													<button
														onClick={() => handleSelectConfig(2, name)}
														className={`flex-1 text-left px-4 py-2 rounded-lg bg-[#FFF0DC]/10 border border-[#F0BB78]/10 hover:bg-[#F0BB78]/20 text-[#F0BB78] font-medium transition-all duration-200`}
													>
														{name}
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteConfig(name);
														}}
														className="ml-2 p-1 rounded hover:bg-red-100/20 transition-colors"
														title="Delete config"
													>
														<Trash className="w-4 h-4 text-red-400" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}
						{/* Timetable 2 Form */}
						<div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
							<div className="bg-linear-to-r from-[#543A14]/10 to-[#F0BB78]/10 px-6 py-4 border-b border-white/10">
								<h2 className="text-lg sm:text-xl font-semibold text-[#F0BB78]">
									Timetable 2
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Campus
									</label>
									<Select
										value={config2.campus}
										onValueChange={(value) =>
											handleConfigChange(2, "campus", value)
										}
									>
										<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
											<SelectValue placeholder="Select campus" />
										</SelectTrigger>
										<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
											{Object.keys(mappings).map((campus) => (
												<SelectItem
													key={campus}
													value={campus}
													className="hover:bg-white/20"
												>
													{campus === "62"
														? "Campus 62"
														: campus === "128"
														? "Campus 128"
														: campus}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Year
									</label>
									<Select
										value={config2.year}
										onValueChange={(value) =>
											handleConfigChange(2, "year", value)
										}
									>
										<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
											<SelectValue placeholder="Select year" />
										</SelectTrigger>
										<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
											<SelectItem value="1" className="hover:bg-white/20">
												1st Year
											</SelectItem>
											<SelectItem value="2" className="hover:bg-white/20">
												2nd Year
											</SelectItem>
											<SelectItem value="3" className="hover:bg-white/20">
												3rd Year
											</SelectItem>
											{config2.campus !== "BCA" && (
												<SelectItem value="4" className="hover:bg-white/20">
													4th Year
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="block text-white/90 font-medium text-sm">
										Batch
									</label>
									<input
										type="text"
										value={config2.batch}
										onChange={(e) =>
											handleConfigChange(
												2,
												"batch",
												e.target.value.toUpperCase()
											)
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
											className="w-full h-12 text-sm bg-linear-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-lg"
											onClick={() => setShowSubjectModal2(true)}
										>
											{selectedSubjects2.length > 0
												? `Selected: ${selectedSubjects2.length} subject(s)`
												: "Select Subjects"}
										</Button>
										{selectedSubjects2.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{selectedSubjects2.map((code) => {
													const subj = getSubjects(
														config2.campus,
														config2.year
													).find((s) => s.Code === code);
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
						className="px-8 py-4 text-lg font-semibold bg-linear-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-xl border border-[#F0BB78]/20"
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
						<div className="bg-linear-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
							<h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0BB78]">
								Comparison Results
							</h2>
						</div>
						<div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
							{/* Common Free Slots Section */}
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-linear-to-r from-[#F0BB78] to-[#543A14] rounded-full"></div>
									<h3 className="text-base sm:text-lg font-semibold text-white">
										Common Free Slots
									</h3>
								</div>
								{Object.keys(compareResult.common_free_slots || {}).length ===
								0 ? (
									<div className="bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
										<p className="text-slate-300/80 text-center text-sm sm:text-base">
											No common free slots found.
										</p>
									</div>
								) : (
									<div className="space-y-3 sm:space-y-4">
										{(() => {
											// Define allowed days
											const allowedDays = [
												"Monday",
												"Tuesday",
												"Wednesday",
												"Thursday",
												"Friday",
												"Saturday",
											];

											// Sort days according to the defined order
											const sortedDays = Object.keys(
												compareResult.common_free_slots
											)
												.filter((day) => allowedDays.includes(day))
												.sort(
													(a, b) =>
														allowedDays.indexOf(a) - allowedDays.indexOf(b)
												);

											return sortedDays.map((day) => {
												const slots = compareResult.common_free_slots[
													day
												] as string[];
												// Sort slots within each day by time
												const sortedSlots = [...slots].sort((a, b) => {
													// Extract start time from slot (e.g., "09:00-09:50" -> "09:00")
													const timeA = a.split("-")[0];
													const timeB = b.split("-")[0];

													// Convert time to minutes for proper numerical comparison
													const getMinutes = (time: string) => {
														const [hours, minutes] = time
															.split(":")
															.map(Number);
														return hours * 60 + minutes;
													};

													return getMinutes(timeA) - getMinutes(timeB);
												});

												return (
													<div
														key={day}
														className="bg-white/5 rounded-lg sm:rounded-xl border border-white/10 overflow-hidden"
													>
														<div className="bg-linear-to-r from-[#F0BB78]/5 to-[#543A14]/5 px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10">
															<h4 className="text-sm sm:text-lg font-semibold text-[#F0BB78]">
																{day}
															</h4>
														</div>
														<div className="p-3 sm:p-6">
															<div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
																{sortedSlots.map((slot, i) => (
																	<span
																		key={i}
																		className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-[#F0BB78]/20 text-[#F0BB78] text-xs sm:text-sm font-medium border border-[#F0BB78]/30 hover:bg-[#F0BB78]/30 transition-colors text-center"
																	>
																		{slot}
																	</span>
																))}
															</div>
														</div>
													</div>
												);
											});
										})()}
									</div>
								)}
							</div>

							{/* Classes Together Section */}
							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-linear-to-r from-[#543A14] to-[#F0BB78] rounded-full"></div>
									<h3 className="text-base sm:text-lg font-semibold text-white">
										Classes Together
									</h3>
								</div>
								{Object.keys(compareResult.classes_together || {}).length ===
								0 ? (
									<div className="bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
										<p className="text-slate-300/80 text-center text-sm sm:text-base">
											No classes together found.
										</p>
									</div>
								) : (
									<div className="space-y-3 sm:space-y-4">
										{(() => {
											// Define allowed days
											const allowedDays = [
												"Monday",
												"Tuesday",
												"Wednesday",
												"Thursday",
												"Friday",
												"Saturday",
											];

											// Sort days according to the defined order
											const sortedDays = Object.keys(
												compareResult.classes_together || {}
											)
												.filter((day) => allowedDays.includes(day))
												.sort(
													(a, b) =>
														allowedDays.indexOf(a) - allowedDays.indexOf(b)
												);

											return sortedDays.map((day) => {
												const daySlots = compareResult.classes_together[
													day
												] as any;
												// Sort time slots within each day
												const sortedTimeSlots = Object.entries(daySlots).sort(
													([timeA], [timeB]) => {
														// Extract start time (e.g., "09:00-09:50" -> "09:00")
														const startTimeA = timeA.split("-")[0];
														const startTimeB = timeB.split("-")[0];

														// Convert time to minutes for proper numerical comparison
														const getMinutes = (time: string) => {
															const [hours, minutes] = time
																.split(":")
																.map(Number);
															return hours * 60 + minutes;
														};

														return (
															getMinutes(startTimeA) - getMinutes(startTimeB)
														);
													}
												);

												return (
													<div
														key={day}
														className="bg-white/5 rounded-lg sm:rounded-xl border border-white/10 overflow-hidden"
													>
														<div className="bg-gradient-to-r from-[#543A14]/5 to-[#F0BB78]/5 px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10">
															<h4 className="text-sm sm:text-lg font-semibold text-[#F0BB78]">
																{day}
															</h4>
														</div>
														<div className="p-3 sm:p-6 space-y-3">
															{sortedTimeSlots.map(
																([time, info]: [string, any]) => (
																	<div
																		key={time}
																		className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
																	>
																		{/* Mobile layout - Stacked */}
																		<div className="flex flex-col sm:hidden w-full">
																			<div className="flex items-center justify-between mb-2">
																				<span className="inline-flex items-center px-2 py-1 rounded-md bg-[#543A14]/30 text-[#F0BB78] text-xs font-medium border border-[#543A14]/40">
																					{time}
																				</span>
																				<span
																					className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
																						info.type === "L"
																							? "bg-[#F0BB78]/20 text-[#F0BB78] border border-[#F0BB78]/30"
																							: info.type === "T"
																							? "bg-[#543A14]/20 text-[#F0BB78] border border-[#543A14]/30"
																							: info.type === "P"
																							? "bg-[#F0BB78]/30 text-[#543A14] border border-[#F0BB78]/40"
																							: "bg-white/10 text-white/80 border border-white/20"
																					}`}
																				>
																					{info.type === "L"
																						? "Lecture"
																						: info.type === "T"
																						? "Tutorial"
																						: info.type === "P"
																						? "Practical"
																						: info.type}
																				</span>
																			</div>
																			<div>
																				<p className="text-white font-medium text-base truncate max-w-[250px]">
																					{info.subject_name}
																				</p>
																				<p className="text-slate-300 text-sm">
																					{info.location}
																				</p>
																			</div>
																		</div>

																		{/* Desktop layout - Horizontal */}
																		<div className="hidden sm:flex items-center justify-between w-full">
																			<div className="flex items-center gap-4">
																				<div className="flex-shrink-0">
																					<span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#543A14]/30 text-[#F0BB78] text-sm font-medium border border-[#543A14]/40">
																						{time}
																					</span>
																				</div>
																				<div className="min-w-0 flex-1">
																					<p className="text-white font-medium text-base">
																						{info.subject_name}
																					</p>
																					<p className="text-slate-300 text-sm">
																						{info.location}
																					</p>
																				</div>
																			</div>

																			{/* Right side - Class Type (Desktop only) */}
																			<div className="flex-shrink-0 ml-4">
																				<span
																					className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
																						info.type === "L"
																							? "bg-[#F0BB78]/20 text-[#F0BB78] border border-[#F0BB78]/30"
																							: info.type === "T"
																							? "bg-[#543A14]/20 text-[#F0BB78] border border-[#543A14]/30"
																							: info.type === "P"
																							? "bg-[#F0BB78]/30 text-[#543A14] border border-[#F0BB78]/40"
																							: "bg-white/10 text-white/80 border border-white/20"
																					}`}
																				>
																					{info.type === "L"
																						? "Lecture"
																						: info.type === "T"
																						? "Tutorial"
																						: info.type === "P"
																						? "Practical"
																						: info.type}
																				</span>
																			</div>
																		</div>
																	</div>
																)
															)}
														</div>
													</div>
												);
											});
										})()}
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
}
