import { NavLink } from "react-router-dom";

const tabs = [
	{ name: "Overview", path: "/" },
	{ name: "Semester", path: "/timeline" },
	{ name: "Marks", path: "/marks" },
];

export default function Navbar() {
	return (
		<nav className="flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full w-full md:w-56 bg-[#f7efe0] md:rounded-r-3xl rounded-b-3xl shadow-md z-40">
			<ul className="flex w-full md:flex-col justify-center md:justify-start items-center md:items-stretch">
				{tabs.map((tab) => (
					<li key={tab.name} className="flex-1 md:flex-none">
						<NavLink
							to={tab.path}
							className={({ isActive }) =>
								`block text-center px-8 py-4 md:py-6 font-medium text-lg md:text-xl transition-colors duration-200 rounded-3xl md:rounded-none md:rounded-r-3xl ${
									isActive
										? "bg-[#f3e7d6] text-[#a97a50]"
										: "text-[#555] hover:bg-[#f3e7d6] hover:text-[#a97a50]"
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
