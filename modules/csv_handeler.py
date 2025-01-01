import pandas as pd
import json
import io

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
    df = pd.read_csv(io.StringIO(csv_string))
    rows, columns = df.shape

    output = {}
    current_day = "-1"
    col_time_mapping = []

    for k in range(1,columns):
        col_time_mapping.append(df.iloc[1,k])

    next_file_index = -1
    for i in range(2, rows):
        if pd.notna(df.iloc[i,0]):
            current_day = str(df.iloc[i,0])
            output[current_day] = {time: [] for time in col_time_mapping} 

        if (str(df.iloc[i,1]) == "Short Subject Code"):
            next_file_index = i
            break

        for j in range(1, columns):
            if pd.notna(df.iloc[i,j]):
                output[current_day][col_time_mapping[j-1]].append(str(df.iloc[i,j]).strip())

    output_subject = []
    subject_binding = ["Code", "Full Code", "Subject"]

    for i in range(next_file_index+1, rows):
        for j in range(0, 6, 3):  # Step by 3 to handle both sets of columns
            if pd.notna(df.iloc[i,1+j]):
                subject_dict = {}
                for k in range(3):
                    if pd.notna(df.iloc[i,1+j+k]):
                        subject_dict[subject_binding[k]] = str(df.iloc[i,1+j+k]).strip()
                if subject_dict:
                    output_subject.append(subject_dict)

    return {
        "timetable": output,
        "subjects": output_subject
    }

if __name__ == "__main__":
    csv_to_json("./data/csv/time_table.csv", "test012", "testsub122")