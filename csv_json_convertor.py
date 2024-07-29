import pandas as pd
import json

df = pd.read_csv('time_table.csv')

rows, columns = df.shape

output = {}
current_day = "-1"
col_time_mapping = []
print(df.iloc[1,1])
for k in range(1,columns):
    col_time_mapping.append(df.iloc[1,k])
print(col_time_mapping)
next_file_index = -1
for i in range (2, rows):
    if pd.notna(df.iloc[i,0]):
        current_day = str(df.iloc[i,0])
        output[current_day] = {time: [] for time in col_time_mapping} 

    if (str(df.iloc[i,1]) == "Short Subject Code"):
        next_file_index = i
        break
        
    for j in range(1, columns):
        if pd.notna(df.iloc[i,j]):
            output[current_day][col_time_mapping[j-1]].append(str(df.iloc[i,j]).strip())
    
filename = 'time_table.json'

with open(filename, 'w') as file:
    json.dump(output, file, indent=4)  # indent=4 is optional, it makes the file more readable

print(f"Data has been written to {filename}")

output_subject = {
    "Code":[],
    "Full Code": [],
    "Subject": []
}
subject_binding = ["Code", "Full Code", "Subject"]
for i in range(next_file_index+1, rows):
    for j in range(3):
        if pd.notna(df.iloc[i,1+j]):
            output_subject[subject_binding[j]].append(str(df.iloc[i,1+j]).strip())
        if pd.notna(df.iloc[i,4+j]):    
            output_subject[subject_binding[j]].append(str(df.iloc[i,4+j]).strip())

filename = 'subject.json'

with open(filename, 'w') as file:
    json.dump(output_subject, file, indent=4)  # indent=4 is optional, it makes the file more readable

print(f"Data has been written to {filename}")