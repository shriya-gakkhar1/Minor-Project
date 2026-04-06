# Merge Plan: Placify + campus-placement-analysis

This is a planning document only.
No integration is performed in this phase.

Update (2026-04-07): Integration has now progressed beyond planning.
Current status snapshot:
- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete

## 1) Objective
Use the open-source repo as a feature donor and logic reference, then integrate selected capabilities into our project without breaking our existing workflow/product identity.

Donor repo:
- https://github.com/partheev/campus-placement-analysis

## 2) What We Learned From Donor Repo

### Core product areas in donor
1. Placement Insights page
2. Campus Placement Analyzer (bulk file upload -> ML-driven stats)
3. Student Placement Analyzer (single-student prediction)
4. Resume Parser (Affinda API)
5. Skill Recommendations (Affinda API)

### Donor stack
- Frontend: React + Vite + Material UI + ApexCharts
- Backend: Flask + Pandas + scikit-learn
- ML pipeline and analytics in backend/src/ml

### Donor route model (frontend)
- /placement-insights
- /campus-placement-analyzer
- /student-placement-analyzer

### Donor backend API model
- POST /api/predict-campus-placements
- POST /api/predict-student-placement
- POST /api/resume-parser
- POST /api/recommendSkills

## 3) Our Current Baseline (local repo at d27779b)

Current app is role/workflow based with auth, admin and student dashboards.
Key routes include:
- / (Login)
- /dashboard
- /students
- /migration
- /add-company
- /reports
- /student
- /student/profile

Key services currently in our app:
- auth/company/student/application workflows
- migration import and data mode adapters
- report generation

## 4) Target Product Direction (After Merge)
We keep our workflow strengths, and add donor analytics strengths.

### Final merged product should do
1. Keep admin-student placement workflow and application tracking
2. Keep migration/import flows and reporting
3. Add advanced analytics screen(s) from donor concepts
4. Add campus-level prediction pipeline from donor concepts
5. Add student-level prediction journey from donor concepts
6. Add optional resume parser and skill recommendation as premium/optional modules

### Product look and IA (proposed nav)
- Dashboard (existing)
- Workflow (existing students/companies/applications)
- Migration (existing)
- Insights Lab (new, donor-inspired)
- Campus Predictor (new, donor-inspired)
- Student Predictor (new, donor-inspired)
- Reports (existing, extended)

## 5) Feature Adoption Matrix

### Adopt now (high value, low risk)
1. Campus-level prediction API contract and output model
2. Student prediction API contract (placement probability + salary)
3. Insights metric cards and chart storytelling style
4. Better data validation contract for uploaded analytics files

### Adopt with adaptation
1. Donor analytics logic in predict.py -> adapt to our schema and naming
2. Donor ML transforms in utils.py -> adapt to our branch/status model
3. Donor chart sections -> implement in our UI language, not copy design files

### Optional / phase-2 adoption
1. Resume parser integration (Affinda dependency)
2. Skill recommendation endpoint and UI
3. Download generated predicted dataset from backend

### Skip for now
1. RedHat/OpenShift deployment specifics
2. Donor-specific static temp file patterns as-is
3. Direct 1:1 UI copy from donor components

## 6) Architecture Plan for Merge (No code yet)

### Guiding rule
Backend ML as service, frontend as product shell.

### Proposed split
- Keep our existing frontend app and route shell
- Add ML microservice capability in backend (Node wrapper or Python service)
- Normalize data contracts in one shared schema file

### Two implementation options

Option A (preferred): Hybrid service
- Keep our current backend as primary API
- Run Python ML service separately
- Node backend proxies ML requests to Python service
- Pros: clean separation, faster debugging

Option B: Direct frontend-to-Flask calls
- Frontend calls Python endpoints directly
- Pros: faster prototype
- Cons: auth/CORS/env complexity, harder long-term governance

Chosen default for planning: Option A.

## 7) Data Contract Strategy

Create canonical contracts before writing integration code:

1. CampusPredictionInput
- uploaded file with required columns
- validate headers + types + null constraints

