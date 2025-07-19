import React, { PropsWithChildren, useEffect } from "react";
import UserContext, { UserContextType } from "./userContext";

const UserContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [schedule, setSchedule] = React.useState<{
		[day: string]: {
			[time: string]: {
				subject_name: string;
				type: "L" | "T" | "P" | "C";
				location: string;
			};
		};
	} | null>(null);

	const [editedSchedule, setEditedSchedule] =
		React.useState<UserContextType["editedSchedule"]>(null);

	useEffect(() => {
		if (schedule) {
			setEditedSchedule(schedule);
		} else {
			setEditedSchedule(null);
		}
	}, [schedule]);

	return (
		<UserContext.Provider
			value={{
				schedule,
				setSchedule,
				editedSchedule,
				setEditedSchedule,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
