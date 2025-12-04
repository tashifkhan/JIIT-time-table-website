from __future__ import print_function
from datetime import datetime, timedelta
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# import main
current_day = datetime.now().strftime("%A")
# print(current_day)

# Get today's date
today = datetime.now()

# Calculate days until next Monday
for i in range(7):
    days_until_next_monday = (7 - today.weekday() + i) % 7 

    # Get the date of the next Monday
    next_monday = today + timedelta(days=days_until_next_monday)
    next_monday_date = next_monday.date().isoformat()

    print(next_monday_date)

# If modifying these SCOPES, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']


def main():
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('calendar', 'v3', credentials=creds)

    # Create a new calendar
    calendar = {
        'summary': 'New Calendar',
        'timeZone': 'Asia/Kolkat'
    }

    created_calendar = service.calendars().insert(body=calendar).execute()
    print('Calendar created: %s' % (created_calendar['id']))

    # Add an event to the new calendar
    event = {
        'summary': 'Google I/O 2024',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google’s developer products.',
        'start': {
            'dateTime': '2024-08-01T09:00:00-07:00',
            'timeZone': 'Asia/Kolkat',
        },
        'end': {
            'dateTime': '2024-08-01T17:00:00-07:00',
            'timeZone': 'Asia/Kolkat',
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
            {'email': 'lpage@example.com'},
            {'email': 'sbrin@example.com'},
        ],
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ],
        },
    }

    event = service.events().insert(calendarId=created_calendar['id'], body=event).execute()
    print('Event created: %s' % (event.get('htmlLink')))

if __name__ == '__main__':
    main()
