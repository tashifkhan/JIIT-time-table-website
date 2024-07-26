import json

def batch_extractor(text):
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[2:start_bracket]
    return ""

def subject_extractor(text):
    start_bracket = text.find('(')
    if start_bracket != -1:
        # Find the position of the closing parenthesis
        end_bracket = text.find(')', start_bracket)
        if end_bracket != -1:
            # Extract the substring inside the brackets
            return text[start_bracket + 1:end_bracket]
    return ""
    
def location_extractor(text):
    # Find the position of the dash
    start_dash = text.find('-')
    if start_dash != -1:
        # Find the position of the slash after the dash
        end_slash = text.find('/', start_dash)
        if end_slash != -1:
            # Extract the substring after the dash and before the slash
            return text[start_dash + 1:end_slash]
    return ""

def subject_name_extractor(subjects_dict, code):
    for i in range(len(subjects_dict["Code"])):
        if subjects_dict["Code"][i] == code:
            return subjects_dict["Subject"][i]
    return ""


with open("time_table.json", 'r') as file:
    time_table = json.load(file)

with open("subject.json", 'r') as file:
    subject = json.load(file)

your_time_table = {}

batch = input("Enter your Batch: ").upper().strip()
print(batch)
electives_subject_codes = []
n = int(input("Number of electives you have: "))
for i in range(n):
    electives_subject_codes.append(input("Enter the subject code of the elective (shortttened one): ").upper().strip())

for day, it in time_table.items():
    for time, classes in it.items():
        for indi_class in classes:
            if batch in indi_class.strip():
                subjectCode = indi_class.strip()
                code = subject_extractor(subjectCode)
                your_time_table.update({
                    day:{
                        time:{
                            # "subjectCode": subjectCode,
                            # "code": code,
                            "name": subject_name_extractor(subject, code),
                            "type": indi_class.strip()[0],
                            "location": location_extractor(subjectCode)

                        }
                    }
                })
                # your_time_table[day][time].append(indi_class.strip())
            for elective_code in electives_subject_codes:
                if subject_extractor(indi_class) == elective_code:
                    print(day, time)
                    print(indi_class)
                    print(subject_name_extractor(subject, subject_extractor(indi_class)),"\n")

            
# print(your_time_table)



