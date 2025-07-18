import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import TimelinePage from "./components/timeline.tsx";
import { Github } from "lucide-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserContextProvider from "./context/userContextProvider.tsx";
import { Analytics } from "@vercel/analytics/react";
import { AcademicCalendar } from "./components/academic-calendar";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import CompareTimetablePage from "./components/compare-timetable";
import Navbar from "./components/navbar";
import { Background } from "./components/background.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Background>
			<UserContextProvider>
				<Analytics />
				<NuqsAdapter>
					<Router>
						<Navbar />
						<div className="md:ml-56 mt-9 md:mt-0 p-4">
							<Routes>
								<Route path="/" element={<App />} />
								<Route path="/timeline" element={<TimelinePage />} />
								<Route
									path="/academic-calendar"
									element={<AcademicCalendar />}
								/>
								<Route
									path="/compare-timetables"
									element={<CompareTimetablePage />}
								/>
							</Routes>
						</div>
						<div className="fixed right-4 bottom-4 z-50 p-5 rounded-[1.4rem] backdrop-blur-md bg-white/5 border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300">
							<a
								href="https://github.com/tashifkhan/JIIT-time-table-website"
								target="_blank"
								rel="noopener noreferrer"
								className="text-[#F0BB78] hover:text-[#543A14] transition-colors"
							>
								<Github className="w-8 h-8 sm:w-10 sm:h-10" />
							</a>
						</div>
					</Router>
				</NuqsAdapter>
			</UserContextProvider>
		</Background>
	</StrictMode>
);
