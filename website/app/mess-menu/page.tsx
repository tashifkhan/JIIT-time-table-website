import type { Metadata } from "next";
import MenuContent from "./menu-content";

export const metadata: Metadata = {
	title: "JIIT Mess Menu",
	description: "Weekly mess menu for JIIT students.",
};

export default function MessMenuPage() {
	return (
		<div className="min-h-screen text-white">
			<div className="w-full max-w-6xl mx-auto">
				<MenuContent apiUrl="/api/mess-menu" />
			</div>
		</div>
	);
}
