import type { Metadata } from "next";
import CalendarContent from "../../components/academic-calendar/calendar-content";

export const metadata: Metadata = {
	title: "JIIT Academic Calendar",
	description:
		"Stay updated with the latest academic events and holidays at JIIT.",
};

export default function AcademicCalendarPage() {
	return <CalendarContent />;
}
