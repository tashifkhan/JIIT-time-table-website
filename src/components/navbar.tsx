import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

const tabs = [
	{ name: "Create TimeTables", path: "/" },
	{ name: "Timeline View", path: "/timeline" },
	{ name: "Academic Calender", path: "/academic-calendar" },
	{ name: "Compare TimeTables", path: "/compare-timetables" },
];

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();

	// Find current tab index
	const currentTabIndex = tabs.findIndex((tab) => {
		if (tab.path === "/" && location.pathname === "/") return true;
		if (tab.path !== "/" && location.pathname.startsWith(tab.path)) return true;
		return false;
	});

	// Check if we're on the timeline page where swipe should be disabled
	const isTimelinePage = location.pathname === "/timeline";

	const swipeHandlers = useSwipeable({
		onSwipedLeft: () => {
			// Disable swipe navigation on timeline page
			if (isTimelinePage) return;
			// Swipe left to go to next page
			const nextIndex = (currentTabIndex + 1) % tabs.length;
			navigate(tabs[nextIndex].path);
		},
		onSwipedRight: () => {
			// Disable swipe navigation on timeline page
			if (isTimelinePage) return;
			// Swipe right to go to previous page
			const prevIndex =
				currentTabIndex <= 0 ? tabs.length - 1 : currentTabIndex - 1;
			navigate(tabs[prevIndex].path);
		},
		trackMouse: true, // Enable mouse swipe for desktop testing
		trackTouch: true,
		preventScrollOnSwipe: false, // Allow normal scrolling
		delta: 50, // Minimum distance for swipe
	});
	return (
		<>
			<nav className="flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full w-full md:w-48 bg-[#FFF0DC]/10 backdrop-blur-2xl border-r border-[#F0BB78]/20 md:rounded-r-xl rounded-xl shadow-lg z-40">
				<ul className="flex w-full md:flex-col justify-center md:justify-start items-center md:items-stretch md:pt-4">
					{tabs.map((tab) => (
						<li key={tab.name} className="flex-1 md:flex-none md:mx-2">
							<NavLink
								to={tab.path}
								className={({ isActive }) =>
									`block text-center px-4 py-3 md:py-3 font-medium text-xs md:text-base transition-all duration-200 rounded-lg md:rounded-lg md:mx-1 ${
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
		</>
	);
}
