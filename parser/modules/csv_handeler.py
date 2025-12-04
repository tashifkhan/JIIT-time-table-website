import pandas as pd
import json
import io

def firstyear_subject_extractor(csv_string: str, imp_index: int) -> list[dict]:
    print("First Year Subject Extractor")
    df = pd.read_csv(io.StringIO(csv_string))
    df = df.dropna(how='all', axis=0)  # Drop rows where all values are NaN
    df = df.dropna(how='all', axis=1)  # Drop columns where all values are NaN
    rows, columns = df.shape

    heading_cell = (-1, -1)

    for i in range(imp_index, rows):
        for j in range(columns):
            cell_value = str(df.iloc[i,j])
            # print(cell_value)
            if cell_value ==  "SHORT FORM / SUBJECT CODE":
                heading_cell = (i, j)
                print(heading_cell)
                break
            elif cell_value == "SUBJECT CODE":
                heading_cell = (i, j)
                print(heading_cell)
                break
    
    if cell_value == "SHORT FORM / SUBJECT CODE":
        subject_binding = ["Code", "Subject"]
        output_subject = []
        for i in range(heading_cell[0]+1, rows):
            subject_dict = {}
            for j in range(2):
                if pd.notna(df.iloc[i,heading_cell[1]+j]):
                    subject_dict[subject_binding[j]] = str(df.iloc[i,heading_cell[1]+j]).strip()
            if subject_dict:
                if subject_dict["Code"] == "Faculty Abbreviation with Names":
                    break
                break_point = 0
                for i in range(len(subject_dict["Code"])):
                    if subject_dict["Code"][i] == " ":
                        break_point = i
                        break
                subject_dict["Full Code"] = subject_dict["Code"][break_point+3:]
                subject_dict["Code"] = subject_dict["Code"][:break_point]
                output_subject.append(subject_dict)
        return output_subject
    
    elif cell_value == "SUBJECT CODE":
        subject_binding = ["Full Code", "Subject"]
        output_subject = []
        for i in range(heading_cell[0]+1, rows):
            subject_dict = {}
            for j in range(2):
                if pd.notna(df.iloc[i,heading_cell[1]+j]):
                    subject_dict[subject_binding[j]] = str(df.iloc[i,heading_cell[1]+j]).strip()
        if subject_dict:
            subject_dict["Code"] = subject_dict["Full Code"][5:]
            output_subject.append(subject_dict)
        print(json.dumps(output_subject, indent=4))
        return output_subject
    else:
        return [
            {
                "Code": "CI121",
                "Full Code": "18B11CI121",
                "Subject": "Fundamentals of Computers & Programming - II"
            },
            {
                "Code": "CI121",
                "Full Code": "18B15CI121",
                "Subject": "Fundamentals of Computers & Programming Lab- II"
            },
            {
                "Code": "CI121",
                "Full Code": "15B11CI121",
                "Subject": "Software Development Fundamentals-II"
            },
            {
                "Code": "CI271",
                "Full Code": "15B17CI271",
                "Subject": "Software Development Fundamentals Lab-II"
            },
            {
                "Code": "HS111",
                "Full Code": "24B11HS111",
                "Subject": "Universal Human Values"
            },
            {
                "Code": "GE111",
                "Full Code": "18B15GE111",
                "Subject": "Engineering Drawing & Design"
            },
            {
                "Code": "MA211",
                "Full Code": "15B11MA211",
                "Subject": "Mathematics-II"
            },
            {
                "Code": "MA212",
                "Full Code": "15B11MA212",
                "Subject": "Basic Mathematics-II"
            },
            {
                "Code": "HS111",
                "Full Code": "24B16HS111",
                "Subject": "Life Skills and Professional Communications"
            },
            {
                "Code": "BT111",
                "Full Code": "18B15BT111",
                "Subject": "Basic Bioscience Lab"
            },
            {
                "Code": "PH211",
                "Full Code": "15B11PH211",
                "Subject": "Physics-2"
            },
            {
                "Code": "PH271",
                "Full Code": "15B17PH271",
                "Subject": "Physics Lab-2"
            },
            {
                "Code": "PH212",
                "Full Code": "15B11PH212",
                "Subject": "Biophysical Techniques"
            }
        ]

def csv_to_json(csv_file_path: str, json_filename: str, json_subject_filename: str) -> None:
    with open(csv_file_path, 'r') as file:
        csv_string = file.read()
    
    json_data = csvstring_to_jsonstrings(csv_string)
    
    # Write timetable data
    filename = f'./data/json/{json_filename}.json'
    with open(filename, 'w') as file:
        json.dump(json_data["timetable"], file, indent=4)
    print(f"Data has been written to {filename}")

    # Write subject data
    filename = f'./data/json/{json_subject_filename}.json'
    with open(filename, 'w') as file:
        json.dump(json_data["subjects"], file, indent=4)
    print(f"Data has been written to {filename}")


