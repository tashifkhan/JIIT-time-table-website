export interface YourTietable {
	[key: string]: {
		[key: string]: {
			subject_name: string;
			type: "L" | "T" | "P" | "C";
			location: string;
		};
	};
}
