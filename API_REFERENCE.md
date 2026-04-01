# API Code Reference

## Complete Function Signatures

### Supabase Service (supabaseService.js)

```javascript
// ============ Client Setup ============
function getSupabaseClient(): SupabaseClient
// Returns initialized Supabase client with persistent session

function isSupabaseConfigured(): boolean
// Returns true if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

// ============ Authentication ============

/** Sign up a new student */
async function signUpStudent(
  email: string,
  password: string,
  profileData: {
    name?: string
    phone?: string
    cgpa?: number
    interests?: string[]
    activeBacklogs?: number
  }
): Promise<{
  ok: boolean
  user?: { id: string, email: string }
  profile?: { id: string, email: string, name: string, ... }
  error?: string
}>

/** Sign in with email and password */
async function signInWithEmail(
  email: string,
  password: string
): Promise<{
  ok: boolean
  user?: { id: string, email: string }
  profile?: { id: string, email: string, role: string, ... }
  error?: string
}>

/** Sign out user */
async function signOut(): Promise<{ ok: boolean, error?: string }>

/** Get current session */
async function getSession(): Promise<Session | null>
```

---

### Auth Service (authService.js)

```javascript
// ============ Session Management ============

function getSession(): {
  role: 'student' | 'admin' | 'guest'
  userId: string | null
  name: string | null
  email: string | null
  phone?: string
  cgpa?: number
  interests?: string[]
  activeBacklogs?: number
  supabaseUser?: boolean
}

function isAuthenticated(): boolean

// ============ Authentication ============

/** Login user (supports Supabase + demo mode) */
async function login(
  role: 'admin' | 'student',
  email: string,
  password: string
): Promise<{
  ok: boolean
  auth?: { role, userId, name, email, ... }
  error?: string
}>

/** Sign up student (Supabase only) */
async function signup(
  email: string,
  password: string,
  profileData: {
    name?: string
    phone?: string
    cgpa?: number
    interests?: string[]
    activeBacklogs?: number
  }
): Promise<{
  ok: boolean
  auth?: { role, userId, name, email, ... }
  error?: string
}>

/** Logout user */
async function logout(): Promise<{ role: 'guest', ... }>

/** Quick login with role (demo only) */
function loginAs(role: 'admin' | 'student'): { role, userId, ... }

/** Logout to demo admin */
function logoutToDemo(): { role: 'admin', ... }
```

---

## Usage Examples

### Example 1: Complete Signup Flow

```javascript
import { signup } from '../services/authService';
import { usePlacementStore } from '../store/usePlacementStore';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const navigate = useNavigate();
  const refreshData = usePlacementStore(state => state.refreshData);

  async function handleSignup(formData) {
    const result = await signup(
      formData.email,
      formData.password,
      {
        name: formData.name,
        phone: formData.phone,
        cgpa: parseFloat(formData.cgpa)
      }
    );

    if (result.ok) {
      refreshData();  // Update Zustand store
      navigate('/student');  // Redirect to dashboard
    } else {
      console.error('Signup failed:', result.error);
    }
  }

  return <form onSubmit={() => handleSignup(formData)} />;
}
```

---

### Example 2: Complete Login Flow

```javascript
import { login } from '../services/authService';
import { usePlacementStore } from '../store/usePlacementStore';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const refreshData = usePlacementStore(state => state.refreshData);

  async function handleLogin(email, password, role) {
    const result = await login(role, email, password);

    if (result.ok) {
      refreshData();
      const dashboard = role === 'admin' ? '/dashboard' : '/student';
      navigate(dashboard);
    } else {
      console.error('Login failed:', result.error);
    }
  }

  return <form onSubmit={() => handleLogin(...)} />;
}
```

---

### Example 3: Access User Data in Components

```javascript
import { usePlacementStore } from '../store/usePlacementStore';

function UserProfile() {
  // Get auth state from Zustand store
  const auth = usePlacementStore(state => state.auth);
  const role = usePlacementStore(state => state.role);

  if (!auth || role === 'guest') {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h2>{auth.name}</h2>
      <p>Email: {auth.email}</p>
      {auth.phone && <p>Phone: {auth.phone}</p>}
      {auth.cgpa && <p>CGPA: {auth.cgpa}</p>}
      {auth.interests?.length > 0 && (
        <p>Interests: {auth.interests.join(', ')}</p>
      )}
      <p>Role: {auth.role}</p>
      <p>Source: {auth.supabaseUser ? 'Supabase' : 'Demo'}</p>
    </div>
  );
}
```

---

### Example 4: Logout

```javascript
import { logout } from '../services/authService';
import { usePlacementStore } from '../store/usePlacementStore';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();
  const refreshData = usePlacementStore(state => state.refreshData);

  async function handleLogout() {
    await logout();
    refreshData();
    navigate('/login');
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

### Example 5: Conditional Rendering Based on Role

```javascript
import { usePlacementStore } from '../store/usePlacementStore';

