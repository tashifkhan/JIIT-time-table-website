export interface Subject {
  code: string;
  fullCode: string;
  subject: string;
}

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
  [key: string]: DaySchedule;
}