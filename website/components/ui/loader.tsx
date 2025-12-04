import React from "react";

interface LoaderProps {
	text?: string;
	className?: string;
}

export function Loader({ text = "Loading...", className = "" }: LoaderProps) {
	return (
		<div className={`flex items-center justify-center py-20 ${className}`}>
			<div className="relative">
				<div className="w-16 h-16 border-4 border-[#F0BB78]/20 border-t-[#F0BB78] rounded-full animate-spin"></div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-8 h-8 bg-[#F0BB78] rounded-full animate-ping"></div>
				</div>
			</div>
			<div className="ml-4 text-xl text-[#F0BB78] font-medium">{text}</div>
		</div>
	);
}
