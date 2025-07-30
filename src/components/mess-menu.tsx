import React, { useEffect, useState } from "react";

interface MessMenu {
	menu: {
		[day: string]: {
			Breakfast: string;
			Lunch: string;
			Dinner: string;
		};
	};
}

const MessMenuPage: React.FC = () => {
	const [menu, setMenu] = useState<MessMenu["menu"] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const dayRefs = React.useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		fetch("https://jportal2-0.vercel.app/mess_menu.json")
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch mess menu");
				return res.json();
			})
			.then((data: MessMenu) => {
				setMenu(data.menu);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

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

	// Scroll to current day on mount
	useEffect(() => {
		if (menu) {
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
	}, [menu]);

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
							Weekly Mess Menu
						</h1>
					</div>
					<p className="text-base sm:text-lg text-slate-300/80 px-4">
						See for yourself what atrocity has been offering you
					</p>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-20">
						<div className="relative">
							<div className="w-16 h-16 border-4 border-[#F0BB78]/20 border-t-[#F0BB78] rounded-full animate-spin"></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-8 h-8 bg-[#F0BB78] rounded-full animate-ping"></div>
							</div>
						</div>
						<div className="ml-4 text-xl text-[#F0BB78] font-medium">
							Loading menu...
						</div>
					</div>
				)}

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
					<div className="w-full max-w-6xl space-y-4">
						{Object.entries(menu).map(([day, meals], idx) => (
							<div
								key={day}
								ref={(el) => (dayRefs.current[idx] = el)}
								className={`backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
									isCurrentDay(day)
										? "border-[#F0BB78]/50 shadow-[0_0_30px_rgba(240,187,120,0.3)]"
										: "border-white/10 hover:border-[#F0BB78]/30"
								}`}
							>
								{/* Day Header */}
								<div className="px-6 py-4 border-b border-white/10">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`w-2 h-2 rounded-full ${
													isCurrentDay(day) ? "bg-[#F0BB78]" : "bg-slate-400"
												}`}
											></div>
											<h2
												className={`text-lg sm:text-xl font-bold ${
													isCurrentDay(day) ? "text-[#F0BB78]" : "text-white"
												}`}
											>
												{day}
											</h2>
										</div>
										{isCurrentDay(day) && (
											<div className="px-3 py-1 bg-[#F0BB78]/20 border border-[#F0BB78]/30 rounded-full text-xs font-medium text-[#F0BB78]">
												TODAY
											</div>
										)}
									</div>
								</div>

								{/* Meals Grid */}
								<div className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{Object.entries(meals).map(([mealType, mealContent]) => (
											<div
												key={mealType}
												className="group relative overflow-hidden rounded-lg bg-white/5 border border-white/10 p-4 transition-all duration-300 hover:border-[#F0BB78]/30 hover:bg-white/10"
											>
												<div className="mb-3">
													<h3 className="font-semibold text-[#F0BB78] text-lg">
														{mealType}
													</h3>
												</div>
												<div className="text-slate-300/90 text-sm leading-relaxed">
													{mealContent}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
};

export default MessMenuPage;
