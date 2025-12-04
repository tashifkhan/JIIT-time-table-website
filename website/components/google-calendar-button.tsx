import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { createGoogleCalendarEvents } from "../utils/calendar";
import { WeekSchedule } from "../types/schedule";

declare global {
	interface Window {
		google: any;
	}
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCalendarButtonProps {
	schedule: WeekSchedule;
}

export function GoogleCalendarButton({ schedule }: GoogleCalendarButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const handleAddToCalendar = async () => {
		setIsLoading(true);
		try {
			const client = window.google.accounts.oauth2.initTokenClient({
				client_id: CLIENT_ID,
				scope: "https://www.googleapis.com/auth/calendar.events",
				prompt: "consent",
				ux_mode: "popup",
				hosted_domain: "gmail.com",
				state: window.location.origin,
				callback: async (response: any) => {
					if (response.error) {
						console.error("OAuth error:", response);
						throw new Error(response.error);
					}

					try {
						const events = await createGoogleCalendarEvents(schedule);
						const results = await Promise.allSettled(
							events.map((event) =>
								fetch(
									"https://www.googleapis.com/calendar/v3/calendars/primary/events",
									{
										method: "POST",
										headers: {
											Authorization: `Bearer ${response.access_token}`,
											"Content-Type": "application/json",
										},
										body: JSON.stringify(event),
									}
								)
							)
						);

						const failures = results.filter((r) => r.status === "rejected");
						if (failures.length > 0) {
							console.error("Some events failed to add:", failures);
							alert("Some events could not be added to your calendar");
						} else {
							alert("Schedule successfully added to Google Calendar!");
						}
					} catch (error) {
						console.error("Error adding events:", error);
						alert("Failed to add events to calendar");
					} finally {
						setIsLoading(false);
					}
				},
			});

			client.requestAccessToken();
		} catch (error) {
			console.error("Error initiating OAuth:", error);
			alert("Failed to connect to Google Calendar. Please try again.");
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
