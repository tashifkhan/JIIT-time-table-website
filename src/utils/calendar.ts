import { WeekSchedule } from "../types/schedule";
import { google } from 'googleapis';

async function createCalendar(auth: any) {
    const calendar = google.calendar({ version: 'v3', auth });
    try {
        const response = await calendar.calendars.insert({
            requestBody: {
                summary: 'College Schedule',
                timeZone: 'Asia/Kolkata'
            }
        });
        return response.data.id;
    } catch (error) {
        console.error('Error creating calendar:', error);
        throw error;
    }
}

export async function createGoogleCalendarEvents(schedule: WeekSchedule, auth: any) {
    // Create new calendar
    const calendarId = await createCalendar(auth);
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
                calendarId: calendarId,
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
                }
            };
            events.push(event);
        }
    }

    return { events, calendarId };
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
