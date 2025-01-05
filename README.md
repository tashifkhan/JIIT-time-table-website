<h1 align="center"> JIIT Personalized Time Table Creator </h1>

<div align="center">
    <a href="simple-timetable.tashif.codes">Hosted Here</a>
</div>
</br>

Welcome to the JIIT Personalized Schedule Creator, a React + Python application (WebAssembly - WADM Pyodide) that allows JIIT students to create a personalized schedule. With a glassmorphic UI, color-coded timetable, elective integration, and export options, it provides a seamless user experience tailored to individual needs.

- It usses <a href="https://github.com/tashifkhan/JIIT-time-table-parser">JIIT TimeTable Parser</a> to parse the TimeTable Doc into JSON

## Features

- **Dynamic Timetable Creation**: Generate a personalized timetable by selecting your batch, year, and electives.
- **Glassmorphic Design**: Sleek and modern UI with frosted glass effects for a visually appealing experience.
- **Color-Coded Timetable**: Quickly distinguish between lectures (L), tutorials (T), and practicals (P).
- **Export Options**:
  - Download schedule as a PDF.
  - Sync timetable with Google Calendar.

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
│   │   ├── ScheduleForm.tsx     # Form for batch & elective selection
│   │   ├── Timetable.tsx        # Main timetable display
│   │   ├── ColorPicker.tsx      # Subject color customization
│   │   └── ExportButtons.tsx    # PDF & Calendar export options
│   ├── data/
│   │   ├── electives.json       # Elective subjects data
│   │   └── timetables/          # Batch-wise timetable JSONs
│   ├── hooks/
│   │   ├── useTimeTable.ts      # Timetable generation logic
│   │   └── useExport.ts         # Export functionality
│   ├── styles/
│   │   └── globals.css          # Tailwind & custom styles
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   └── pages/
│       ├── index.tsx            # Landing page
│       └── timetable.tsx        # Schedule view
├── public/
│   ├── _creator.py              # Python Module
│   └── icon.png                 # Icon
└── package.json                 # Project dependencies
```

## Installation

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
   - Enter your batch, year, and electives.
   - Fetch electives dynamically from the JSON.
2. **Timetable Page**
   - View your personalized schedule.
   - Color-coded design for easy understanding.
3. **Export Options**
   - Download as PDF/PNG or sync with Google Calendar.

## Contributing

We welcome contributions to enhance this project!

1.  Fork the repository.
2.  Create a new branch:

    ```bash
    git checkout -b feature-name
    ```

3.  Commit changes and create a pull request.

## Future Scope

- Handelling 4th year BE TimeTable
- BBA, BCA, MBA, MCA, BS, BE-128 TimeTable Generation
- PWA Support for offline usage
- Reminders for classes
- Visualization of free and busy slots of 2 students
