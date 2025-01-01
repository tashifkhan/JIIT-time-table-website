import json
from datetime import datetime

def batch_extractor(text):
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[1:start_bracket].strip()
    return ""

def subject_extractor(text):
    start_bracket = text.find('(')
    if start_bracket != -1:
        end_bracket = text.find(')', start_bracket)
        if end_bracket != -1:
            return text[start_bracket + 1:end_bracket]
    return ""

def location_extractor(text):
    start_dash = text.find('-')
    if start_dash != -1:
        end_slash = text.find('/', start_dash)
        if end_slash != -1:
            return text[start_dash + 1:end_slash]
    return ""

def subject_name_extractor(subjects_dict, code):
    for subject in subjects_dict:
        if subject["Code"] == code:
            return subject["Subject"]
    return ""

def process_day(day_str):
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

def process_timeslot(timeslot, type="L"):
    try:
        # Split the timeslot into start and end times
        start_time, end_time = timeslot.split('-')
        
        # Handle cases with or without AM/PM
        start_time = start_time.strip()
        end_time = end_time.strip().replace('.', ':')
        
        # Add AM if no AM/PM specified (assuming morning times)
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

        # Convert times to 24-hour format
        start_time_24 = convert_time_format(start_time)
        end_time_24 = convert_time_format(end_time)
        
        # Add an hour to end time if type is P
        if type == "P":
            end_hour = int(end_time_24.split(':')[0])
            end_min = end_time_24.split(':')[1]
            end_hour = (end_hour + 1) % 24
            end_time_24 = f"{end_hour:02d}:{end_min}"

        return start_time_24, end_time_24
    except Exception as e:
        print(f"Error processing timeslot '{timeslot}': {e}")
        return "00:00", "00:00"

def time_table_creator(time_table_json_string, subject_json_string, batch, electives_subject_codes):
    time_table = time_table_json_string
    subject = subject_json_string
    your_time_table = []
    # Iterate through each day in the timetable
    for day, it in time_table.items():
        # Iterate through each time slot in the day
        for time, classes in it.items():
            # Iterate through each class in the time slot
            for indi_class in classes:
                subjectCode = indi_class.strip()
                code = subject_extractor(subjectCode)  # Extract subject code from the class string

                # Check if class belongs to student's batch (direct match)
                if batch in batch_extractor(indi_class.strip()) and "-" not in batch_extractor(indi_class.strip()):
                    if len(indi_class.strip()) > 0:
                        your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])

                # Handle elective subjects
                for elective_code in electives_subject_codes:
                    # Skip practical sessions (marked with 'P')
                    if len(indi_class)>0 and indi_class[0] != "P":
                        if subject_extractor(indi_class) == elective_code:
                            extracted_batch = batch_extractor(indi_class)

                            # Handle simple batch assignments (no ranges or groups)
                            if ("-" not in extracted_batch) or ("," not in extracted_batch):
                                # No batch specified or full batch (3 characters)
                                if len(extracted_batch) in [0,3]:
                                    your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])

                                # Single character batch
                                elif len(extracted_batch) == 1:
                                    if extracted_batch == batch[0]:
                                        your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])

                                # Two character batch
                                elif len(extracted_batch) == 2:
                                    for letter in extracted_batch:
                                        your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])

                            # Handle comma-separated batch lists
                            if ("," in extracted_batch):
                                batch_list = extracted_batch.split(",")
                                for index, b in enumerate(batch_list):
                                    # Handle long batch lists (more than 3 batches)
                                    if len(batch_list) > 3:
                                        if b.strip()[0].isalpha():
                                            if b.strip()[0] == batch[0]:
                                                batch_list[index] = b[1:]
                                                if batch_list[index] == batch[1:]:
                                                    your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])
                                            else: 
                                                break
                                        else:
                                            if b == batch[1:]:
                                                your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])

                                    # Handle short batch lists
                                    else:
                                        if b.strip()[0] == batch[0]:
                                            # Single character batch
                                            if len(b.strip()) == 1:
                                                your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])
                                            else:
                                                # Handle batch ranges (e.g., A1-A4)
                                                batch_nums = ((b.strip())).split("-")
                                                if len(batch) > 1 and all(len(num.strip()) > 1 for num in batch_nums):
                                                    batch_number_str = batch.strip()[1:]

                                                    if batch_number_str:
                                                        # Check if student's batch number falls within the range
                                                        batch_number = int(batch_number_str)
                                                        batch_num_0 = int(batch_nums[0].strip()[1:])
                                                        batch_num_1 = int(batch_nums[1].strip()[1:])

                                                        if batch_num_0 <= batch_number <= batch_num_1:
                                                            your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(subjectCode)])
                                                    else:
                                                        print("Batch string is empty or incorrectly sliced.")
                                                else:
                                                    print("Batch string or batch_nums are incorrectly formatted.")

    ''' time table 
    ['MON', '10 -10.50 AM', 'Data Structures and Algorithms', 'L', 'G7']
    ['MON', '3-3.50 PM', 'Indian Constitution and Traditional knowledge', 'L', 'G8']
    ['TUES', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'G8']
    ['TUES', '3-3.50 PM', 'Data Structures and Algorithms Lab', 'P', 'CL04']
    ['WED', '9 -9.50 AM', 'Microprocessors and Microcontrollers', 'P', 'IOT Lab']
    ['WED', '1- 1.50 PM', 'Data Structures and Algorithms', 'L', 'G4']
    ['WED', '3-3.50 PM', 'Indian Constitution and Traditional knowledge', 'L', 'G6']
    ['THUR', '9 -9.50 AM', 'Indian Constitution and Traditional knowledge', 'L', 'G8']
    ['THUR', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'FF4']
    ['THUR', '3-3.50 PM', 'Data Structures and Algorithms', 'L', 'G4']
    ['THUR', '4-4.50 PM', 'Electromagnetic Field Theory', 'T', 'F10']
    ['FRI', '10 -10.50 AM', 'Electromagnetic Field Theory', 'L', 'G8']
    ['FRI', '3-3.50 PM', 'Python for Signal Processing & Communication Lab', 'P', 'SPL']
    ['SAT', '9 -9.50 AM', 'Electromagnetic Field Theory', 'P', 'ACL,JBSPL']
    '''

    formatted_timetable = {}

    for entry in your_time_table:
        day = process_day(entry[0])
        time = entry[1]
        start_time, end_time = process_timeslot(time, entry[3])
        
        if day not in formatted_timetable:
            formatted_timetable[day] = {}
        
        formatted_timetable[day][f"{start_time}-{end_time}"] = {
            "subject_name": entry[2],
            "type": entry[3],
            "location": entry[4]
        }
    
    return formatted_timetable

