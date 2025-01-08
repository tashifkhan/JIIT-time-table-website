export interface TimeSlot {
  time: string;
  subject: string;
  type: 'L' | 'T' | 'P';
  location: string;
  faculty: string;
}

export interface DaySchedule {
  [key: string]: TimeSlot[];
}

export type ClassType = 'L' | 'T' | 'P';

export interface WeekSchedule {
  [day: string]: {
    [time: string]: {
      subject_name: string;
      type: "L" | "T" | "P" | "C";
      location: string;
    };
  };
}