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

	return (
		<div className="min-h-[50%] text-[#FFF0DC] p-0 md:p-8 overflow-scroll">
			<div className="mb-8 px-4 md:px-8 text-center">
				<div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-2">
					<svg
						className="w-10 h-10 md:w-12 md:h-12 text-[#F0BB78]"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
							clipRule="evenodd"
						/>
					</svg>
					<h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-[#F0BB78]">
						Weekly Mess Menu
					</h1>
				</div>
				<div className="text-base md:text-xl text-[#FFF0DC]/70 font-normal">
					Enjoy delicious meals every day!
				</div>
			</div>
			{loading && (
				<div className="text-center text-lg text-[#F0BB78]">
					Loading menu...
				</div>
			)}
			{error && <div className="text-center text-red-400">{error}</div>}
			{menu && (
				<div className="mb-6 mx-4 md:mx-0 p-4 rounded-lg bg-[#23201c]/60 border border-[#FFF0DC]/10 shadow flex flex-col gap-4 animate-fade-in">
					{Object.entries(menu).map(([day, meals]) => (
						<div
							key={day}
							className="rounded-xl bg-gradient-to-r from-[#543A14]/40 to-[#F0BB78]/20 border border-[#F0BB78]/30 shadow-lg p-4"
						>
							<div className="flex items-center gap-3 mb-2">
								<svg
									className="w-6 h-6 text-[#F0BB78]"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="font-bold text-lg text-[#F0BB78]">{day}</span>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-black/20 rounded-lg p-3">
									<div className="font-semibold text-[#F0BB78] mb-1">
										Breakfast
									</div>
									<div className="text-[#FFF0DC]/90 text-sm">
										{meals.Breakfast}
									</div>
								</div>
								<div className="bg-black/20 rounded-lg p-3">
									<div className="font-semibold text-[#F0BB78] mb-1">Lunch</div>
									<div className="text-[#FFF0DC]/90 text-sm">{meals.Lunch}</div>
								</div>
								<div className="bg-black/20 rounded-lg p-3">
									<div className="font-semibold text-[#F0BB78] mb-1">
										Dinner
									</div>
									<div className="text-[#FFF0DC]/90 text-sm">
										{meals.Dinner}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MessMenuPage;
