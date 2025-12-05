"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import UserContextProvider from "../context/userContextProvider";
import { Background } from "../components/layout/background";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "../components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: "/ph",
			ui_host: "/ph",
			// @ts-ignore
			defaults: "2025-05-24",
			capture_exceptions: true,
			debug: process.env.NODE_ENV === "development",
		});
	}, []);

	return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<PostHogProvider>
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
