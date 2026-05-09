# Placify — Placement Analytics Dashboard for TPOs

Placify helps college placement cells understand and manage placement data better.

It imports student placement data from Excel or CSV files and provides analytics, at-risk student detection, placement simulations, and report generation through an interactive dashboard.

## Core Features

- Dashboard with total students, placed students, unplaced students, placement percentage, average package, highest package, and companies visited
- Branch-wise placement, company distribution, CGPA vs placement, and placement trend charts
- Searchable student analytics table with branch and status filters
- Transparent rule-based at-risk detection using CGPA, internships, skills, and projects
- Placement simulator for checking how CGPA cutoff changes affect eligible students
- Downloadable placement summary report

## Tech Stack

- React
- Vite
- TailwindCSS
- shadcn-style UI components
- lucide-react
- Recharts
- Zustand
- PapaParse
- SheetJS
- localStorage

## Viva Explanation

Placify is a placement analytics dashboard for TPOs. It imports student placement data from Excel or CSV files and provides analytics, at-risk student detection, placement simulations, and report generation through an interactive dashboard.

## Run Locally

```bash
npm install
npm run dev
```

## Import Format

CSV or Excel files should contain columns like:

```text
id, name, branch, cgpa, status, package, company, internships, skills, projects, year
```

Common capitalized variants such as `Name`, `Branch`, `CGPA`, `Company`, and `Package` are also supported.
