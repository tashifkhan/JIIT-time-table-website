import React from "react";

interface BackgroundProps {
	children: React.ReactNode;
	className?: string;
}

export const Background: React.FC<BackgroundProps> = ({
	children,
	className = "",
}) => {
	return (
		<main
			className={`min-h-screen bg-gradient-to-br from-[#543A14]/20 via-[#131010]/40 to-[#131010]/60 p-4 sm:p-8 relative overflow-hidden ${className}`}
		>
			{/* Background effects */}
			<div className="absolute inset-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-5%] left-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#000]/30 rounded-full blur-[96px] sm:blur-[128px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-48 sm:w-72 h-48 sm:h-72 bg-[#543A14]/30 rounded-full blur-[96px] sm:blur-[128px]" />
			</div>
			{/* Content with relative z-index */}
			<div className="relative z-10">{children}</div>
		</main>
	);
};
