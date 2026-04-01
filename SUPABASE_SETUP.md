# Supabase Authentication & Student Signup Setup

## Overview
This document provides complete setup instructions for implementing Supabase authentication with student signup functionality in PlaceIQ.

---

## 1. Supabase Project Setup

### Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: PlaceIQ (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Wait for project to initialize (~2 minutes)

### Get API Credentials
1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Public Key** (VITE_SUPABASE_ANON_KEY)

---

## 2. Environment Variables Setup

### Frontend (.env.local)
Create or update `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Replace with your actual credentials from Supabase

---

## 3. Database Schema

### Create "profiles" Table

Go to **Supabase Dashboard → SQL Editor** and run this SQL:

```sql
-- Create profiles table for student data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  phone TEXT,
  cgpa NUMERIC(3,2) DEFAULT 0 CHECK (cgpa >= 0 AND cgpa <= 10),
  interests TEXT[] DEFAULT '{}',
  activeBacklogs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Authenticated users can insert their profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
```

### Verify Table Creation

Go to **Supabase Dashboard → Editor** and check:
- Table `profiles` exists
- Columns: id, email, name, role, phone, cgpa, interests, activeBacklogs, created_at, updated_at
- RLS policies are enabled

---

## 4. Authentication Settings

### Email Authentication Setup

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Ensure **Email** is enabled
3. Configure **Email Confirmations**:
   - Go to **Authentication → Email Templates**
   - Customize if needed (optional)

### Auth Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Add Redirect URLs:
   - Development: `http://localhost:5173/login`
   - Production: `https://yourdomain.com/login`

---

## 5. Backend Integration (Optional REST API)

If you want a backend REST endpoint to sync profile data:

### Create Express Endpoint (backend/routes/auth.js)

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend
);

// Create profile after signup
router.post('/create-profile', async (req, res) => {
  try {
    const { userId, email, name, phone, cgpa } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          name,
          phone,
          cgpa,
          role: 'student',
        },
      ])
      .select();

    if (error) throw error;
    
    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

module.exports = router;
```

### Backend .env Setup

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get **Service Key** from **Supabase → Settings → API → Service Role Key**

---

## 6. Testing Student Signup Flow

### Test Steps

1. **Access Login Page**: Navigate to http://localhost:5173/login
2. **Select Student Role**: Click "Student" button
3. **Click "Create Account"** (only visible for students)
4. **Fill Signup Form**:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test@1234 (min 6 chars)
   - Phone: 9876543210 (optional)
   - CGPA: 8.5 (optional)
5. **Submit**: Click "Create Account"
6. **Verify**: Check Supabase Dashboard → Auth Users & profiles table

### Test Login

1. Go back to Login page
2. Select Student role
3. Enter credentials: john@example.com / Test@1234
4. Click "Sign In"
5. Should redirect to student dashboard

---

## 7. API Reference

### Frontend Services

#### `signUpStudent(email, password, profileData)`
**Location**: `src/services/supabaseService.js`

Creates a new student account with additional profile data.

```javascript
import { signUpStudent } from './services/supabaseService';

const result = await signUpStudent('student@example.com', 'password123', {
  name: 'Jane Doe',
  phone: '9876543210',
  cgpa: 8.5,
  interests: ['Web Development', 'AI'],
  activeBacklogs: 0
});

if (result.ok) {
  console.log('User created:', result.user.id);
  console.log('Profile:', result.profile);
} else {
  console.error('Signup failed:', result.error);
}
```

**Returns**:
```javascript
{
  ok: true,
  user: { id, email, ...authData },
  profile: { id, email, name, role, phone, cgpa, ... }
}
```

---

#### `signInWithEmail(email, password)`
**Location**: `src/services/supabaseService.js`

Authenticates user and fetches profile data.

```javascript
import { signInWithEmail } from './services/supabaseService';

const result = await signInWithEmail('student@example.com', 'password123');

if (result.ok) {
  console.log('Logged in:', result.user.email);
  console.log('Profile data:', result.profile);
} else {
  console.error('Login failed:', result.error);
}
```

---

#### `signup(email, password, profileData)`
**Location**: `src/services/authService.js`

High-level signup function that auto-logins after successful registration.

```javascript
import { signup } from './services/authService';

const result = await signup('student@example.com', 'password123', {
  name: 'Jane Doe',
  phone: '9876543210',
  cgpa: 8.5
});

if (result.ok) {
  // User is automatically logged in
  // Redirect to dashboard
} else {
  console.error('Signup failed:', result.error);
}
```

---

#### `login(role, email, password)`
**Location**: `src/services/authService.js`

Unified login function supporting both Supabase and demo mode.

```javascript
import { login } from './services/authService';

const result = await login('student', 'student@example.com', 'password123');

if (result.ok) {
  console.log('Logged in as:', result.auth.role);
  // Redirect to dashboard
} else {
  console.error('Login failed:', result.error);
}
```

---

#### `logout()`
**Location**: `src/services/authService.js`

Signs out current user from Supabase.

```javascript
import { logout } from './services/authService';

await logout();
// User session cleared
```

---

## 8. UI Components Updated

### Login Page (`src/pages/Login.jsx`)

**New Features**:
- ✅ Student signup option (hidden for admin)
- ✅ Toggle between Login and Signup
- ✅ Signup form with fields:
  - Full Name (required)
  - Email (required)
  - Password (required, min 6 chars)
  - Phone (optional)
  - CGPA (optional, 0-10)
- ✅ Form validation
- ✅ Error messages
- ✅ Demo credentials fallback

**Key Changes**:
- `isSignup` state to toggle forms
- Separate `handleLoginSubmit` and `handleSignupSubmit`
- Admin role doesn't see signup option
- Password confirmation validation

---

## 9. Security Best Practices

### Implemented
- ✅ Row Level Security (RLS) on profiles table
- ✅ Users can only read/update their own profile
- ✅ Service-to-client key separation
- ✅ Password minimum length (6 characters)
- ✅ Email uniqueness constraint

### Additional Recommendations
1. **Production**: Enable email verification before allowing login
2. **Rate Limiting**: Enable Supabase rate limiting
3. **CORS**: Configure CORS properly in Supabase
4. **Secrets**: Use GitHub Secrets for API keys in CI/CD
5. **Audit**: Monitor auth logs in Supabase Dashboard

---

## 10. Troubleshooting

### Issue: "Supabase not configured"
**Solution**: 
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### Issue: Signup creates auth user but fails on profile insert
**Solution**:
- Check `profiles` table RLS policies
- Ensure `profiles` table exists with correct schema
- Check database logs in Supabase Dashboard

### Issue: User can't login after signup
**Solution**:
- Verify email exists in `auth.users` table
- Check `profiles` table has matching email
- Verify profile insert was successful
- Check browser console for errors

### Issue: "Email already exists"
**Solution**:
- Unique constraint on email exists
- User may have signed up before
- Use forgot password or recovery flow

---

## 11. Next Steps

### Enhanced Features (Future)
1. Email verification on signup
2. Password reset flow
3. Profile editing page
4. Multiple interests/skills
5. OAuth integration (Google, GitHub)
6. 2FA authentication
7. Activity logging

### Integration Points
1. Connect profile data to applications
2. Show student profile in admin dashboard
3. Profile completeness indicator
4. Student search filtering by CGPA, interests

---

## References
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
