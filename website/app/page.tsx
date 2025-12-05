import type { Metadata } from "next";
import HomeContent from "../components/home/home-content";
import Loading from "../components/common/loading";

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
