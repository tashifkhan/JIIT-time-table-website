import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

function RedirectAC() {
	const navigate = useNavigate();
	const currentPath = window.location.pathname;
	return currentPath === "/academic-calendar" ? null : (
		<div className="flex justify-center">
			<motion.button
				onClick={() => navigate("/academic-calendar")}
				className="mt-4 px-6 py-2 rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 
                             text-[#F0BB78] hover:bg-white/20 transition-all duration-300 shadow-lg
                             flex items-center gap-2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<Calendar className="w-5 h-5" />
				<span>View Academic Calendar →</span>
			</motion.button>
		</div>
	);
}

export default RedirectAC;
