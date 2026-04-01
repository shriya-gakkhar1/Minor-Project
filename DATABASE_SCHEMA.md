# Database Schema - SQL Setup

## One-Click Setup for Supabase

Copy and paste the entire SQL block below into **Supabase Dashboard → SQL Editor**, then click "Run".

---

## Complete SQL Setup

```sql
-- =====================================================
-- USER PROFILES TABLE FOR STUDENT DATA
-- =====================================================

-- Create the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  phone TEXT,
  cgpa NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (cgpa >= 0 AND cgpa <= 10),
  interests TEXT[] DEFAULT '{}',
  activeBacklogs INTEGER NOT NULL DEFAULT 0 CHECK (activeBacklogs >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_cgpa CHECK (cgpa BETWEEN 0 AND 10)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can read all profiles (optional, uncomment if needed)
-- CREATE POLICY "Admins can read all profiles"
--   ON profiles FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles p2
--       WHERE p2.id = auth.uid() AND p2.role = 'admin'
--     )
--   );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

-- Create function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS (OPTIONAL)
-- =====================================================

-- View for admin dashboard (students with placement count)
CREATE OR REPLACE VIEW student_summary AS
SELECT
  p.id,
  p.email,
  p.name,
  p.phone,
  p.cgpa,
  ARRAY_LENGTH(p.interests, 1) AS interest_count,
  p.activeBacklogs,
  p.created_at
FROM profiles p
WHERE p.role = 'student'
ORDER BY p.created_at DESC;

-- =====================================================
-- GRANTS (SECURITY)
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;
GRANT SELECT ON student_summary TO authenticated;

-- =====================================================
-- TEST DATA (OPTIONAL - Comment out if not needed)
-- =====================================================

-- Note: Replace these UUID values with actual Supabase user IDs
-- Uncomment to add test data after creating users

/*
INSERT INTO profiles (id, email, name, role, phone, cgpa, interests, activeBacklogs)
VALUES
  ('user-id-1', 'john@example.com', 'John Doe', 'student', '9876543210', 8.5, ARRAY['Web Dev', 'AI'], 0),
  ('user-id-2', 'jane@example.com', 'Jane Smith', 'student', '9876543211', 9.2, ARRAY['Cloud', 'DevOps'], 1),
  ('user-id-3', 'admin@example.com', 'Admin User', 'admin', '9876543212', 0, '{}', 0)
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'profiles';

-- Check row security policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'profiles';

-- Check data
-- SELECT COUNT(*) as total_profiles FROM profiles;
```

---

## Table Structure Reference

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | - | PRIMARY KEY, FK auth.users | Supabase user ID |
| `email` | TEXT | - | NOT NULL, UNIQUE | User email address |
| `name` | TEXT | NULL | - | Full name |
| `role` | TEXT | 'student' | CHECK IN ('student','admin') | User role |
| `phone` | TEXT | NULL | - | Contact number |
| `cgpa` | NUMERIC(3,2) | 0 | CHECK 0-10 | Cumulative GPA |
| `interests` | TEXT[] | '{}' | - | Array of interests/skills |
| `activeBacklogs` | INTEGER | 0 | CHECK >= 0 | Count of active backlogs |
| `created_at` | TIMESTAMP | NOW() | - | Creation timestamp |
| `updated_at` | TIMESTAMP | NOW() | - | Last update timestamp |

---

## Indexes Created

```
profiles_email_idx         → Fast email lookups
profiles_role_idx          → Fast role filtering
profiles_created_at_idx    → Fast sorting by date
```

---

## Row Level Security (RLS) Policies

### Policy 1: Read Own Profile
```
Users can SELECT only their own profile
Condition: auth.uid() = id
```

### Policy 2: Update Own Profile
```
Users can UPDATE only their own profile
Condition: auth.uid() = id AND auth.uid() = id (WITH CHECK)
```

### Policy 3: Insert Own Profile
```
Users can INSERT only their own profile
Condition: auth.uid() = id
```

**Security**: Users cannot read, update, or insert other users' data.

---

## Example Data Insertions

After users sign up via the app, data automatically appears in the table. Here are examples:

