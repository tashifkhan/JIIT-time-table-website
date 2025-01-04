"use client";

import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { downloadAsPng, downloadAsPdf } from "../utils/download";
import { motion } from "framer-motion";

export function DownloadButtons() {
	return (
		<motion.div
			className="flex gap-2 sm:gap-4 justify-center mt-4 sm:mt-6"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Button
				onClick={() => downloadAsPng("schedule-display", "schedule")}
				className="text-sm h-9 sm:h-10 backdrop-blur-md bg-[#F0BB78]/30 border border-[#F0BB78]/20 shadow-lg hover:bg-[#F0BB78]/40 transition-all duration-300"
			>
				<Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
				PNG
			</Button>
			<Button
				onClick={() => downloadAsPdf("schedule-display", "schedule")}
				className="text-sm h-9 sm:h-10 backdrop-blur-md bg-[#543A14]/30 border border-[#543A14]/20 shadow-lg hover:bg-[#543A14]/40 transition-all duration-300"
			>
				<Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
				PDF
			</Button>
		</motion.div>
	);
}
