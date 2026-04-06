import { Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getNavItemsForRole } from '../components/navigationConfig';
import Topbar from '../components/Topbar';
import { usePlacementStore } from '../store/usePlacementStore';

export default function AppShell() {
  const role = usePlacementStore((state) => state.role);
  const auth = usePlacementStore((state) => state.auth);
  const dataMode = usePlacementStore((state) => state.dataMode);
  const lastRefreshedAt = usePlacementStore((state) => state.lastRefreshedAt);
  const setDataMode = usePlacementStore((state) => state.setDataMode);
  const triggerRealtimeRefresh = usePlacementStore((state) => state.triggerRealtimeRefresh);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => getNavItemsForRole(role), [role]);

  const featuredExploreLinks = useMemo(() => {
    if (role === 'admin') {
      return [
        { to: '/insights-lab', label: 'Insights Lab' },
        { to: '/campus-predictor', label: 'Campus Predictor' },
        { to: '/student-predictor', label: 'Student Predictor' },
        { to: '/resume-studio', label: 'Resume Studio' },
        { to: '/reports', label: 'Reports' },
      ];
    }

    return [
      { to: '/student', label: 'Student Home' },
      { to: '/student/predictor', label: 'Placement Analyzer' },
      { to: '/student/resume-studio', label: 'Resume Studio' },
      { to: '/student/profile', label: 'Profile' },
    ];
  }, [role]);

  useEffect(() => {
    void triggerRealtimeRefresh();
    const timer = setInterval(() => {
      void triggerRealtimeRefresh();
    }, 25000);

    return () => clearInterval(timer);
  }, [triggerRealtimeRefresh]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className='pf-shell-bg flex min-h-screen bg-transparent'>
      <Sidebar role={role} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar
          role={role}
          auth={auth}
          dataMode={dataMode}
          lastRefreshedAt={lastRefreshedAt}
          onModeChange={setDataMode}
          onRefresh={triggerRealtimeRefresh}
          onMenuToggle={() => setIsMobileMenuOpen((value) => !value)}
        />
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>

      {isMobileMenuOpen ? (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <button
            type='button'
            onClick={() => setIsMobileMenuOpen(false)}
            className='absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]'
            aria-label='Close menu overlay'
          />

          <aside className='absolute left-0 top-0 h-full w-[86%] max-w-[320px] border-r border-slate-200 bg-white p-4 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Explore Features</p>
                <p className='text-xs text-slate-500'>Quick sandwich menu access</p>
              </div>
              <button
                type='button'
                onClick={() => setIsMobileMenuOpen(false)}
                className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600'
                title='Close menu'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <nav className='space-y-1.5'>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.25)]'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className='h-4 w-4' />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className='mt-5 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50 p-3'>
              <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                <Sparkles className='h-3.5 w-3.5 text-teal-700' />
                New Features
              </p>
              <div className='mt-2 space-y-1'>
                {featuredExploreLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className='block rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-white hover:text-slate-900'
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