if __name__ == "__main__":
    with open("./data/json/time_table.json", 'r') as file:
        time_table = json.load(file)

    with open("./data/json/subject2.json", 'r') as file:
        subject = json.load(file)

    your_time_table = []

    batch = input("Enter your Batch: ").upper().strip()
    electives_subject_codes = []
    n = int(input("Number of electives you have: "))
    for i in range(n):
        electives_subject_codes.append(input("Enter the subject code of the elective (shortttened one): ").upper().strip())

    print(json.dumps(time_table_creator(time_table, subject, batch, electives_subject_codes), indent=4))

''' formated timetable
{
    "Monday": {
        "10:00-10:50": {
            "subject_name": "Data Structures and Algorithms",
            "type": "L",
            "location": "G7"
        },
        "15:00-15:50": {
            "subject_name": "Indian Constitution and Traditional knowledge",
            "type": "L",
            "location": "G8"
        }
    },
    "Tuesday": {
        "10:00-10:50": {
            "subject_name": "Electromagnetic Field Theory",
            "type": "L",
            "location": "G8"
        },
        "15:00-16:50": {
            "subject_name": "Data Structures and Algorithms Lab",
            "type": "P",
            "location": "CL04"
        }
    },
    "Wednesday": {
        "09:00-10:50": {
            "subject_name": "Microprocessors and Microcontrollers",
            "type": "P",
            "location": "IOT Lab"
        },
        "13:00-13:50": {
            "subject_name": "Data Structures and Algorithms",
            "type": "L",
            "location": "G4"
        },
        "15:00-15:50": {
            "subject_name": "Indian Constitution and Traditional knowledge",
            "type": "L",
            "location": "G6"
        }
    },
    "Thursday": {
        "09:00-09:50": {
            "subject_name": "Indian Constitution and Traditional knowledge",
            "type": "L",
            "location": "G8"
        },
        "10:00-10:50": {
            "subject_name": "Electromagnetic Field Theory",
            "type": "L",
            "location": "FF4"
        },
        "15:00-15:50": {
            "subject_name": "Data Structures and Algorithms",
            "type": "L",
            "location": "G4"
        },
        "16:00-16:50": {
            "subject_name": "Electromagnetic Field Theory",
            "type": "T",
            "location": "F10"
        }
    },
    "Friday": {
        "10:00-10:50": {
            "subject_name": "Electromagnetic Field Theory",
            "type": "L",
            "location": "G8"
        },
        "15:00-16:50": {
            "subject_name": "Python for Signal Processing & Communication Lab",
            "type": "P",
            "location": "SPL"
        }
    },
    "Saturday": {
        "09:00-10:50": {
            "subject_name": "Electromagnetic Field Theory",
            "type": "P",
            "location": "ACL,JBSPL"
        }
    }
}
'''