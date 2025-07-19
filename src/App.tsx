import React, { useContext } from "react";
import {
	callPythonFunction,
	usePyodideStatus,
	initializePyodide,
} from "./utils/pyodide";
import { ScheduleForm } from "./components/schedule-form";
import { ScheduleDisplay } from "./components/schedule-display";
import { UrlParamsDialog } from "./components/url-params-dialog";
// import { AcademicCalendar } from "./components/academic-calendar";
import { motion } from "framer-motion";
import timetableMapping from "../public/data/time-table/ODD25/62.json";
import mapping128 from "../public/data/time-table/ODD25/128.json";
import { Calendar, ChevronDown, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserContext from "./context/userContext";
import {
	useQueryState,
	parseAsInteger,
	parseAsBoolean,
	parseAsString,
	parseAsArrayOf,
} from "nuqs";

interface YourTietable {
	[key: string]: {
		[key: string]: {
			subject_name: string;
			type: "L" | "T" | "P" | "C";
			location: string;
		};
	};
}

const App: React.FC = () => {
	const navigate = useNavigate();
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
		const configs = localStorage.getItem("classConfigs");
		return configs ? JSON.parse(configs) : {};
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
		return !localStorage.getItem("cachedSchedule");
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
					campus === "62" ? "time_table_creator" : "bando128_year1";
			} else {
				functionName = campus === "62" ? "time_table_creator_v2" : "banado128";
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

		const mapping = campus === "62" ? timetableMapping : mapping128;
		const subjectJSON =
			campus === "62"
				? mapping[year as keyof typeof mapping].subjects
				: mapping[year as keyof typeof mapping].subjects;
		const timeTableJSON =
			campus === "62"
				? mapping[year as keyof typeof mapping].timetable
				: mapping[year as keyof typeof mapping].timetable;

		console.log("Using mapping:", campus === "62" ? "62" : "128");
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

	// Add a ref to ensure auto-generation only runs once
	const autoGeneratedRef = React.useRef(false);

	// New useEffect to auto-generate schedule only after state is set from URL params
	React.useEffect(() => {
		// Only run if all params are present and not empty, and only once
		if (
			!autoGeneratedRef.current &&
			_year &&
			_batch &&
			_campus &&
			_selectedSubjects &&
			_selectedSubjects.length > 0
		) {
			autoGeneratedRef.current = true;
			handleFormSubmit({
				year: _year,
				batch: _batch,
				electives: _selectedSubjects,
				campus: _campus,
			});
		}
	}, [_year, _batch, _campus, _selectedSubjects]);

	// Handle URL parameters and existing cached schedule
	React.useEffect(() => {
		const cached = localStorage.getItem("cachedSchedule");

		// read params directly from URL to avoid dependency on state that could change after mount
		const urlParams = new URLSearchParams(window.location.search);
		const year = urlParams.get("year") || "";
		const batch = urlParams.get("batch") || "";
		const campus = urlParams.get("campus") || "";
		const selectedSubjects = urlParams.getAll("selectedSubjects") || [];

		const allParamsPresent = year && batch && campus;

		console.log("🌐 URL params processing:", {
			year,
			batch,
			campus,
			selectedSubjects,
			allParamsPresent,
			cached: !!cached,
		});

		if (allParamsPresent) {
			if (!cached) {
				// No cached schedule - auto generate
				handleFormSubmit({
					year,
					batch,
					electives: selectedSubjects,
					campus,
				});
			} else {
				// Cached schedule exists - show dialog

				setUrlParamsData({
					year,
					batch,
					campus,
					selectedSubjects,
				});
				setShowUrlParamsDialog(true);
			}
		}
	}, []);

	const handleUrlParamsOverride = async () => {
		if (!urlParamsData) return;

		setShowUrlParamsDialog(false);
		await handleFormSubmit({
			year: urlParamsData.year,
			batch: urlParamsData.batch,
			electives: urlParamsData.selectedSubjects,
			campus: urlParamsData.campus,
		});
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

	return (
		<main className="min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-4 sm:p-8 relative overflow-hidden">
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
						<Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#F0BB78]" />
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
										mapping={timetableMapping}
										mapping128={mapping128}
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
									navigate("/timeline");
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

			{/* <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10"> */}
			{/* Academic Calendar Component */}
			{/* <AcademicCalendar />
			</div> */}

			{/* URL Parameters Dialog */}
			{urlParamsData && (
				<UrlParamsDialog
					isOpen={showUrlParamsDialog}
					onClose={() => setShowUrlParamsDialog(false)}
					urlParams={urlParamsData}
					mapping={_campus === "62" ? timetableMapping : mapping128}
					year={_year}
					onOverride={handleUrlParamsOverride}
					onPrefill={handleUrlParamsPrefill}
					onViewExisting={handleUrlParamsViewExisting}
				/>
			)}
		</main>
	);
};

export default App;
export type { YourTietable };
