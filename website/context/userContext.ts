import { createContext } from 'react';

interface UserContextType {
    schedule: {
        [day: string]: {
            [time: string]: {
                subject_name: string;
                type: "L" | "T" | "P" | "C";
                location: string;
            };
        };
    } | null;

    setSchedule: React.Dispatch<React.SetStateAction<{
        [day: string]: {
            [time: string]: {
                subject_name: string;
                type: "L" | "T" | "P" | "C";
                location: string;
            };
        };
    } | null>>;

    editedSchedule: {
        [day: string]: {
            [time: string]: {
                subject_name: string;
                type: "L" | "T" | "P" | "C"; // Added "C" for custom events
                location: string;
                isCustom?: boolean;
            };
        };
    } | null;
    setEditedSchedule: React.Dispatch<React.SetStateAction<UserContextType['editedSchedule']>>;
}

const UserContext = createContext<UserContextType>({
    schedule: null,
    setSchedule: () => {},
    editedSchedule: null,
    setEditedSchedule: () => {},
});

export default UserContext;
export type { UserContextType };
