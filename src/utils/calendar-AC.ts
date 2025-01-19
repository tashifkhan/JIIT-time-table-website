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

export async function addAcademicCalendarEvents(events: CalendarEvent[]): Promise<GoogleCalendarResponse> {
    return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/calendar.events",
            callback: async (response: any) => {
                if (response.error) {
                    resolve({
                        success: false,
                        message: "Operation failed",
                        error: "Authentication failed",
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
                        description: `Academic Calendar Event for JIIT 2024-25\n\nDate: ${event.start.date}${
                            event.start.date !== event.end.date ? ` to ${event.end.date}` : ''
                        }`,
                        colorId: event.summary.startsWith('Holiday -') ? '11' : '1',
                    }));

                    const results = await Promise.allSettled(
                        calendarEvents.map(event =>
                            fetch(
                                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                                {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${response.access_token}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(event),
                                }
                            )
                        )
                    );

                    const failures = results.filter(result => result.status === 'rejected');
                    
                    if (failures.length > 0) {
                        resolve({
                            success: false,
                            message: "Operation failed",
                            error: `Failed to add ${failures.length} events`,
                        });
                    } else {
                        resolve({
                            success: true,
                            message: "Successfully added all academic calendar events!",
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        message: "Operation failed",
                        error: "An unexpected error occurred",
                    });
                }
            },
        });

        client.requestAccessToken();
    });
}
