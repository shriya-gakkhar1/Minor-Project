# Quick Start Guide - Student Signup Setup

## ⚡ 5-Minute Setup

### Step 1: Create Supabase Project (2 min)
```
1. Go to https://supabase.com → Sign up/Login
2. Click "New Project"
3. Fill: Name="PlaceIQ", Password (strong), Region (nearest)
4. Wait ~2 minutes for initialization
```

### Step 2: Get API Keys (1 min)
```
1. Dashboard → Settings → API
2. Copy:
   - Project URL → VITE_SUPABASE_URL
   - Anon Public Key → VITE_SUPABASE_ANON_KEY
```

### Step 3: Setup Environment (1 min)
Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Create Database Table (1 min)
```
1. Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy-paste SQL from SUPABASE_SETUP.md (Section 3)
4. Click "Run"
```

---

## 🚀 Test It

### Start Dev Server
```bash
cd frontend
npm run dev  # or pnpm dev
```

### Test Student Signup
1. Open http://localhost:5173/login
2. Click "Student" role
3. Click "Create Account" (orange button)
4. Fill form and submit
5. Should login automatically → See student dashboard

### Test Student Login
1. Go back to login page
2. Student role selected
3. Enter email & password from signup
4. Click "Sign In"
5. Should login successfully

### Verify Data
1. Supabase Dashboard → Editor
2. Click "profiles" table
3. See your new entry with all data

---

## 📁 Files You Modified

1. **`frontend/src/services/supabaseService.js`**
   - Added: signUpStudent, signInWithEmail, signOut, getSession

2. **`frontend/src/services/authService.js`**
   - Modified: login (now async), logout (now async)
   - Added: signup function

3. **`frontend/src/pages/Login.jsx`**
   - Added: Signup form + toggle
   - Added: Form validation
   - Hidden: Signup option for admin

---

## 🎯 Key Features Implemented

✅ Student can signup with email/password  
✅ Additional profile fields (name, phone, cgpa)  
✅ Auto-login after signup  
✅ Persistent login with session storage  
✅ Admin doesn't see signup option  
✅ Demo credentials still work  
✅ Form validation & error messages  
✅ Supabase automatic fallback to demo mode  

---

## 🔍 Database Schema (Quick Ref)

**Table: profiles**
```
id           UUID (auto)
email        TEXT (unique)
name         TEXT
role         TEXT (student/admin)
phone        TEXT
cgpa         NUMERIC (0-10)
interests    ARRAY (skills/interests)
activeBacklogs INTEGER
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Supabase not configured" | Add .env.local vars, restart dev server |
| Signup works but login fails | Check profiles table exists & has your email |
| Form validation errors | Phone optional, CGPA must be 0-10 |
| Password too short | Min 6 characters required |
| Email already exists | Use different email or recover account |
| Can't see Create Account | Make sure Student role is selected |

---

## 📞 Admin Role (Unchanged)

- Admin login with demo credentials: `admin@placeflow.edu` / `admin123`
- NO signup option for admin (as required)
- Admin authentication still uses demo mode
- Can be upgraded to Supabase later

---

## 🔐 Security Checklist

✅ Row Level Security (RLS) enabled  
✅ Users access only their own data  
✅ Passwords encrypted by Supabase  
✅ Anon key safe for frontend  
✅ Service key kept secure (backend only)  

---

## 📚 Detailed Docs

For complete documentation, see:
- **SUPABASE_SETUP.md** - Full setup guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **Login.jsx** - Component code

---

## ✨ What's Next?

Potential enhancements:
- [ ] Email verification on signup
- [ ] Password reset flow
- [ ] Profile editing page
- [ ] Student search in admin dashboard
- [ ] OAuth integration (Google)

---

## 🆘 Need Help?

1. **Check browser console** (F12) for errors
2. **Check Supabase dashboard** for database errors
3. **Verify .env.local** has correct keys
4. **Restart dev server** after env changes
5. **See SUPABASE_SETUP.md** troubleshooting section

---

## 📝 Testing Credentials

After signup (use any new email):
```
Email: your-email@example.com
Password: your-password (set during signup)
```

Demo credentials (still work):
```
Admin:   admin@placeflow.edu / admin123
Student: student@placeflow.edu / student123
```

---

**Setup Complete!** 🎉

The system is ready for students to sign up and login with Supabase authentication.
