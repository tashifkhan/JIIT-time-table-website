import streamlit as st
import streamlit.components.v1 as components
from datetime import datetime
import json
import xlsx_handeler as xcc
import xls_handeler as xcc_legacy

st.set_page_config(
    page_title="JIIT Time Table Simplified",
    page_icon="🤡",  
    layout="centered", 
    initial_sidebar_state="auto",  
)

schedule_data = [
    ['MON', '10 -10.50 AM', 'Data Structures and Algorithms', 'L', 'G7'],
    ['MON', '3-3.50 PM', 'Indian Constitution and Traditional knowledge', 'L', 'G8'],
    ['TUES', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'G8'],
    ['TUES', '3-3.50 PM', 'Data Structures and Algorithms Lab', 'P', 'CL04'],
    ['WED', '9 -9.50 AM', 'Microprocessors and Microcontrollers', 'P', 'IOT Lab'],
    ['WED', '1- 1.50 PM', 'Data Structures and Algorithms', 'L', 'G4'],
    ['WED', '3-3.50 PM', 'Indian Constitution and Traditional knowledge', 'L', 'G6'],
    ['THUR', '9 -9.50 AM', 'Indian Constitution and Traditional knowledge', 'L', 'G8'],
    ['THUR', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'FF4'],
    ['THUR', '3-3.50 PM', 'Data Structures and Algorithms', 'L', 'G4'],
    ['THUR', '4-4.50 PM', 'Electromagnetic Field Theory', 'T', 'F10'],
    ['FRI', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'G8'],
    ['FRI', '3-3.50 PM', 'Python for Signal Processing & Communication Lab', 'P', 'SPL'],
    ['SAT', '9 -9.50 AM', 'Electromagnetic Field Theory', 'P', 'ACL,JBSPL']
]

def convert_time_format(time_str):
    # Remove extra spaces
    time_str = time_str.strip().replace(' ', '')
    
    # Ensure the time string contains minutes
    if 'AM' in time_str or 'PM' in time_str:
        if ':' not in time_str:
            time_str = time_str.replace('AM', ':00 AM').replace('PM', ':00 PM')
    
    # Format to ensure no extra spaces
    time_str = time_str.replace('AM', ' AM').replace('PM', ' PM')
    
    try:
        # Convert 12-hour format to 24-hour format
        return datetime.strptime(time_str, '%I:%M %p').strftime('%H:%M')
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")

def process_timeslot(timeslot):
    # Split the timeslot into start and end times
    start_time, end_time = timeslot.split('-')
    
    # Handle cases with or without AM/PM
    start_time = start_time.strip()
    end_time = end_time.strip().replace('.', ':')  # Replace `.` with `:`
    
    # Assuming AM/PM is consistent and provided
    if not ('AM' in start_time or 'PM' in start_time):
        start_time += " AM"  # Default to AM if not provided
    if not ('AM' in end_time or 'PM' in end_time):
        end_time += " AM"  # Default to AM if not provided
    
    # Convert times to 24-hour format
    return convert_time_format(start_time), convert_time_format(end_time)

