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
		<Card className="w-full max-w-md p-6 backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 shadow-xl rounded-xl">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="year" className="text-slate-200">
						Year
					</Label>
					<Select value={year} onValueChange={setYear}>
						<SelectTrigger className="bg-slate-800/50 border-slate-700">
							<SelectValue placeholder="Select year" />
						</SelectTrigger>
						<SelectContent>
							{[1, 2, 3, 4].map((yr) => (
								<SelectItem key={yr} value={yr.toString()}>
									Year {yr}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="batch" className="text-slate-200">
						Batch
					</Label>
					<Input
						id="batch"
						value={batch}
						onChange={(e) => setBatch(e.target.value)}
						placeholder="Enter your batch (e.g., B3)"
						className="bg-slate-800/50 border-slate-700"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="electiveCount" className="text-slate-200">
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
						className="bg-slate-800/50 border-slate-700"
					/>
				</div>

				{Array.from({ length: electiveCount }).map((_, index) => (
					<motion.div
						key={index}
						className="space-y-2"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
					>
						<Label htmlFor={`elective-${index}`} className="text-slate-200">
							Elective {index + 1}
						</Label>
						<Select
							value={selectedElectives[index]}
							onValueChange={(value) => handleElectiveChange(index, value)}
						>
							<SelectTrigger className="bg-slate-800/50 border-slate-700">
								<SelectValue placeholder="Select elective" />
							</SelectTrigger>
							<SelectContent>
								{subjects.map((subject) => (
									<SelectItem key={subject.code} value={subject.code}>
										{subject.subject}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</motion.div>
				))}

				<Button
					type="submit"
					className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
				>
					<Sparkles className="w-4 h-4 mr-2" />
					Generate Schedule
				</Button>
			</form>
		</Card>
	);
}
