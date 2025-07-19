import { NavLink } from "react-router-dom";

const tabs = [
	{ name: "Overview", path: "/" },
	{ name: "Semester", path: "/timeline" },
	{ name: "Marks", path: "/marks" },
];

export default function Navbar() {
	return (
		<nav className="flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full w-full md:w-56 bg-[#FFF0DC]/10 backdrop-blur-2xl border-r border-[#F0BB78]/20 md:rounded-r-2xl rounded-b-2xl shadow-2xl z-40">
			<ul className="flex w-full md:flex-col justify-center md:justify-start items-center md:items-stretch">
				{tabs.map((tab) => (
					<li key={tab.name} className="flex-1 md:flex-none">
						<NavLink
							to={tab.path}
							className={({ isActive }) =>
								`block text-center px-6 py-4 md:py-6 font-semibold text-base md:text-lg transition-all duration-300 rounded-2xl md:rounded-none md:rounded-r-2xl ${
									isActive
										? "bg-[#F0BB78]/20 text-[#F0BB78] border-l-4 border-[#F0BB78] shadow-lg"
										: "text-[#F0BB78]/70 hover:bg-[#F0BB78]/10 hover:text-[#F0BB78] hover:shadow-md"
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
