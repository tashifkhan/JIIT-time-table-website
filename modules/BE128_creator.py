import re
from datetime import datetime
import json

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


def faculty_extractor(text: str) -> str:
    start_bracket = text.find('/')
    if start_bracket != -1:
        return text[start_bracket+1:].strip()
    return ""

def expand_batch(batch_code):
    """Expand batch code into list of individual batches."""
    if not batch_code: 
        return []
        
    if batch_code == 'ALL':
        return ['E', 'F']
    
    matches = re.findall(r'([A-Z])(\d+)', batch_code)
    if matches:
        return [f"{letter}{number}" for letter, number in matches]
    
    return [batch_code]

def location_extractor(text: str) -> str:
    parts = text.split('-')
    if len(parts) < 2:
        return ""

    location = parts[-1].split('/')[0]
    return location.strip()

def is_batch_included(search_batch: str, extracted_batch_input: str) -> bool:
    if not extracted_batch_input:
        return True
    batch_list = expand_batch(extracted_batch_input.strip())
    if search_batch in batch_list:
        return True
    for batch in batch_list:
        if len(batch) == 1 and search_batch[0] == batch:
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
    time_str = time_str.strip().replace(' ', '')
    
    if 'AM' in time_str or 'PM' in time_str:
        if ':' not in time_str:
            time_str = time_str.replace('AM', ':00 AM').replace('PM', ':00 PM')

    time_str = time_str.replace('AM', ' AM').replace('PM', ' PM')
    
    try:
        return datetime.strptime(time_str, '%I:%M %p').strftime('%H:%M')
    except ValueError as e:
        raise ValueError(f"Error parsing time string '{time_str}': {e}")

def process_timeslot(timeslot: str, type: str = "L") -> tuple[str]:
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

        start_time_24 = convert_time_format(start_time)
        end_time_24 = convert_time_format(end_time)
        
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
    

def is_elective(extracted_batch:str):
    if extracted_batch == "ALL":
        return True
    return False

def do_you_have_elective(elective_subject_codes: list[str], subject_code: str) -> bool:
    if subject_code in elective_subject_codes:
        return True
    return False

def time_table_creator(time_table_json: dict, subject_json: dict, batch: str, electives_subject_codes: list[str]) -> dict:
    time_table = time_table_json
    subject = subject_json
    your_time_table = []
    # Iterate through each day in the timetable
    for day, it in time_table.items():
        # Iterate through each time slot in the day
        for time, classes in it.items():
            # Iterate through each class in the time slot
            for indi_class in classes:
                code = subject_extractor(indi_class.strip())
                batchs = batch_extractor(indi_class.strip())

                if not is_elective(extracted_batch=batchs):
                    if is_batch_included(batch, batchs):
                        your_time_table.append([day, time, subject[code.strip()], indi_class.strip()[0], location_extractor(indi_class.strip())])

                else:
                    if do_you_have_elective(elective_subject_codes=electives_subject_codes, subject_code=code) and is_batch_included(batch, batchs):
                        your_time_table.append([day, time, subject[code.strip()], indi_class.strip()[0], location_extractor(indi_class.strip())])


    formatted_timetable = {}

    for entry in your_time_table:
        day = process_day(entry[0])
        time = entry[1]
        start_time, end_time = process_timeslot(time, entry[3])

        if entry[2].strip() in ["ENGINEERING DRAWING AND DESIGN", "Engineering Drawing & Design"]:
            end_time = f"{int(end_time[:2])+1}{end_time[2:]}"
        
        if day not in formatted_timetable:
            formatted_timetable[day] = {}
        
        formatted_timetable[day][f"{start_time}-{end_time}"] = {
            "subject_name": entry[2],
            "type": entry[3],
            "location": entry[4]
        }
    
    return formatted_timetable

