import { WeekSchedule } from "../types/schedule";

// const MONTHS_TO_ADD = 5;

// interface GoogleEvent {
//   summary: string;
//   location: string;
//   description: string;
//   start: {
//     dateTime: string;
//     timeZone: string;
//   };
//   end: {
//     dateTime: string;
//     timeZone: string;
//   };
//   recurrence: string[];
// }


// declare global {
//   interface Window {
//     gapi: {
//       client: {
//         calendar: any;
//       };
//     };
//   }
// }


// const getDayNumber = (day: string): number => {
//   const days = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };
//   return days[day as keyof typeof days] || 0;
// };

// const parseTime = (timeString: string): { hours: number; minutes: number } => {
//   const [time] = timeString.split('-');
//   const [hours, minutes] = time.split(':').map(Number);
//   return { hours, minutes };
// };

// const createEventDateTime = (dayNumber: number, time: { hours: number; minutes: number }): Date => {
//   const date = new Date();
//   date.setHours(time.hours, time.minutes, 0);
  
//   // Set to next occurrence of the day
//   const currentDay = date.getDay();
//   const daysUntilTarget = (dayNumber - currentDay + 7) % 7;
//   date.setDate(date.getDate() + daysUntilTarget);
  
//   return date;
// };

// export const createGoogleCalendarEvents = async (schedule: WeekSchedule) => {
//   if (!window.gapi?.client?.calendar) {
//     throw new Error('Google Calendar API not loaded');
//   }

//   const events: GoogleEvent[] = [];
//   const endDate = new Date();
//   endDate.setMonth(endDate.getMonth() + MONTHS_TO_ADD);

//   Object.entries(schedule).forEach(([day, slots]) => {
//     Object.entries(slots).forEach(([timeSlot, classes]) => {
//       const slot: TimeSlot = {
//         time: timeSlot,
//         subject: classes.subject_name,
//         type: classes.type,
//         location: classes.location,
//         faculty: 'TBD'  // Add actual faculty data if available
//       };
//       const dayNumber = getDayNumber(day);
//       const time = parseTime(timeSlot);
//         const startDate = createEventDateTime(dayNumber, time);
//         const endDate = new Date(startDate);
//         endDate.setHours(endDate.getHours() + 1);

//         const event: GoogleEvent = {
//           summary: `${slot.subject} (${slot.type})`,
//           location: slot.location,
//           description: `Faculty: ${slot.faculty}`,
//           start: {
//             dateTime: startDate.toISOString(),
//             timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//           },
//           end: {
//             dateTime: endDate.toISOString(),
//             timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//           },
//           recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${endDate.toISOString().split('T')[0].replace(/-/g, '')}`],
//         };

//         events.push(event);
//       });
//     });

//   return events;
// };

export async function createGoogleCalendarEvents(schedule: WeekSchedule) {
    const events = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 6);

    // Map days to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMapping: { [key: string]: number } = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
    };

    for (const [day, slots] of Object.entries(schedule)) {
        for (const [time, slot] of Object.entries(slots)) {
            const [startTime, endTime] = time.split('-');
            
            // Create event
            const event = {
              summary: `${slot.subject_name} - ${slot.type}`,
              location: slot.location,
              description: `Class: ${slot.subject_name}\nRoom: ${slot.location}\nType: ${slot.type}`,
              recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`],
              start: {
                  timeZone: 'Asia/Kolkata',
                  dateTime: getNextDateForDayAndTime(dayMapping[day], startTime).toISOString()
              },
              end: {
                  timeZone: 'Asia/Kolkata',
                  dateTime: getNextDateForDayAndTime(dayMapping[day], endTime).toISOString()
              }
          };
            
            events.push(event);
        }
    }

    return events;
}

function getNextDateForDayAndTime(targetDay: number, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const date = new Date(now);
    date.setHours(hours, minutes, 0);

    while (date.getDay() !== targetDay) {
        date.setDate(date.getDate() + 1);
    }

    return date;
}