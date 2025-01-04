import React, { PropsWithChildren } from "react";
import UserContext from "./userContext";

const UserContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [schedule, setSchedule] = React.useState<{
		[day: string]: {
			[time: string]: {
				subject_name: string;
				type: "L" | "T" | "P";
				location: string;
			};
		};
	} | null>(null);

	return (
		<UserContext.Provider value={{ schedule, setSchedule }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
