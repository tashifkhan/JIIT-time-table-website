import { motion } from "framer-motion";
import { DownloadButtons } from "./download-buttons";
// import { GoogleCalendarButton } from "./google-calendar-button";
import { WeekSchedule } from "../types/schedule";

interface ActionButtonsProps {
	schedule: WeekSchedule;
}

export function ActionButtons({ schedule }: ActionButtonsProps) {
	return (
		<motion.div
			className="flex flex-col gap-3 sm:gap-4 justify-center items-center mt-4 sm:mt-6 p-3 sm:p-6 backdrop-blur-md bg-[#FFF0DC]/10 rounded-xl sm:rounded-2xl border border-[#F0BB78]/20 shadow-lg"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<DownloadButtons />
			{/* <GoogleCalendarButton schedule={schedule} /> */}
		</motion.div>
	);
}
