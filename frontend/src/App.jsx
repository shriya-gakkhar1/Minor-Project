import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Skeleton from './components/ui/Skeleton';
const AddCompanyPage = lazy(() => import('./pages/AddCompanyPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MigrationPage = lazy(() => import('./pages/MigrationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
import { usePlacementStore } from './store/usePlacementStore';

function AdminOnly({ children }) {
  const role = usePlacementStore((state) => state.role);
  if (role !== 'admin') return <Navigate to='/student' replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div className='p-6'><Skeleton className='h-16 w-full' /></div>}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route
            path='/dashboard'
            element={
              <AdminOnly>
                <AdminDashboard />
              </AdminOnly>
            }
          />
          <Route
            path='/students'
            element={
              <AdminOnly>
                <StudentsPage />
              </AdminOnly>
            }
          />
          <Route
            path='/migration'
            element={
              <AdminOnly>
                <MigrationPage />
              </AdminOnly>
            }
          />
          <Route
            path='/add-company'
            element={
              <AdminOnly>
                <AddCompanyPage />
              </AdminOnly>
            }
          />
          <Route
            path='/reports'
            element={
              <AdminOnly>
                <ReportsPage />
              </AdminOnly>
            }
          />
          <Route path='/student' element={<StudentDashboard />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}