### Via SignUp API
```javascript
// This happens automatically when you call signup()
// Inserts into profiles table with:
{
  id: auth_user_id,
  email: "student@example.com",
  name: "John Doe",
  role: "student",
  phone: "9876543210",
  cgpa: 8.5,
  interests: [],
  activeBacklogs: 0,
  created_at: NOW(),
  updated_at: NOW()
}
```

### Manual SQL Insert (for testing)
```sql
-- Note: Replace with actual user ID from auth.users table
INSERT INTO profiles (id, email, name, role, phone, cgpa)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@example.com',
  'Test Student',
  'student',
  '9876543210',
  7.5
);
```

---

## Query Examples

### Get All Students
```sql
SELECT * FROM profiles WHERE role = 'student' ORDER BY created_at DESC;
```

### Get Student by Email
```sql
SELECT * FROM profiles WHERE email = 'student@example.com';
```

### Get High CGPA Students
```sql
SELECT name, email, cgpa FROM profiles WHERE cgpa >= 8.0 ORDER BY cgpa DESC;
```

### Get Students with Backlogs
```sql
SELECT name, email, activeBacklogs FROM profiles WHERE activeBacklogs > 0;
```

### Count Students by Interest
```sql
SELECT
  unnest(interests) as interest,
  COUNT(*) as count
FROM profiles
WHERE role = 'student'
GROUP BY interest
ORDER BY count DESC;
```

### Student Summary View
```sql
SELECT * FROM student_summary;
```

### Update Student CGPA
```sql
UPDATE profiles
SET cgpa = 8.7
WHERE email = 'student@example.com';
```

### Delete Student Profile
```sql
DELETE FROM profiles
WHERE id = 'user-uuid-here';
-- Note: This also deletes auth.users entry due to FK cascade
```

---

## Backup & Restore Commands

### Export Data (SQL - run in SQL Editor)
```sql
-- Export as CSV
COPY (SELECT * FROM profiles) TO STDOUT WITH CSV HEADER;
```

### Import from CSV
```sql
-- First, create a temporary table
CREATE TABLE profiles_import AS SELECT * FROM profiles LIMIT 0;

-- Then copy from file (run via CLI)
-- psql -h db.supabase.co -U postgres -d postgres -c "COPY profiles_import FROM STDIN WITH CSV HEADER"
```

---

## Performance Optimization Tips

### 1. Add Composite Index (if needed)
```sql
CREATE INDEX profiles_role_cgpa_idx ON profiles(role, cgpa DESC);
```

### 2. Add Partial Index (for active students)
```sql
CREATE INDEX profiles_active_students_idx ON profiles(email)
WHERE role = 'student' AND activeBacklogs = 0;
```

### 3. Analyze Query Performance
```sql
EXPLAIN ANALYZE SELECT * FROM profiles WHERE cgpa >= 8.0;
```

---

## Troubleshooting

### Issue: "Permission denied for schema public"
**Solution**: Check RLS policies or run setup with admin user

### Issue: "Duplicate key value violates unique constraint"
**Solution**: Email already exists. Use different email.

### Issue: "Invalid UUID"
**Solution**: Make sure ID matches Supabase auth.users ID format

### Issue: "CGPA check constraint violation"
**Solution**: CGPA must be between 0 and 10

### Issue: Tables not visible in UI
**Solution**: Refresh Supabase dashboard or check RLS is not hiding tables

---

## Monitoring & Maintenance

### Check Table Size
```sql
SELECT pg_size_pretty(pg_total_relation_size('profiles')) AS size;
```

### Find Unused Indexes
```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname != 'pg_catalog'
ORDER BY tablename, indexname;
```

### Check Row Count
```sql
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM profiles WHERE role = 'student';
SELECT COUNT(*) FROM profiles WHERE role = 'admin';
```

### Monitor Auth Users
```sql
SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## Disaster Recovery

### Backup Steps (Supabase Auto-Backup)
- Supabase automatically backs up daily
- Access backups in **Settings → Backups**
- Manual backups can be created before major changes

### Restore Steps
1. Go to **Supabase Dashboard → Settings → Backups**
2. Select backup point
3. Click "Restore"
4. Confirm the operation

---

## Related Documentation

- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Generated**: April 2024  
**Last Updated**: April 2024
