import type { Metadata } from "next";
import HomeContent from "./home-content";
import Loading from "./loading";

export const metadata: Metadata = {
	title: "JIIT Time Table Simplified",
	description: "Create your personalized class schedule",
};

import { Suspense } from "react";

export default function Home() {
	return (
		<Suspense fallback={<Loading />}>
			<HomeContent />
		</Suspense>
	);
}
