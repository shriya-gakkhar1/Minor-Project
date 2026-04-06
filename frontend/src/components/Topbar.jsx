import { LogOut, RefreshCw, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import Button from './Button';
import Input from './Input';

const pageTitles = {
  '/dashboard': 'Placement Overview',
  '/students': 'Student Data',
  '/migration': 'Migration Center',
  '/insights-lab': 'Insights Lab',
  '/campus-predictor': 'Campus Predictor',
  '/student-predictor': 'Student Predictor',
  '/add-company': 'Add Company',
  '/student': 'Student Workspace',
  '/student/predictor': 'Student Placement Analyzer',
  '/reports': 'Reporting & Statistics',
};

export default function Topbar({ role, auth, dataMode, lastRefreshedAt, onModeChange, onRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'PlaceFlow';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className='sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-md'>
      <div className='flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='inline-flex rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-700'>
              {role === 'admin' ? 'TPO Coordinator' : 'Student'}
            </span>
            <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              Sync {dataMode}
            </span>
          </div>
          <h1 className='mt-1 text-lg font-semibold tracking-tight text-slate-900'>{title}</h1>
          <p className='text-xs text-slate-500'>
            Signed in as {auth?.name || 'Demo User'} | Last sync {new Date(lastRefreshedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <div className='hidden w-64 md:block'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
              <Input className='pl-9' placeholder='Search students or companies' />
            </div>
          </div>

          <select
            value={dataMode}
            onChange={(event) => onModeChange(event.target.value)}
            className='h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
            title='Data mode'
          >
            <option value='offline'>Offline</option>
            <option value='online'>Online</option>
          </select>

          <Button variant='secondary' size='sm' onClick={onRefresh}>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>

          <button
            onClick={handleLogout}
            className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
            title='Logout'
          >
            <LogOut className='h-4 w-4' />
          </button>
        </div>
      </div>
    </header>
  );
}
