import { NavLink } from "react-router-dom";

const tabs = [
	{ name: "Create TimeTables", path: "/" },
	{ name: "Academic Calender", path: "/academic-calendar" },
	{ name: "Compare TimeTables", path: "/compare-timetables" },
];

export default function Navbar() {
	return (
		<nav className="flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full w-full md:w-48 bg-[#FFF0DC]/10 backdrop-blur-2xl border-r border-[#F0BB78]/20 md:rounded-r-xl rounded-xl shadow-lg z-40">
			<ul className="flex w-full md:flex-col justify-center md:justify-start items-center md:items-stretch md:pt-4">
				{tabs.map((tab) => (
					<li key={tab.name} className="flex-1 md:flex-none md:mx-2">
						<NavLink
							to={tab.path}
							className={({ isActive }) =>
								`block text-center px-4 py-3 md:py-3 font-medium text-sm md:text-base transition-all duration-200 rounded-lg md:rounded-lg md:mx-1 ${
									isActive
										? "bg-[#F0BB78]/20 text-[#F0BB78] border-l-2 md:border-l-0 md:border-b-2 border-[#F0BB78] shadow-sm"
										: "text-[#F0BB78]/70 hover:bg-[#F0BB78]/10 hover:text-[#F0BB78]"
								}`
							}
							end={tab.path === "/"}
						>
							{tab.name}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