def csvstring_to_jsonstrings(csv_string: str) -> dict:
    # Read CSV into DataFrame and drop empty rows and columns
    print("CSV String to JSON Strings")
    df = pd.read_csv(io.StringIO(csv_string))
    df = df.dropna(how='all', axis=0)  # Drop rows where all values are NaN
    df = df.dropna(how='all', axis=1)  # Drop columns where all values are NaN
    rows, columns = df.shape
  
    # print("\nTable Structure:")
    # print("-" * (columns * 15))  # Print horizontal line
    # for i in range(rows):
    #     for j in range(columns):
    #         cell_value = str(df.iloc[i,j])
    #         print(f"{cell_value[:12]:<12}", end=" | ")  # Truncate and left-align values
    #     print("\n" + "-" * (columns * 15))  # Print horizontal line after each row

    output = {}
    current_day = "-1"
    col_time_mapping = []
    does_include_subjects = False

    for k in range(1,columns):
        col_time_mapping.append(df.iloc[0,k])
    
    # Initialize time slots with empty lists for each day
    for i in range(0, rows):
        if pd.notna(df.iloc[i,0]):
            current_day = str(df.iloc[i,0]).strip()
            if current_day not in output:
                output[current_day] = {time: [] for time in col_time_mapping}

    # Find where subject codes start
    next_file_index = -1
    for i in range(2, rows):
        if (str(df.iloc[i,1]) == "Short Subject Code" or str(df.iloc[i,1]) == "Short Name"):
            next_file_index = i
            does_include_subjects = True
            break

    # Extract class entries
    if next_file_index == -1:
        for i in range(2, rows):
            if (str(df.iloc[i,1]).strip() == "IMPORTANT INFORMATION"):
                next_file_index = i
                break
    
    for i in range(0, next_file_index):
        if pd.notna(df.iloc[i,0]):
            current_day = str(df.iloc[i,0]).strip()
        
        for j in range(1, columns):
            # print(df.iloc[i,j])
            if pd.notna(df.iloc[i,j]):
                output[current_day][col_time_mapping[j-1]].append(str(df.iloc[i,j]).strip())


    # Extract subject codes and details
    output_subject = []
    subject_binding = ["Code", "Full Code", "Subject"]
    if does_include_subjects:
        coordinate = []
        for i in range(next_file_index, rows):
            for j in range(0, columns): 
                if j < columns - 2 and (str(df.iloc[i,1+j]) == "Short Subject Code" or str(df.iloc[i,1+j]) == "Short Name"):
                    coordinate.append(j)
        # print(coordinate)
        for i in range(next_file_index+1, rows):
            for j in coordinate:  # Step by 3 to handle both sets of columns
                if pd.notna(df.iloc[i,1+j]):
                    subject_dict = {}
                    for k in range(3):
                        if pd.notna(df.iloc[i,1+j+k]):
                            # print(str(df.iloc[i,1+j+k]).strip())
                            subject_dict[subject_binding[k]] = str(df.iloc[i,1+j+k]).strip()
                    if subject_dict:
                        output_subject.append(subject_dict)
    else:
        output_subject = firstyear_subject_extractor(csv_string, next_file_index)

    # print(json.dumps(output_subject, indent=4))

    return {
        "timetable": output,
        "subjects": output_subject
    }

if __name__ == "__main__":
    csv_to_json("./hello.csv", "test012", "testsub122")

'''
    if does_include_subjects:
        for i in range(next_file_index, rows):
            if i == next_file_index:
                for j in range(1, columns): 
                    coordinate = []
                # for j in range(0, 6, 3):  # Step by 3 to handle both sets of columns
                    if j < columns - 2 and (str(df.iloc[i,1+j]) == "Short Subject Code" or str(df.iloc[i,1+j]) == "Short Name"):
                        print(df.iloc[i,1+j], "-->")
                        coordinate.append(j+1)
                subject_dict = {}
            for j in coordinate:
                for k in range(3):
                    if j + k < columns - 1 and pd.notna(df.iloc[i,1+j+k]):
                        subject_dict[subject_binding[k]] = str(df.iloc[i,1+j+k]).strip()
                if subject_dict:
                    output_subject.append(subject_dict)
    else:
        output_subject = firstyear_subject_extractor(csv_string, next_file_index)
'''