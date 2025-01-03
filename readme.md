# Time Table Python Creator

<div align="center">
   <a href="https://jiit-timetable.tashif.codes/">🤡 hosted here 🤡</a> 
</div>

This is a Flask-based web application that simplifies the process of creating and managing time tables. The application allows users to upload their time table files in various formats (CSV, XLSX, XLS, PDF) and generates a simplified schedule (you can download it too). Additionally, it provides an option to select electives and integrates with Google Calendar to add events.

## Features

- Upload time table files in CSV, XLSX, XLS, or PDF formats.
- Automatically parse and convert the uploaded files to a simplified schedule.
- Select electives and generate a personalized time table.
- Integrate with Google Calendar to add events.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/tashifkhan/JIIT-time-table-parser
   cd JIIT-time-table-parser
   ```

2. Create a virtual environment and activate it:

   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:

   ```sh
   pip install -r requirements.txt
   ```

4. Set up Google Calendar API credentials:
   - Follow the instructions [here](https://developers.google.com/calendar/quickstart/python) to create credentials and download the `credentials.json` file.
   - Place the `credentials.json` file in the root directory of the project.

## Usage

1. Run the Flask application:

   ```sh
   python server.py
   ```

2. Open your web browser and navigate to `http://127.0.0.1:5000/`.

3. Upload your time table file and follow the instructions to generate your schedule.

4. Select your electives and submit to view your personalized time table.

5. Optionally, integrate with Google Calendar to add your schedule as events.

## File Structure

- `server.py`: Main Flask application file.
- `templates/`: Contains HTML templates for the web pages.
- `static/`: Contains static files like CSS and JavaScript.
- `modules/`: Contains various modules for handling file conversions and processing.
- `google_calender_integration.py`: Script for integrating with Google Calendar.
- `_creator.py`: Script for creating the time table from the parsed data.

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/)
- [Google Calendar API](https://developers.google.com/calendar)
- [html2canvas](https://html2canvas.hertzen.com/)


## Work In Progress
- 4th year table not handelled yet (double entries beacuse of 2 slots availble)
- google calender integration in works
