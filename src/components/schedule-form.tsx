import { useState } from "react";
import { motion } from "framer-motion";
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
import { Subject } from "../types/subject";
import { Sparkles } from "lucide-react";

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
}

export function ScheduleForm({ mapping, onSubmit }: ScheduleFormProps) {
	const [year, setYear] = useState("");
	const [batch, setBatch] = useState("");
	const [campus, setCampus] = useState("");
	const [electiveCount, setElectiveCount] = useState(0);
	const [selectedElectives, setSelectedElectives] = useState<string[]>([]);

	const handleElectiveChange = (index: number, value: string) => {
		const newElectives = [...selectedElectives];
		newElectives[index] = value;
		setSelectedElectives(newElectives);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			year,
			batch,
			electives: selectedElectives,
			campus,
		});
	};

	return (
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
								alert(
									"⚠️ Warning ⚠️ \n128 Time Table is not compltely tested yet. You may encounter bugs or errors or formating issues. You can raise a github issue for the same."
								);
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

						<div className="space-y-2">
							<Label
								htmlFor="electiveCount"
								className="text-white/90 font-medium text-sm sm:text-base"
							>
								Number of Electives
							</Label>
							<Input
								id="electiveCount"
								type="number"
								min="0"
								max="10"
								value={electiveCount}
								onChange={(e) => {
									const count = parseInt(e.target.value);
									setElectiveCount(count);
									setSelectedElectives(Array.from({ length: count }, () => ""));
								}}
								className="h-9 sm:h-10 text-sm bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
							/>
						</div>

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
									Elective {index + 1}
								</Label>
								<Select
									value={selectedElectives[index]}
									onValueChange={(value) => handleElectiveChange(index, value)}
								>
									<SelectTrigger className="h-9 sm:h-10 text-sm bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
										<SelectValue placeholder="Select elective" />
									</SelectTrigger>
									<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
										{year &&
											mapping[year]?.subjects
												?.sort((a, b) => a.Subject.localeCompare(b.Subject))
												?.map((subject) => (
													<SelectItem
														key={subject.Code}
														value={subject.Code}
														className="hover:bg-white/20"
													>
														{subject.Subject.split(" ")
															.map(
																(word) =>
																	word.charAt(0).toUpperCase() +
																	word.slice(1).toLowerCase()
															)
															.join(" ")}
													</SelectItem>
												))}
									</SelectContent>
								</Select>
							</motion.div>
						))}
					</>
				)}

				<Button
					type="submit"
					className="w-full h-9 sm:h-10 text-sm sm:text-base bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
				>
					<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
					Generate Schedule
				</Button>
			</form>
		</Card>
	);
}
