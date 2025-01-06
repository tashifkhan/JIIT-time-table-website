import json
from datetime import datetime
import re
from typing import List

def parse_batch_numbers(batch_input: str) -> List[str]:
    """
    Parse batch number formats and return array of individual batches.
    Handles special cases like 'ABC', single letters, and empty strings.
    """
    if not batch_input:
        return ['A', 'B', 'C', 'G']
    
    batch_input = batch_input.strip()
    
    # Handle concatenated batch numbers (e.g., A15A17)
    if re.match(r'^[A-Za-z]\d+[A-Za-z]\d+$', batch_input):
        matches = re.findall(r'[A-Za-z]\d+', batch_input)
        return [match.upper() for match in matches]
    
    # Handle ABC special case
    if batch_input.isalpha():
        return [c.upper() for c in batch_input]
    
    # Handle single letter case
    if len(batch_input) == 1 and batch_input.isalpha():
        return [batch_input.upper()]
    
    # Handle multiple ranges separated by comma
    if ',' in batch_input:
        ranges = [r.strip() for r in batch_input.split(',')]
        result = []
        current_prefix = None
        
        for r in ranges:
            if r.isdigit():  # If it's just a number, use the previous prefix
                if current_prefix:
                    result.append(f"{current_prefix}{r}")
                continue
            elif r[0].isalpha():  # If it starts with a letter, update the prefix
                current_prefix = re.match(r'([A-Za-z]+)', r).group(1)
            # Handle hyphen-separated ranges within comma-separated parts
            if '-' in r:
                parts = r.split('-')
                match = re.match(r'([A-Za-z]+)', parts[0])
                if not match:
                    continue
                prefix = match.group(1)
                numbers = [int(re.search(r'\d+', part).group()) for part in parts if re.search(r'\d+', part)]
                if numbers:
                    result.extend(f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1))
            else:
                # Handle non-range parts
                result.append(r.strip())
        return result
    
    # Handle single range without commas
    if '-' in batch_input:
        parts = batch_input.split('-')
        prefix = re.match(r'([A-Za-z]+)', parts[0]).group(1)
        numbers = [int(re.search(r'\d+', part).group()) for part in parts]
        return [f"{prefix}{i}" for i in range(numbers[0], numbers[-1] + 1)]
    
    # Handle single batch number
    return [batch_input]

def is_elective(extracted_batch: str, subject_code: str, extracted_batches: List[str]) -> bool:
    """
    Check if a subject code is an elective subject.
    
    Args:
        subject_code: Subject code to check
        electives: List of elective subject codes
    
    Returns:
        bool: True if subject is an elective, False otherwise
    """
    if extracted_batch.upper() == "A7-A8-A10":
        return False
    if extracted_batch.isalpha():
        return True
    if len(extracted_batches) > 3:
        return True
    if not extracted_batch.strip():
        return True
    if len(extracted_batches) == 3 and extracted_batch[0] == "C" and subject_code[0] != "B":
        return True
    return False

def is_batch_included(search_batch: str, extracted_batch_input: str) -> bool:
    """
    Check if a batch is included in the batch input string.
    Handles both exact matches and prefix matches.
    
    Args:
        search_batch: Batch to search for (e.g., 'A6' or 'B')
        batch_input: Input string containing batch specifications
    
    Returns:
        bool: True if batch is included, False otherwise
    """
    if not extracted_batch_input:
        return True
    batch_list = parse_batch_numbers(extracted_batch_input.strip())
    if search_batch in batch_list:
        return True
    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
            return True
    return False

def batch_extractor(text: str) -> str:
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[1:start_bracket].strip()
    return ""

def subject_extractor(text: str) -> str:
    start_bracket = text.find('(')
    if start_bracket != -1:
        end_bracket = text.find(')', start_bracket)
        if end_bracket != -1:
            return text[start_bracket + 1:end_bracket]
    return ""

def location_extractor(text: str) -> str:
    parts = text.split('-')
    if len(parts) < 2:
        return ""

    location = parts[-1].split('/')[0]
    return location.strip()
        

def subject_name_extractor(subjects_dict: dict, code: str) -> str:
    for subject in subjects_dict:
        if subject["Code"] == code:
            return subject["Subject"]
        if subject["Full Code"] == code:
            return subject["Subject"]
        if str(subject["Full Code"][:2] + subject["Code"]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Full Code"][3:]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Full Code"][2:]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Full Code"][:5] + subject["Code"]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Full Code"][2:5] + subject["Code"]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Full Code"][3:5] + subject["Code"]).strip() == code.strip():
            return subject["Subject"]
        if str(subject["Code"][1:]).strip() == code.strip():
            return subject["Subject"]
    return code

def do_you_have_elective(elective_subject_codes: List[str], subject_code: str, subject_dict :dict) -> bool:
    if subject_code in elective_subject_codes:
        return True
    electives_directory = []
    for subject in subject_dict:
        if subject["Code"] in elective_subject_codes:
            electives_directory.append(subject)
    for elective in electives_directory:
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][3:] == subject_code:
            return True
        if elective["Full Code"][2:] == subject_code:
            return True
        if elective["Full Code"][:5] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][:2] + elective["Code"] == subject_code:
            return True  
        if elective["Full Code"][2:5] + elective["Code"] == subject_code:
            return True
        if elective["Full Code"][3:5] + elective["Code"] == subject_code:
            return True
        if elective["Code"][1:] == subject_code:
            return True
    return False

