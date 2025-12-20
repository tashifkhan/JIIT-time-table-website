from datetime import datetime
import re
from typing import List

def batch_extractor128(text: str) -> str:
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[1:start_bracket].strip()
    return text

def subject_extractor128(text: str) -> str:
    start_bracket = text.find('(')
    if start_bracket != -1:
        end_bracket = text.find(')', start_bracket)
        if end_bracket != -1:
            return text[start_bracket + 1:end_bracket]
    return text

def faculty_extractor128(text: str) -> str:
    start_bracket = text.find('/')
    if start_bracket != -1:
        return text[start_bracket+1:].strip()
    return text

def expand_batch128(batch_code):
    """Expand batch code into list of individual batches."""
    if not batch_code: 
        return []
        
    if batch_code == 'ALL':
        return ['E', 'F']
    
    matches = re.findall(r'([A-Z])(\d+)', batch_code)
    if matches:
        return [f"{letter}{number}" for letter, number in matches]
    
    return [batch_code]

def location_extractor128(text: str) -> str:
    parts = text.split('-')
    if len(parts) < 2:
        return text

    location = parts[-1].split('/')[0]
    return location.strip()

def is_batch_included128(search_batch: str, extracted_batch_input: str) -> bool:
    if not extracted_batch_input:
        return True
    batch_list = expand_batch128(extracted_batch_input.strip())
    if search_batch in batch_list:
        return True
    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True
    return False

def process_day128(day_str: str) -> str:
    day_mapping = {
        'MON': 'Monday',
        'M': 'Monday',
        'MONDAY': 'Monday',
        'TUES': 'Tuesday',
        'TUE': 'Tuesday',
        'T': 'Tuesday',
        'TUESDAY': 'Tuesday',
        'WED': 'Wednesday',
        'W': 'Wednesday',
        'WEDNESDAY': 'Wednesday',
        'THUR': 'Thursday',
        'THURS': 'Thursday',
        'THURSDAY': 'Thursday',
        'THU': 'Thursday',
        'TH': 'Thursday',
        'FRI': 'Friday',
        'FRIDAY': 'Friday',
        'F': 'Friday',
        'SAT': 'Saturday',
        'S': 'Saturday',
        'SA': 'Saturday',
        'SATURDAY': 'Saturday',
        'SATUR': 'Saturday',
        'SUN': 'Sunday',
        'SU': 'Sunday',
        'U': 'Sunday',
        'SUNDAY': 'Sunday'
    }
    
    day_str = day_str.strip().upper()
    return day_mapping.get(day_str, day_str)

def convert_time_format128(time_str):
    time_str = time_str.strip().replace(' ', '')
    
    if 'AM' in time_str or 'PM' in time_str:
        if ':' not in time_str:
            time_str = time_str.replace('AM', ':00 AM').replace('PM', ':00 PM')

    time_str = time_str.replace('AM', ' AM').replace('PM', ' PM')
    
    try:
        return datetime.strptime(time_str, '%I:%M %p').strftime('%H:%M')
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")

def process_timeslot128(timeslot: str, type: str = "L") -> tuple[str]:
    try:
        timeslot = timeslot.replace('12 NOON', '12:00 PM').replace('NOON', '12:00 PM')

        start_time, end_time = timeslot.split('-')

        start_time = start_time.strip()
        end_time = end_time.strip().replace('.', ':')
        
        if not ('AM' in start_time.upper() or 'PM' in start_time.upper()):
            if len(start_time.split(':')[0].strip()) == 1:
                start_time = "0" + start_time
            if int(start_time.split(':')[0]) < 7:
                start_time += " PM"
            else:
                start_time += " AM"
                
        if not ('AM' in end_time.upper() or 'PM' in end_time.upper()):
            if len(end_time.split(':')[0].strip()) == 1:
                end_time = "0" + end_time
            if int(end_time.split(':')[0]) < 7:
                end_time += " PM"
            else:
                end_time += " AM"

        start_time_24 = convert_time_format128(start_time)
        end_time_24 = convert_time_format128(end_time)
        
        if type == "P":
            end_hour = int(end_time_24.split(':')[0])
            end_min = end_time_24.split(':')[1]
            end_hour = (end_hour + 1) % 24
            end_time_24 = f"{end_hour:02d}:{end_min}"

        if start_time_24 == "00:00":
            start_time_24 = "12:00"
        if end_time_24[3:] == "50":
            end_time_24 = f"{int(end_time_24[:2])+1}:00"
        return start_time_24, end_time_24
    except Exception as e:
        print(f"Error processing timeslot '{timeslot}': {e}")
        return "00:00", "00:00"

def is_elective128(extracted_batch:str):
    if extracted_batch == "ALL":
        return True
    return False

def do_you_have_subject(subject_codes: List[str], subject_code: str) -> bool:
    if subject_code in subject_codes:
        return True
    return False

def subject_name128(subjects_dict: dict, code: str) -> str:
    for subject in subjects_dict:
        if subject["fullCode"] == code:
            return subject["subject"]
        if subject["code"] == code:
            return subject["subject"]
    return code

def banado128(time_table_json: dict, subject_json: dict, batch: str, subject_codes: List[str]) -> dict:
    # try:
        time_table = time_table_json
        subject = subject_json
        your_time_table = []

        days = list(time_table.keys())
        # Iterate through each day in the timetable
        for day in days:
            time_slots = time_table[day]
            time_slot_keys = list(time_slots.keys())
            for time in time_slot_keys:
                classes = time_slots[time]
                if not isinstance(classes, list):
                    continue
                for indi_class in classes:
                    if not isinstance(indi_class, str):
                        continue
                    code = subject_extractor128(indi_class.strip())
                    batchs = batch_extractor128(indi_class.strip())
                    
                    if do_you_have_subject(subject_codes=subject_codes, subject_code=code) and is_batch_included128(batch, batchs):
                        your_time_table.append([day, time, subject_name128(subject, code), indi_class.strip()[0], location_extractor128(indi_class.strip())])

        formatted_timetable = {}

        for entry in your_time_table:
            day = process_day128(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot128(time, entry[3])

            if entry[2] in ["ENGINEERING DRAWING AND DESIGN", "Engineering Drawing & Design"]:
                end_time = f"{int(end_time[:2])+1}{end_time[2:]}"
            
            if day not in formatted_timetable:
                formatted_timetable[day] = {}
            # Format end time to ensure it's in HH:MM format
            if len(end_time) == 4:  # If end time is like "1100"
                end_time = f"{end_time[:2]}:{end_time[2:]}"

            if entry[2].strip() == entry[2].strip().upper():
                entry[2] = entry[2].strip().title()
                
            formatted_timetable[day][f"{start_time}-{end_time}"] = {
                "subject_name": entry[2],
                "type": entry[3],
                "location": entry[4]
            }
        
        return formatted_timetable

    # except Exception as e:
    #     print(f"{str(e)}")
    #     return {}
