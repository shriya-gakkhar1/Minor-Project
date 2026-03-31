import { Bell, LogOut, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import Button from './Button';
import Input from './Input';

const pageTitles = {
  '/dashboard': 'Placement Overview',
  '/students': 'Student Data',
  '/migration': 'Migration Center',
  '/add-company': 'Add Company',
  '/student': 'Student Workspace',
  '/reports': 'Reporting & Statistics',
};

export default function Topbar({ role, auth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'PlaceFlow';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className='sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur'>
      <div className='flex h-16 items-center justify-between gap-4 px-4 md:px-6'>
        <div>
          <h1 className='text-lg font-semibold text-slate-900'>{title}</h1>
          <p className='text-xs text-slate-500'>
            Signed in as {auth?.name || 'Demo User'} ({role === 'admin' ? 'TPO' : 'Student'})
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <div className='hidden w-64 md:block'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
              <Input className='pl-9' placeholder='Search students or companies' />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            title='Logout'
          >
            <LogOut className='h-4 w-4' />
          </button>
        </div>
      </div>
    </header>
  );
}