def process_day(day_str: str) -> str:
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

def process_timeslot(timeslot: str, type: str = "L") -> tuple[str]:
    try:
        # Handle special case for NOON
        timeslot = timeslot.replace('12 NOON', '12:00 PM').replace('NOON', '12:00 PM')
        
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

        if start_time_24 == "00:00":
            start_time_24 = "12:00"
        if end_time_24[3:] == "50":
            end_time_24 = f"{int(end_time_24[:2])+1}00"
        return start_time_24, end_time_24
    except Exception as e:
        print(f"Error processing timeslot '{timeslot}': {e}")
        return "00:00", "00:00"
    

def time_table_creator(time_table_json: dict, subject_json: list, batch: str, electives_subject_codes: List[str]) -> dict:
    print("Processing inputs:", {
        "batch": batch,
        "electives": electives_subject_codes,
        "time_table_type": type(time_table_json),
        "subject_type": type(subject_json)
    })
    
    try:
        time_table = time_table_json if isinstance(time_table_json, dict) else {}
        subject = subject_json if isinstance(subject_json, list) else []
        your_time_table = []

        # Convert dict_keys to list for iteration
        days = list(time_table.keys())
        
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
                        
                    code = subject_extractor(indi_class.strip())
                    batchs = batch_extractor(indi_class.strip())
                    batchs_list = parse_batch_numbers(batchs)

                    if not is_elective(extracted_batch=batchs, subject_code=code, extracted_batches=batchs_list):
                        if is_batch_included(batch, batchs):
                            your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(indi_class.strip())])
                    else:
                        if do_you_have_elective(subject_dict=subject, elective_subject_codes=electives_subject_codes, subject_code=code) and is_batch_included(batch, batchs):
                            your_time_table.append([day, time, subject_name_extractor(subject, code), indi_class.strip()[0], location_extractor(indi_class.strip())])

        formatted_timetable = {}
        for entry in your_time_table:
            day = process_day(entry[0])
            time = entry[1]
            start_time, end_time = process_timeslot(time, entry[3])

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
    
    except Exception as e:
        print(f"Error in time_table_creator: {str(e)}")
        return {}

if __name__ == "__main__":
    # with open("./data/json/time_table.json", 'r') as file:
    #     time_table = json.load(file)

    with open("./data/json/subjects_newsem.json", 'r') as file:
        subject = json.load(file)

    # your_time_table = []

    # batch = input("Enter your Batch: ").upper().strip()
    # electives_subject_codes = []
    # n = int(input("Number of electives you have: "))
    # for i in range(n):
    #     electives_subject_codes.append(input("Enter the subject code of the elective (shortttened one): ").upper().strip())

    # print(json.dumps(time_table_creator(time_table, subject, batch, electives_subject_codes), indent=4))
    test = "LA5-A6(EC315)-G6/SCH"
    test2 = "T A1-A10,C1-C3 (H3H30)-FF1/IJ"
    test3 = "T B1-B15 (H3H30)-FF1/IJ"
    print(location_extractor(test3))
    print(subject_name_extractor(subject, subject_extractor(test3)))
    print(parse_batch_numbers(batch_extractor(test3)))
    print(location_extractor(test2))
    print(subject_name_extractor(subject, subject_extractor(test2)))
    print(parse_batch_numbers(batch_extractor(test2)))
    print(location_extractor(test))
    print(subject_name_extractor(subject, subject_extractor(test)))
    print(parse_batch_numbers(batch_extractor(test)))
    # print(batch_extractor(test2))
    # subjectCode = test2.strip()
    # code = subject_extractor(subjectCode) 
    # print(code)
    # print(subject_name_extractor(subject, code))
    # batch = "B12"
    # print(batch_extractor(test))
    # test_inputs = [
    #     "A3",
    #     "A5-A6",
    #     "A7-A8-A10",
    #     "C1-C3",
    #     "B9,10",
    #     "B3,B4",
    #     "B3,4",
    #     "B3,B4,A9",
    #     "B3,4,8,A9,C1-C3",
    #     "ABC",
    #     "B",
    #     "A",
    #     "C",
    #     "AC",
    #     "bc",
    #     "Ac",
    #     "A1-A10, B11-B15, C1-C3",
    #     "B1-B10",
    #     "",
    #     "A15A17",
    #     "A1-A10, B11-B15,C",
    #     "LA1-A10,C"
    # ]

    # print("Testing batch number parser:")
    # for test_input in test_inputs:
    #     result = parse_batch_numbers(test_input)
    #     print(f"Input: {test_input:20} -> Output: {result}")

    # print()

    # test_cases = [
    #     ("A6", "A1-A10"),
    #     ("B16", "B"),
    #     ("C2", "C1-C3"),
    #     ("A3", "ABC"),
    #     ("B5", "B1-B10"),
    #     ("B3", "B3,B4"),
    #     ("B4", "B3,4"),
    #     ("D1", "ABC"),
    #     ("A1", ""),
    #     ("A8", "A7-A8-A10"),
    #     ("B7", "Ca"),
    #     ("A14", "A14A17"),
    #     ("B12", "A1-A10, B11-B15, C1-C3"),
    #     ("B4", "B3,4,8,A9,C1-C3"),
    #     ("C5", "A1-A10, B11-B15,C "),
    # ]

    # for search_batch, batch_input in test_cases:
    #     result = is_batch_included(search_batch, batch_input)
    #     print(f"Searching for {search_batch:3} in {batch_input:10} -> {result}")



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