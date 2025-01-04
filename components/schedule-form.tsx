"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "../types/schedule";
import { Sparkles } from "lucide-react";

interface ScheduleFormProps {
	subjects: Subject[];
	onSubmit: (data: {
		year: string;
		batch: string;
		electives: string[];
	}) => void;
}

export function ScheduleForm({ subjects, onSubmit }: ScheduleFormProps) {
	const [year, setYear] = useState("");
	const [batch, setBatch] = useState("");
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
		});
	};

	return (
		<Card className="w-full max-w-md p-6 backdrop-blur-2xl bg-[#FFF0DC]/10 border border-[#F0BB78]/20 shadow-2xl rounded-xl">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="year" className="text-white/90 font-medium">
						Year
					</Label>
					<Select value={year} onValueChange={setYear}>
						<SelectTrigger className="bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
							<SelectValue placeholder="Select year" />
						</SelectTrigger>
						<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
							{[1, 2, 3, 4].map((yr) => (
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
					<Label htmlFor="batch" className="text-white/90 font-medium">
						Batch
					</Label>
					<Input
						id="batch"
						value={batch}
						onChange={(e) => setBatch(e.target.value)}
						placeholder="Enter your batch (e.g., B3)"
						className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="electiveCount" className="text-white/90 font-medium">
						Number of Electives
					</Label>
					<Input
						id="electiveCount"
						type="number"
						min="0"
						max="5"
						value={electiveCount}
						onChange={(e) => {
							const count = parseInt(e.target.value);
							setElectiveCount(count);
							setSelectedElectives(Array.from({ length: count }, () => ""));
						}}
						className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all"
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
							className="text-white/90 font-medium"
						>
							Elective {index + 1}
						</Label>
						<Select
							value={selectedElectives[index]}
							onValueChange={(value) => handleElectiveChange(index, value)}
						>
							<SelectTrigger className="bg-[#FFF0DC]/10 border-[#F0BB78]/20 backdrop-blur-md hover:bg-[#FFF0DC]/15 transition-all">
								<SelectValue placeholder="Select elective" />
							</SelectTrigger>
							<SelectContent className="bg-[#FFF0DC]/20 backdrop-blur-2xl border-[#F0BB78]/20">
								{subjects.map((subject) => (
									<SelectItem
										key={subject.code}
										value={subject.code}
										className="hover:bg-white/20"
									>
										{subject.subject}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</motion.div>
				))}

				<Button
					type="submit"
					className="w-full bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300 shadow-lg hover:shadow-[#F0BB78]/25"
				>
					<Sparkles className="w-4 h-4 mr-2" />
					Generate Schedule
				</Button>
			</form>
		</Card>
	);
}
