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

export async function addAcademicCalendarEvents(events: CalendarEvent[]): Promise<GoogleCalendarResponse> {
    return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
