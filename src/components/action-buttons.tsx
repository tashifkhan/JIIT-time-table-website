import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { downloadAsPng, downloadAsPdf } from "../utils/download";
import { useNavigate } from "react-router-dom";
import { GoogleCalendarButton } from "./google-calendar-button";
import { YourTietable } from "../App";
import { useContext, useState } from "react";
import UserContext from "../context/userContext";
import { useToast } from "../hooks/use-toast";

interface ActionButtonsProps {
	schedule: YourTietable;
}

export function ActionButtons({ schedule }: ActionButtonsProps) {
	const { editedSchedule } = useContext(UserContext);
	const navigate = useNavigate();
	const { toast } = useToast();
	const [loading, setLoading] = useState<null | "png" | "pdf">(null);
	const [progressMsg, setProgressMsg] = useState("");

	// Use edited schedule if available, otherwise use original schedule
	const displaySchedule = editedSchedule || schedule;

	const handleDownload = async (
		downloadFn: typeof downloadAsPng | typeof downloadAsPdf,
		type: "png" | "pdf"
	) => {
		setLoading(type);
		setProgressMsg("");
		toast({
			title: `Preparing your ${type.toUpperCase()}...`,
			description: "This may take a moment for large schedules.",
		});
		navigate("/timeline?download=1");
		await new Promise((resolve) => setTimeout(resolve, 500)); // Shorter, just to ensure navigation

		const element = document.getElementById("schedule-display");
		if (!element) {
			toast({
				title: "Schedule not found!",
				description: "Please navigate to the timeline page first.",
				variant: "destructive",
			});
			setLoading(null);
			return;
		}

		await downloadFn("schedule-display", "schedule", {
			onProgress: (msg) => {
				setProgressMsg(msg);
				toast({
					title: msg,
					variant: "default",
				});
			},
			onSuccess: () => {
				toast({
					title: `${type.toUpperCase()} ready!`,
					description: `Your schedule has been downloaded as a ${type.toUpperCase()}.`,
				});
				setLoading(null);
			},
			onError: (err) => {
				toast({
					title: `Failed to download ${type.toUpperCase()}`,
					description: err.message,
					variant: "destructive",
				});
				setLoading(null);
			},
		});
	};

	return (
		<motion.div
			className="flex flex-col gap-3 sm:gap-4 justify-center items-center mt-4 sm:mt-6 p-3 sm:p-6 backdrop-blur-md bg-[#FFF0DC]/10 rounded-xl sm:rounded-2xl border border-[#F0BB78]/20 shadow-lg"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				className="flex gap-2 sm:gap-4 justify-center mt-4 sm:mt-6"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Button
					onClick={() => handleDownload(downloadAsPng, "png")}
					disabled={loading !== null}
					className="text-sm h-9 sm:h-10 backdrop-blur-md bg-[#F0BB78]/30 border border-[#F0BB78]/20 shadow-lg hover:bg-[#F0BB78]/40 transition-all duration-300 flex items-center justify-center"
				>
					{loading === "png" ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
					)}
					PNG
				</Button>
				<Button
					onClick={() => handleDownload(downloadAsPdf, "pdf")}
					disabled={loading !== null}
					className="text-sm h-9 sm:h-10 backdrop-blur-md bg-[#543A14]/30 border border-[#543A14]/20 shadow-lg hover:bg-[#543A14]/40 transition-all duration-300 flex items-center justify-center"
				>
					{loading === "pdf" ? (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					) : (
						<Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
					)}
					PDF
				</Button>
			</motion.div>
			{progressMsg && (
				<p className="text-xs text-blue-300 mt-1">{progressMsg}</p>
			)}
			<GoogleCalendarButton schedule={displaySchedule} />
			<p className="text-xs text-gray-400 mt-2">
				Note: Custom events will not be recurring in Google Calendar
			</p>
		</motion.div>
	);
}
