import { useState } from "react";

declare global {
	interface Window {
		gapi: any;
	}
}
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { createGoogleCalendarEvents } from "../utils/calendar";
import { WeekSchedule } from "../types/schedule";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC =
	"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

interface GoogleCalendarButtonProps {
	schedule: WeekSchedule;
}

export function GoogleCalendarButton({ schedule }: GoogleCalendarButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const initializeGoogleCalendar = async () => {
		if (!window.gapi) return;

		try {
			await window.gapi.client.init({
				apiKey: API_KEY,
				discoveryDocs: [DISCOVERY_DOC],
			});

			await window.gapi.client.load("calendar", "v3");
		} catch (error) {
			console.error("Error initializing Google Calendar:", error);
		}
	};

	const handleAddToCalendar = async () => {
		setIsLoading(true);
		try {
			// Load the Google API client
			await new Promise((resolve) => window.gapi.load("client:auth2", resolve));
			await initializeGoogleCalendar();

			// Request authorization
			await window.gapi.auth2.getAuthInstance().signIn();

			// Create calendar events
			const events = await createGoogleCalendarEvents(schedule);

			// Add events to calendar
			for (const event of events) {
				await window.gapi.client.calendar.events.insert({
					calendarId: "primary",
					resource: event,
				});
			}

			alert("Schedule successfully added to Google Calendar!");
		} catch (error) {
			console.error("Error adding to Google Calendar:", error);
			alert("Failed to add schedule to Google Calendar. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Button
				onClick={handleAddToCalendar}
				disabled={isLoading}
				className="backdrop-blur-md bg-[#FFF0DC]/10 border border-[#F0BB78]/20 shadow-lg hover:bg-[#FFF0DC]/20
				transition-all duration-300 rounded-xl px-6 py-3 text-[#fff]/60"
			>
				<Calendar className="w-5 h-5 mr-3" />
				{isLoading ? "Adding to Calendar..." : "Add to Google Calendar"}
			</Button>
		</motion.div>
	);
}
