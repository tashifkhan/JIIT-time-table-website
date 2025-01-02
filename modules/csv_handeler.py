import pandas as pd
import json
import io

def firstyear_subject_extractor(csv_string, imp_index):
    df = pd.read_csv(io.StringIO(csv_string))
    df = df.dropna(how='all', axis=0)  # Drop rows where all values are NaN
    df = df.dropna(how='all', axis=1)  # Drop columns where all values are NaN
    rows, columns = df.shape

    heading_cell = (-1, -1)

    for i in range(imp_index, rows):
        for j in range(columns):
            cell_value = str(df.iloc[i,j])
            if cell_value ==  "SHORT FORM / SUBJECT CODE":
                heading_cell = (i, j)
                break
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

def csv_to_json(csv_file_path, json_filename, json_subject_filename):
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


def csvstring_to_jsonstrings(csv_string):
    # Read CSV into DataFrame and drop empty rows and columns
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
        if (str(df.iloc[i,1]) == "Short Subject Code"):
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
            print(df.iloc[i,j])
            if pd.notna(df.iloc[i,j]):
                output[current_day][col_time_mapping[j-1]].append(str(df.iloc[i,j]).strip())


    # Extract subject codes and details
    output_subject = []
    subject_binding = ["Code", "Full Code", "Subject"]
    if does_include_subjects:
        for i in range(next_file_index+1, rows):
            for j in range(0, 6, 3):  # Step by 3 to handle both sets of columns
                if pd.notna(df.iloc[i,1+j]):
                    subject_dict = {}
                    for k in range(3):
                        if pd.notna(df.iloc[i,1+j+k]):
                            subject_dict[subject_binding[k]] = str(df.iloc[i,1+j+k]).strip()
                    if subject_dict:
                        output_subject.append(subject_dict)
    else:
        output_subject = firstyear_subject_extractor(csv_string, next_file_index)

    return {
        "timetable": output,
        "subjects": output_subject
    }

if __name__ == "__main__":
    csv_to_json("./data/csv/time_table.csv", "test012", "testsub122")