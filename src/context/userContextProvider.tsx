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

	// Load editedSchedule from localStorage on mount
	useEffect(() => {
		const cachedEdited = localStorage.getItem("editedSchedule");
		if (cachedEdited) {
			try {
				setEditedSchedule(JSON.parse(cachedEdited));
			} catch {}
		}
	}, []);

	// Persist editedSchedule to localStorage whenever it changes
	React.useEffect(() => {
		if (editedSchedule) {
			localStorage.setItem("editedSchedule", JSON.stringify(editedSchedule));
		} else {
			localStorage.removeItem("editedSchedule");
		}
	}, [editedSchedule]);

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
