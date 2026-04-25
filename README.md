<div align="center">

# Placify AI

### A smart placement analytics platform for colleges

Placify AI helps a college placement cell turn messy student placement data into clear dashboards, predictions, reports, and action plans.

[![React](https://img.shields.io/badge/Frontend-React-149ECA?style=for-the-badge&logo=react&logoColor=white)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](#tech-stack)
[![Analytics](https://img.shields.io/badge/Focus-Placement%20Analytics-0F766E?style=for-the-badge)](#what-it-does)
[![Minor Project](https://img.shields.io/badge/College-Minor%20Project-F59E0B?style=for-the-badge)](#why-it-stands-out)

</div>

---

## The Simple Idea

Most placement teams manage students, companies, applications, CGPA filters, interview updates, and reports through scattered Excel sheets.

**Placify AI brings all of that into one clean system.**

Upload or manage placement data, explore it visually, find students who need help, predict likely outcomes, and generate useful reports for decision-making.

---

## What It Does

| Area | What Placify AI Helps With |
| --- | --- |
| **Placement Dashboard** | See total students, active drives, selected students, interview queue, and placement rate. |
| **Data Import** | Bring placement data from CSV or Excel-style sheets and convert it into useful records. |
| **Workflow Tracking** | Move students through stages like Applied, Shortlisted, Interview, Selected, and Rejected. |
| **Interactive Charts** | Click charts to filter students by company, status, branch, or performance. |
| **At-Risk Detection** | Identify students who may need mentoring, resume work, or eligibility improvement. |
| **Scenario Simulation** | Test what happens if training improves, interview slots increase, or offer rates change. |
| **Campus Prediction** | Analyze campus-level placement patterns from uploaded data. |
| **Student Prediction** | Estimate a student's placement readiness using academics, projects, skills, and experience. |
| **Resume Studio** | Parse resumes, calculate ATS-style fit, suggest improvements, and export cleaner resume content. |
| **Reports** | Generate placement summaries that are useful for reviews, presentations, and college records. |

---

## Who Uses It?

### For TPO / Admin

- Import student and company data.
- Track application status.
- View placement analytics.
- Spot weak areas early.
- Simulate outcomes before making decisions.
- Generate reports for college review meetings.

### For Students

- See eligible drives.
- Track placement progress.
- Check placement readiness.
- Improve resume quality.
- Get action-focused recommendations.

---

## Why It Stands Out

Placify AI is not just a static dashboard.

It connects the full placement loop:

```text
Raw Data -> Clean Records -> Dashboards -> Predictions -> Actions -> Reports
```

That means the project is useful as a real college tool, not only as a visual demo.

Key strengths:

- **Practical problem**: solves a common placement-cell workflow.
- **Data-driven**: uses structured placement records and analytics.
- **Interactive**: charts are not just for viewing; they help filter and decide.
- **Predictive**: includes student and campus prediction flows.
- **Action-first**: highlights what the TPO should do next.
- **Good demo value**: clear admin and student views for presentation.

---

## Main Screens

| Screen | Purpose |
| --- | --- |
| **Admin Dashboard** | Placement command center with KPIs, charts, risk queue, company drill-down, and scenario simulator. |
| **Students** | Manage student records and placement status. |
| **Migration Center** | Import and normalize external placement data. |
| **Insights Lab** | Explore branch, status, and company analytics. |
| **Campus Predictor** | Upload campus data and get prediction-style insights. |
| **Student Predictor** | Check individual placement readiness. |
| **Resume Studio** | Improve resumes using parsing, ATS scoring, and recommendations. |
| **Reports** | Create visual placement reports and exports. |

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Recharts
- PapaParse
- jsPDF / html2canvas

### Backend

- Node.js
- Express
- ML-style prediction routes
- Resume parsing helpers
- PDF/DOCX text extraction

---

## Run Locally

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Demo Login

| Role | Email | Password |
| --- | --- | --- |
| Admin / TPO | `admin@placeflow.edu` | `admin123` |
| Student | `student@placeflow.edu` | `student123` |

---

## Example Placement Flow

1. Admin imports student placement data.
2. Placify AI cleans and organizes the data.
3. Dashboard shows placement rate, company performance, branch readiness, and workflow status.
4. TPO filters charts and finds students needing support.
5. Predictors estimate outcomes and suggest improvements.
6. Reports are generated for college review.

---

## Project Structure

```text
Minor-Project/
  backend/
    routes/
    services/
    server.js

  frontend/
    src/
      pages/
      components/
      services/
      store/
```

---

## In One Line

**Placify AI turns college placement data into decisions: who is ready, who needs help, which companies are converting, and what the placement cell should do next.**

