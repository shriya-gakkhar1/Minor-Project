import { loadDb, saveDb } from './dbService';

// Demo credentials for login
const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@placeflow.edu',
    password: 'admin123',
  },
  student: {
    email: 'student@placeflow.edu',
    password: 'student123',
  },
};

export function getSession() {
  return loadDb().auth;
}

export function isAuthenticated() {
  const auth = getSession();
  return auth && auth.role !== 'guest';
}

export function login(role, email, password) {
  const db = loadDb();

  // Validate credentials (demo mode - accept demo credentials or any input)
  const expectedCredentials = DEMO_CREDENTIALS[role];
  const isValidCredentials =
    email === expectedCredentials.email && password === expectedCredentials.password;

  if (!isValidCredentials) {
    return { ok: false, error: 'Invalid email or password' };
  }

  const nextAuth =
    role === 'student'
      ? { role: 'student', userId: 'stu_01', name: 'Aarav Sharma', email: 'aarav@college.edu' }
      : { role: 'admin', userId: 'admin_01', name: 'TPO Admin', email: 'tpo@placeflow.edu' };

  const result = saveDb({ ...db, auth: nextAuth });
  return { ok: true, auth: result.auth };
}

export function loginAs(role) {
  const db = loadDb();
  const nextAuth =
    role === 'student'
      ? { role: 'student', userId: 'stu_01', name: 'Aarav Sharma', email: 'aarav@college.edu' }
      : { role: 'admin', userId: 'admin_01', name: 'TPO Admin', email: 'tpo@placeflow.edu' };

  return saveDb({ ...db, auth: nextAuth }).auth;
}

export function logout() {
  const db = loadDb();
  const nextAuth = { role: 'guest', userId: null, name: null, email: null };
  return saveDb({ ...db, auth: nextAuth }).auth;
}

export function logoutToDemo() {
  return loginAs('admin');
}
