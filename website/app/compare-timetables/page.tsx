"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronDown,
	Trash,
	Eye,
	Clock,
	Users,
	Calendar,
	User,
	Sparkles,
} from "lucide-react";
import {
	initializePyodide,
	callTimeTableCreator,
	callCompareTimetables,
	usePyodideStatus,
} from "../../utils/pyodide";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

import {
	SubjectSelector,
	Subject,
} from "../../components/schedule/schedule-form";
import { TimetableModal } from "../../components/schedule/timetable-modal";
import Loading from "@/components/common/loading";
import {
	useTimeTables,
	useBatchMappings,
	useDefaultSemester,
} from "../../hooks/use-api";

const initialConfig = { campus: "", year: "", batch: "", electives: [] };

// Reusable Config Form Component
function ConfigForm({
	config,
	configIndex,
	onConfigChange,
	getSubjects,
	selectedSubjects,
	setSelectedSubjects,
	showSubjectModal,
	setShowSubjectModal,
	mappings,
	savedConfigs,
	onSelectConfig,
	onDeleteConfig,
	isConfigOpen,
	setIsConfigOpen,
}: {
	config: any;
	configIndex: 1 | 2;
	onConfigChange: (idx: 1 | 2, field: string, value: any) => void;
	getSubjects: (campus: string, year: string) => Subject[];
	selectedSubjects: string[];
	setSelectedSubjects: React.Dispatch<React.SetStateAction<string[]>>;
	showSubjectModal: boolean;
	setShowSubjectModal: React.Dispatch<React.SetStateAction<boolean>>;
	mappings: Record<string, any>;
	savedConfigs: Record<string, any>;
	onSelectConfig: (idx: 1 | 2, name: string) => void;
	onDeleteConfig: (name: string) => void;
	isConfigOpen: boolean;
	setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const personLabel = configIndex === 1 ? "Your Schedule" : "Friend's Schedule";
	const personIcon = configIndex === 1 ? User : Users;
	const Icon = personIcon;

	return (
		<div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
			{/* Header with icon */}
			<div className="bg-gradient-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-6 py-4 border-b border-white/10">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center shrink-0">
						<Icon className="w-5 h-5 text-[#F0BB78]" />
					</div>
					<div>
						<h2 className="text-lg sm:text-xl font-semibold text-[#F0BB78]">
							{personLabel}
						</h2>
						<p className="text-xs text-slate-300/60 line-clamp-1">
							{config.batch
								? `${
										config.campus === "62"
											? "Campus 62"
											: config.campus === "128"
											? "Campus 128"
											: config.campus
								  } • Year ${config.year} • Batch ${config.batch}`
								: "Configure schedule details"}
						</p>
					</div>
				</div>
			</div>

			<div className="p-6 space-y-5 flex-1 flex flex-col">
				{/* Saved Configs Dropdown */}
				{Object.keys(savedConfigs).length > 0 && (
					<div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden shrink-0">
						<button
							onClick={() => setIsConfigOpen((prev) => !prev)}
							className="w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-white/5 transition-all duration-200 focus:outline-none cursor-pointer select-none"
						>
							<span className="text-sm font-medium text-[#F0BB78]">
								Load Saved Config
							</span>
							<ChevronDown
								className={`w-4 h-4 text-[#F0BB78] transition-transform duration-300 ${
									isConfigOpen ? "rotate-180" : "rotate-0"
								}`}
							/>
						</button>
						<AnimatePresence>
							{isConfigOpen && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="overflow-hidden"
								>
									<div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t border-white/5">
										{Object.keys(savedConfigs).map((name) => (
											<div
												key={name}
												className="flex items-center justify-between gap-2"
											>
												<button
													onClick={() => onSelectConfig(configIndex, name)}
													className="flex-1 text-left px-3 py-2 rounded-lg bg-[#FFF0DC]/10 border border-[#F0BB78]/10 hover:bg-[#F0BB78]/20 text-[#F0BB78] text-sm font-medium transition-all duration-200 truncate"
												>
													{name}
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														onDeleteConfig(name);
													}}
													className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors shrink-0"
													title="Delete config"
												>
													<Trash className="w-3.5 h-3.5" />
												</button>
											</div>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}

				{/* Form Fields */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label className="text-white/90 font-medium text-sm">Campus</Label>
						<Select
							value={config.campus}
							onValueChange={(value) =>
								onConfigChange(configIndex, "campus", value)
							}
						>
							<SelectTrigger className="h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all text-white">
								<SelectValue placeholder="Select campus" />
							</SelectTrigger>
							<SelectContent className="bg-[#131010]/95 backdrop-blur-2xl border-[#F0BB78]/20 text-white">
								{Object.keys(mappings).map((campus) => (
									<SelectItem
										key={campus}
										value={campus}
										className="focus:bg-[#F0BB78]/20 focus:text-white"
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
						<Label className="text-white/90 font-medium text-sm">Year</Label>
						<Select
							value={config.year}
							onValueChange={(value) =>
								onConfigChange(configIndex, "year", value)
							}
						>
							<SelectTrigger className="h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all text-white">
								<SelectValue placeholder="Select year" />
							</SelectTrigger>
							<SelectContent className="bg-[#131010]/95 backdrop-blur-2xl border-[#F0BB78]/20 text-white">
								<SelectItem
									value="1"
									className="focus:bg-[#F0BB78]/20 focus:text-white"
								>
									1st Year
								</SelectItem>
								<SelectItem
									value="2"
									className="focus:bg-[#F0BB78]/20 focus:text-white"
								>
									2nd Year
								</SelectItem>
								<SelectItem
									value="3"
									className="focus:bg-[#F0BB78]/20 focus:text-white"
								>
									3rd Year
								</SelectItem>
								{config.campus !== "BCA" && (
									<SelectItem
										value="4"
										className="focus:bg-[#F0BB78]/20 focus:text-white"
									>
										4th Year
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label className="text-white/90 font-medium text-sm">Batch</Label>
						<Input
							type="text"
							value={config.batch}
							onChange={(e) =>
								onConfigChange(
									configIndex,
									"batch",
									e.target.value.toUpperCase()
								)
							}
							className="h-10 text-sm bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 focus:border-[#F0BB78]/50 focus:ring-[#F0BB78]/50 transition-all text-white placeholder:text-white/40"
							placeholder="Enter batch (e.g. A6 or F4)"
						/>
					</div>

					{/* Electives UI */}
					<AnimatePresence>
						{config.year && config.year !== "1" && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-3 pt-1"
							>
								<Label className="text-white/90 font-medium text-sm">
									Choose Your Subjects
								</Label>
								<Button
									type="button"
									className="w-full h-10 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 rounded-lg border border-[#F0BB78]/20"
									onClick={() => setShowSubjectModal(true)}
								>
									{selectedSubjects.length > 0
										? `Selected: ${selectedSubjects.length} subject(s)`
										: "Select Subjects"}
								</Button>
								{selectedSubjects.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{selectedSubjects.map((code) => {
											const subj = getSubjects(config.campus, config.year).find(
												(s) => s.Code === code
											);
											return (
												<div
													key={code}
													className="flex items-center gap-2 px-3 py-1.5 bg-[#F0BB78]/20 rounded-lg text-[#F0BB78] text-xs group hover:bg-[#F0BB78]/30 transition-colors border border-[#F0BB78]/20"
												>
													<span className="truncate max-w-[100px] font-medium">
														{subj?.Subject || code}
													</span>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedSubjects((prev) =>
																prev.filter((c) => c !== code)
															);
														}}
														className="text-[#F0BB78]/60 hover:text-red-400 transition-colors text-sm font-bold"
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
									subjects={getSubjects(config.campus, config.year)}
									selectedSubjects={selectedSubjects}
									setSelectedSubjects={setSelectedSubjects}
									open={showSubjectModal}
									setOpen={setShowSubjectModal}
									year={config.year}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

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

	// Saved configs state
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
	const [timetable1, setTimetable1] = useState<any>(null);
	const [timetable2, setTimetable2] = useState<any>(null);
	const [compareResult, setCompareResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const { loaded: pyodideLoaded } = usePyodideStatus();

	// Modal states for viewing individual timetables
	const [showTimetable1Modal, setShowTimetable1Modal] = useState(false);
	const [showTimetable2Modal, setShowTimetable2Modal] = useState(false);

	// Scroll ref for results
	const resultsRef = useRef<HTMLDivElement>(null);

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
				const mapping = mappings[params.campus];
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

			const args1 = getMappingAndArgs(config1);
			const args2 = getMappingAndArgs(config2);

			const [tt1, tt2] = await Promise.all([
				callTimeTableCreator(config1.campus, config1.year, args1),
				callTimeTableCreator(config2.campus, config2.year, args2),
			]);
			setTimetable1(tt1);
			setTimetable2(tt2);

			const result = await callCompareTimetables(tt1, tt2);
			setCompareResult(result);

			// Scroll to results
			setTimeout(() => {
				resultsRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			}, 100);
		} catch (e) {
			console.error("Error comparing timetables:", e);
			setCompareResult({ error: "Failed to compare timetables." });
		} finally {
			setLoading(false);
		}
	};

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

	const getSubjects = (campus: string, year: string): Subject[] => {
		if (!campus || !year) return [];
		const mapping = mappings[campus];
		return (mapping as Record<string, any>)?.[year]?.subjects || [];
	};

	// Calculate stats
	const freeSlotCount = useMemo(() => {
		if (!compareResult?.common_free_slots) return 0;
		return Object.values(compareResult.common_free_slots).reduce(
			(acc: number, slots: any) =>
				acc + (Array.isArray(slots) ? slots.length : 0),
			0
		);
	}, [compareResult]);

	const classesTogetherCount = useMemo(() => {
		if (!compareResult?.classes_together) return 0;
		return Object.values(compareResult.classes_together).reduce(
			(acc: number, slots: any) =>
				acc + (typeof slots === "object" ? Object.keys(slots).length : 0),
			0
		);
	}, [compareResult]);

	// Day ordering helper
	const allowedDays = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	const sortSlotsByTime = (slots: string[]) => {
		return [...slots].sort((a, b) => {
			const timeA = a.split("-")[0];
			const timeB = b.split("-")[0];
			const getMinutes = (time: string) => {
				const [hours, minutes] = time.split(":").map(Number);
				return hours * 60 + minutes;
			};
			return getMinutes(timeA) - getMinutes(timeB);
		});
	};

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
				{/* Header */}
				<motion.div
					className="text-center space-y-3 sm:space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-3">
						<div className="w-12 h-12 rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center">
							<Users className="w-6 h-6 text-[#F0BB78]" />
						</div>
						<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78]">
							Compare Timetables
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4 max-w-xl">
						Find when you and your friend are both free or have classes together
					</p>
				</motion.div>

				{/* Configuration Forms */}
				<motion.div
					className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<ConfigForm
						config={config1}
						configIndex={1}
						onConfigChange={handleConfigChange}
						getSubjects={getSubjects}
						selectedSubjects={selectedSubjects1}
						setSelectedSubjects={setSelectedSubjects1}
						showSubjectModal={showSubjectModal1}
						setShowSubjectModal={setShowSubjectModal1}
						mappings={mappings}
						savedConfigs={savedConfigs}
						onSelectConfig={handleSelectConfig}
						onDeleteConfig={handleDeleteConfig}
						isConfigOpen={isConfigOpen1}
						setIsConfigOpen={setIsConfigOpen1}
					/>

					<ConfigForm
						config={config2}
						configIndex={2}
						onConfigChange={handleConfigChange}
						getSubjects={getSubjects}
						selectedSubjects={selectedSubjects2}
						setSelectedSubjects={setSelectedSubjects2}
						showSubjectModal={showSubjectModal2}
						setShowSubjectModal={setShowSubjectModal2}
						mappings={mappings}
						savedConfigs={savedConfigs}
						onSelectConfig={handleSelectConfig}
						onDeleteConfig={handleDeleteConfig}
						isConfigOpen={isConfigOpen2}
						setIsConfigOpen={setIsConfigOpen2}
					/>
				</motion.div>

				{/* Compare Button */}
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
						className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-[#F0BB78]/25 rounded-xl border border-[#F0BB78]/20 group"
					>
						{loading ? (
							<span className="flex items-center gap-3">
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Comparing...
							</span>
						) : (
							<span className="flex items-center gap-3">
								<Sparkles className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
								Compare Timetables
							</span>
						)}
					</Button>
				</motion.div>

				{/* Results Section */}
				{compareResult && !compareResult.error && (
					<motion.div
						ref={resultsRef}
						className="w-full max-w-6xl space-y-6 scroll-mt-32"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{/* Comparison Results Card */}
						<div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
							<div className="bg-gradient-to-r from-[#F0BB78]/10 to-[#543A14]/10 px-6 py-5 border-b border-white/10 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<h2 className="text-xl sm:text-2xl font-bold text-[#F0BB78] flex items-center gap-3">
									<Sparkles className="w-6 h-6" />
									Comparison Results
								</h2>
								<div className="flex items-center gap-2">
									{timetable1 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowTimetable1Modal(true)}
											className="text-xs text-white/70 hover:text-white hover:bg-white/10 border border-white/10 h-8"
										>
											<Eye className="w-3 h-3 mr-2" />
											Your Schedule
										</Button>
									)}
									{timetable2 && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowTimetable2Modal(true)}
											className="text-xs text-white/70 hover:text-white hover:bg-white/10 border border-white/10 h-8"
										>
											<Eye className="w-3 h-3 mr-2" />
											Friend's Schedule
										</Button>
									)}
								</div>
							</div>

							<div className="p-4 sm:p-8 space-y-10">
								{/* Common Free Slots Section */}
								<section className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
											<Clock className="w-5 h-5 text-[#F0BB78]" />
										</div>
										<h3 className="text-xl font-bold text-white tracking-tight">
											Common Free Slots{" "}
											<span className="text-[#F0BB78]/60 ml-2 text-lg">
												({freeSlotCount})
											</span>
										</h3>
									</div>

									{Object.keys(compareResult.common_free_slots || {}).length ===
									0 ? (
										<div className="bg-white/5 rounded-2xl p-10 border border-white/10 text-center flex flex-col items-center justify-center border-dashed">
											<Clock className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
											<p className="text-slate-300/80 text-lg font-medium">
												No common free slots found.
											</p>
											<p className="text-slate-400/60 text-sm mt-1">
												Try changing your elected subjects slightly.
											</p>
										</div>
									) : (
										<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
											{Object.keys(compareResult.common_free_slots)
												.filter((day) => allowedDays.includes(day))
												.sort(
													(a, b) =>
														allowedDays.indexOf(a) - allowedDays.indexOf(b)
												)
												.map((day) => {
													const slots = sortSlotsByTime(
														compareResult.common_free_slots[day] as string[]
													);
													return (
														<div
															key={day}
															className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#F0BB78]/30 transition-colors group flex flex-col"
														>
															<div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
																<h4 className="text-sm font-bold text-[#F0BB78] uppercase tracking-widest">
																	{day}
																</h4>
																<span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-md border border-white/10">
																	{slots.length} slots
																</span>
															</div>
															<div className="p-4 flex-1">
																<div className="flex flex-wrap gap-2">
																	{slots.map((slot, i) => (
																		<span
																			key={i}
																			className="inline-flex items-center px-3 py-1.5 rounded-md bg-white/5 text-slate-300 text-xs font-medium border border-white/10 hover:bg-white/10 hover:border-[#F0BB78]/30 transition-all cursor-default"
																		>
																			{slot}
																		</span>
																	))}
																</div>
															</div>
														</div>
													);
												})}
										</div>
									)}
								</section>

								{/* Divider */}
								<div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

								{/* Classes Together Section */}
								<section className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
											<Users className="w-5 h-5 text-[#F0BB78]" />
										</div>
										<h3 className="text-xl font-bold text-white tracking-tight">
											Classes Together{" "}
											<span className="text-[#F0BB78]/60 ml-2 text-lg">
												({classesTogetherCount})
											</span>
										</h3>
									</div>

									{Object.keys(compareResult.classes_together || {}).length ===
									0 ? (
										<div className="bg-white/5 rounded-2xl p-10 border border-white/10 text-center flex flex-col items-center justify-center border-dashed">
											<Users className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
											<p className="text-slate-300/80 text-lg font-medium">
												No classes together found.
											</p>
										</div>
									) : (
										<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
											{Object.keys(compareResult.classes_together || {})
												.filter((day) => allowedDays.includes(day))
												.sort(
													(a, b) =>
														allowedDays.indexOf(a) - allowedDays.indexOf(b)
												)
												.map((day) => {
													const daySlots = compareResult.classes_together[
														day
													] as any;
													const sortedTimeSlots = Object.entries(daySlots).sort(
														([timeA], [timeB]) => {
															const startTimeA = timeA.split("-")[0];
															const startTimeB = timeB.split("-")[0];
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

													const parseClassDetails = (rawString: any) => {
														// Handle Map (Pyodide proxy) or Object
														if (rawString && typeof rawString === "object") {
															const getVal = (key: string) => {
																if (typeof rawString.get === "function") {
																	return rawString.get(key);
																}
																return rawString[key];
															};

															return {
																subject_name: String(
																	getVal("subject_name") || ""
																),
																type: String(getVal("type") || "?"),
																location: String(getVal("location") || ""),
															};
														}

														// Ensure we're working with a string for regex fallback
														const str = String(rawString || "");

														// Example format: subject_namePhysics-2typeLlocationFF1
														const nameMatch = str.match(
															/subject_name(.*?)type/
														);
														const typeMatch = str.match(/type(.*?)location/);
														const locationMatch = str.match(/location(.*)/);

														const subject_name = nameMatch ? nameMatch[1] : str;
														const type = typeMatch ? typeMatch[1] : "?";
														const location = locationMatch
															? locationMatch[1]
															: "";

														return { subject_name, type, location };
													};

													return (
														<div
															key={day}
															className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-[#F0BB78]/30 transition-colors group"
														>
															<div className="bg-[#F0BB78]/10 px-5 py-3 border-b border-white/10 flex justify-between items-center group-hover:bg-[#F0BB78]/15 transition-colors">
																<h4 className="text-sm font-bold text-[#F0BB78] uppercase tracking-widest">
																	{day}
																</h4>
																<span className="text-[10px] font-medium bg-[#F0BB78]/20 text-[#F0BB78] px-2 py-0.5 rounded-full">
																	{sortedTimeSlots.length} classes
																</span>
															</div>
															<div className="divide-y divide-white/5">
																{sortedTimeSlots.map(
																	([time, subjects]: any) => (
																		<div
																			key={time}
																			className="p-4 flex items-start gap-4 hover:bg-white/5 transition-colors"
																		>
																			<div className="shrink-0 w-24 px-2 py-1 bg-white/5 rounded text-center border border-white/10">
																				<p className="text-xs font-mono font-medium text-slate-300">
																					{time}
																				</p>
																			</div>
																			<div className="flex-1 space-y-2">
																				{(Array.isArray(subjects)
																					? subjects
																					: [subjects]
																				).map(
																					(subjStr: string, idx: number) => {
																						const info =
																							parseClassDetails(subjStr);
																						return (
																							<div
																								key={idx}
																								className="flex items-center justify-between gap-3 p-2 rounded-lg border border-white/5 bg-white/5"
																							>
																								<div className="flex flex-col min-w-0">
																									<span className="text-sm text-slate-200 font-medium truncate">
																										{info.subject_name}
																									</span>
																									{info.location && (
																										<span className="text-[10px] text-slate-500 flex items-center gap-1">
																											<div className="w-1 h-1 rounded-full bg-slate-500" />
																											{info.location}
																										</span>
																									)}
																								</div>
																								<span
																									className={`text-[10px] px-2 py-0.5 rounded border ${
																										info.type === "L"
																											? "bg-blue-500/10 text-blue-400 border-blue-500/20"
																											: info.type === "T"
																											? "bg-purple-500/10 text-purple-400 border-purple-500/20"
																											: info.type === "P"
																											? "bg-orange-500/10 text-orange-400 border-orange-500/20"
																											: "bg-slate-500/10 text-slate-400 border-slate-500/20"
																									}`}
																								>
																									{info.type === "L"
																										? "LEC"
																										: info.type === "T"
																										? "TUT"
																										: info.type === "P"
																										? "LAB"
																										: info.type}
																								</span>
																							</div>
																						);
																					}
																				)}
																			</div>
																		</div>
																	)
																)}
															</div>
														</div>
													);
												})}
										</div>
									)}
								</section>
							</div>
						</div>
					</motion.div>
				)}

				{/* Error State */}
				{compareResult && compareResult.error && (
					<motion.div
						className="w-full max-w-6xl bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 shadow-xl p-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-bold">!</span>
							</div>
							<h3 className="text-lg font-semibold text-red-400">Error</h3>
						</div>
						<p className="text-red-300 mt-2">{compareResult.error}</p>
					</motion.div>
				)}
			</div>

			{/* Timetable Modals */}
			<TimetableModal
				isOpen={showTimetable1Modal}
				onClose={() => setShowTimetable1Modal(false)}
				schedule={timetable1}
				title="Your Timetable"
				subtitle={`${
					config1.campus === "62"
						? "Campus 62"
						: config1.campus === "128"
						? "Campus 128"
						: config1.campus
				} • Year ${config1.year} • Batch ${config1.batch}`}
			/>
			<TimetableModal
				isOpen={showTimetable2Modal}
				onClose={() => setShowTimetable2Modal(false)}
				schedule={timetable2}
				title="Friend's Timetable"
				subtitle={`${
					config2.campus === "62"
						? "Campus 62"
						: config2.campus === "128"
						? "Campus 128"
						: config2.campus
				} • Year ${config2.year} • Batch ${config2.batch}`}
			/>
		</main>
	);
}
