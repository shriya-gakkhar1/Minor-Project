# Placify AI

Placify AI is a placement intelligence platform for TPO teams and students.
It combines workflow tracking, migration/import utilities, reporting, and prediction-driven insights in one fast React + Node product shell.

## Why This Project Exists

Placement teams usually juggle spreadsheets, disconnected dashboards, and manual follow-ups.
Placify AI centralizes the full loop:

- manage students, companies, and application status
- monitor conversion across the pipeline
- run campus-level and student-level prediction flows
- generate reports for decisions, reviews, and presentations

## What Is New In This Release

This version ships the full Phase 1 to Phase 3 execution track:

- phase documentation and merge planning artifacts
- donor-inspired prediction contracts and service architecture
- campus predictor page with CSV input, quality warnings, and analytics outputs
- student predictor page with guided flow, readiness meter, confidence band, and action-first recommendations
- resume studio pipeline with OCR-aware resume ingestion, ATS optimization, Reactive Resume JSON export, and PDF download
- insights lab with branch, status, and company analytics
- backend ML-style routes for campus predict, student predict, ATS scoring, resume optimization, resume parse, and skill recommendations
- backend-first prediction behavior with graceful frontend fallbacks
- full design polish across shell, dashboards, tables, and forms
- lightweight motion system tuned for performance and accessibility

## Product Surfaces

### Admin / TPO

- dashboard command center
- students and workflow management
- migration tools
- insights lab
- campus predictor
- student predictor
- resume studio
- reporting and export

### Student

- student workspace
- eligible drives and application status tracker
- student predictor and recommendation flow
- resume studio for ATS-ready resume regeneration
- profile management

## Tech Stack

### Frontend

- React + Vite
- Zustand store
- Tailwind CSS utilities
- Recharts for analytics

### Backend

- Node.js + Express
- Mongo connection scaffold
- ML-style analytics endpoints adapted from donor logic patterns

## Architecture Snapshot

1. frontend renders role-based experiences and prediction UI flows
2. frontend service layer calls backend prediction routes first
3. backend normalizes inputs and returns analytics payloads
4. frontend falls back locally if prediction backend is temporarily unavailable

## Key API Endpoints

- POST /api/ml/campus-predict
- POST /api/ml/student-predict
- POST /api/ml/resume-parse
- POST /api/ml/ats-score
- POST /api/ml/resume-optimize
- POST /api/ml/recommend-skills

## Resume Studio OSS Pipeline

Resume Studio combines these open-source components in one flow:

- PaddleOCR (Apache-2.0): OCR extraction for scanned/older resumes
- Resume-Matcher-inspired ATS logic (Apache-2.0 donor reference): keyword and semantic scoring
- Reactive Resume-compatible JSON export (MIT ecosystem): builder-ready resume payload

Flow:

1. Upload old resume (PDF/DOCX/TXT/image)
2. Extract text (pdf-parse/mammoth, or PaddleOCR where applicable)
3. Compare against JD and target role
4. Generate optimized resume content (summary, bullets, skills)
5. Download Reactive Resume JSON and polished PDF

### Optional: Enable PaddleOCR Locally

By default, the app works without OCR using text extractors.
To enable PaddleOCR for scanned resumes, install Python dependencies and set env vars before starting backend:

```bash
pip install paddleocr
set ENABLE_PADDLE_OCR=true
set PADDLE_PYTHON_CMD=python
```

Notes:

- OCR runs through backend script at backend/tools/paddle_ocr_extract.py
- For PDF files with very low extracted text, OCR is attempted when enabled

## Local Setup

## 1) Install Dependencies

From project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 2) Start Backend

```bash
cd backend
npm start
```

Default backend URL: http://localhost:5000

## 3) Start Frontend

```bash
cd frontend
npm run dev
```

Default frontend URL: http://localhost:5173

## Demo Credentials

- Admin: admin@placeflow.edu / admin123
- Student: student@placeflow.edu / student123

## Project Structure

```text
backend/
  app.js
  server.js
  routes/
    mlRoutes.js
  services/
    campusPredictorEngine.js

frontend/
  src/
    pages/
      AdminDashboard.jsx
      StudentDashboard.jsx
      InsightsLabPage.jsx
      CampusPredictorPage.jsx
      StudentPredictorPage.jsx
      ReportsPage.jsx
    services/
      predictionContracts.js
      predictionService.js
```

## Phase Tracking Docs

- FLOWCHART_MERGE_FULL.md
- MERGE_PLAN_CAMPUS_PLACEMENT_ANALYSIS.md
- PHASE_2_ADDED_WORK_STATUS.md

## Current Status

- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete
- UI polish and analytics hardening: Complete

## Notes

- Root README.txt is preserved for legacy reference.
- README.md is now the primary project landing document.