import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Calendar, BookOpen } from "lucide-react";

interface UrlParamsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	urlParams: {
		year: string;
		batch: string;
		campus: string;
		selectedSubjects?: string[];
		selectedElectives?: string[];
	};
	mapping: any;
	year: string;
	onOverride: () => void;
	onPrefill: () => void;
	onViewExisting: () => void;
}

export function UrlParamsDialog({
	isOpen,
	urlParams,
	mapping,
	year,
	onOverride,
	onPrefill,
	onViewExisting,
}: UrlParamsDialogProps) {
	if (!isOpen) return null;

	const subjects =
		urlParams.selectedSubjects && urlParams.selectedSubjects.length > 0
			? urlParams.selectedSubjects
			: urlParams.selectedElectives || [];

	// Split and deduplicate codes (handle possible concatenation)
	const allCodes = subjects
		.flatMap((s) => s.split(","))
		.map((s) => s.trim())
		.filter(Boolean);
	const uniqueCodes = Array.from(new Set(allCodes));

	// Get subject list for the year
	const subjectList =
		typeof mapping === "object" && mapping !== null && mapping[year]?.subjects
			? mapping[year].subjects
			: [];
	const codeToName = (code: string) => {
		const subj = subjectList.find((s: any) => s.Code === code);
		return subj ? subj.Subject || code : code;
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="bg-[#131010]/90 border border-[#F0BB78]/20 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
				>
					<div className="text-center mb-6">
						<Calendar className="w-12 h-12 text-[#F0BB78] mx-auto mb-3" />
						<h2 className="text-xl font-semibold text-[#F0BB78] mb-2">
							Schedule Parameters Detected
						</h2>
						<p className="text-slate-300/80 text-sm">
							We found schedule parameters in the URL, but you already have an
							existing schedule.
						</p>
					</div>

					<div className="bg-[#FFF0DC]/5 rounded-xl p-4 mb-6 space-y-3">
						<h3 className="text-white/90 font-medium mb-3 flex items-center gap-2">
							<BookOpen className="w-4 h-4" />
							URL Parameters:
						</h3>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between items-center">
								<span className="text-slate-300/70">Campus:</span>
								<span className="text-[#F0BB78] font-medium">
									{urlParams.campus}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-slate-300/70">Year:</span>
								<span className="text-[#F0BB78] font-medium">
									Year {urlParams.year}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-slate-300/70">Batch:</span>
								<span className="text-[#F0BB78] font-medium">
									{urlParams.batch}
								</span>
							</div>
							{uniqueCodes.length > 0 && (
								<div className="pt-2 border-t border-[#F0BB78]/10">
									<span className="text-slate-300/70 text-xs">
										Selected Subjects:
									</span>
									<div className="flex flex-wrap gap-1 mt-1">
										{uniqueCodes.map((code, idx) => (
											<span
												key={idx}
												className="px-2 py-1 bg-[#F0BB78]/20 rounded text-[#F0BB78] text-xs"
											>
												{codeToName(code)}{" "}
												<span className="opacity-60">({code})</span>
											</span>
										))}
										{uniqueCodes.length > 3 && (
											<span className="px-2 py-1 bg-[#F0BB78]/20 rounded text-[#F0BB78] text-xs">
												+{uniqueCodes.length - 3} more
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="space-y-3">
						<Button
							onClick={onOverride}
							className="w-full h-10 bg-gradient-to-r from-[#543A14] to-[#F0BB78] hover:from-[#543A14]/80 hover:to-[#F0BB78]/80 transition-all duration-300"
						>
							Generate New Schedule
						</Button>

						<Button
							onClick={onPrefill}
							variant="outline"
							className="w-full h-10 border-[#F0BB78]/20 text-[#F0BB78] hover:bg-[#F0BB78]/10"
						>
							Use as Form Prefill
						</Button>

						<Button
							onClick={onViewExisting}
							variant="ghost"
							className="w-full h-10 text-slate-300 hover:bg-white/10"
						>
							View Existing Schedule
						</Button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
