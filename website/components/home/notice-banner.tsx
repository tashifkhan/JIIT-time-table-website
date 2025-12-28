"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NoticeBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, height: 0 }}
				className="w-full max-w-2xl mx-auto px-4"
			>
				<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 relative backdrop-blur-sm">
					<button
						onClick={() => setIsVisible(false)}
						className="absolute top-2 right-2 p-1 hover:bg-yellow-500/20 rounded-lg transition-colors text-yellow-500/60 hover:text-yellow-500"
					>
						<X className="w-4 h-4" />
					</button>

					<div className="flex gap-3">
						<AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
						<div className="space-y-2 text-sm text-yellow-200/90">
							<h3 className="font-semibold text-yellow-500 text-base">
								Timetable Availability Notice
							</h3>

							<ul className="list-disc pl-4 space-y-1 text-yellow-200/80">
								<li>
									<span className="font-medium text-yellow-200">
										Sector 62:
									</span>{" "}
									Only 62 timetables are present (2nd year HSS elective codes
									might be missing).
								</li>
								<li>
									<span className="font-medium text-yellow-200">
										Sector 128:
									</span>{" "}
									Only 1st year timetables available.
								</li>
								<li>
									<span className="font-medium text-yellow-200">BCA:</span> Only
									2nd year available (data might be inaccurate).
								</li>
							</ul>

							<div className="pt-2 border-t border-yellow-500/10 mt-2 text-yellow-200/70 text-xs">
								<p>
									Found an issue or have missing data? Report on{" "}
									<a
										href="https://github.com/tashifkhan/JIIT-time-table-website/issues"
										target="_blank"
										rel="noopener noreferrer"
										className="text-yellow-500 hover:underline"
									>
										GitHub
									</a>
									, mail to{" "}
									<a
										href="mailto:admin@tashif.codes"
										className="text-yellow-500 hover:underline"
									>
										admin@tashif.codes
									</a>
									, or DM me.
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
