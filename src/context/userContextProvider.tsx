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
		if (schedule && !editedSchedule) {
			// This will only set editedSchedule on initial load, not on subsequent schedule changes
			if (!localStorage.getItem("hasLoadedSchedule")) {
				setEditedSchedule(schedule);
				localStorage.setItem("hasLoadedSchedule", "true");
			}
		}
	}, [schedule]);

	useEffect(() => {
		if (!schedule) {
			localStorage.removeItem("hasLoadedSchedule");
		}
	}, [schedule]);

	useEffect(() => {
		if (schedule && !editedSchedule) {
			setEditedSchedule(schedule);
		}
	}, [schedule, editedSchedule]);

	useEffect(() => {
		if (!schedule) {
			setEditedSchedule(null);
			localStorage.removeItem("hasLoadedSchedule");
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
