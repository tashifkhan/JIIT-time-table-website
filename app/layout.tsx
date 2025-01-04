import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "JIIT Time Table Simplified",
	description: "Create your personalized class schedule",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className={inter.className} suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
