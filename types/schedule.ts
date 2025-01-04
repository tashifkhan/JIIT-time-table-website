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

export interface WeekSchedule {
  [key: string]: DaySchedule;
}