function Navigation() {
  const role = usePlacementStore(state => state.role);

  return (
    <nav>
      {role === 'admin' && (
        <>
          <a href="/dashboard">Admin Dashboard</a>
          <a href="/students">Manage Students</a>
          <a href="/companies">Manage Companies</a>
        </>
      )}

      {role === 'student' && (
        <>
          <a href="/student">My Dashboard</a>
          <a href="/profile">My Profile</a>
          <a href="/applications">My Applications</a>
        </>
      )}

      {role === 'guest' && (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

---

### Example 6: Protected Route Component

```javascript
import { Navigate } from 'react-router-dom';
import { usePlacementStore } from '../store/usePlacementStore';

function ProtectedRoute({ children, requiredRole }) {
  const role = usePlacementStore(state => state.role);

  if (role === 'guest') {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Usage
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

### Example 7: Error Handling

```javascript
import { signup } from '../services/authService';

async function handleSignup(email, password) {
  const result = await signup(email, password, { name: 'John' });

  if (!result.ok) {
    // Handle different error types
    if (result.error?.includes('already exists')) {
      setError('Email already registered. Try login or password reset.');
    } else if (result.error?.includes('password')) {
      setError('Password must be at least 6 characters.');
    } else if (result.error?.includes('Supabase')) {
      setError('Configuration error. Please contact administrator.');
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
  }
}
```

---

### Example 8: Form Validation Helper

```javascript
function validateSignupForm(data) {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!data.email.includes('@')) {
    errors.email = 'Invalid email format';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (data.cgpa && (isNaN(data.cgpa) || data.cgpa < 0 || data.cgpa > 10)) {
    errors.cgpa = 'CGPA must be between 0 and 10';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Usage
const { isValid, errors } = validateSignupForm(formData);
if (isValid) {
  await signup(...);
} else {
  setFormErrors(errors);
}
```

---

### Example 9: Async Form with Loading State

```javascript
function SignupForm() {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        {
          name: formData.name,
          phone: formData.phone,
          cgpa: formData.cgpa ? parseFloat(formData.cgpa) : 0
        }
      );

      if (result.ok) {
        // Success
        navigate('/student');
      } else {
        // Error
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}
```

---

### Example 10: Profile Update After Signup

```javascript
import { updateUserProfile } from '../services/api'; // Future endpoint

async function handleSignup(email, password, profileData) {
  const result = await signup(email, password, profileData);

  if (result.ok) {
    // Optional: Update additional profile data later
    try {
      await updateUserProfile(result.user.id, {
        interests: ['Web Dev', 'AI'],
        activeBacklogs: 0,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Additional profile update failed:', err);
    }

    navigate('/student');
  }
}
```

---

## Type Definitions (TypeScript)

```typescript
interface AuthSession {
  role: 'student' | 'admin' | 'guest';
  userId: string | null;
  name: string | null;
  email: string | null;
  phone?: string;
  cgpa?: number;
  interests?: string[];
  activeBacklogs?: number;
  supabaseUser?: boolean;
}

interface ProfileData {
  name?: string;
  phone?: string;
  cgpa?: number;
  interests?: string[];
  activeBacklogs?: number;
}

interface SignupResult {
  ok: boolean;
  auth?: AuthSession;
  error?: string;
}

interface LoginResult {
  ok: boolean;
  auth?: AuthSession;
  error?: string;
}
```

---

## Zustand Store Integration

```javascript
import { usePlacementStore } from '../store/usePlacementStore';

// Get entire auth object
const auth = usePlacementStore(state => state.auth);

// Get role
const role = usePlacementStore(state => state.role);

// Trigger data refresh (call after login/signup)
const refreshData = usePlacementStore(state => state.refreshData);

// Login as role
const loginAsRole = usePlacementStore(state => state.loginAsRole);

// Example in component
function MyComponent() {
  const { auth, role, refreshData } = usePlacementStore(state => ({
    auth: state.auth,
    role: state.role,
    refreshData: state.refreshData
  }));

  return (
    <div>
      <p>Logged in as: {auth.name} ({role})</p>
    </div>
  );
}
```

---

## Error Codes Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "Supabase not configured" | Missing env vars | Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| "email already exists" | Duplicate email | Use different email or reset account |
| "invalid_password" | Wrong password | Check caps lock, try again |
| "Invalid email or password" | Credentials wrong | Verify email and password |
| "Profile save failed" | DB insert error | Check profiles table schema |
| "Failed to fetch profile" | DB query error | Check RLS policies |
| "Configuration error" | Backend issue | Contact administrator |

---

## Response Structure

### Successful Response
```javascript
{
  ok: true,
  user: {
    id: "uuid",
    email: "user@example.com"
  },
  profile: {
    id: "uuid",
    email: "user@example.com",
    name: "John Doe",
    role: "student",
    phone: "1234567890",
    cgpa: 8.5,
    interests: [],
    activeBacklogs: 0
  }
}
```

### Error Response
```javascript
{
  ok: false,
  error: "Email already exists"
}
```

---

Generated: April 2024
