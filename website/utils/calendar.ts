import { WeekSchedule } from "../types/schedule";

/**
 * Generates an iCal (.ics) file content from timetable schedule
 */
export function generateTimetableICalFile(schedule: WeekSchedule, calendarName: string = "JIIT Timetable"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 5);

    const dayMapping: { [key: string]: number } = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
    };

    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JIIT Time Table//Timetable//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${calendarName}`,
        'X-WR-TIMEZONE:Asia/Kolkata',
    ].join('\r\n');

    let eventIndex = 0;
    for (const [day, slots] of Object.entries(schedule)) {
        for (const [time, slot] of Object.entries(slots)) {
            const [startTime, endTime] = time.split('-').map(t => 
                t.includes(':') ? t : `${t.slice(0, 2)}:${t.slice(2)}`
            );
            const isCustom = slot.type === 'C';
            const uid = `${timestamp}-${eventIndex}@jiit-timetable`;
            
            const eventStart = getNextDateForDayAndTime(dayMapping[day], startTime);
            const eventEnd = getNextDateForDayAndTime(dayMapping[day], endTime);
            
            const startDateStr = formatDateTimeForICal(eventStart);
            const endDateStr = formatDateTimeForICal(eventEnd);
            const untilDate = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            
            const summary = escapeICalText(`${isCustom ? '✨' : ''} ${slot.type} - ${slot.subject_name}`);
            const description = escapeICalText(getEventDescription(slot));
            const location = escapeICalText(slot.location);
            
            const eventLines = [
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${timestamp}`,
                `DTSTART;TZID=Asia/Kolkata:${startDateStr}`,
                `DTEND;TZID=Asia/Kolkata:${endDateStr}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                `LOCATION:${location}`,
            ];
            
            // Add recurrence rule for non-custom events
            if (!isCustom) {
                eventLines.push(`RRULE:FREQ=WEEKLY;UNTIL=${untilDate}`);
            }
            
            eventLines.push('END:VEVENT');
            icalContent += '\r\n' + eventLines.join('\r\n');
            eventIndex++;
        }
    }

    icalContent += '\r\nEND:VCALENDAR';
    return icalContent;
}

/**
 * Downloads the timetable iCal file to the user's device
 */
export function downloadTimetableICalFile(schedule: WeekSchedule, filename: string = "jiit-timetable.ics"): void {
    const icalContent = generateTimetableICalFile(schedule);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Escapes special characters for iCal format
 */
function escapeICalText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Formats a Date object to iCal datetime format (without timezone suffix)
 */
function formatDateTimeForICal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export async function createGoogleCalendarEvents(schedule: WeekSchedule) {
    const events = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 5);

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
            const [startTime, endTime] = time.split('-').map(t => 
                t.includes(':') ? t : `${t.slice(0, 2)}:${t.slice(2)}`
            );
            let isCustom = slot.type === 'C';
            
            const event = {
                summary: `${isCustom ? '✨' : ''} ${slot.type} - ${slot.subject_name}`,
                location: slot.location,
                description: getEventDescription(slot),
                recurrence: isCustom ? [] : [`RRULE:FREQ=WEEKLY;UNTIL=${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`],
                start: {
                    timeZone: 'Asia/Kolkata',
                    dateTime: getNextDateForDayAndTime(dayMapping[day], startTime).toISOString()
                },
                end: {
                    timeZone: 'Asia/Kolkata',
                    dateTime: getNextDateForDayAndTime(dayMapping[day], endTime).toISOString()
                },
                colorId: slot.type === 'C' ? '2' : '6'
            };
            events.push(event);
        }
    }

    return events;
}

function getEventDescription(slot: { subject_name: string; location: string; type: string;}) {
    const isCustom = slot.type === 'C';
    const typeMap = {
        'L': 'Lecture',
        'T': 'Tutorial',
        'P': 'Practical',
        'C': 'Custom Event'
    };
    
    return `${isCustom ? 'Custom Event' : 'Class'}: ${slot.subject_name}\nRoom: ${slot.location}\nType: ${typeMap[slot.type as keyof typeof typeMap]}`;
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
