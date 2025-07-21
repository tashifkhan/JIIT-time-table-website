<h1 align="center"> JIIT Personalized Time Table Creator </h1>

<div align="center">
    <a href="https://simple-timetable.tashif.codes/">Live Demo</a>
</div>
</br>

## Overview

A powerful React + Python application using WebAssembly (Pyodide) that helps JIIT students create personalized class schedules. Features a modern glassmorphic UI, color-coded timetables, and multiple export options. This application allows users to edit the timetable and add custom events. It also features the ability to fetch the academic calendar and sync it to Google Calendar, with enhanced color coding for events synced to Google Calendar.

The academic calendar is parsed using the script available at:
[JIIT Academic Calendar](https://github.com/tashifkhan/JIIT-Academic-Calender)

The timetable is parsed using the script available at:
[JIIT Time Table Parser](https://github.com/tashifkhan/JIIT-time-table-parser)

## Key Features

- **Parsing**: Uses JIIT TimeTable Parser for accurate data extraction
- **PWA**: Download and use offline as well
- **Branch Support**: Handles multiple branches and years
- **Compare TimeTables**: Parses multiple timetables and tells you the common free slots & classes
- **Shareable Timetable**: Now timetables can be recreated by simple url sharing.
- **Save Configs**: Save and load multiple timetable configs to load that tiemtable anytime.
- **Timeline View**: No need to export the timetable... you can view the timetable at /timetable route because stored locally
- **Export Options**: PDF, PNG, and Google Calendar sync
- **Custom Events**: Edit the timetable and add custom events
- **Academic Calendar**: Fetch and sync the academic calendar to Google Calendar
- **Enhanced Color Coding**: More color coding for events synced to Google Calendar

## Tech Stack

### Frontend

- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

### Backend

- **Framework**: Python - Pyodide (Web Assembly)
- **Endpoints**: Timetable & Academic Calendar processing, generation & comparing
- **Google Calendar API** for syncing schedules

### Data

`Note: If you want to make a custom frontent or an App or something`
make a request

```bash
curl https://simple-timetable.tashif.codes/data/time-table/ODD25/62.json   # replace 62 with 128 if want 128 data, also also replace the semester also if want anyother
```

or

```bash
curl https://simple-timetable.tashif.codes/data/calender/2526/calender.json  # replace 2526 with whichever academic year you want to use
```

## Project Structure

```

.
├── json_creater.py # this the python streamlit app that converts the ugly excel to json for the website
├── public
│   ├── data                       # this directory contains all the json data created
│   │   ├── calender
│   │   │   ├── 2425
│   │   │   │   └── calendar.json
│   │   │   └── 2526
│   │   │   └── calender.json
│   │   │ 
│   │   └── time-table
│   │   ├── EVEN25
│   │   │   ├── 128.json
│   │   │   └── 62.json
│   │   └── ODD25
│   │   ├── 128.json
│   │   └── 62.json
│   │ 
│   ├── modules                      # this directory contains specific python modules to create timetable
│   │   ├── BE128_creator.py
│   │   └── BE62_creator.py
│   │ 
│   ├── _creator.py                  # Python file that creates the timetable
│   ├── manifest.json                # manifest file for PWA
│   ├── robots.txt
│   ├── service-worker.js            # service working to save resources offline
│   └── sitemap.xml
│ 
├── src
│   ├── components
│   │   ├── academic-calendar.tsx         # Academic calendar display page
│   │   ├── action-buttons.tsx
│   │   ├── background.tsx
│   │   ├── compare-timetable.tsx         # Conparing timetable page
│   │   ├── edit-event-dialog.tsx
│   │   ├── google-calendar-button.tsx
│   │   ├── navbar.tsx                    # swiable navbar
│   │   ├── not-found.tsx                 # 404 Not Found Custom page
│   │   ├── schedule-display.tsx
│   │   ├── schedule-form.tsx
│   │   ├── timeline-landing.tsx          # landing page for /timeline if no schedule has been created
│   │   ├── timeline-wrapper.tsx
│   │   ├── timeline.tsx                  # Calendar / Timeline View page for the timetable
│   │   ├── url-params-dialog.tsx
│   │   └── ui\                           # this directory contains the shdcn compoents
│   │ 
│   ├── context
│   │   ├── userContext.ts
│   │   └── userContextProvider.tsx
│   │ 
│   ├── hooks\
│   ├── lib\
│   ├── types\                # TypeScript type Definitions
│   │ 
│   ├── utils
│   │   ├── calender-AC.ts                  # Google Calender API Integration for AC
│   │   ├── calender.ts                     # Google Calender API Integration for TimeTable
│   │   ├── download.ts                     # Hook/function to download png/pdf of TimeTable
│   │   └── pyodide.ts                      # WASM middleware for module execution
│   │ 
│   ├── App.tsx          # the schedule creator page
│   └── main.tsx         # apps entry point
│ 
├── README.md
└── index.html

```

## Data Flow

1. User selects batch, year, campus, and electives.
2. Python parser processes the timetable.
3. React renders the personalized schedule.
4. Export options handle data conversion.
5. Academic calendar is accessed to add its visualization.

## Development Setup

### Prerequisites

- bun (recommended) or npm
- Python 3.8+ (for parser)

1.  Clone the repository and navigate:

    ```bash
    git clone https://github.com/tashifkhan/JIIT-time-table-website
    cd JIIT-time-table-website
    ```

2.  Install dependencies:

    ```bash
    bun i
    ```

    or

    ```bash
    npm i
    ```

3.  Run the development server:

    ```bash
    bun dev
    ```

    or

    ```bash
    npm run dev
    ```

Frontend runs at: `http://localhost:5173`

## Usage

1. **Home Page**
   - Enter your camopus, batch, year, and electives.
   - Fetch electives dynamically from JSON - created using [Parser](https://github.com/tashifkhan/JIIT-time-table-parser).
2. **Timetable Page**
   - View your personalized schedule.
   - Color-coded design for easy understanding.
   - Edit Fumctionaity
   - Adding of Custom Events
3. **Export Options**
   - Download as PDF/PNG or sync with Google Calendar.
4. **Academic Calendar Sync**
   - Fetch the academic calendar using the [Academic Calendar Parser](https://github.com/tashifkhan/JIIT-Academic-Calender).
   - Sync the academic calendar to Google Calendar with enhanced color coding for events.

## Troubleshooting

Common issues and solutions:

1. **Loading Error**: Clear cache and reload
2. **Export Failed**: Check browser permissions... especially WASM
3. **Parser Error**: Check the frekaing Excel for errors

## Contributing

We welcome contributions to enhance this project!

1.  Fork the repository.
2.  Create a new branch:

    ```bash
    git checkout -b feature-name
    ```

3.  Commit changes and create a pull request.

## Raising an Issue

If you encounter any issues or have suggestions, please raise an issue on GitHub:

1. Go to the [Issues](https://github.com/tashifkhan/JIIT-time-table-website/issues) section of the repository.
2. Click on the "New Issue" button.
3. Provide a detailed description of the issue or suggestion.
4. Submit the issue.

We appreciate your feedback and contributions!

## Note:

`timetable excels for 4th year & 2nd year 128 campus has not been released`

## Future Scope

- [x] Handelling 4th year BE TimeTable
- [x] PWA Support for offline usage
- [x] Reminders for classes
- [x] Visualization of free and busy slots of 2 students

## License

GPL-3.0 License - See ![LICENSE](./LICENSE) file

## Contact

For support or queries:

- GitHub Issues
- Email: [developer@tashif.codes]

```

```
