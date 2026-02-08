# ITU Calendar

## Vision
A semester overview calendar for IT University courses, styled like a classic paper calendar. View all lectures and deliverables across 6 months (January–July 2026), filter by course, and edit events directly on the page.

## Target User
Leo Sakharov (you) — tracking your ITU semester schedule.

## Core Requirements

### Visual Design (from reference screenshot)
- 6 columns: January through June 2026
- Rows: days of month with weekday abbreviations (M, T, O, T, F, L, S — Danish)
- Week numbers on right edge of each month
- Alternating gray/white week stripes
- Green filled dots for lectures
- Red hollow circles for deliverables/deadlines
- Danish holidays displayed inline
- Clean, minimal aesthetic — cream/white background, clear grid lines

### Functionality
- **Course filtering**: Toggle courses on/off via checkboxes/buttons
- **Inline editing**: Click to add, edit, or delete events
- **Drag to move**: Reposition events between dates
- **Event types**: Lecture, Deliverable, Exam, Presentation, Holiday
- **Persistence**: All changes saved to database

### Data Model
- **Courses**: id, name, color (hex), active (boolean)
- **Events**: id, course_id, title, date, type (lecture/deliverable/exam/presentation/holiday)

## Technical Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: CSS (custom, matching screenshot aesthetic)
- **Backend**: Supabase (PostgreSQL + auto-generated API)
- **Hosting**: calendar.leosakharov.com (subdomain of portfolio)

## Current State
Greenfield — no code exists yet.

## Reference
Visual style: `/Users/leosakharov/Desktop/Screenshot 2026-02-08 at 15.11.43.png`
