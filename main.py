import json

def batch_extractor(text):
    start_bracket = text.find('(')
    if start_bracket != -1:
        return text[1:start_bracket].strip()
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
            if batch in (indi_class.strip()):
                subjectCode = indi_class.strip()
                code = subject_extractor(subjectCode)
                if len(indi_class.strip()) > 0:
                    print(day, time)
                    print(indi_class)
                    print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")
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

            for elective_code in electives_subject_codes:

                if subject_extractor(indi_class) == elective_code:
                    extracted_batch = batch_extractor(indi_class)

                    if ("-" not in extracted_batch) or ("," not in extracted_batch):
                        if len(extracted_batch) in [0,3]:
                            # code = subject_extractor(subjectCode)
                            print(day, time)
                            print(indi_class)
                            print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")

                        elif len(extracted_batch) == 1:
                            if extracted_batch == batch[0]:
                                print(day, time)
                                print(indi_class)
                                print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")

                        elif len(extracted_batch) == 2:
                            for letter in extracted_batch:
                                if letter == batch[0]:
                                    print(day, time)
                                    print(indi_class)
                                    print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")

                    else:
                        if ("," in extracted_batch):
                            batch_list = extracted_batch.split(",")
                            # print(batch_list, "\n")
                            for b in batch_list:
                                # print(b.strip())
                                if b.strip()[0] == batch[0]:
                                    if len(b.strip()) == 1:
                                        print(day, time)
                                        print(indi_class)
                                        print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")
                                    else:
                                        batch_nums = ((b.strip())).split("-")
                                        # print(batch_nums)
                                        # Ensure the batch string is in expected format
                                        if len(batch) > 1 and all(len(num.strip()) > 1 for num in batch_nums):
                                            batch_number_str = batch.strip()[1:]
                                            
                                            if batch_number_str:
                                                batch_number = int(batch_number_str)
                                                
                                                # Strip and slice batch_nums elements correctly
                                                batch_num_0 = int(batch_nums[0].strip()[1:])
                                                batch_num_1 = int(batch_nums[1].strip()[1:])
                                                
                                                if batch_num_0 <= batch_number <= batch_num_1:
                                                    print(day, time)
                                                    print(indi_class)
                                                    print(subject_name_extractor(subject, subject_extractor(indi_class)),f"{batch_extractor(indi_class)}\n")
                    
                                            else:
                                                print("Batch string is empty or incorrectly sliced.")
                                        else:
                                            print("Batch string or batch_nums are incorrectly formatted.")


            
# print(your_time_table)



