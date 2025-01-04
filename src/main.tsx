import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Github } from "lucide-react";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<div className="fixed right-4 bottom-4 z-50 p-5 rounded-[1.4rem] backdrop-blur-md bg-white/5 border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300">
			<a
				href="https://github.com/tashifkhan"
				target="_blank"
				rel="noopener noreferrer"
				className="text-[#F0BB78] hover:text-[#543A14] transition-colors"
			>
				<Github className="w-8 h-8 sm:w-10 sm:h-10" />
			</a>
		</div>
		<App />
	</StrictMode>
);
