// Add the missing Window interface extension
declare global {
    interface Window {
        google: any;
    }
}

// Type definitions
type CalendarEvent = {
    summary: string;
    start: { date: string };
    end: { date: string };
};

type GoogleCalendarResponse = {
    success: boolean;
    message: string;
    error?: string;
};

/**
 * Generates an iCal (.ics) file content from academic calendar events
 */
export function generateICalFile(events: CalendarEvent[], calendarName: string = "JIIT Academic Calendar"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JIIT Time Table//Academic Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${calendarName}`,
        'X-WR-TIMEZONE:Asia/Kolkata',
    ].join('\r\n');

    events.forEach((event, index) => {
        const uid = `${timestamp}-${index}@jiit-timetable`;
        const summary = escapeICalText(event.summary);
        const startDate = event.start.date.replace(/-/g, '');
        // For all-day events, end date should be the day after
        const endDate = getNextDay(event.end.date).replace(/-/g, '');
        const isHoliday = event.summary.toLowerCase().includes('holiday');
        
        icalContent += '\r\n' + [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${timestamp}`,
            `DTSTART;VALUE=DATE:${startDate}`,
            `DTEND;VALUE=DATE:${endDate}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:Academic Calendar Event for JIIT`,
            'TRANSP:TRANSPARENT',
            isHoliday ? 'CATEGORIES:Holiday' : 'CATEGORIES:Academic',
            'END:VEVENT',
        ].join('\r\n');
    });

    icalContent += '\r\nEND:VCALENDAR';
    
    return icalContent;
}

/**
 * Downloads the iCal file to the user's device
 */
export function downloadICalFile(events: CalendarEvent[], filename: string = "jiit-academic-calendar.ics"): void {
    const icalContent = generateICalFile(events);
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
 * Gets the next day for iCal end date (all-day events need end date to be exclusive)
 */
function getNextDay(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

export async function addAcademicCalendarEvents(events: CalendarEvent[]): Promise<GoogleCalendarResponse> {
    return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/calendar.events",
            callback: async (response: any) => {
                if (response.error) {
                    console.error("OAuth error:", response.error);
                    resolve({
                        success: false,
                        message: "Authentication failed",
                        error: response.error
                    });
                    return;
                }

                try {
                    const calendarEvents = events.map(event => ({
                        summary: event.summary,
                        start: {
                            date: event.start.date,
                            timeZone: 'Asia/Kolkata'
                        },
                        end: {
                            date: event.end.date,
                            timeZone: 'Asia/Kolkata'
                        },
                        description: `Academic Calendar Event for JIIT 2024-25`,
                        transparency: 'transparent',
                        visibility: 'public',
                        colorId: event.summary.toLowerCase().includes('holiday') ? '11' : '1',
                    }));

                    console.log("Attempting to add events:", calendarEvents.length);

                    for (const event of calendarEvents) {
                        try {
                            const fetchResponse = await fetch(
                                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                                {
                                    method: "POST",
                                    headers: {
                                        'Authorization': `Bearer ${response.access_token}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(event),
                                }
                            );

                            if (!fetchResponse.ok) {
                                const errorData = await fetchResponse.json();
                                console.error("Failed to add event:", errorData);
                                throw new Error(`Failed to add event: ${errorData.error?.message || 'Unknown error'}`);
                            }
                        } catch (error) {
                            console.error("Error adding event:", error);
                            throw error;
                        }
                    }

                    resolve({
                        success: true,
                        message: "Successfully added all academic calendar events!"
                    });
                } catch (error) {
                    console.error("Calendar operation failed:", error);
                    resolve({
                        success: false,
                        message: "Failed to add events",
                        error: error instanceof Error ? error.message : "Unknown error occurred"
                    });
                }
            },
        });

        try {
            client.requestAccessToken();
        } catch (error) {
            console.error("Failed to request access token:", error);
            resolve({
                success: false,
                message: "Failed to initialize Google Calendar",
                error: "Authentication failed"
            });
        }
    });
}
