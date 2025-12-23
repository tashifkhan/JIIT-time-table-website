"use client";
import React, { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";

interface MessMenu {
	menu: {
		[day: string]: {
			Breakfast: string;
			Lunch: string;
			Lunch128?: string;
			Dinner: string;
		};
	};
}

interface MenuContentProps {
	apiUrl?: string;
}

interface OutdatedInfo {
	isOutdated: boolean;
	daysOutdated: number;
	menuWeekStart: Date | null;
	menuWeekEnd: Date | null;
}

const MenuContent: React.FC<MenuContentProps> = ({
	apiUrl = "/api/mess-menu",
}) => {
	const [menu, setMenu] = useState<MessMenu["menu"] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [outdatedInfo, setOutdatedInfo] = useState<OutdatedInfo>({
		isOutdated: false,
		daysOutdated: 0,
		menuWeekStart: null,
		menuWeekEnd: null,
	});
	const dayRefs = React.useRef<(HTMLDivElement | null)[]>([]);

	// Function to parse date from day string like "Sunday 01.08.25"
	const parseDateFromDay = (dayString: string): Date | null => {
		const dateMatch = dayString.match(/(\d{2})\.(\d{2})\.(\d{2})/);
		if (dateMatch) {
			const [, day, month, year] = dateMatch;
			// Convert 2-digit year to 4-digit year (assuming 20xx)
			const fullYear = 2000 + parseInt(year);
			return new Date(fullYear, parseInt(month) - 1, parseInt(day));
		}
		return null;
	};

	// Function to check if menu is outdated and get details
	const getOutdatedInfo = (menuData: MessMenu["menu"]): OutdatedInfo => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const menuDays = Object.keys(menuData);

		// Find Monday (start) and Sunday (end) entries
		const mondayEntry = menuDays.find((day) => day.startsWith("Monday"));
		const sundayEntry = menuDays.find((day) => day.startsWith("Sunday"));

		const menuWeekStart = mondayEntry ? parseDateFromDay(mondayEntry) : null;
		const menuWeekEnd = sundayEntry ? parseDateFromDay(sundayEntry) : null;

		if (menuWeekEnd) {
			const sundayEnd = new Date(menuWeekEnd);
			sundayEnd.setHours(23, 59, 59, 999);

			if (today > sundayEnd) {
				const diffTime = today.getTime() - sundayEnd.getTime();
				const daysOutdated = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				return {
					isOutdated: true,
					daysOutdated,
					menuWeekStart,
					menuWeekEnd,
				};
			}
		}

		return {
			isOutdated: false,
			daysOutdated: 0,
			menuWeekStart,
			menuWeekEnd,
		};
	};

	// Format date range for display
	const formatDateRange = (start: Date | null, end: Date | null): string => {
		if (!start || !end) return "";
		const options: Intl.DateTimeFormatOptions = {
			month: "short",
			day: "numeric",
		};
		return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
	};

	useEffect(() => {
		fetch(apiUrl)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch mess menu");
				return res.json();
			})
			.then((data: MessMenu) => {
				setMenu(data.menu);
				setOutdatedInfo(getOutdatedInfo(data.menu));
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [apiUrl]);

	const isCurrentDay = (day: string) => {
		const today = new Date();
		const dayNames = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		const currentDay = dayNames[today.getDay()];
		return day.startsWith(currentDay);
	};

	// Scroll to current day on mount (only if menu is not outdated)
	useEffect(() => {
		if (menu && !outdatedInfo.isOutdated) {
			const today = new Date();
			const dayNames = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];
			const currentDay = dayNames[today.getDay()];
			// Find the index of the first menu key that starts with the current day
			const menuDays = Object.keys(menu);
			const dayIndex = menuDays.findIndex((d) => d.startsWith(currentDay));

			if (dayIndex !== -1 && dayRefs.current[dayIndex]) {
				setTimeout(() => {
					const targetElement = dayRefs.current[dayIndex];
					if (targetElement) {
						const headerHeight = 200; // Account for header height
						const elementTop = targetElement.offsetTop;
						const scrollPosition = elementTop - headerHeight;

						window.scrollTo({
							top: Math.max(0, scrollPosition),
							behavior: "smooth",
						});
					}
				}, 200);
			}
		}
	}, [menu, outdatedInfo.isOutdated]);

	return (
		<main>
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#F0BB78]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-start max-w-7xl mx-auto space-y-6 sm:space-y-8">
				{/* Header Section */}
				<div className="text-center space-y-3 sm:space-y-4">
					<div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
						<h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-[#F0BB78] bg-gradient-to-r from-[#F0BB78] to-[#543A14]">
							JIIT Weekly Mess Menu
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4">
						See the atrocities being offered
					</p>
				</div>

				{/* Outdated Menu Warning */}
				{outdatedInfo.isOutdated && (
					<div className="w-full max-w-2xl mx-auto">
						<div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-6 text-center backdrop-blur-lg">
							<div className="text-amber-400 text-xl mb-3">
								<svg
									className="w-8 h-8 mx-auto"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="text-amber-300 font-medium text-lg mb-2">
								Menu Outdated by {outdatedInfo.daysOutdated} Day
								{outdatedInfo.daysOutdated !== 1 ? "s" : ""}
							</div>
							<div className="text-amber-200/80 text-sm mb-3">
								This week's mess menu hasn't been updated yet. The menu below is
								from{" "}
								<span className="font-medium text-amber-200">
									{formatDateRange(
										outdatedInfo.menuWeekStart,
										outdatedInfo.menuWeekEnd
									)}
								</span>
								.
							</div>
							<div className="text-amber-200/60 text-xs">
								The new menu will be updated shortly. Please check back later.
							</div>
						</div>
					</div>
				)}

				{/* Loading State */}
				{loading && <Loader text="Loading menu..." />}

				{/* Error State */}
				{error && (
					<div className="flex items-center justify-center py-20">
						<div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
							<div className="text-red-400 text-xl mb-2">
								<svg
									className="w-6 h-6 mx-auto"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<div className="text-red-300 font-medium">{error}</div>
						</div>
					</div>
				)}

				{/* Menu Content */}
				{menu && (
					<div
						className={`w-full max-w-6xl space-y-4 ${outdatedInfo.isOutdated ? "opacity-75" : ""}`}
					>
						{/* Outdated menu label */}
						{outdatedInfo.isOutdated && (
							<div className="flex items-center justify-center gap-2 text-amber-400/80 text-sm mb-2">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>
									Showing last available menu (
									{formatDateRange(
										outdatedInfo.menuWeekStart,
										outdatedInfo.menuWeekEnd
									)}
									)
								</span>
							</div>
						)}
						{Object.entries(menu).map(([day, meals], idx) => {
							// Don't highlight "today" if menu is outdated
							const shouldHighlight =
								!outdatedInfo.isOutdated && isCurrentDay(day);
							return (
								<div
									key={day}
									ref={(el) => {
										dayRefs.current[idx] = el;
									}}
									className={`rounded-2xl border p-6 transition-all duration-300 ${
										shouldHighlight
											? "border-[#F0BB78]/50 bg-white/5 shadow-[0_0_30px_rgba(240,187,120,0.1)]"
											: "border-white/10 bg-white/5 hover:border-[#F0BB78]/30"
									}`}
								>
									{/* Day Header */}
									<div className="flex items-center gap-3 mb-6">
										<div
											className={`w-1.5 h-1.5 rounded-full ${outdatedInfo.isOutdated ? "bg-slate-500" : "bg-slate-400"}`}
										></div>
										<h2
											className={`text-xl font-bold ${outdatedInfo.isOutdated ? "text-slate-300" : "text-white"}`}
										>
											{day.split(" ")[0]}
											<span className="ml-2 text-slate-400 font-normal text-lg">
												{day.split(" ").slice(1).join(" ")}
											</span>
										</h2>
										{shouldHighlight && (
											<span className="ml-2 px-2 py-0.5 bg-[#F0BB78]/20 text-[#F0BB78] text-xs rounded-full border border-[#F0BB78]/30">
												Today
											</span>
										)}
									</div>

								{/* Meals Grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{Object.entries(meals).map(([mealType, mealContent]) => {
										if (mealType === "Lunch128") return null; // Handle separately
										return (
											<div
												key={mealType}
												className="rounded-xl bg-[#1a1a1a] border border-white/5 p-5 hover:border-white/10 transition-colors"
											>
												<div className="mb-2">
													<h3 className="font-medium text-[#F0BB78] text-base">
														{mealType}
													</h3>
												</div>
												<div className="text-slate-400 text-sm leading-relaxed">
													{mealContent as string}
												</div>
												{mealType === "Lunch" && meals.Lunch128 && (
													<div className="mt-4 pt-4 border-t border-white/10">
														<div className="mb-2">
															<h3 className="font-medium text-[#F0BB78] text-base flex items-center gap-2">
																<span>Sector 128</span>
															</h3>
														</div>
														<div className="text-slate-400 text-sm leading-relaxed">
															{meals.Lunch128}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
							);
						})}
					</div>
				)}
			</div>
		</main>
	);
};

export default MenuContent;