2. CampusPredictionOutput
- totals (students, placed, not placed)
- branch salary/placement breakdown
- skill impact insights
- percentile/distribution data
- optional downloadable predicted dataset URL

3. StudentPredictionInput
- tier, cgpa, inter_gpa, ssc_gpa, internships, projects, skills flags, branch

4. StudentPredictionOutput
- is_placed (0/1)
- placement_probability
- predicted_salary
- top_improvement_factors

5. ResumeParseOutput (optional phase-2)
- extracted profile signals
- inferred branch/skills
- recommended next skills

## 8) Frontend Merge Plan

### New modules to add (future)
1. src/pages/CampusPredictorPage.jsx
2. src/pages/StudentPredictorPage.jsx
3. src/pages/InsightsLabPage.jsx
4. src/services/predictionService.js
5. src/services/resumeService.js (optional)
6. src/components/charts/predictor/*

### Existing modules to extend
1. src/App.jsx routes and guards
2. src/layout/AppShell.jsx nav integration
3. src/store/usePlacementStore.js with prediction state slices
4. src/pages/ReportsPage.jsx to include prediction sections

## 9) Backend Merge Plan

### New backend capabilities (future)
1. /api/ml/campus-predict
2. /api/ml/student-predict
3. /api/ml/resume-parse (optional)
4. /api/ml/recommend-skills (optional)

### Service topology (future)
- backend (Node): auth/workflow/main API gateway
- ml-service (Flask): heavy analytics and ML
- shared env contracts and timeout/retry policy

## 10) Execution Phases

### Phase 0: Discovery freeze
- Confirm donor repo license/attribution requirements (no LICENSE file detected in quick scan)
- Document reusable logic in abstract form, avoid blind copy-paste
- Finalize schema mapping between donor and our model
Status: Complete

### Phase 1: Contracts and mocks
- Write OpenAPI-style interface for new prediction endpoints
- Build frontend mock responses first
- Validate UX and charts without backend dependency
Status: Complete

### Phase 2: Campus predictor integration
- Implement campus file validation and API wiring
- Render campus insights cards/charts
- Add download predicted data action
Status: Complete

### Phase 3: Student predictor integration
- Add student predictor form + score output
- Add placement probability and salary projection panel
- Add recommendation text generated from model outputs
Status: Complete

Phase 3 completion notes:
- Student predictor page is integrated and routed for admin and student flows.
- Backend-first student prediction and recommendation calls are live with local fallback.
- Resume parse is now backend-first (filename-driven endpoint) with graceful fallback.
- UX upgraded for better decision clarity: guided steps, presets, readiness score, confidence band, and action-first output.

### Phase 4: Optional Affinda modules
- Resume parse upload flow
- Skill recommendation panel
- API key management and fallback behavior

### Phase 5: Hardening
- Unit tests for payload validation + transforms
- API timeout/error boundaries and retries
- E2E flow test from upload to insights

## 11) Risk Register

1. Schema mismatch risk
- Mitigation: strict mapping table and contract tests before integration

2. Model drift / deterministic mismatch
- Mitigation: fixed sample fixtures and golden outputs

3. External API dependency risk (Affinda)
- Mitigation: feature flag + graceful fallback

4. UX inconsistency risk
- Mitigation: implement donor ideas in our design system, not direct UI cloning

## 12) Success Criteria

1. Existing auth/workflow features still work unchanged
2. New predictor features reachable via navigation
3. Campus and student predictions return consistent outputs
4. Reports can include prediction summaries
5. Feature flags allow disabling optional external API features

## 13) Team Task Split Suggestion

1. Architecture/contracts: one person
2. Backend ML bridge: one person
3. Frontend predictor pages/charts: one person
4. Validation/tests/QA: one person
5. Documentation/demo scripts: one person

## 14) Immediate Next Steps (when you say "start integration")
1. Build schema mapping table file
2. Add prediction service interfaces in frontend with mocked backend
3. Create empty predictor pages and route wiring
4. Add backend endpoint stubs
5. Integrate one feature at a time (campus predictor first)

---
This plan is ready to execute in phases when approved.
