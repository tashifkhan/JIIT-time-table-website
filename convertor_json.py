import pandas as pd
import json

df = pd.read_csv('time_table.csv')

rows, columns = df.shape
print(f'The number of rows is {rows} and the number of columns is {columns}')

# # Iterating over each cell
# for col in df.columns:
#     for index, row in df.iterrows():
#         print(f'Row {index}, Column {col}: {row[col]}')

# for i in range(1, rows):
#     for j in range(columns):
#         print(f'Row {i}, Column {j}: {df.iloc[i, j]}')

terminator = [2, -1]

print(type(df.iloc[3, 0]))
print(str(df.iloc[2, 0]))
print(str(df.iloc[2, 0]) != 'nan')

# i = 2
# j = 0
output = {}
current_day = "-1"
col_time_mapping = [9,10,11,12,1,2,3,4]
next_file_index = -1
for i in range (2, rows):
    if pd.notna(df.iloc[i,0]):
        current_day = str(df.iloc[i,0])
        output[current_day] = {
            9: [],
            10: [],
            11: [],
            12: [],
            1: [],
            2: [],
            3: [],
            4: []
        }    

    if (str(df.iloc[i,1]) == "Short Subject Code"):
        next_file_index = i
        break
        
    for j in range(1, columns):
        if pd.notna(df.iloc[i,j]):
            output[current_day][col_time_mapping[j-1]].append(str(df.iloc[i,j]))
    

# Specify the filename
filename = 'time_table.json'

# Writing the dictionary to a JSON file
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
            output_subject[subject_binding[j]].append(str(df.iloc[i,1+j]))
        if pd.notna(df.iloc[i,4+j]):    
            output_subject[subject_binding[j]].append(str(df.iloc[i,4+j]))


# Specify the filename
filename = 'subject.json'

# Writing the dictionary to a JSON file
with open(filename, 'w') as file:
    json.dump(output_subject, file, indent=4)  # indent=4 is optional, it makes the file more readable

print(f"Data has been written to {filename}")