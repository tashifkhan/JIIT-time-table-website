import { Loader } from "@/components/ui/loader";

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
			<Loader text="Loading..." />
		</div>
	);
}
