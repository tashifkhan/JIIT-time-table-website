"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { ScheduleDisplay } from "./schedule-display";
import { YourTietable } from "../../types";

interface TimetableModalProps {
	isOpen: boolean;
	onClose: () => void;
	schedule: YourTietable | null;
	title?: string;
	subtitle?: string;
}

export function TimetableModal({
	isOpen,
	onClose,
	schedule,
	title = "Timetable",
	subtitle,
}: TimetableModalProps) {
	if (!schedule || Object.keys(schedule).length === 0) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto bg-[#131010]/95 backdrop-blur-xl border border-white/10 p-0">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-gradient-to-r from-[#F0BB78]/10 to-[#543A14]/10 backdrop-blur-xl border-b border-white/10 px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-[#F0BB78]/20 border border-[#F0BB78]/30 flex items-center justify-center">
								<Calendar className="w-5 h-5 text-[#F0BB78]" />
							</div>
							<div>
								<DialogTitle className="text-xl font-bold text-[#F0BB78]">
									{title}
								</DialogTitle>
								{subtitle && (
									<p className="text-sm text-slate-300/70">{subtitle}</p>
								)}
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-white/10 transition-colors"
						>
							<X className="w-5 h-5 text-slate-300" />
						</button>
					</div>
				</div>

				{/* Schedule Content */}
				<div className="p-4 sm:p-6">
					<ScheduleDisplay schedule={schedule} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
