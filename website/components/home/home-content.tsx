"use client";

import React, { useContext } from "react";
import {
	callPythonFunction,
	usePyodideStatus,
	initializePyodide,
} from "../../utils/pyodide";
import { ScheduleForm } from "../schedule/schedule-form";
import { ScheduleDisplay } from "../schedule/schedule-display";
import { UrlParamsDialog } from "./url-params-dialog";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, Trash, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import UserContext from "../../context/userContext";
import {
	useQueryState,
	parseAsInteger,
	parseAsBoolean,
	parseAsString,
	parseAsArrayOf,
} from "nuqs";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { YourTietable } from "../../types";

export default function HomeContent() {
	const [timeTableData, setTimeTableData] = React.useState<any[]>([]);
	const [selectedSemester, setSelectedSemester] = React.useState<string>("");
	const [mappings, setMappings] = React.useState<Record<string, any>>({});

	React.useEffect(() => {
		fetch("/api/time-table")
			.then((res) => res.json())
			.then((data) => {
				setTimeTableData(data);
				if (data.length === 0) return;

				const now = new Date();
				const currentYear = now.getFullYear().toString().slice(-2);
				const currentMonth = now.getMonth(); // 0-11

				// Filter for semesters matching current year
				const currentYearSemesters = data.filter((d: any) =>
					d.semester.endsWith(currentYear)
				);

				if (currentYearSemesters.length === 1) {
					// If only one exists for current year, use it
					setSelectedSemester(currentYearSemesters[0].semester);
				} else if (currentYearSemesters.length > 1) {
					// If multiple exist, check month (Jan-May = EVEN, else ODD)
					const isEven = currentMonth <= 4;
					const preferredPrefix = isEven ? "EVEN" : "ODD";
					const preferred = currentYearSemesters.find((d: any) =>
						d.semester.startsWith(preferredPrefix)
					);
					if (preferred) {
						setSelectedSemester(preferred.semester);
					} else {
						setSelectedSemester(currentYearSemesters[0].semester);
					}
				} else {
					// Fallback to first available if no current year match
					setSelectedSemester(data[0].semester);
				}
			})
			.catch((err) => console.error("Failed to fetch time tables", err));
	}, []);

	React.useEffect(() => {
		if (!selectedSemester) return;
		const semesterInfo = timeTableData.find(
			(d) => d.semester === selectedSemester
		);
		if (!semesterInfo) return;

		const newMappings: Record<string, any> = {};
		const promises = semesterInfo.batches.map((batch: string) =>
			fetch(`/api/time-table/${selectedSemester}/${batch}`)
				.then((res) => res.json())
				.then((json) => {
					newMappings[batch] = json;
				})
				.catch((err) => console.error(`Failed to fetch batch ${batch}`, err))
		);
		Promise.all(promises).then(() => setMappings(newMappings));
	}, [selectedSemester, timeTableData]);
	const router = useRouter();
	const { schedule, setSchedule, setEditedSchedule } = useContext(UserContext);
	const [numExecutions, setNumExecutions] = React.useState(0);
	const [isGenerating, setIsGenerating] = useQueryState(
		"isGenerating",
		parseAsBoolean.withDefault(false)
	);
	// saved configs state
	const [savedConfigs, setSavedConfigs] = React.useState<{
		[key: string]: any;
	}>(() => {
		if (typeof window !== "undefined") {
			const configs = localStorage.getItem("classConfigs");
			return configs ? JSON.parse(configs) : {};
		}
		return {};
	});
	const [selectedConfig, setSelectedConfig] = React.useState<string>("");
	const [showUrlParamsDialog, setShowUrlParamsDialog] = React.useState(false);
	// 1. Update urlParamsData and related state/props
	const [urlParamsData, setUrlParamsData] = React.useState<{
		year: string;
		batch: string;
		campus: string;
		selectedSubjects: string[];
	} | null>(null);

	// New state to track pending auto-generation
	const [pendingAutoGeneration, setPendingAutoGeneration] = React.useState<{
		year: string;
		batch: string;
		campus: string;
		electives: string[];
	} | null>(null);
	React.useEffect(() => {
		localStorage.setItem("classConfigs", JSON.stringify(savedConfigs));
	}, [savedConfigs]);
	// cached schedule from localStorage on mount
	React.useEffect(() => {
		const cached = localStorage.getItem("cachedSchedule");
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (parsed && typeof parsed === "object") {
					setSchedule(parsed);
				}
			} catch {}
		}
	}, []);
	const initialFormOpen = React.useMemo(() => {
		if (typeof window !== "undefined") {
			return !localStorage.getItem("cachedSchedule");
		}
		return true;
	}, []);
	const [isFormOpen, setIsFormOpen] = React.useState(initialFormOpen);
	const { loaded: pyodideLoaded } = usePyodideStatus();
	// schedule to localStorage whenever it changes (and is not null)
	React.useEffect(() => {
		if (schedule && Object.keys(schedule).length > 0) {
			localStorage.setItem("cachedSchedule", JSON.stringify(schedule));
		}
	}, [schedule]);
	React.useEffect(() => {
		initializePyodide();
	}, []);
	const evaluteTimeTable = async (
		time_table_json: any,
		subject_json: any,
		batch: string,
		electives_subject_codes: any[],
		campus: string,
		year: string
	) => {
		try {
			let functionName;
			if (year === "1") {
				functionName =
					campus === "62"
						? "time_table_creator"
						: campus === "BCA"
						? "bca_creator_year1"
						: "bando128_year1";
			} else {
				functionName =
					campus === "62"
						? "time_table_creator_v2"
						: campus === "BCA"
						? "bca_creator"
						: "banado128";
			}
			console.log(functionName);
			const output = await callPythonFunction(functionName, {
				time_table_json,
				subject_json,
				batch,
				electives_subject_codes,
			});
			setNumExecutions((prev) => (typeof prev === "number" ? prev + 1 : 1));
			return output;
		} catch (error) {
			return "Error executing Python function";
		}
	};
	const handleFormSubmit = async (data: {
		year: string;
		batch: string;
		electives?: string[];
		campus: string;
		manual?: boolean;
	}) => {
		let { year, batch, electives, campus } = data;
		if (!electives) {
			electives = [];
		}
		// Clear any existing edited schedule when generating a new one
		setEditedSchedule(null);
		const mapping = mappings[campus];
		if (!mapping) return;
		const subjectJSON = mapping[year as keyof typeof mapping].subjects;
		const timeTableJSON = mapping[year as keyof typeof mapping].timetable;
		console.log(
			"Using mapping:",
			campus === "62" ? "62" : campus === "BCA" ? "BCA" : "128"
		);
		console.log("With data:", { timeTableJSON, subjectJSON, batch, electives });
		try {
			setIsGenerating(true);
			if (!pyodideLoaded) {
				await initializePyodide();
			}
			let Schedule = await evaluteTimeTable(
				timeTableJSON,
				subjectJSON,
				batch,
				electives,
				campus,
				year
			);
			if (numExecutions === 0) {
				console.log("Initial execution - running twice");
				Schedule = await evaluteTimeTable(
					timeTableJSON,
					subjectJSON,
					batch,
					electives,
					campus,
					year
				);
			}
			if (Schedule === "Error executing Python function") {
				const mockSchedule: YourTietable = {};
				const plainMockSchedule = JSON.parse(JSON.stringify(mockSchedule));
				setSchedule(plainMockSchedule);
			} else {
				const plainSchedule = JSON.parse(JSON.stringify(Schedule));
				setSchedule(plainSchedule);
			}
			localStorage.setItem(
				"cachedScheduleParams",
				JSON.stringify({
					year,
					batch,
					campus,
					selectedSubjects: electives,
				})
			);
		} catch (error) {
			console.error("Error generating schedule:", error);
			setSchedule({});
		} finally {
			setIsGenerating(false);
		}
	};
	const [_year, setYear] = useQueryState("year", parseAsString.withDefault(""));
	const [_batch, setBatch] = useQueryState(
		"batch",
		parseAsString.withDefault("")
	);
	const [_campus, setCampus] = useQueryState(
		"campus",
		parseAsString.withDefault("")
	);
	const [_electiveCount, setElectiveCount] = useQueryState(
		"electiveCount",
		parseAsInteger.withDefault(0)
	);
	const [_selectedSubjects, setSelectedSubjects] = useQueryState(
		"selectedSubjects",
		parseAsArrayOf(parseAsString).withDefault([])
	);
	// Watch for pending auto-generation and available mappings
	React.useEffect(() => {
		if (!pendingAutoGeneration) return;

		const { year, batch, campus, electives } = pendingAutoGeneration;
		const mapping = mappings[campus];

		// Check if we have the necessary mapping data
		if (mapping && mapping[year]) {
			console.log("Executing pending auto-generation");
			handleFormSubmit({
				year,
				batch,
				campus,
				electives,
			});
			setPendingAutoGeneration(null);
		}
	}, [pendingAutoGeneration, mappings]);
	// Handle URL parameters and existing cached schedule
	React.useEffect(() => {
		const cached = localStorage.getItem("cachedSchedule");
		const cachedParams = localStorage.getItem("cachedScheduleParams");
		// read params directly from URL to avoid dependency on state that could change after mount
		const urlParams = new URLSearchParams(window.location.search);
		const year = urlParams.get("year") || "";
		const batch = urlParams.get("batch") || "";
		const campus = urlParams.get("campus") || "";
		const selectedSubjectsRaw = urlParams.getAll("selectedSubjects") || [];
		const selectedSubjects = selectedSubjectsRaw
			.flatMap((s) => s.split(","))
			.map((s) => s.trim())
			.filter(Boolean);
		const allParamsPresent = year && batch && campus;
		if (allParamsPresent) {
			if (!cached) {
				// No cached schedule - auto generate
				// No cached schedule - queue auto generate
				setPendingAutoGeneration({
					year,
					batch,
					campus,
					electives: selectedSubjects,
				});
				// Also set the form state so it's visible what's happening
				setYear(year);
				setBatch(batch);
				setCampus(campus);
				setSelectedSubjects(selectedSubjects);
			} else {
				// Compare URL params to cached schedule params
				let isSame = false;
				try {
					const cachedObj = cachedParams ? JSON.parse(cachedParams) : {};
					isSame =
						cachedObj.year === year &&
						cachedObj.batch === batch &&
						cachedObj.campus === campus &&
						Array.isArray(cachedObj.selectedSubjects) &&
						Array.isArray(selectedSubjects) &&
						cachedObj.selectedSubjects.length === selectedSubjects.length &&
						cachedObj.selectedSubjects.every((s: string) =>
							selectedSubjects.includes(s)
						);
				} catch {}
				setShowUrlParamsDialog(false);
				if (!isSame) {
					setUrlParamsData({
						year,
						batch,
						campus,
						selectedSubjects,
					});
					setShowUrlParamsDialog(true);
				}
			}
		}
	}, []);
	const handleUrlParamsOverride = async () => {
		if (!urlParamsData) return;
		setShowUrlParamsDialog(false);
		setPendingAutoGeneration({
			year: urlParamsData.year,
			batch: urlParamsData.batch,
			campus: urlParamsData.campus,
			electives: urlParamsData.selectedSubjects,
		});
		// Also update form state
		setYear(urlParamsData.year);
		setBatch(urlParamsData.batch);
		setCampus(urlParamsData.campus);
		setSelectedSubjects(urlParamsData.selectedSubjects);
	};
	const handleUrlParamsPrefill = () => {
		if (!urlParamsData) return;
		// Prefill the form but don't auto-generate
		setYear(urlParamsData.year);
		setBatch(urlParamsData.batch);
		setCampus(urlParamsData.campus);
		setSelectedSubjects(urlParamsData.selectedSubjects);
		// Open the form so user can see the prefilled values
		setIsFormOpen(true);
		setShowUrlParamsDialog(false);
	};
	const handleUrlParamsViewExisting = () => {
		// Just close the dialog and view existing schedule
		setShowUrlParamsDialog(false);
	};
	const handleSelectConfig = async (name: string) => {
		const config = savedConfigs[name];
		if (!config) return;
		// Clear any existing edited schedule to ensure fresh display
		setEditedSchedule(null);
		// Set the form state first
		setYear(config.year);
		setBatch(config.batch);
		setElectiveCount(config.electiveCount || 0);
		setSelectedSubjects(config.selectedSubjects || []);
		setCampus(config.campus);
		setSelectedConfig(name);
		// Close the form after loading config
		setIsFormOpen(false);
		// Generate schedule automatically with this config
		await handleFormSubmit({
			year: config.year,
			batch: config.batch,
			electives: config.selectedSubjects || [],
			campus: config.campus,
		});
	};
	const handleSaveConfig = (name: string, configData: any) => {
		setSavedConfigs((prev) => ({ ...prev, [name]: configData }));
	};
	const [isConfigOpen, setIsConfigOpen] = React.useState(false);
	const handleDeleteConfig = (name: string) => {
		setSavedConfigs((prev) => {
			const newConfigs = { ...prev };
			delete newConfigs[name];
			return newConfigs;
		});
		if (selectedConfig === name) setSelectedConfig("");
	};
	// Add state for share dialog
	const [showShareDialog, setShowShareDialog] = React.useState(false);
	const [shareDialogConfig, setShareDialogConfig] = React.useState<{
		name: string;
		config: any;
	} | null>(null);
	return (
		<main>
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>
			<div className="relative z-10 flex flex-col items-center justify-start max-w-7xl mx-auto space-y-6 sm:space-y-8">
				<motion.div
					className="text-center space-y-3 sm:space-y-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
						<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							JIIT Schedule Creator
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4">
						Create your personalized class schedule in minutes
					</p>
				</motion.div>
				{/* Dropdown for saved configs - always visible above the form */}
				{Object.keys(savedConfigs).length > 0 && (
					<div className="mb-4 w-full max-w-xl mx-auto">
						<div className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
							<button
								onClick={() => setIsConfigOpen((prev) => !prev)}
								className="w-full flex items-center justify-between px-6 py-4 bg-transparent hover:bg-white/10 transition-all duration-200 focus:outline-none cursor-pointer select-none"
							>
								<span className="text-lg font-semibold text-[#F0BB78]">
									Load Saved Config
								</span>
								<ChevronDown
									className={`w-6 h-6 text-[#F0BB78] transition-transform duration-300 ${
										isConfigOpen ? "rotate-180" : "rotate-0"
									}`}
								/>
							</button>
							<motion.div
								initial={false}
								animate={{
									height: isConfigOpen ? "auto" : 0,
									opacity: isConfigOpen ? 1 : 0,
								}}
								style={{ overflow: "hidden" }}
								transition={{ duration: 0.4, ease: "easeInOut" }}
							>
								{isConfigOpen && (
									<div className="px-6 pb-6 pt-2 flex flex-col gap-2">
										{Object.keys(savedConfigs).map((name) => (
											<div
												key={name}
												className="flex items-center justify-between gap-2"
											>
												<button
													onClick={async () => {
														await handleSelectConfig(name);
														setIsConfigOpen(false);
													}}
													className={`flex-1 text-left px-4 py-2 rounded-lg bg-[#FFF0DC]/10 border border-[#F0BB78]/10 hover:bg-[#F0BB78]/20 text-[#F0BB78] font-medium transition-all duration-200`}
												>
													{name}
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setShareDialogConfig({
															name,
															config: savedConfigs[name],
														});
														setShowShareDialog(true);
													}}
													className="ml-2 p-1 rounded hover:bg-blue-100/20 transition-colors"
													title="Share config"
												>
													<Share2 className="w-4 h-4 text-[#F0BB78]" />
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
							</motion.div>
						</div>
					</div>
				)}{" "}
				<motion.div
					className="flex justify-center w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<div className="w-full max-w-xl bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
						<button
							onClick={() => setIsFormOpen((prev) => !prev)}
							className="w-full flex items-center justify-between px-6 py-4 bg-transparent hover:bg-white/10 transition-all duration-200 focus:outline-none cursor-pointer select-none"
						>
							<span className="text-lg font-semibold text-[#F0BB78]">
								Schedule Form
							</span>
							<ChevronDown
								className={`w-6 h-6 text-[#F0BB78] transition-transform duration-300 ${
									isFormOpen ? "rotate-180" : "rotate-0"
								}`}
							/>
						</button>
						<motion.div
							initial={false}
							animate={{
								height: isFormOpen ? "auto" : 0,
								opacity: isFormOpen ? 1 : 0,
							}}
							style={{ overflow: "hidden" }}
							transition={{ duration: 0.4, ease: "easeInOut" }}
						>
							{isFormOpen && (
								<div className="px-6 pb-6 pt-2 flex justify-center">
									<ScheduleForm
										mapping={mappings}
										campuses={Object.keys(mappings)}
										onSubmit={handleFormSubmit}
										onSaveConfig={handleSaveConfig}
										savedConfigs={savedConfigs}
										autoSubmitKey={selectedConfig}
									/>
								</div>
							)}
						</motion.div>
					</div>
				</motion.div>
				{schedule && Object.keys(schedule).length > 0 && (
					<>
						<motion.div
							className="mt-6 sm:mt-8 backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl p-0 sm:p-6 border border-white/10 shadow-xl overflow-x-auto"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
						>
							<p className="text-sm text-slate-300/60 p-4 text-center">
								Tap on any time slot to edit it, or click the + icon in each
								day's title to add new events.
							</p>
							<ScheduleDisplay schedule={schedule} />
						</motion.div>
						<div className="flex justify-center gap-4">
							<motion.button
								onClick={() => {
									router.push("/timeline");
								}}
								className="mt-4 px-6 py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 
														 text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg
														 flex items-center gap-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Calendar className="w-5 h-5" />
								<span>Timeline View</span>
							</motion.button>
						</div>
					</>
				)}
			</div>
			{/* Background effects - adjusted for mobile */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>
			{/* Loader only when generating */}
			{isGenerating && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="bg-white/10 border border-[#F0BB78]/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center"
					>
						{/* Three bouncing balls loader */}
						<div className="mb-6 flex flex-row items-end gap-2 h-10">
							{[0, 1, 2].map((i) => (
								<motion.div
									key={i}
									className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F0BB78]"
									initial={{ y: 0 }}
									animate={{ y: [0, -18, 0] }}
									transition={{
										repeat: Infinity,
										duration: 0.9,
										ease: "easeInOut",
										delay: i * 0.15,
									}}
								/>
							))}
						</div>
						<p className="text-lg font-semibold text-[#F0BB78] mb-1">
							Generating your schedule...
						</p>
						<p className="text-slate-200/80 text-sm">
							This may take a few seconds
						</p>
					</motion.div>
				</motion.div>
			)}
			{/* URL Parameters Dialog */}
			{urlParamsData && (
				<UrlParamsDialog
					isOpen={showUrlParamsDialog}
					onClose={() => setShowUrlParamsDialog(false)}
					urlParams={urlParamsData}
					mapping={mappings[_campus]}
					year={_year}
					onOverride={handleUrlParamsOverride}
					onPrefill={handleUrlParamsPrefill}
					onViewExisting={handleUrlParamsViewExisting}
				/>
			)}
			{/* Share Config Dialog */}
			{showShareDialog && shareDialogConfig && (
				<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
					<DialogContent className="max-w-md bg-white/10 backdrop-blur-xl border border-white/20 text-white">
						<div className="space-y-6">
							{/* Header with icon */}
							<div className="text-center space-y-3">
								<div className="w-16 h-16 mx-auto rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center">
									<svg
										className="w-8 h-8 text-[#F0BB78]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
										/>
									</svg>
								</div>
								<div>
									<DialogTitle className="text-xl font-bold text-[#F0BB78] mb-1">
										Share Configuration
									</DialogTitle>
									<DialogDescription className="text-slate-300/80">
										Share "{shareDialogConfig.name}" with others
									</DialogDescription>
								</div>
							</div>
							{/* URL Input Section */}
							<div className="space-y-3">
								<label className="text-sm font-medium text-[#F0BB78]/90 block">
									Shareable Link
								</label>
								<div className="relative">
									<input
										type="text"
										readOnly
										value={(() => {
											const { year, batch, campus, selectedSubjects } =
												shareDialogConfig.config;
											const params = new URLSearchParams({
												year,
												batch,
												campus,
												selectedSubjects: (selectedSubjects || []).join(","),
											});
											return `${window.location.origin}${
												window.location.pathname
											}?${params.toString()}`;
										})()}
										className="w-full px-4 py-3 pr-12 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F0BB78]/50 focus:border-[#F0BB78]/50 transition-all"
										onFocus={(e) => e.target.select()}
									/>
									<button
										className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 transition-colors group"
										onClick={async () => {
											const { year, batch, campus, selectedSubjects } =
												shareDialogConfig.config;
											const params = new URLSearchParams({
												year,
												batch,
												campus,
												selectedSubjects: (selectedSubjects || []).join(","),
											});
											const url = `${window.location.origin}${
												window.location.pathname
											}?${params.toString()}`;
											try {
												await navigator.clipboard.writeText(url);
											} catch (err) {
												// Fallback for older browsers
												const input = document.querySelector(
													"input[type='text'][readonly]"
												) as HTMLInputElement;
												if (input) {
													input.select();
													document.execCommand("copy");
												}
											}
										}}
										title="Copy to clipboard"
									>
										<svg
											className="w-4 h-4 text-slate-400 group-hover:text-[#F0BB78] transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
											/>
										</svg>
									</button>
								</div>
							</div>
							{/* Action Buttons */}
							<div className="flex gap-3 pt-2">
								<button
									onClick={() => setShowShareDialog(false)}
									className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
									Cancel
								</button>
								<button
									className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#F0BB78] hover:bg-[#e0a85c] rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
									onClick={async () => {
										const { year, batch, campus, selectedSubjects } =
											shareDialogConfig.config;
										const params = new URLSearchParams({
											year,
											batch,
											campus,
											selectedSubjects: (selectedSubjects || []).join(","),
										});
										const url = `${window.location.origin}${
											window.location.pathname
										}?${params.toString()}`;
										try {
											await navigator.clipboard.writeText(url);
											// Optional: Show a toast or success message
										} catch (err) {
											console.error("Failed to copy:", err);
										}
										setShowShareDialog(false);
									}}
								>
									<Share2 className="w-4 h-4" />
									Share
								</button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</main>
	);
}
