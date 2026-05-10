import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getNavItemsForRole } from '../components/navigationConfig';
import Topbar from '../components/Topbar';
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

      <main className='min-h-[calc(100vh-96px)]'>
        <Outlet />
      </main>

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
