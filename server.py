from flask import Flask, render_template
import os
from flask import request
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/fileupload', methods=['POST'])
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
    return 'File uploaded successfully'

if __name__ == '__main__':
    app.run(debug=True)