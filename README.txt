PlaceFlow - Simple Guide

1) How to run

Step 1: Install Node.js.
Step 2: Open project folder in terminal.
Step 3: Go to frontend folder.
cd frontend
Step 4: Install packages.
npm install
Step 5: Start app.
npm run dev
Step 6: Open browser.
http://localhost:5173


2) What this project does

PlaceFlow is a placement management system for colleges.
It replaces manual tracking in sheets and chat groups.

It has two users:
- Admin (TPO)
- Student

Admin can import data, manage workflow, and view analytics.
Student can check eligible companies, apply, and track status.


3) How to use (Admin)

- Login as Admin.
- Open Migration page.
- Upload CSV or paste Google Sheet link.
- Check preview and validation messages.
- Open Dashboard to see insights and charts.
- Add company from Add Company page.
- Update workflow status:
	Applied -> Shortlisted -> Interview -> Selected/Rejected
- Generate report from dashboard (AI key optional).


4) How to use (Student)

- Login as Student.
- Open Student Dashboard.
- See eligible companies.
- Click Apply for eligible drives.
- See your applications and status tracker.
- Open Profile page to update your details.


5) Demo mode vs Online mode

- Offline mode:
	Data is saved in browser localStorage.
	Works without Supabase.

- Online mode:
	Data sync uses Supabase table placeflow_state.
	Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend .env.
	If Supabase is not set, app safely continues in offline behavior.


6) Notes

- This project is designed as a SaaS-style college project.
- Main focus is workflow + migration + analytics.
- Backend folder exists, but frontend can run independently.
