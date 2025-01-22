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

- **Modern UI**: Glassmorphic design with Tailwind CSS
- **Parsing**: Uses JIIT TimeTable Parser for accurate data extraction
- **Branch Support**: Handles multiple branches and years
- **Responsive**: Works seamlessly across devices
- **Export Options**: PDF, PNG, and Google Calendar sync
- **Custom Events**: Edit the timetable and add custom events
- **Academic Calendar**: Fetch and sync the academic calendar to Google Calendar
- **Enhanced Color Coding**: More color coding for events synced to Google Calendar

## Tech Stack

### Frontend

- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Export Tools**: js-pdf, html-to-image

### Backend

- **Framework**: Python - Pyodide (Web Assembly)
- **Endpoints**: Timetable processing and generation
- **Google Calendar API** for syncing schedules

### Data

- **Raw Time Table**: JSON files
- **Elective Subjects**: JSON files with course details

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── academic-calendar.tsx       # Academic calendar display page
│   │   ├── action-buttons.tsx          # Buttons for downloading png & pdfs
│   │   ├── edit-event-dialog.tsx       # Dialog for editing events
│   │   ├── google-calendar-button.tsx  # Button to sync with Google Calendar
│   │   ├── redirectAC.tsx              # Academic calendar Button
│   │   ├── schedule-display.tsx        # Component to render the TimeTable
│   │   ├── schedule-form.tsx           # Form for creating or editing TimeTable
│   │   ├── timeline.tsx                # Timeline visualization for the TimeTable
│   ├── data/
│   │   ├── 128-mapping.json            # 128 BE subjects data
│   │   ├── timetable-mapping.json      # 62 BE subjects data
│   │   └── calender.json               # Academic Calender data
│   ├── utils/
│   │   ├── calender-AC.ts              # Google Calender API Integration for AC
│   │   ├── calender.ts                 # Google Calender API Integration for TimeTable
│   │   ├── download.ts                 # Hook/function to download png/pdf of TimeTable
│   │   └── pyodide.ts                  # WASM middleware for module execution
│   ├── context/
│   │   ├── userContext.ts              # Manages State of the TimeTable across different Components/Pages
│   │   └── userContextProvidor.tsx
│   ├── types/
│   │   ├── schedule.ts                 # TypeScript Definitions
│   │   ├── subjects.ts
│   │   └── timetable.ts
│   ├── App.tsx                         # Main App page / Entrypoint
│   ├── main.tsx                        # Layout page
│   └── global.css                      # Schedule view
├── public/
│   ├── modules/                        # Specific Course Python Module
│   │   ├── BE62_creator.py
│   │   ├── BE128_creator.py
│   │   └── BCA_creator.py
│   ├── _creator.py                     # Python Module
│   └── icon.png                        # Icon
└── package.json                        # Project dependencies & config files
```

## Data Flow

1. User selects batch, year, campus, and electives.
2. Python parser processes the timetable.
3. React renders the personalized schedule.
4. Export options handle data conversion.
5. Academic calendar is accessed to add its visualization.

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Python 3.8+ (for parser development)

1.  Clone the repository and navigate:

    ```bash
    git clone https://github.com/tashifkhan/JIIT-time-table-website
    cd JIIT-time-table-website
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

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
2. **Export Failed**: Check browser permissions
3. **Parser Error**: Verify input format

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

## Future Scope

- Handelling 4th year BE TimeTable
- PWA Support for offline usage
- Reminders for classes
- Visualization of free and busy slots of 2 students

## License

GPL-3.0 License - See LICENSE file

## Contact

For support or queries:

- GitHub Issues
- Email: [developer@tashid.codes]
