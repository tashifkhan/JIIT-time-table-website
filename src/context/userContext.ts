import { createContext } from 'react';


interface UserContextType {
    schedule: {
        [day: string]: {
            [time: string]: {
                subject_name: string;
                type: "L" | "T" | "P";
                location: string;
            };
        };
    } | null;

    setSchedule: React.Dispatch<React.SetStateAction<{
        [day: string]: {
            [time: string]: {
                subject_name: string;
                type: "L" | "T" | "P";
                location: string;
            };
        };
    } | null>>;

}

  
const UserContext = createContext<UserContextType>({
    schedule: {},
    setSchedule: () => {},
});

export default UserContext;
