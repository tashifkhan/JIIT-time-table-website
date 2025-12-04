"use client";
import { useRouter, usePathname } from "next/navigation";
import {
	Calendar,
	Clock,
	Menu,
	X,
	Utensils,
	GitCompare,
	Github,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import MobileNavbar from "./mobile-navbar";

export const tabs = [
	{
		label: "Create Timetable",
		mobileLabel: "Create",
		path: "/",
		icon: Calendar,
	},
	{
		label: "Timeline",
		mobileLabel: "Timeline",
		path: "/timeline",
		icon: Clock,
	},
	{
		label: "Mess Menu",
		mobileLabel: "Menu",
		path: "/mess-menu",
		icon: Utensils,
	},
	{
		label: "Academic Calendar",
		mobileLabel: "Calendar",
		path: "/academic-calendar",
		icon: Calendar,
	},
	{
		label: "Compare Timetables",
		mobileLabel: "Compare",
		path: "/compare-timetables",
		icon: GitCompare,
	},
];

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	// Find current tab index
	const currentTabIndex = tabs.findIndex((tab) => {
		if (tab.path === "/" && pathname === "/") return true;
		if (tab.path !== "/" && pathname.startsWith(tab.path)) return true;
		return false;
	});

	// Handle logo click
	const handleLogoClick = () => {
		router.push("/");
	};
	// Handle navigation
	const handleNavigation = (path: string) => {
		router.push(path);
		setIsOpen(false);
	};

	// Check if we're on the timeline page where swipe should be disabled
	const isTimelinePage = pathname === "/timeline";

	const swipeHandlers = useSwipeable({
		onSwipedLeft: () => {
			// Disable swipe navigation on timeline page
			if (isTimelinePage) return;
			// Swipe left to go to next page
			const nextIndex = (currentTabIndex + 1) % tabs.length;
			router.push(tabs[nextIndex].path);
		},
		onSwipedRight: () => {
			// Disable swipe navigation on timeline page
			if (isTimelinePage) return;
			// Swipe right to go to previous page
			const prevIndex =
				currentTabIndex <= 0 ? tabs.length - 1 : currentTabIndex - 1;
			router.push(tabs[prevIndex].path);
		},
		trackMouse: true, // Enable mouse swipe for desktop testing
		trackTouch: true,
		preventScrollOnSwipe: false, // Allow normal scrolling
		delta: 50, // Minimum distance for swipe
	});
	return (
		<>
			{/* Desktop Sidebar */}
			<motion.nav
				className={`hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300`}
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className="p-6 flex flex-col h-full">
					<div className="flex justify-center items-center gap-3 mb-8 px-2">
						<Image
							src="/icon.png"
							alt="JIIT TimeTable"
							width={125}
							height={125}
						/>
					</div>

					<div className="flex-1 space-y-2">
						{tabs.map((tab) => {
							const isActive =
								tab.path === "/"
									? pathname === "/"
									: pathname.startsWith(tab.path);
							return (
								<Link
									key={tab.path}
									href={tab.path}
									className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
										isActive
											? "text-[#F0BB78] bg-[#F0BB78]/10"
											: "text-slate-400 hover:text-slate-200 hover:bg-white/5"
									}`}
								>
									{isActive && (
										<motion.div
											layoutId="activeTab"
											className="absolute inset-0 bg-[#F0BB78]/10 rounded-xl"
											initial={false}
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 30,
											}}
										/>
									)}
									<tab.icon
										className={`w-5 h-5 relative z-10 transition-colors ${
											isActive
												? "text-[#F0BB78]"
												: "text-slate-400 group-hover:text-slate-200"
										}`}
									/>
									<span className="font-medium relative z-10">{tab.label}</span>
									{isActive && (
										<motion.div
											layoutId="activeIndicator"
											className="absolute right-0 w-1 h-8 bg-[#F0BB78] rounded-l-full"
										/>
									)}
								</Link>
							);
						})}
					</div>

					<div className="mt-auto px-4 pb-6">
						<Link
							href="https://github.com/tashifkhan/JIIT-time-table-website"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 group"
						>
							<Github className="w-5 h-5 transition-colors text-slate-400 group-hover:text-slate-200" />
							<span className="font-medium">GitHub</span>
						</Link>
					</div>
				</div>
			</motion.nav>

			{/* Invisible swipe area for mobile devices - disabled on timeline page */}
			{!isTimelinePage && (
				<>
					{/* Left edge swipe area */}
					<div
						{...swipeHandlers}
						className="fixed top-20 left-0 bottom-0 w-6 pointer-events-auto z-20 md:ml-48 md:top-0"
						style={{ background: "transparent" }}
					/>
					{/* Right edge swipe area */}
					<div
						{...swipeHandlers}
						className="fixed top-20 right-0 bottom-0 w-6 pointer-events-auto z-20 md:ml-48 md:top-0"
						style={{ background: "transparent" }}
					/>
				</>
			)}

			<MobileNavbar />
		</>
	);
}
