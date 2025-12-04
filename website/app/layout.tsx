import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";
import Script from "next/script";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#F0BB78",
};

export const metadata: Metadata = {
	title: "JIIT Time Table Simplified",
	description:
		"A website that helps JIIT students create personalized class schedules and academic calendar, color-coded timetables, and multiple export options. This application allows users to edit the timetable and add custom events. It also features the ability to fetch the academic calendar and sync it to Google Calendar, with enhanced color coding for events synced to Google Calendar.",
	keywords: [
		"JIIT",
		"timetable",
		"schedule",
		"Academic Calendar",
		"download timetable",
		"timetable pdf",
		"Jaypee Institite of Information Technology",
		"62",
		"128",
		"academic calendar",
		"Google Calendar",
		"export options",
		"custom events",
	],
	authors: [{ name: "Tashif Ahmad Khan" }],
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/icon.png", sizes: "512x512", type: "image/png" },
			{
				url: "/icon.png",
				sizes: "512x512",
				type: "image/png",
				media: "(display-mode: standalone)",
			},
		],
		apple: "/icon.png",
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "JIIT Timetable",
		startupImage: ["/icon.png"],
	},
	other: {
		"Cross-Origin-Opener-Policy": "same-origin",
		"Cross-Origin-Embedder-Policy": "require-corp",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				{/* Service Worker Registration */}
				<Script
					id="service-worker-register"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js');
                });
              }
            `,
					}}
				/>
				{/* Google APIs */}
				<Script
					src="https://apis.google.com/js/api.js"
					strategy="afterInteractive"
				/>
				<Script
					src="https://accounts.google.com/gsi/client"
					strategy="afterInteractive"
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<div className="flex min-h-screen">
						<Navbar />
						<main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
							{children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
