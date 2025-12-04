"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { tabs } from "./navbar";

const MobileNavbar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [active, setActive] = useState(0);
	const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Update active state based on pathname
	useEffect(() => {
		const currentIndex = tabs.findIndex((tab) => {
			if (tab.path === "/" && pathname === "/") return true;
			if (tab.path !== "/" && pathname.startsWith(tab.path)) return true;
			return false;
		});
		if (currentIndex !== -1) {
			setActive(currentIndex);
		}
	}, [pathname]);

	// Update indicator position when active changes or resize
	useEffect(() => {
		const updateIndicator = () => {
			if (btnRefs.current[active] && containerRef.current) {
				const btn = btnRefs.current[active];
				const container = containerRef.current;
				if (!btn) return;
				const btnRect = btn.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();

				setIndicatorStyle({
					width: btnRect.width,
					left: btnRect.left - containerRect.left,
				});
			}
		};

		// Small delay to ensure layout is ready
		const timeoutId = setTimeout(updateIndicator, 50);
		window.addEventListener("resize", updateIndicator);

		return () => {
			window.removeEventListener("resize", updateIndicator);
			clearTimeout(timeoutId);
		};
	}, [active]);

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
			<div
				ref={containerRef}
				className="relative flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl rounded-full px-2 py-2 border border-white/10"
			>
				{/* Sliding Active Indicator */}
				<motion.div
					animate={indicatorStyle}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className="absolute top-2 bottom-2 rounded-full bg-[#F0BB78]/10"
				/>

				{tabs.map((tab, index) => {
					const isActive = index === active;
					return (
						<button
							key={tab.path}
							ref={(el) => {
								btnRefs.current[index] = el;
							}}
							onClick={() => router.push(tab.path)}
							className={`relative flex flex-col items-center justify-center flex-1 px-1 py-2 text-sm font-medium transition-colors z-10 ${
								isActive
									? "text-[#F0BB78]"
									: "text-slate-400 hover:text-slate-200"
							}`}
						>
							<div className="z-10">
								<tab.icon size={20} />
							</div>
							<span className="text-[10px] mt-0.5 font-medium z-10">
								{tab.mobileLabel}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default MobileNavbar;
