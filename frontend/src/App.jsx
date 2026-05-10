import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Skeleton from './components/ui/Skeleton';
import Login from './pages/Login';

import { usePlacementStore } from './store/usePlacementStore';

const AddCompanyPage = lazy(() => import('./pages/AddCompanyPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MigrationPage = lazy(() => import('./pages/MigrationPage'));
const MockInterviewPage = lazy(() => import('./pages/MockInterviewPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ResumeStudioPage = lazy(() => import('./pages/ResumeStudioPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));

function AuthGuard({ children }) {
  const auth = usePlacementStore((state) => state.auth);

  if (!auth || auth.role === 'guest' || !auth.role) {
    return <Navigate to='/login' replace />;
  }

  return children;
}

function AdminOnly({ children }) {
  const role = usePlacementStore((state) => state.role);

  if (role !== 'admin') return <Navigate to='/student/dashboard' replace />;

  return children;
}

function StudentOnly({ children }) {
  const role = usePlacementStore((state) => state.role);

  if (role !== 'student') return <Navigate to='/tpo/dashboard' replace />;

  return children;
}

function PublicHome() {
  const auth = usePlacementStore((state) => state.auth);

  if (auth?.role === 'admin') return <Navigate to='/tpo/dashboard' replace />;
  if (auth?.role === 'student') return <Navigate to='/student/dashboard' replace />;

  return <LandingPage />;
}

export default function App() {
  return (
    <Suspense fallback={<div className='p-6'><Skeleton className='h-16 w-full' /></div>}>
      <Routes>

        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route path="/dashboard" element={<Navigate to='/tpo/dashboard' replace />} />
          <Route path="/students" element={<Navigate to='/tpo/students' replace />} />
          <Route path="/migration" element={<Navigate to='/tpo/ingest' replace />} />
          <Route path="/add-company" element={<Navigate to='/tpo/drives' replace />} />
          <Route path="/reports" element={<Navigate to='/tpo/reports' replace />} />
          <Route path="/insights-lab" element={<Navigate to='/tpo/dashboard' replace />} />
          <Route path="/campus-predictor" element={<Navigate to='/tpo/dashboard' replace />} />
          <Route path="/student-predictor" element={<Navigate to='/student/dashboard' replace />} />
          <Route path="/resume-studio" element={<Navigate to='/student/resume' replace />} />
          <Route path="/mock-interview" element={<Navigate to='/student/mock-interview' replace />} />

          <Route
            path="/tpo/dashboard"
            element={<AdminOnly><AdminDashboard /></AdminOnly>}
          />
          <Route
            path="/tpo/ingest"
            element={<AdminOnly><MigrationPage /></AdminOnly>}
          />
          <Route
            path="/tpo/drives"
            element={<AdminOnly><AddCompanyPage /></AdminOnly>}
          />
          <Route
            path="/tpo/students"
            element={<AdminOnly><StudentsPage /></AdminOnly>}
          />
          <Route
            path="/tpo/reports"
            element={<AdminOnly><ReportsPage /></AdminOnly>}
          />

          <Route path="/student" element={<Navigate to='/student/dashboard' replace />} />
          <Route
            path="/student/dashboard"
            element={<StudentOnly><StudentDashboard /></StudentOnly>}
          />
          <Route
            path="/student/opportunities"
            element={<StudentOnly><StudentDashboard /></StudentOnly>}
          />
          <Route
            path="/student/resume"
            element={<StudentOnly><ResumeStudioPage /></StudentOnly>}
          />
          <Route
            path="/student/profile"
            element={<StudentOnly><StudentProfile /></StudentOnly>}
          />
          <Route
            path="/student/predictor"
            element={<Navigate to='/student/dashboard' replace />}
          />
          <Route
            path="/student/resume-studio"
            element={<Navigate to='/student/resume' replace />}
          />
          <Route
            path="/student/mock-interview"
            element={<StudentOnly><MockInterviewPage /></StudentOnly>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
