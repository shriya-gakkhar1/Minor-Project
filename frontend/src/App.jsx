import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Skeleton from './components/ui/Skeleton';
import Login from './pages/Login';

import { usePlacementStore } from './store/usePlacementStore';

// Lazy loaded pages
const AddCompanyPage = lazy(() => import('./pages/AddCompanyPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MigrationPage = lazy(() => import('./pages/MigrationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));

// 🔐 Authentication Guard - Redirects to login if not authenticated
function AuthGuard({ children }) {
  const auth = usePlacementStore((state) => state.auth);

  if (!auth || auth.role === 'guest' || !auth.role) {
    return <Navigate to='/' replace />;
  }

  return children;
}

// 🔐 Admin Protection
function AdminOnly({ children }) {
  const role = usePlacementStore((state) => state.role);

  if (role !== 'admin') return <Navigate to='/student' replace />;

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div className='p-6'><Skeleton className='h-16 w-full' /></div>}>
      <Routes>

        {/* 🔓 Public Route */}
        <Route path="/" element={<Login />} />

        {/* 🔒 Protected Layout */}
        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <AdminOnly>
                <AdminDashboard />
              </AdminOnly>
            }
          />

          <Route
            path="/students"
            element={
              <AdminOnly>
                <StudentsPage />
              </AdminOnly>
            }
          />

          <Route
            path="/migration"
            element={
              <AdminOnly>
                <MigrationPage />
              </AdminOnly>
            }
          />

          <Route
            path="/add-company"
            element={
              <AdminOnly>
                <AddCompanyPage />
              </AdminOnly>
            }
          />

          <Route
            path="/reports"
            element={
              <AdminOnly>
                <ReportsPage />
              </AdminOnly>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <AuthGuard>
                <StudentDashboard />
              </AuthGuard>
            }
          />

          <Route
            path="/student/profile"
            element={
              <AuthGuard>
                <StudentProfile />
              </AuthGuard>
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}