if __name__ == "__main__":
    # Test cases
    test_strings = [
        "PF7F8F9(18B11CS311)-CL3/AYUSHI/KEDARNATH/ANUBHUTI/PANKAJ MISHRA/NEERAJ JAIN",
        "LE15E16(15B11EC411) -\nCR53/BHARTENDU CHATURVEDI",
        "LF9F10(18B11EC213) -CR53/ATUL\nKUMAR",
        "LALL(21B12CS318) -148/ARTI JAIN",              # Should return ['E', 'F']
        "TE1E2E3E4E5(19B12HS613)- 244B/AMBA AGARWAL",   # Should return ['E1', 'E2', 'E3', 'E4', 'E5']
        "LE5(15B11EC611) -153/DIVYA KAUSHIK",           # Should return ['E5']
        "LF7F8(15B11CI513) -148/ASHISH"                 # Should return ['F7', 'F8']
    ]

    for test in test_strings:
        batch = batch_extractor(test)
        expanded = expand_batch(batch)
        print(f"Input: {test}")
        print(f"Extracted: {batch}")
        print(f"location: {location_extractor(test)}")
        print(f"faculty: {faculty_extractor(test)}")
        print(f"Expanded: {expanded}\n")

    # Test cases for is_batch_included
    print("Testing is_batch_included function:")
    test_cases = [
        ("F7", "F7F8F9", True),
        ("E5", "E1E2E3E4E5", True),
        ("F99", "ALL", True),
        ("E1", "E", True),
        ("F9", "F7F8", False),
        ("E3", "F7F8", False),
        ("E1", "", True),
    ]

    for search_batch, batch_input, expected in test_cases:
        result = is_batch_included(search_batch, batch_input)
        print(f"search_batch: {search_batch}, batch_input: {batch_input}")
        print(f"Expected: {expected}, Got: {result}")
        assert result == expected, f"Test failed for {search_batch} in {batch_input}"
        print("Test passed!\n")

    time_table = {
			"MON": {
				"8:00 - 8:50 AM": [
					"LALL(17B11EC731) -148/AJIT KUMAR",
					"LALL(18B13EC314) -153/B. SURESH",
					"LALL(23B12EC311) - 118/SATYENDRA KUMAR",
					"LALL(21B12CS319) - 117/VARSHA GARG",
					"LALL(21B12CS314) - 226/DEVPRIYA",
					"LALL(21B12CS312) - 228/SHARIQ",
					"LALL(21B12CS315) - 123/ADITIPRIYA"
				],
				"9 - 9:50 AM": [
					"LALL(21B12CS318) -148/ARTI JAIN",
					"LALL(21B12CS321) -153/SHRUTI GUPTA",
					"LALL(21B12CS317) -117//HIMANSHU",
					"LALL(21B12CS320)-118//SNIGDHA",
					"LALL(21B12CS313) -123/RASHMI",
					"TE1E2E3E4E5(16B1NHS636)- 113/EKTA SRIVASTAVA",
					"TE1E2E3E4E5(16B1NHS635)- 244/ANSHU BANWARI",
					"TE1E2E3E4E5(19B12HS613)- 244B/AMBA AGARWAL"
				],
				"10:00-10:50 AM": [
					"LF1F2(15B11CI513) -230/CHETNA",
					"LALL(15B11CI514) -217/SHIKHA",
					"LF5F6(15B11CI513) -235/VARTIKA",
					"LF3F4(15B11CI513) -229/MUKTA",
					"LF7F8(15B11CI513) -148/ASHISH",
					"TE3(18B11EC315) -116/VINAY ANAND TIKKIWAL"
				],
				"11:00-11:50 AM": [
					"PE2(15B17EC671)-134/DIVYA KAUSHIK",
					"LE3E4(15B11EC611) -118/KUMAR MOHIT",
					"LF1F2(18B11CS311) -234/PANKAJ",
					"TF2(15B11CI513) -127/ADITI SHARMA",
					"TE1(18B11EC315) -138/VINAY ANAND TIKKIWAL"
				],
				"12:00 - 12:50 PM": [],
				"1:00 PM - 1:50PM": [
					"LE3E4(18B11EC315) -117/HIMANI GUPTA",
					"LF3F4(18B11CS311) - 118/KEDARNATH",
					"LF9(18B11CS311) -123/NEERAJ JAIN",
					"LF7F8(18B11CS311) -148/AYUSHI",
					"PE1(18B15EC315)-142/VIMAL KUMAR MISHRA"
				],
				"2:00 PM - 2:50 PM": [
					"TF1(15B11CI513) -244B/LALITA",
					"PF4F5F6(18B11CS311)- CL3/ANUBHUTI/PANKAJ/AYUSHI/KEDARNATH/NEERAJ JAIN",
					"LE5(15B11EC611) -123/DIVYA KAUSHIK"
				],
				"3:00 PM - 3 :50 PM": [
					"LF9(18B11CS311) -117/NEERAJ JAIN",
					"TF3(15B11CI513) -226/MUKTA",
					"TE5(18B11EC315) -123/VINAY ANAND TIKKIWAL"
				],
				"4:00 PM -4:50 PM": [
					"LALL(22B12CS413) -225/NIVEDITTA",
					"LALL(18B12EC417) -229/NILUFAR YASMIN"
				],
				"5:00 PM -5:50 PM": [
					"LALL(22B12CS422) - 225/SATYAPRAKASH",
					"LALL(19B12EC414) -229/ ANKUR GUPTA"
				]
			},
			"TUES": {
				"8:00 - 8:50 AM": [
					"LALL(17B1NEC741) -117/ARTI NOOR",
					"LALL(15B11EC613) - 118/JITENDRA MOHAN",
					"LALL(17B1NEC734) - 153//ASHISH GUPTA",
					"LALL(21B12CS319) - 148/VARSHA GARG",
					"LALL(21B12CS314) - 226/DEVPRIYA",
					"LALL(21B12CS312) - 228/SHARIQ",
					"LALL(21B12CS315) - 123/ADITIPRIYA"
				],
				"9 - 9:50 AM": [
					"LALL(18B12MA611)-117/AMITA BHAGAT",
					"LALL(19M12MA611)-217/AMIT SRIVASTAVA",
					"LALL(16B1NMA633)-123/KAMLESH KUMAR SHUKLA",
					"LALL(16B1NHS631)-CR53/DEEPAK VERMA",
					"LALL(16B1NPH633)-153/PRASHANT CHAUHAN",
					"LALL(16B1NPH631)-148/VIKAS MALIK",
					"LALL(16B1NPH632)-226/ANUJ KUMAR"
				],
				"10:00-10:50 AM": [
					"LE1E2(18B11EC315) -148/VIMAL KUMAR MISHRA",
					"LE5(15B11EC611) -153/DIVYA KAUSHIK",
					"PF7F8F9(18B11CS311)-CL3/AYUSHI/KEDARNATH/ANUBHUTI/PANKAJ MISHRA/NEERAJ JAIN",
					"PF1F2F3(21B17CI573)-CL2/MUKTA/CHETNA/ASHISH/VARTIKA"
				],
				"11:00-11:50 AM": [
					"PE1(15B17EC671)-134/KAPIL DEV TYAGI",
					"LE3E4(15B11EC611) -118/KUMAR MOHIT",
					"LE5(18B11EC315) -123/HIMANI GUPTA"
				],
				"12:00 - 12:50 PM": ["TALL(15B11CI514) -123/GAURAV KUMAR NIGAM"],
				"1:00 PM - 1:50PM": [
					"LE3E4(18B11EC315) -117/HIMANI GUPTA",
					"LF9(18B11CS311) -123/NEERAJ JAIN",
					"TF5F6F7F8(16B1NHS632)- 118/SHWETA VERMA"
				],
				"2:00 PM - 2:50 PM": [
					"TF5(15B11CI513) -123/LALITA",
					"TF1F2F3F4E3(18B12HS611)- 117/DEEPAK VERMA",
					"PE2(18B15EC315)-142/VIMAL KUMAR MISHRA",
					"TF1F2F3F4E3(16B1NHS632)- 118/SHWETA VERMA",
					"TF6F7F8F9(19B12HS613)-111/AMBA AGARWAL"
				],
				"3:00 PM - 3 :50 PM": [
					"LF5F6(18B11CS311) -226/ANUBHUTI",
					"TF7(15B11CI513) -228/ADITI SHARMA",
					"TF1F2F3F4F5F6(20B12HS311)- 118/GEORGE"
				],
				"4:00 PM -4:50 PM": [
					"LALL(20B12MA411)-225/UMME ZAINAB",
					"LALL(18B12PH812) - /AMIT VERMA"
				],
				"5:00 PM -5:50 PM": [
					"LALL(22B12CS413) - 225/NIVEDITTA",
					"LALL(19B12EC414) -229/ ANKUR GUPTA"
				]
			},
			"WED": {
				"8:00 - 8:50 AM": [
					"LALL(18B12HS611)- 117/DEEPAK VERMA",
					"LALL(16B1NHS635)- 118/ANSHU BANWARI",
					"LALL(20B12HS311)- 226/GEORGE",
					"LALL(16B1NHS636)-123/EKTA SRIVASTAVA",
					"LALL(19B12HS613)-153/AMBA AGARWAL",
					"LALL(16B1NHS632)- 148/SHWETA VERMA",
					"LALL(18B12MA611)- 117/AMITA BHAGAT",
					"LALL(19M12MA611)-217/AMIT SRIVASTAVA",
					"LALL(16B1NMA633)- 123/KAMLESH KUMAR SHUKLA",
					"LALL(16B1NHS631)- 228/DEEPAK VERMA"
				],
				"9 - 9:50 AM": [
					"LALL(17B11EC731) -148/AJIT KUMAR",
					"LALL(18B13EC314) -153/B. SURESH",
					"LALL(23B12EC311) - 118/SATYENDRA KUMAR",
					"LALL(21B12CS318) -226/ARTI JAIN",
					"LALL(21B12CS321) -244B/SHRUTI GUPTA",
					"LALL(21B12CS317) -123//HIMANSHU",
					"LALL(21B12CS320)-117/SNIGDHA",
					"LALL(21B12CS313) -CR54/RASHMI",
					"LALL(17B1NEC741) -117/ARTI NOOR",
					"LALL(15B11EC613) -118/JITENDRA MOHAN",
					"LALL(17B1NEC734) -153/ASHISH GUPTA",
					"LALL(21B12CS319) -148/VARSHA GARG"
				],
				"10:00-10:50 AM": [
					"LALL(20B16CS326)-123/SHAILESH",
					"LALL(20B16CS322)-148/TWINKLE",
					"LALL(20B16CS323)-153/NIVEDITTA",
					"LALL(16B1NHS634 )- 117/NILU CHOUDHARY",
					"LALL(16B19EC691) -118/VINAY ANAND TIKKIWAL",
					"LF1F2(15B11CI513) -148/CHETNA",
					"LALL(15B11CI514) -153/SHIKHA",
					"LF5F6(15B11CI513) -123/VARTIKA",
					"LF3F4(15B11CI513) -117/MUKTA"
				],
				"11:00-11:50 AM": [
					"LE5(15B11EC611) -148/DIVYA KAUSHIK",
					"LF5F6(18B11CS311) -153/ANUBHUTI",
					"LF7F8(18B11CS311) -118/AYUSHI",
					"TE2(18B11EC315) -244/VIMAL KUMAR MISHRA",
					"PE5(15B17EC671)-134/RAVI PRAKASH VERMA",
					"LE1E2(18B11EC315) -117/VIMAL KUMAR MISHRA",
					"LE3E4(18B11EC315) -118/HIMANI GUPTA",
					"LF3F4(18B11CS311) - 123/KEDARNATH"
				],
				"12:00 - 12:50 PM": [],
				"1:00 PM - 1:50PM": [
					"LE5(18B11EC315) -118/HIMANI GUPTA",
					"LE1E2(15B11EC611) -117/DIVYA KAUSHIK",
					"TF8(15B11CI513) -121/LALITA",
					"LE3E4(15B11EC611) -118/KUMAR MOHIT",
					"LE1E2(15B11EC611) -117/DIVYA KAUSHIK"
				],
				"2:00 PM - 2:50 PM": [
					"PE3(18B15EC315)-142/SATYENDRA KUMAR",
					"LF1F2(18B11CS311) -123/PANKAJ",
					"LF3F4(18B11CS311) - CR53/KEDARNATH",
					"TF5F6F7F8F9E1E2E4E5(18B12HS611)- 118/DEEPAK VERMA",
					"TF9E1E2E4E5(16B1NHS632)- 111/SHWETA VERMA",
					"PE1E2E3F7F8F9(16B1NHS634 ) -117/NILU CHOUDHARY",
					"PE4(18B15EC315)-142/SATYENDRA KUMAR",
					"PF1F2F3(18B11CS311)-CL3//KEDARNATH/PANKAJ MISHRA/ANUBHUTI/NEERAJ JAIN/AYUSHI"
				],
				"3:00 PM - 3 :50 PM": [
					"LF1F2(15B11CI513) -117/CHETNA",
					"LALL(15B11CI514) -118/SHIKHA",
					"LF5F6(15B11CI513) -123/VARTIKA",
					"LF3F4(15B11CI513) -226/MUKTA",
					"LF7F8F8(15B11CI513) -228/ASHISH"
				],
				"4:00 PM -4:50 PM": [
					"LALL(22B12CS422) - 225/SATYAPRAKASH",
					"LALL(18B12EC417) -229/NILUFAR YASMIN",
					"LALL(22B12CS422) - 225/SATYAPRAKASH",
					"LALL(18B12EC417) -229/NILUFAR YASMIN"
				],
				"5:00 PM -5:50 PM": [
					"LALL(20B12MA411)- 225/UMME ZAINAB",
					"LALL(18B12PH812) - /AMIT VERMA"
				]
			},
			"THUR": {
				"8:00 - 8:50 AM": [
					"LALL(16B1NPH633)- 153/PRASHANT CHAUHAN",
					"LALL(16B1NPH631)-148/VIKAS MALIK",
					"LALL(16B1NPH632)-226/ANUJ KUMAR"
				],
				"9 - 9:50 AM": [
					"LALL(21B12CS314) -226/DEVPRIYA",
					"LALL(21B12CS312) -228/SHARIQ",
					"LALL(21B12CS315) - 123/ADITIPRIYA"
				],
				"10:00-10:50 AM": ["LF7F8F8(15B11CI513) -118/ASHISH"],
				"11:00-11:50 AM": [],
				"12:00 - 12:50 PM": [],
				"1:00 PM - 1:50PM": ["TF6F9(15B11CI513) -126/ANUBHUTI"],
				"2:00 PM - 2:50 PM": ["PF4F5F6(21B17CI573)-CL2/MUKTA/CHETNA/ASHISH/"],
				"3:00 PM - 3 :50 PM": [],
				"4:00 PM -4:50 PM": [],
				"5:00 PM -5:50 PM": []
			},
			"FRI": {
				"8:00 - 8:50 AM": [
					"LALL(17B11EC731) -148/AJIT KUMAR",
					"LALL(18B13EC314) -153/B. SURESH",
					"LALL(23B12EC311) - 118/SATYENDRA KUMAR",
					"LALL(21B12CS318) -226/ARTI JAIN",
					"LALL(21B12CS321) - 228/SHRUTI GUPTA",
					"LALL(21B12CS317) - 123//HIMANSHU",
					"LALL(21B12CS320)- 117/SNIGDHA",
					"LALL(21B12CS313) - 111/RASHMI"
				],
				"9 - 9:50 AM": [
					"LALL(18B12HS611)-117/DEEPAK VERMA",
					"LALL(16B1NHS635)-118/ANSHU BANWARI",
					"LALL(20B12HS311)-217/GEORGE",
					"LALL(16B1NHS636)-123/EKTA SRIVASTAVA",
					"LALL(19B12HS613)-153/AMBA AGARWAL",
					"LALL(16B1NHS632)-148/SHWETA VERMA"
				],
				"10:00-10:50 AM": [
					"PE3(15B17EC671)-134/RAVI PRAKASH VERMA",
					"LF5F6(18B11CS311) -117/ANUBHUTI",
					"TE4(18B11EC315) -126/VIMAL KUMAR MISHRA",
					"LE5(18B11EC315) -123/HIMANI GUPTA",
					"PF7F8F9(215B17CI573)-CL2/"
				],
				"11:00-11:50 AM": [
					"LE1E2(15B11EC611) -117/DIVYA KAUSHIK",
					"LF1F2(18B11CS311) -118/PANKAJ",
					"TF4(15B11CI513) -127/ADITI SHARMA"
				],
				"12:00 - 12:50 PM": [],
				"1:00 PM - 1:50PM": [
					"LE1E2(18B11EC315) -117/VIMAL KUMAR MISHRA",
					"TF1F2F3F4F5F6(20B12HS311)- 118/GEORGE",
					"LF7F8(18B11CS311) -123/AYUSHI",
					"PE5(18B15EC315)-142/SATYENDRA KUMAR",
					"PE4(15B17EC671)-134/RAVI PRAKASH VERMA"
				],
				"2:00 PM - 2:50 PM": ["P ALL(15B17CI574)-CL4/SHIKHA/MUKTA/GAURAV"],
				"3:00 PM - 3 :50 PM": ["LE5(15B11EC611) -123/KUMAR MOHIT"],
				"4:00 PM -4:50 PM": [
					"LALL(22B12CS413) -225/NIVEDITTA",
					"LALL(19B12EC414) -229/ ANKUR GUPTA"
				],
				"5:00 PM -5:50 PM": [
					"LALL(20B12MA411)- 225/UMME ZAINAB",
					"LALL(18B12PH812) - /AMIT VERMA"
				]
			},
			"SAT": {
				"8:00 - 8:50 AM": [
					"LALL(15B11EC613) - 118/JITENDRA MOHAN",
					"LALL(17B1NEC734) - 148/ASHISH GUPTA",
					"TF1F2F3F4F5F6F7F8F9(16B1N HS636)-116//EKTA SRIVASTAVA",
					"TF1F2F3F4F5F6F7F8F9(16B1N HS635)-113//ANSHU BANWARI",
					"TF1F2F3F4F5(19B12HS613)- 121//AMBA AGARWAL",
					"LALL(17B1NEC741) -117/ARTI NOOR"
				],
				"9 - 9:50 AM": [
					"LALL(18B12MA611)-117/AMITA BHAGAT",
					"LALL(19M12MA611)-217/AMIT SRIVASTAVA",
					"LALL(16B1NMA633)-123/KAMLESH KUMAR SHUKLA",
					"LALL(16B1NHS631)-228/DEEPAK VERMA",
					"LALL(16B1NPH633)-153/PRASHANT CHAUHAN",
					"LALL(16B1NPH631)-148/VIKAS MALIK",
					"LALL(16B1NPH632)-230/ANUJ KUMAR"
				],
				"10:00-10:50 AM": [
					"PE4E5F1F2F3F4F5F6(16B1NHS634 ) -117/NILU CHOUDHARY",
					"PALL(20B16CS326)-CL4/SHRUTI JAISWAL/SHAILESH/SHIKHA",
					"PALL(20B16CS322)-CL3/DEVPRIYA/TWINKLE/JANARDAN",
					"PALL(20B16CS323)-CL2/NIVEDITA/MUKESH/HIMANI/AMBALIKA",
					"LALL(16B19EC691) -118/VINAY ANAND TIKKIWAL"
				],
				"11:00-11:50 AM": [],
				"12:00 - 12:50 PM": ["TF7F8F9E1E2E3E4E5(20B12HS311)- 118/GEORGE"],
				"1:00 PM - 1:50PM": [],
				"2:00 PM - 2:50 PM": [],
				"3:00 PM - 3 :50 PM": [],
				"4:00 PM -4:50 PM": [],
				"5:00 PM -5:50 PM": []
			}
		}
    
    subjects = {
			"18B12HS611": "Marketing Management",
			"20B16CS322": "Java Programming",
			"18B11CS311": "Computer Networks and Internet of Things",
			"18B12EC417": "SATELLITE COMMUNICATION",
			"16B1NHS635": "Organisational Behaviour",
			"20B16CS323": "Problem Solving using C and C++",
			"15B11CI513": "Software Engineering",
			"18B12MA811": "FUZZY OPTIMIZATION & DECSION MAKING",
			"20B12HS311": "Global Politics",
			"20B16CS326": "Front End Programming",
			"15B11CI514": "Artificial Intelligence",
			"22B12CS413": "Data Analytics using R and Python",
			"16B1NHS636": "Literature and Adaption",
			"15B11EC611": "Telecommunication Networks",
			"21B12CS312": "Sensor Technology & Android Programming",
			"22B12CS422": "Cloud computing Essentials: Azure and AWS",
			"19B12HS613": "International Trade and Finance",
			"18B11EC315": "VLSI Design",
			"21B12CS319": "Fundamentals of Soft Computing",
			"19B12EC414": "PROCESSING WITH DEEP LEARNING",
			"16B1NPH631": "COMPUTATIONAL PHYSICS",
			"17B11EC731": "Mobile Communication",
			"21B12CS314": "Introduction to Large Scale Database Systems",
			"16B1NPH632": "SOLID STATE ELECTRONIC DEVICES",
			"18B13EC314": "Machine Learning for Signal Processing",
			"21B12CS315": "Web Technology and Cyber Security",
			"16B1NPH633": "PHOTOVOLTAIC TECHNIQUES",
			"23B12EC311": "Semiconductor Devices and Circuits",
			"21B12CS317": "Introduction to Blockchain Technology",
			"18B12MA611": "Operations Research",
			"15B11EC613": "Control Systems",
			"21B12CS318": "Big Data Ingestion",
			"17B1NEC741": "Digital Hardware Design",
			"21B12CS320": "Open source software development",
			"16B1NMA633": "Statistics",
			"17B1NEC734": "RF and Microwave Engineering",
			"21B12CS313": "Fundamentals of Distributed and Cloud Computing",
			"16B1NHS631": "Project Management",
			"16B19EC691": "Renewable Energy",
			"21B12CS321": "Concepts of Graph theory",
			"15B17CI573": "Software Engineering Lab",
			"15B17EC671": "Telecommunication Networks Lab",
			"15B17CI574": "Artificial Intelligence Lab",
			"18B15EC315": "VLSI Design Lab-II",
			"16B1NHS632": "Cognitive Psychology",
			"16B1NHS634": "THEATRE AND PERFORMANCE"
		}
    
    print(json.dumps(time_table_creator(time_table, subjects, "E3", ["17B11EC731", "20B12HS311", "20B16CS323", "16B1NMA633", "17B1NEC734"]), indent=4))