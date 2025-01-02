from flask import Flask, render_template
import os
from flask import request
from werkzeug.utils import secure_filename

# conversion modules
from modules.xlsx_handeler import xlsx_to_csv_string
from modules.xls_handeler import xls_to_csv_string
from modules.pdf_handeler import pdf_to_csv_string

# processing modules
from modules.csv_handeler import csvstring_to_jsonstrings
from modules._creator import time_table_creator

''' pipeline
from modules.xls_handeler import xls_to_csv_string
from modules.csv_handeler import csvstring_to_jsonstrings
from modules._creator import time_table_creator
from modules.xlsx_handeler import xlsx_to_csv_string
import json

def test_xls_to_csv_string():
    with open('data/xls/B Tech I Sem Odd 2024 Aug 8.xlsx', 'rb') as file:
        # csv_string = xls_to_csv_string(file)
        csv_string = xlsx_to_csv_string(file)
        print(csv_string)
        jsondict = csvstring_to_jsonstrings(csv_string)
        print(json.dumps(jsondict, indent=4))
        time_table = jsondict["timetable"]
        subjects_dict = jsondict["subjects"]
        # print(json.dumps(time_table_creator(time_table, subjects_dict, "A6", ["MA533", "NEC735", "HS315"]), indent=4))
        print(json.dumps(time_table_creator(time_table, subjects_dict, "A6", []), indent=4))

def test_xlsx_to_csv_string():
    with open('./data/xls/B. Tech V Sem ODD 2024 Aug 7.xls', 'rb') as file:
        csv_string = xls_to_csv_string(file)
        print(csv_string)
        jsondict = csvstring_to_jsonstrings(csv_string)
        print(json.dumps(jsondict, indent=4))
        time_table = jsondict["timetable"]
        subjects_dict = jsondict["subjects"]
        # print(json.dumps(time_table_creator(time_table, subjects_dict, "A6", ["MA533", "NEC735", "HS315"]), indent=4))
        print(json.dumps(time_table_creator(time_table, subjects_dict, "A6", []), indent=4))

if __name__ == "__main__":
    test_xls_to_csv_string()
    # test_xlsx_to_csv_string()
'''

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fileupload', methods=['GET','POST'])
def fileupload():
    # return render_template('fileupload.html')
    UPLOAD_FOLDER = 'uploads'
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    if 'file' not in request.files:
        return 'No file uploaded', 400
        
    file = request.files['file']
    if file.filename == '':
        return 'No file selected', 400
        
    filename = secure_filename(file.filename)
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension == ".xls":
        csv_string = xls_to_csv_string(file)


    elif file_extension == ".xlsx":
        csv_string = xlsx_to_csv_string(file)

    elif file_extension == ".csv":
        csv_string = file.read()

    
    elif file_extension == ".pdf":
        csv_string = pdf_to_csv_string(file)

    else:
        return 'Invalid file format', 400
    
    jsondict = csvstring_to_jsonstrings(csv_string)
    time_table = jsondict["timetable"]
    subjects_dict = jsondict["subjects"]
    subjects_dict = sorted(subjects_dict, key=lambda x: x['Subject'].lower())
    for subject in subjects_dict:
        subject['Subject'] = subject['Subject'].title()

    return render_template('fileupload.html', time_table=time_table, subjects_dict=subjects_dict)

@app.route('/electives', methods=['POST'])
def electives():
    request_data = request.form
    print(request_data)
    return "yes"

if __name__ == '__main__':
    app.run(debug=True)