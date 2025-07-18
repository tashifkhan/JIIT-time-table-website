import React from "react";
import { useState, useContext, useEffect, useRef } from "react";
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

import { Sparkles } from "lucide-react";
import UserContext from "../context/userContext";
import {
	useQueryState,
	parseAsString,
	parseAsInteger,
	parseAsArrayOf,
} from "nuqs";

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
	mapping128: {
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
		manual?: boolean;
	}) => void;
	onSaveConfig?: (name: string, configData: any) => void;
	savedConfigs?: { [key: string]: any };
	autoSubmitKey?: string;
	useLocalState?: boolean;
}

interface Subject {
	Code: string;
	"Full Code"?: string;
	"Subject "?: string;
	Subject?: string;
}

export function ScheduleForm({
	mapping,
	mapping128,
	onSubmit,
	onSaveConfig,
	savedConfigs,
	autoSubmitKey,
	useLocalState = false,
}: ScheduleFormProps) {
	const { setEditedSchedule } = useContext(UserContext);

	// State hooks for local or query state
	const _year = useLocalState
		? React.useState("")
		: useQueryState("year", parseAsString.withDefault(""));
	const [year, setYear] = _year;
	const _batch = useLocalState
		? React.useState("")
		: useQueryState("batch", parseAsString.withDefault(""));
	const [batch, setBatch] = _batch;
	const _campus = useLocalState
		? React.useState("")
		: useQueryState("campus", parseAsString.withDefault(""));
	const [campus, setCampus] = _campus;
	const _electiveCount = useLocalState
		? React.useState(0)
		: useQueryState("electiveCount", parseAsInteger.withDefault(0));
	const [electiveCount, setElectiveCount] = _electiveCount;
	const _selectedElectives = useLocalState
		? React.useState<string[]>([])
		: useQueryState(
				"selectedElectives",
				parseAsArrayOf(parseAsString).withDefault([])
		  );
	const [selectedElectives, setSelectedElectives] = _selectedElectives;
	const [isGenerating, setIsGenerating] = useState(false);

	// Modal state
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [saveName, setSaveName] = useState("");
	const [saveError, setSaveError] = useState("");

	const handleElectiveChange = (index: number, value: string) => {
		const newElectives = [...selectedElectives];
		newElectives[index] = value;
		setSelectedElectives(newElectives);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setEditedSchedule(null);
		setIsGenerating(true);
		try {
			await onSubmit({
				year,
				batch,
				electives: selectedElectives,
				campus,
				manual: true,
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const [mapz, setMapz] = useState(mapping);

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
			electiveCount,
			selectedElectives,
			campus,
		};
		if (onSaveConfig) {
			onSaveConfig(saveName, configData);
		}
		setShowSaveModal(false);
		setSaveName("");
		setSaveError("");
	};

	const prevAutoSubmitKey = useRef<string | undefined>(undefined);

	// Update form state when a config is loaded
	useEffect(() => {
		if (autoSubmitKey && savedConfigs && savedConfigs[autoSubmitKey]) {
			const config = savedConfigs[autoSubmitKey];
			setYear(config.year);
			setBatch(config.batch);
			setCampus(config.campus);
			setElectiveCount(config.electiveCount);
			setSelectedElectives(config.selectedElectives);
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
			selectedElectives !== undefined // allow empty array
		) {
			onSubmit({
				year,
				batch,
				electives: selectedElectives,
				campus,
				manual: false,
			});
			prevAutoSubmitKey.current = autoSubmitKey;
		}
	}, [autoSubmitKey, year, batch, campus, selectedElectives, onSubmit]);

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
								if (value === "128") {
									setMapz(mapping128);
									// alert(
									// 	"⚠️ Warning ⚠️ \n128 Time Table is not compltely tested yet. You may encounter bugs or errors or formating issues. You can raise a github issue for the same."
									// );
								}
							}}
						>
							<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
								<SelectValue placeholder="Select campus" />
							</SelectTrigger>
							<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
								<SelectItem value="62">62</SelectItem>
								<SelectItem value="128">128</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{campus && (
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
										{[1, 2, 3].map((yr) => (
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
										if (campus === "62") {
											if (value.match(/^[DF]|BBA|BCA|BSC|MCA|MBA|^[E]/)) {
												alert("62 campus only allows A, B, C and G batches.");
												return;
											}
										} else if (campus === "128") {
											if (!value.match(/^[EF]/)) {
												alert("128 campus only allows E and F batches.");
												return;
											}
										}
										setBatch(value);
									}}
									placeholder={`Enter your batch (e.g., ${
										campus === "62" ? "A6" : "F4"
									})`}
									className="h-9 sm:h-10 text-sm bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
								/>
							</div>

							{year && year != "1" && (
								<div className="space-y-2">
									<Label
										htmlFor="electiveCount"
										className="text-white/90 font-medium text-sm sm:text-base"
									>
										{campus === "128"
											? "Number of Subjects"
											: "Number of Electives"}
									</Label>
									{campus === "128" && (
										<p className="text-sm text-slate-300/50 italic">
											If you {"don't"} remember the exact number just enter 20
											and select only the ones you need
										</p>
									)}
									<Input
										id="electiveCount"
										type="number"
										min="0"
										max="20"
										value={electiveCount}
										onChange={(e) => {
											const count = parseInt(e.target.value);
											setElectiveCount(count);
											setSelectedElectives(
												Array.from({ length: count }, () => "")
											);
										}}
										className="h-9 sm:h-10 text-sm bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
									/>
								</div>
							)}

							{Array.from({ length: electiveCount }).map((_, index) => (
								<motion.div
									key={index}
									className="space-y-2"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: index * 0.1 }}
								>
									<Label
										htmlFor={`elective-${index}`}
										className="text-white/90 font-medium text-sm sm:text-base"
									>
										{campus === "128"
											? `Subject ${index + 1}`
											: `Elective ${index + 1}`}
									</Label>
									<Select
										value={selectedElectives[index]}
										onValueChange={(value) =>
											handleElectiveChange(index, value)
										}
									>
										<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
											<SelectValue
												placeholder={`${
													campus === "128"
														? `Select Subject ${index + 1}`
														: `Select Elective ${index + 1}`
												}`}
											/>
										</SelectTrigger>
										<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
											{year &&
												mapz[year]?.subjects &&
												[...mapz[year].subjects]
													.sort((a, b) =>
														(a?.Subject || "").localeCompare(b?.Subject || "")
													)
													.map(
														(subject) =>
															subject && (
																<SelectItem
																	key={subject.Code}
																	value={subject.Code}
																	className="hover:bg-white/20"
																>
																	{subject.Subject?.match(/^[A-Z\s]+$/)
																		? subject.Subject.replace(
																				/\w\S*/g,
																				(txt) =>
																					txt.charAt(0).toUpperCase() +
																					txt.substr(1).toLowerCase()
																		  )
																		: subject.Subject}
																</SelectItem>
															)
													)}
										</SelectContent>
									</Select>
								</motion.div>
							))}
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
							className="w-[50%] h-9 sm:h-10 text-sm sm:text-base bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
							onClick={() => setShowSaveModal(true)}
						>
							Save Class Config
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
							className="bg-white/10 border border-[#F0BB78]/20 rounded-2xl shadow-2xl p-8 flex flex-col items-center"
						>
							<h2 className="text-lg font-semibold text-[#F0BB78] mb-4">
								Save Class Config
							</h2>
							<Input
								type="text"
								placeholder="Enter a name for this config"
								value={saveName}
								onChange={(e) => {
									setSaveName(e.target.value);
									setSaveError("");
								}}
								className="mb-2"
							/>
							{saveError && (
								<p className="text-red-400 text-sm mb-2">{saveError}</p>
							)}
							<div className="flex gap-3 mt-2">
								<Button onClick={handleSaveConfig} type="button">
									Save
								</Button>
								<Button
									onClick={() => setShowSaveModal(false)}
									type="button"
									variant="ghost"
								>
									Cancel
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
