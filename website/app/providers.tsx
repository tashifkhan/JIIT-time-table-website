"use client";

import { PostHogProvider } from "posthog-js/react";
import UserContextProvider from "../context/userContextProvider";
import { Background } from "../components/background";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "../components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const options = {
	api_host: "https://us.i.posthog.com",
};

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<PostHogProvider
			apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY || ""}
			options={options}
		>
			<Background>
				<UserContextProvider>
					<NuqsAdapter>
						{children}
						<Analytics />
						<Toaster />
					</NuqsAdapter>
				</UserContextProvider>
			</Background>
		</PostHogProvider>
	);
}
