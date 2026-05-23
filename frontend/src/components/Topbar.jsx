import { Database, LogOut, Menu, Moon, RefreshCw, RotateCcw, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import Button from './Button';
import { getNavItemsForRole } from './navigationConfig';

const pageTitles = {
  '/tpo/dashboard': 'Placement Intelligence Center',
  '/tpo/ingest': 'AI Data Ingestion',
  '/tpo/drives': 'Hiring Pipeline',
  '/tpo/students': 'Student Intelligence',
  '/tpo/prediction': 'Placement Predictor AI',
  '/tpo/reports': 'Intelligence Reports',
  '/student/dashboard': 'Career Command Center',
  '/student/opportunities': 'Opportunity Hub',
  '/student/mock-interview': 'AI Interview Arena',
  '/student/profile': 'Profile Intelligence',
};

export default function Topbar({ role, auth, lastRefreshedAt, onRefresh, onResetData, onSwitchRole, onMenuToggle, theme, onThemeToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Placify';
  const navItems = getNavItemsForRole(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReset = () => {
    if (!onResetData) return;
    const ok = window.confirm('Reset imported students, drives, and applications? Your login session will stay active.');
    if (!ok) return;
    onResetData();
    navigate(role === 'admin' ? '/tpo/dashboard' : '/student/dashboard');
  };

  const handleRoleSwitch = () => {
    if (!onSwitchRole) return;
    const nextRole = role === 'admin' ? 'student' : 'admin';
    onSwitchRole(nextRole);
    navigate(nextRole === 'admin' ? '/tpo/dashboard' : '/student/dashboard');
  };

  return (
    <header className='sticky top-0 z-30 px-4 pt-4 md:px-6'>
      <div className='mx-auto flex max-w-[1320px] items-center justify-between gap-3 rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface-strong)] px-4 py-3 shadow-[var(--pf-shadow)] backdrop-blur-2xl'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-300 text-white shadow-lg shadow-sky-400/20'>
            <Database className='h-5 w-5' />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-base font-semibold text-[var(--pf-text)]'>Placify</p>
            <p className='truncate text-xs text-[var(--pf-muted)]'>{title}</p>
          </div>
        </div>

        <nav className='hidden items-center gap-1 xl:flex'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
                  }`
                }
              >
                <Icon className='h-4 w-4' />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={onThemeToggle}
            className='grid h-10 w-10 place-items-center rounded-2xl border border-[var(--pf-border)] bg-white/60 text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5 dark:text-slate-200'
            title='Toggle theme'
          >
            {theme === 'dark' ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
          </button>

          <Button variant='secondary' size='sm' onClick={onRefresh} className='hidden sm:inline-flex'>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>

          {onSwitchRole ? (
            <Button variant='secondary' size='sm' onClick={handleRoleSwitch} className='hidden md:inline-flex'>
              {role === 'admin' ? <UserRound className='h-4 w-4' /> : <ShieldCheck className='h-4 w-4' />}
              {role === 'admin' ? 'Student View' : 'TPO View'}
            </Button>
          ) : null}

          {onResetData ? (
            <Button variant='secondary' size='sm' onClick={handleReset} className='hidden md:inline-flex'>
              <RotateCcw className='h-4 w-4' />
              Reset Data
            </Button>
          ) : null}

          <button
            onClick={handleLogout}
            className='hidden h-10 w-10 place-items-center rounded-2xl border border-[var(--pf-border)] bg-white/60 text-slate-600 transition hover:-translate-y-0.5 hover:text-rose-600 hover:shadow-md dark:bg-white/5 dark:text-slate-300 dark:hover:text-rose-200 sm:grid'
            title={`Signed in as ${auth?.name || 'Demo User'}. Logout`}
          >
            <LogOut className='h-4 w-4' />
          </button>

          <button
            type='button'
            onClick={onMenuToggle}
            className='grid h-10 w-10 place-items-center rounded-2xl border border-[var(--pf-border)] bg-white/60 text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5 dark:text-slate-200 xl:hidden'
            title='Open menu'
          >
            <Menu className='h-4 w-4' />
          </button>
        </div>
      </div>

      <div className='mx-auto mt-2 hidden max-w-[1320px] px-3 text-xs text-[var(--pf-muted)] md:block'>
        {auth?.name || 'Demo User'} · Updated {new Date(lastRefreshedAt).toLocaleTimeString()}
      </div>
    </header>
  );
}
