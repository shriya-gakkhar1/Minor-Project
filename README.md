# ATS & AI Resume Builder Toolbox

A comprehensive, utility-suite style platform (similar to ILovePDF) designed for corporate hiring workflows and professional resume optimization. This platform provides an all-in-one suite of AI-powered tools for both recruiters (ATS) and candidates (Resume Building).

## Core Tools & Engines

- **ATS Scorer Engine**: Instantly evaluate resumes against job descriptions with an AI-powered scoring system.
- **OSS Resume Optimizer**: Optimize formatting and content structure for maximum ATS compatibility.
- **Campus Predictor Engine**: Data-driven insights to predict candidate success and match rates.
- **Paddle OCR Bridge**: Advanced Optical Character Recognition to extract text and data accurately from PDF/image resumes.
- **Resume Signal Extractor**: Automatically extract key skills, experiences, and education metrics from unstructured resume text.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS (Premium SaaS UI quality)
- **Backend**: Node.js, Express (Workflow-driven API architecture)
- **Machine Learning**: Python, PaddleOCR, Jupyter Notebooks for training
- **State Management & Data**: Zustand, SheetJS, PapaParse

## Project Structure

```text
/backend  # Node.js API server & Engine Integrations (ATS, OCR, Optimizations)
/frontend # React + Vite UI Suite
/ml       # Python ML APIs & Jupyter Training Notebooks
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)

### Installation & Execution

**1. Setup Backend:**
```bash
cd backend
npm install
npm run dev
```

**2. Setup Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Setup ML Environment:**
```bash
cd ml/api
pip install -r requirements.txt
python app.py
```

## Vision

The project features a suite of tools for hiring workflows over purely student-centric features. The architecture prioritizes a robust one-engine setup, ensuring each tool performs seamlessly as a standalone utility or an integrated suite.
