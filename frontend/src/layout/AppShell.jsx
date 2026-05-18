import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getNavItemsForRole } from '../components/navigationConfig';
import Topbar from '../components/Topbar';
import { cn } from '../lib/utils';
import { usePlacementStore } from '../store/usePlacementStore';

function getInitialTheme() {
  try {
    return localStorage.getItem('placify-theme') || 'light';
  } catch {
    return 'light';
  }
}

export default function AppShell() {
  const role = usePlacementStore((state) => state.role);
  const auth = usePlacementStore((state) => state.auth);
  const lastRefreshedAt = usePlacementStore((state) => state.lastRefreshedAt);
  const triggerRealtimeRefresh = usePlacementStore((state) => state.triggerRealtimeRefresh);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const navItems = useMemo(() => getNavItemsForRole(role), [role]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.add('theme-transition');
    try {
      localStorage.setItem('placify-theme', theme);
    } catch {
      // Ignore storage failures; theme still works for this session.
    }
  }, [theme]);

  useEffect(() => {
    void triggerRealtimeRefresh();
  }, [triggerRealtimeRefresh]);

  return (
    <div className='pf-shell-bg min-h-screen text-[var(--pf-text)]'>
      <Topbar
        role={role}
        auth={auth}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={triggerRealtimeRefresh}
        onMenuToggle={() => setIsMobileMenuOpen((value) => !value)}
        theme={theme}
        onThemeToggle={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
      />

      <div className='flex min-h-[calc(100vh-96px)]'>
        {/* Sidebar — visible on lg+ */}
        <aside className='hidden w-[220px] shrink-0 border-r border-[var(--pf-border)] bg-[var(--pf-surface-strong)] backdrop-blur-xl lg:block'>
          <nav className='space-y-1 p-3 pt-4'>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-sky-400/20 to-teal-300/15 text-sky-700 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)] dark:text-teal-100'
                        : 'text-slate-500 hover:bg-white/[0.07] hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )
                  }
                >
                  <Icon className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105' />
                  <span className='truncate'>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className='absolute bottom-4 left-0 w-[220px] px-3'>
            <div className='rounded-2xl border border-[var(--pf-border)] bg-white/[0.035] p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {role === 'admin' ? 'TPO Workflow' : 'Student Workflow'}
              </p>
              <p className='mt-1 text-xs text-[var(--pf-muted)]'>
                {role === 'admin'
                  ? 'Import → Analyze → Report'
                  : 'Profile → Predict → Apply'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className='min-w-0 flex-1 overflow-x-hidden'>
          <Outlet />
        </main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen ? (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <button
            type='button'
            onClick={() => setIsMobileMenuOpen(false)}
            className='absolute inset-0 bg-slate-950/30 backdrop-blur-sm'
            aria-label='Close menu'
          />

          <div className='absolute left-4 right-4 top-4 rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface-strong)] p-4 shadow-[var(--pf-shadow)] backdrop-blur-2xl'>
            <div className='mb-3 flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-[var(--pf-text)]'>Placify</p>
                <p className='text-xs text-[var(--pf-muted)]'>Choose a page</p>
              </div>
              <button
                type='button'
                onClick={() => setIsMobileMenuOpen(false)}
                className='rounded-xl border border-[var(--pf-border)] px-3 py-1.5 text-sm text-[var(--pf-muted)]'
              >
                Close
              </button>
            </div>

            <nav className='grid gap-2'>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200'
                          : 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className='h-4 w-4' />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
