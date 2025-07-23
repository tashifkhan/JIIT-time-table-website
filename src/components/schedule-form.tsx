import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Fuse from "fuse.js";

import { Sparkles, Save } from "lucide-react";
import UserContext from "../context/userContext";
import { useQueryState, parseAsString, parseAsArrayOf } from "nuqs";
import { useToast } from "../hooks/use-toast";

export interface Subject {
	Code: string;
	"Full Code"?: string;
	"Subject "?: string;
	Subject?: string;
}

interface SubjectSelectorProps {
	subjects: Subject[];
	selectedSubjects: string[];
	setSelectedSubjects: (fn: (prev: string[]) => string[]) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	year: string;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
	subjects,
	selectedSubjects,
	setSelectedSubjects,
	open,
	setOpen,
	year,
}) => {
	const [subjectSearch, setSubjectSearch] = useState("");
	const fuse = useMemo(() => {
		if (!year || !subjects) return null;
		return new Fuse(subjects, {
			keys: [
				{ name: "Subject", weight: 0.7 },
				{ name: "Code", weight: 0.3 },
				{ name: "Full Code", weight: 0.2 },
			],
			threshold: 0.4,
			includeScore: true,
			shouldSort: true,
			findAllMatches: true,
			minMatchCharLength: 2,
		});
	}, [year, subjects]);

	const filteredSubjects = useMemo(() => {
		if (!year || !subjects) return [];
		if (!subjectSearch.trim()) {
			return subjects.sort((a, b) =>
				(a?.Subject || "").localeCompare(b?.Subject || "")
			);
		}
		const searchTerm = subjectSearch.toLowerCase();
		const allSubjects = subjects;
		const exactMatches = allSubjects.filter((subject) => {
			const subjectName = (subject.Subject || "").toLowerCase();
			const subjectCode = subject.Code.toLowerCase();
			const fullCode = (subject["Full Code"] || "").toLowerCase();
			return (
				subjectName.includes(searchTerm) ||
				subjectCode.includes(searchTerm) ||
				fullCode.includes(searchTerm)
			);
		});
		const fuzzyResults = fuse
			? fuse.search(subjectSearch).map((result) => result.item)
			: [];
		const exactMatchCodes = new Set(exactMatches.map((s) => s.Code));
		const uniqueFuzzyMatches = fuzzyResults.filter(
			(subject) => !exactMatchCodes.has(subject.Code)
		);
		const sortedExactMatches = exactMatches.sort((a, b) => {
			const aSubject = (a.Subject || "").toLowerCase();
			const bSubject = (b.Subject || "").toLowerCase();
			const aCode = a.Code.toLowerCase();
			const bCode = b.Code.toLowerCase();
			const aStartsWithSubject = aSubject.startsWith(searchTerm);
			const bStartsWithSubject = bSubject.startsWith(searchTerm);
			const aStartsWithCode = aCode.startsWith(searchTerm);
			const bStartsWithCode = bCode.startsWith(searchTerm);
			if (aStartsWithSubject && !bStartsWithSubject) return -1;
			if (!aStartsWithSubject && bStartsWithSubject) return 1;
			if (aStartsWithCode && !bStartsWithCode) return -1;
			if (!aStartsWithCode && bStartsWithCode) return 1;
			return aSubject.localeCompare(bSubject);
		});
		return [...sortedExactMatches, ...uniqueFuzzyMatches];
	}, [year, subjects, subjectSearch, fuse]);

	const handleSubjectToggle = (code: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				className="p-0 sm:p-6 max-w-full w-full sm:max-w-lg h-[100dvh] sm:h-auto flex flex-col"
				style={{ maxHeight: "100dvh" }}
			>
				<div className="sticky top-0 z-10 bg-background/90 border-b border-[#F0BB78]/10 px-4 py-3 flex items-center gap-2">
					<DialogHeader className="flex-1">
						<DialogTitle className="text-base sm:text-lg">
							Select Subjects
							<span className="ml-2 text-xs text-[#F0BB78]">
								{selectedSubjects.length} selected
							</span>
							{subjectSearch && (
								<span className="ml-2 text-xs text-slate-400">
									• {filteredSubjects.length} found
								</span>
							)}
						</DialogTitle>
					</DialogHeader>
					<Button
						variant="ghost"
						size="sm"
						className="text-[#F0BB78] px-2 py-1"
						onClick={() => setOpen(false)}
					>
						Done
					</Button>
				</div>
				<div className="px-4 pt-2 pb-2 flex gap-2 items-center sticky top-[48px] bg-background/90 z-10">
					<Input
						placeholder="Search by subject name or code... (exact + fuzzy search)"
						value={subjectSearch}
						onChange={(e) => setSubjectSearch(e.target.value)}
						className="flex-1"
						autoFocus
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="ml-2 text-xs px-3 py-2"
						onClick={() => setSelectedSubjects(() => [])}
						disabled={selectedSubjects.length === 0}
					>
						Clear All
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
					{filteredSubjects.map((subject) => {
						const searchTerm = subjectSearch.toLowerCase();
						const isExactMatch =
							searchTerm &&
							((subject.Subject || "").toLowerCase().includes(searchTerm) ||
								subject.Code.toLowerCase().includes(searchTerm) ||
								(subject["Full Code"] || "")
									.toLowerCase()
									.includes(searchTerm));
						return (
							<div
								key={subject.Code}
								className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
									selectedSubjects.includes(subject.Code)
										? "bg-[#F0BB78]/30 border border-[#F0BB78]/40"
										: "hover:bg-[#F0BB78]/10"
								}`}
								onClick={() => handleSubjectToggle(subject.Code)}
							>
								<input
									type="checkbox"
									checked={selectedSubjects.includes(subject.Code)}
									readOnly
									className="accent-[#F0BB78] w-5 h-5"
								/>
								<div className="flex flex-col flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm truncate font-medium text-white/90">
											{subject.Subject}
										</span>
										{isExactMatch && searchTerm && (
											<span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
												exact
											</span>
										)}
									</div>
									<span className="text-xs text-[#F0BB78] truncate">
										{subject.Code}
									</span>
								</div>
								{selectedSubjects.includes(subject.Code) && (
									<span className="text-xs text-[#F0BB78] font-semibold">
										Selected
									</span>
								)}
							</div>
						);
					})}
					{filteredSubjects.length === 0 && (
						<div className="text-center text-slate-400 py-8">
							No subjects found.
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

interface ScheduleFormProps {
	mapping: {
		[key: string]: {
			timetable: {
				[day: string]: {
					[time: string]: string[];
				};
			};
			subjects: Subject[];
		};
	};
	onSubmit: (data: {
		year: string;
		batch: string;
		electives: string[];
		campus: string;
	}) => void;
	onSaveConfig?: (name: string, configData: any) => void;
	savedConfigs?: { [key: string]: any };
	autoSubmitKey?: string;
}

export function ScheduleForm({
	mapping,
	onSubmit,
	onSaveConfig,
	savedConfigs,
	autoSubmitKey,
}: ScheduleFormProps) {
	const { setEditedSchedule } = useContext(UserContext);
	const [year, setYear] = useQueryState("year", parseAsString.withDefault(""));
	const [batch, setBatch] = useQueryState(
		"batch",
		parseAsString.withDefault("")
	);
	const [campus, setCampus] = useQueryState(
		"campus",
		parseAsString.withDefault("")
	);
	const [selectedSubjects, setSelectedSubjects] = useQueryState(
		"selectedSubjects",
		parseAsArrayOf(parseAsString).withDefault([])
	);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [saveName, setSaveName] = useState("");
	const [saveError, setSaveError] = useState("");
	const [showSubjectModal, setShowSubjectModal] = useState(false);
	const [_subjectSearch, setSubjectSearch] = useState("");
	const [mapz, setMapz] = useState(mapping);
	const { toast } = useToast();
	const [batchError, setBatchError] = useState("");
	const [showBatchErrorDialog, setShowBatchErrorDialog] = useState(false);

	useEffect(() => {
		setMapz(mapping);
	}, [mapping]);

	// Initialize Fuse.js for fuzzy search
	// const fuse = useMemo(() => {
	// 	if (!year || !mapz[year]?.subjects) return null;

	// 	return new Fuse(mapz[year].subjects, {
	// 		keys: [
	// 			{ name: "Subject", weight: 0.7 },
	// 			{ name: "Code", weight: 0.3 },
	// 			{ name: "Full Code", weight: 0.2 },
	// 		],
	// 		threshold: 0.4, // More lenient threshold for better fuzzy matching
	// 		includeScore: true,
	// 		shouldSort: true,
	// 		findAllMatches: true,
	// 		minMatchCharLength: 2,
	// 	});
	// }, [year, mapz]);

	// // Filter subjects based on search - combining regular and fuzzy search
	// const filteredSubjects = useMemo(() => {
	// 	if (!year || !mapz[year]?.subjects) return [];

	// 	if (!subjectSearch.trim()) {
	// 		return mapz[year].subjects.sort((a, b) =>
	// 			(a?.Subject || "").localeCompare(b?.Subject || "")
	// 		);
	// 	}

	// 	const searchTerm = subjectSearch.toLowerCase();
	// 	const allSubjects = mapz[year].subjects;

	// 	// Regular search - exact matches first
	// 	const exactMatches = allSubjects.filter((subject) => {
	// 		const subjectName = (subject.Subject || "").toLowerCase();
	// 		const subjectCode = subject.Code.toLowerCase();
	// 		const fullCode = (subject["Full Code"] || "").toLowerCase();

	// 		return (
	// 			subjectName.includes(searchTerm) ||
	// 			subjectCode.includes(searchTerm) ||
	// 			fullCode.includes(searchTerm)
	// 		);
	// 	});

	// 	// Fuzzy search for non-exact matches
	// 	const fuzzyResults = fuse
	// 		? fuse.search(subjectSearch).map((result) => result.item)
	// 		: [];

	// 	// Combine results: exact matches first, then fuzzy matches that aren't already included
	// 	const exactMatchCodes = new Set(exactMatches.map((s) => s.Code));
	// 	const uniqueFuzzyMatches = fuzzyResults.filter(
	// 		(subject) => !exactMatchCodes.has(subject.Code)
	// 	);

	// 	// Sort exact matches by relevance (starts with search term gets priority)
	// 	const sortedExactMatches = exactMatches.sort((a, b) => {
	// 		const aSubject = (a.Subject || "").toLowerCase();
	// 		const bSubject = (b.Subject || "").toLowerCase();
	// 		const aCode = a.Code.toLowerCase();
	// 		const bCode = b.Code.toLowerCase();

	// 		// Prioritize matches that start with the search term
	// 		const aStartsWithSubject = aSubject.startsWith(searchTerm);
	// 		const bStartsWithSubject = bSubject.startsWith(searchTerm);
	// 		const aStartsWithCode = aCode.startsWith(searchTerm);
	// 		const bStartsWithCode = bCode.startsWith(searchTerm);

	// 		if (aStartsWithSubject && !bStartsWithSubject) return -1;
	// 		if (!aStartsWithSubject && bStartsWithSubject) return 1;
	// 		if (aStartsWithCode && !bStartsWithCode) return -1;
	// 		if (!aStartsWithCode && bStartsWithCode) return 1;

	// 		return aSubject.localeCompare(bSubject);
	// 	});

	// 	return [...sortedExactMatches, ...uniqueFuzzyMatches];
	// }, [year, mapz, subjectSearch, fuse]);

	const handleSubjectToggle = (code: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		let error = "";
		if (campus === "62") {
			if (batch.match(/^[DFH]|BBA|BCA|BSC|MCA|MBA|^[E]/)) {
				error = "62 campus only allows A, B, C, G, and H batches.";
			}
		} else if (campus === "128") {
			if (!batch.match(/^[EFGH]/)) {
				error = "128 campus only allows E, F, G, and H batches.";
			}
		} else if (campus === "BCA") {
			if (!batch.match(/^BCA\d*$/)) {
				error = "BCA campus only allows batches like BCA1, BCA2, etc.";
			}
		}
		if (error) {
			setBatchError(error);
			setShowBatchErrorDialog(true);
			return;
		} else {
			setBatchError("");
		}
		setEditedSchedule(null);
		setIsGenerating(true);
		try {
			await onSubmit({
				year,
				batch,
				electives: selectedSubjects,
				campus,
			});
		} finally {
			setIsGenerating(false);
		}
	};

	// Handle save config
	const handleSaveConfig = () => {
		if (!saveName.trim()) {
			setSaveError("Please enter a name");
			return;
		}
		if (savedConfigs && savedConfigs[saveName]) {
			setSaveError("A config with this name already exists");
			return;
		}
		const configData = {
			year,
			batch,
			campus,
			selectedSubjects,
		};
		if (onSaveConfig) {
			onSaveConfig(saveName, configData);
		}
		setShowSaveModal(false);
		setSaveName("");
		setSaveError("");
		toast({
			title: "Class config saved!",
			description: `Saved as '${saveName.trim()}'`,
		});
	};

	const prevAutoSubmitKey = useRef<string | undefined>(undefined);

	// Update form state when a config is loaded
	useEffect(() => {
		if (autoSubmitKey && savedConfigs && savedConfigs[autoSubmitKey]) {
			const config = savedConfigs[autoSubmitKey];
			setYear(config.year);
			setBatch(config.batch);
			setCampus(config.campus);
			setSelectedSubjects(config.selectedSubjects || []);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoSubmitKey]);

	// Auto-submit when config changes, even if electives is empty
	useEffect(() => {
		if (
			autoSubmitKey &&
			autoSubmitKey !== prevAutoSubmitKey.current &&
			year &&
			batch &&
			campus &&
			selectedSubjects !== undefined // allow empty array
		) {
			onSubmit({
				year,
				batch,
				electives: selectedSubjects,
				campus,
			});
			prevAutoSubmitKey.current = autoSubmitKey;
		}
	}, [autoSubmitKey, year, batch, campus, selectedSubjects, onSubmit]);

	const isFormValid =
		year &&
		batch &&
		campus &&
		(year === "1" || selectedSubjects.length > 0 || year === "1");

	return (
		<>
			<AnimatePresence>
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
							<motion.div
								className="mb-4"
								initial={{ rotate: 0 }}
								animate={{ rotate: 360 }}
								transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
							>
								<Sparkles className="w-10 h-10 text-[#F0BB78]" />
							</motion.div>
							<p className="text-lg font-semibold text-[#F0BB78] mb-1">
								Generating your schedule...
							</p>
							<p className="text-slate-200/80 text-sm">
								This may take a few seconds
							</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<Card className="w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6 backdrop-blur-2xl bg-[#FFF0DC]/10 border border-[#F0BB78]/20 shadow-2xl rounded-xl">
				<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
					<div className="space-y-2">
						<Label
							htmlFor="campus"
							className="text-white/90 font-medium text-sm sm:text-base"
						>
							Campus
						</Label>
						<Select
							value={campus}
							onValueChange={(value) => {
								setCampus(value);
							}}
						>
							<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
								<SelectValue placeholder="Select campus" />
							</SelectTrigger>
							<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
								<SelectItem value="62">62</SelectItem>
								<SelectItem value="128">128</SelectItem>
								<SelectItem value="BCA">BCA</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{campus && typeof campus === "string" && (
						<>
							<div className="space-y-2">
								<Label
									htmlFor="year"
									className="text-white/90 font-medium text-sm sm:text-base"
								>
									Year
								</Label>
								<Select value={year} onValueChange={setYear}>
									<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
										<SelectValue placeholder="Select year" />
									</SelectTrigger>
									<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
										{(campus !== "BCA" ? [1, 2, 3, 4] : [1, 2, 3]).map((yr) => (
											<SelectItem
												key={yr}
												value={yr.toString()}
												className="hover:bg-white/20"
											>
												Year {yr}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="batch"
									className="text-white/90 font-medium text-sm sm:text-base"
								>
									Batch
								</Label>
								<Input
									id="batch"
									value={batch}
									onChange={(e) => {
										const value = e.target.value.toUpperCase();
										setBatch(value);
									}}
									placeholder={`Enter your batch (e.g., ${
										campus === "62"
											? "A6"
											: campus === "128"
											? "F4"
											: campus === "BCA"
											? "BCA1"
											: "Batch"
									})`}
									className="h-9 sm:h-10 text-sm bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
								/>
								{batchError && (
									<p className="text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 rounded px-2 py-1 mt-1 mb-0.5">
										{batchError}
									</p>
								)}
							</div>

							{typeof year === "string" && year !== "1" && (
								<div className="space-y-2">
									<Label className="text-white/90 font-medium text-sm sm:text-base">
										Choose Your Subjects
									</Label>
									<Button
										type="button"
										className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
										onClick={() => {
											setSubjectSearch(""); // Clear search when opening modal
											setShowSubjectModal(true);
										}}
									>
										{selectedSubjects.length > 0
											? `Selected: ${selectedSubjects.length} subject(s)`
											: "Select Subjects"}
									</Button>
									<div className="flex flex-wrap gap-2 mt-2">
										{selectedSubjects.map((code) => {
											const subj = (mapz?.[year]?.subjects ?? []).find(
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
															handleSubjectToggle(code);
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
								</div>
							)}
						</>
					)}

					<div className="flex justify-center gap-2">
						<Button
							type="submit"
							className="w-full h-9 sm:h-10 text-sm sm:text-base bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
						>
							<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
							Generate Schedule
						</Button>
						<Button
							type="button"
							disabled={!isFormValid}
							title={
								!isFormValid
									? "Fill all fields to save config"
									: "Save this class config for later"
							}
							className="w-[50%] h-9 sm:h-10 text-sm sm:text-base bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => setShowSaveModal(true)}
						>
							<Save className="w-4 h-4 mr-1" />
							Save
						</Button>
					</div>
				</form>
			</Card>

			{/* Modal for saving config */}
			<AnimatePresence>
				{showSaveModal && (
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
							className="bg-gradient-to-br from-[#FFF0DC]/30 to-[#F0BB78]/10 border border-[#F0BB78]/30 rounded-2xl shadow-2xl p-0 sm:p-0 w-[90vw] max-w-sm flex flex-col items-center"
						>
							<div className="w-full flex flex-col items-center p-6 pb-4 border-b border-[#F0BB78]/20 bg-[#FFF0DC]/10 rounded-t-2xl">
								<div className="flex items-center gap-2 mb-2">
									<Save className="w-6 h-6 text-[#F0BB78]" />
									<h2 className="text-lg font-semibold text-[#F0BB78]">
										Save Class Config
									</h2>
								</div>
								<p className="text-xs text-slate-400 text-center max-w-xs">
									Give a memorable name to this configuration so you can quickly
									load it later.
								</p>
							</div>
							<div className="w-full flex flex-col gap-3 p-6 pt-4">
								<Label
									htmlFor="save-config-name"
									className="text-sm text-white/80 mb-1"
								>
									Config Name
								</Label>
								<Input
									id="save-config-name"
									type="text"
									placeholder="Enter a name for this config"
									value={saveName}
									onChange={(e) => {
										setSaveName(e.target.value);
										setSaveError("");
									}}
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSaveConfig();
									}}
									className="mb-0 bg-white/10 border-white/20 focus:border-[#F0BB78] focus:ring-[#F0BB78]/30 transition-all"
								/>
								{saveError && (
									<p className="text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 rounded px-2 py-1 mt-1 mb-0.5">
										{saveError}
									</p>
								)}
								<div className="flex gap-3 mt-2 w-full">
									<Button
										onClick={handleSaveConfig}
										type="button"
										className="flex-1 bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 shadow-md"
									>
										<Save className="w-4 h-4 mr-1" /> Save
									</Button>
									<Button
										onClick={() => setShowSaveModal(false)}
										type="button"
										variant="ghost"
										className="flex-1 border border-[#F0BB78]/30 text-[#F0BB78] hover:bg-[#F0BB78]/10"
									>
										Cancel
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Modal for subject selection */}
			<SubjectSelector
				subjects={mapz?.[year]?.subjects || []}
				selectedSubjects={selectedSubjects}
				setSelectedSubjects={setSelectedSubjects}
				open={showSubjectModal}
				setOpen={setShowSubjectModal}
				year={year}
			/>

			{/* Modal for batch error */}
			{showBatchErrorDialog && (
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
						className="bg-gradient-to-br from-red-400/20 to-red-400/10 border border-red-400/30 rounded-2xl shadow-2xl p-0 sm:p-0 w-[90vw] max-w-sm flex flex-col items-center"
					>
						<div className="w-full flex flex-col items-center p-6 pb-4 border-b border-red-400/20 bg-red-400/10 rounded-t-2xl">
							<h2 className="text-lg font-semibold text-red-400">
								Batch Error
							</h2>
						</div>
						<div className="w-full flex flex-col gap-3 p-6 pt-4">
							<p className="text-red-400 text-sm font-medium text-center">
								{batchError}
							</p>
							<Button
								onClick={() => setShowBatchErrorDialog(false)}
								type="button"
								variant="ghost"
								className="flex-1 border border-red-400/30 text-red-400 hover:bg-red-400/10 mt-4"
							>
								OK
							</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</>
	);
}
