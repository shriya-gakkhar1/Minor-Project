import { loadDb, saveDb } from './dbService';

export function getSession() {
  return loadDb().auth;
}

export function loginAs(role) {
  const db = loadDb();
  const nextAuth =
    role === 'student'
      ? { role: 'student', userId: 'stu_01', name: 'Aarav Sharma', email: 'aarav@college.edu' }
      : { role: 'admin', userId: 'admin_01', name: 'TPO Admin', email: 'tpo@placeflow.edu' };

  return saveDb({ ...db, auth: nextAuth }).auth;
}

export function logoutToDemo() {
  return loginAs('admin');
}
