import { Suspense } from "react";
import ExamContent from "../../components/exam-schedule/exam-content";
import Loading from "../../components/common/loading";

export const metadata = {
	title: "Exam Schedule | JIIT TimeTable",
	description: "View and search exam schedules for JIIT students",
};

export default function ExamSchedulePage() {
	return (
		<main className="min-h-screen md:ml-64 px-4 py-8 pb-28 md:pb-8">
			<Suspense fallback={<Loading />}>
				<ExamContent />
			</Suspense>
		</main>
	);
}
