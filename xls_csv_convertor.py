import xlrd
import json
import io

def xls_to_json_string(uploaded_xls_file):
    file_contents = uploaded_xls_file.read()
    workbook = xlrd.open_workbook(file_contents=file_contents)
    worksheet = workbook.sheet_by_index(0)
    
    output = {}
    current_day = "-1"
    col_time_mapping = []
    
    rows = worksheet.nrows
    columns = worksheet.ncols
    
    # Get time mappings from second row
    for k in range(1, columns):
        col_time_mapping.append(worksheet.cell_value(1, k))
    
    next_file_index = -1
    for i in range(2, rows):
        if worksheet.cell_value(i, 0):
            current_day = str(worksheet.cell_value(i, 0))
            output[current_day] = {time: [] for time in col_time_mapping}
            
        if str(worksheet.cell_value(i, 1)) == "Short Subject Code":
            next_file_index = i
            break
            
        for j in range(1, columns):
            cell_value = worksheet.cell_value(i, j)
            if cell_value:
                output[current_day][col_time_mapping[j-1]].append(str(cell_value).strip())
    
    # Process subject data
    output_subject = []
    subject_binding = ["Code", "Full Code", "Subject"]
    
    for i in range(next_file_index + 1, rows):
        for j in range(0, 6, 3):
            if worksheet.cell_value(i, 1+j):
                subject_dict = {}
                for k in range(3):
                    cell_value = worksheet.cell_value(i, 1+j+k)
                    if cell_value:
                        subject_dict[subject_binding[k]] = str(cell_value).strip()
                if subject_dict:
                    output_subject.append(subject_dict)
    
    return {
        "timetable": output,
        "subjects": output_subject
    }

def xls_to_json(xls_file, json_timetable_file, json_subject_file):
    workbook = xlrd.open_workbook(xls_file)
    worksheet = workbook.sheet_by_index(0)
    
    data = xls_to_json_string({"read": lambda: open(xls_file, 'rb').read()})
    
    with open(json_timetable_file, 'w') as file:
        json.dump(data["timetable"], file, indent=4)
        
    with open(json_subject_file, 'w') as file:
        json.dump(data["subjects"], file, indent=4)


