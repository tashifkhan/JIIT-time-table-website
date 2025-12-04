
// Basic types
type TimeSlot = string;
type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI";
type LectureEntry = string;

// Schedule interfaces
type DaySchedule = Record<TimeSlot, LectureEntry[]>;

type WeekSchedule = Record<WeekDay, DaySchedule>

interface Section {
    timetable: WeekSchedule;
    subjects: string[];
}

interface TimetableData {
    [sectionNumber: string]: Section;
}

export type {
    TimeSlot,
    WeekDay,
    LectureEntry,
    DaySchedule,
    WeekSchedule,
    Section,
    TimetableData
};