import { WeekSchedule, TimeSlot } from "../types/schedule";

const MONTHS_TO_ADD = 5;

interface GoogleEvent {
  summary: string;
  location: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence: string[];
}

const getDayNumber = (day: string): number => {
  const days = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };
  return days[day as keyof typeof days] || 0;
};

const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [time] = timeString.split('-');
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

const createEventDateTime = (dayNumber: number, time: { hours: number; minutes: number }): Date => {
  const date = new Date();
  date.setHours(time.hours, time.minutes, 0);
  
  // Set to next occurrence of the day
  const currentDay = date.getDay();
  const daysUntilTarget = (dayNumber - currentDay + 7) % 7;
  date.setDate(date.getDate() + daysUntilTarget);
  
  return date;
};

export const createGoogleCalendarEvents = async (schedule: WeekSchedule) => {
  if (!window.gapi?.client?.calendar) {
    throw new Error('Google Calendar API not loaded');
  }

  const events: GoogleEvent[] = [];
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + MONTHS_TO_ADD);

  Object.entries(schedule).forEach(([day, slots]) => {
    Object.entries(slots).forEach(([timeSlot, classes]) => {
      classes.forEach((slot: TimeSlot) => {
        const dayNumber = getDayNumber(day);
        const time = parseTime(timeSlot);
        const startDate = createEventDateTime(dayNumber, time);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        const event: GoogleEvent = {
          summary: `${slot.subject} (${slot.type})`,
          location: slot.location,
          description: `Faculty: ${slot.faculty}`,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${endDate.toISOString().split('T')[0].replace(/-/g, '')}`],
        };

        events.push(event);
      });
    });
  });

  return events;
};