# Function to render HTML with the schedule data
def render_schedule_html(schedule_data):
    days = {
        'MON': 'Monday',
        'TUES': 'Tuesday',
        'WED': 'Wednesday',
        'THUR': 'Thursday',
        'FRI': 'Friday',
        'SAT': 'Saturday',
        'SUN': 'Sunday'
    }

    events_html = ""
    for day, timeslot, subject, event_type, location in schedule_data:
        start_time, end_time = process_timeslot(timeslot)
        events_html += f"""
        <li class="cd-schedule__event">
            <a data-start="{start_time}" data-end="{end_time}" data-content="{subject}" data-event="{event_type}" href="#0">
                <em class="cd-schedule__name">{subject}</em>
            </a>
        </li>
        """

    html_content = f"""
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>document.getElementsByTagName("html")[0].className += " js";</script>
       <link rel="stylesheet" href="templet/assets/css/style.css">
        <title>Schedule Template</title>
    </head>
    <body>
        <header class="cd-main-header text-center flex flex-column flex-center">
            <h1 class="text-xl">Your Schedule</h1>
        </header>

        <div class="cd-schedule cd-schedule--loading margin-top-lg margin-bottom-lg js-cd-schedule">
            <div class="cd-schedule__timeline">
                <ul>
                    <li><span>09:00</span></li>
                    <li><span>09:30</span></li>
                    <li><span>10:00</span></li>
                    <li><span>10:30</span></li>
                    <li><span>11:00</span></li>
                    <li><span>11:30</span></li>
                    <li><span>12:00</span></li>
                    <li><span>12:30</span></li>
                    <li><span>13:00</span></li>
                    <li><span>13:30</span></li>
                    <li><span>14:00</span></li>
                    <li><span>14:30</span></li>
                    <li><span>15:00</span></li>
                    <li><span>15:30</span></li>
                    <li><span>16:00</span></li>
                    <li><span>16:30</span></li>
                    <li><span>17:00</span></li>
                    <li><span>17:30</span></li>
                    <li><span>18:00</span></li>
                </ul>
            </div>
            
            <div class="cd-schedule__events">
                <ul>
                    <li class="cd-schedule__group">
                        <div class="cd-schedule__top-info"><span>{days[schedule_data[0][0]]}</span></div>
                        <ul>
                            {events_html}
                        </ul>
                    </li>
                </ul>
            </div>
            
            <div class="cd-schedule-modal">
                <header class="cd-schedule-modal__header">
                    <div class="cd-schedule-modal__content">
                        <span class="cd-schedule-modal__date"></span>
                        <h3 class="cd-schedule-modal__name"></h3>
                    </div>
                    <div class="cd-schedule-modal__header-bg"></div>
                </header>

                <div class="cd-schedule-modal__body">
                    <div class="cd-schedule-modal__event-info"></div>
                    <div class="cd-schedule-modal__body-bg"></div>
                </div>

                <a href="#0" class="cd-schedule-modal__close text-replace">Close</a>
            </div>

            <div class="cd-schedule__cover-layer"></div>
        </div>
        <script src="templet/your-cdn-link/assets/js/util.js"></script>
        <script src="templet/assets/js/main.js"></script>
    </body>
    </html>
    """
    return html_content
    def create_streamlit_schedule_template():
        # Create dynamic CSS classes for different event types
        st.markdown("""
            <style>
            .L { background: #f0918e; }
            .P { background: #61c0bf; }
            .T { background: #ffbe0f; }
            .schedule-item {
                padding: 10px;
                margin: 5px;
                border-radius: 5px;
                color: white;
            }
            </style>
        """, unsafe_allow_html=True)

        # Create a time table layout
        for day in ['MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT']:
            day_events = [event for event in schedule_data if event[0] == day]
            if day_events:
                st.subheader(day)
                for event in day_events:
                    st.markdown(f"""
                        <div class="schedule-item {event[3]}">
                            {event[1]}: {event[2]} ({event[4]})
                        </div>
                    """, unsafe_allow_html=True)

# Streamlit app
# st.title("Class Schedule")

# Display the schedule
components.html(render_schedule_html(schedule_data), height=400)

st.markdown("# JIIT Schedule")

with open("./data/json/subject.json", 'r') as file:
    subject = json.load(file)

# print(subject["Subject"])

# File Upload
uploaded_file = st.file_uploader("Upload the time table Excel here")

if uploaded_file is not None:
    file_extension = uploaded_file.name.split('.')[-1]

    if file_extension in ["xls", "xlsx"]:
        if file_extension == "xlsx":
            csv_file = xcc.xlsx_to_csv_string(uploaded_file)
        else:
            csv_file = xcc_legacy.xls_to_csv_string(uploaded_file)
            # print(csv_file)
        
        batch = st.text_input("Enter your batch:")


        has_electives = st.radio("Do you have electives?", ("Yes", "No"), index=1)
        if has_electives == "Yes":
            num_electives = st.number_input("How many electives do you have?", min_value=1, step=1)

            selecions = ['Select your elective'] + subject["Subject"]
            electives = []
            for i in range(int(num_electives)):
                elective = st.selectbox(f"Choose your elective {i+1}:", selecions)
                electives.append(elective)


        else:
            st.write("No electives selected.")

        if st.button("Submit"):
            st.success("Submit works")

    elif file_extension == "pdf":
        st.error("PDF files can't be parsed.")
        st.error("If you are from 128 ask your teachers to give a excel version of the time table.")
        st.error("Otherwise upload a file of xls or xlsx format.")
        
    else:
        st.error("Please upload a valid file. It must be of xls or xlsx format")

