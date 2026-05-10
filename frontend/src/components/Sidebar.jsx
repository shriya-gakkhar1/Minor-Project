import { NavLink } from 'react-router-dom';
import { Database } from 'lucide-react';
import { getNavItemsForRole } from './navigationConfig';
import { cn } from '../lib/utils';

export default function Sidebar({ role }) {
  const navItems = getNavItemsForRole(role);

  return (
    <aside className='hidden h-screen w-[272px] shrink-0 border-r border-[var(--pf-border)] bg-[var(--pf-surface-strong)] backdrop-blur-xl lg:block'>
      <div className='flex h-16 items-center gap-3 border-b border-white/10 px-5'>
        <div className='rounded-xl bg-slate-100 p-2 text-slate-950'>
          <Database className='h-4 w-4' />
        </div>
        <div>
          <p className='text-sm font-semibold text-white'>Placify AI</p>
          <p className='text-xs text-slate-500'>{role === 'admin' ? 'Placement Intelligence' : 'Readiness Workspace'}</p>
        </div>
      </div>

      <nav className='pf-stagger space-y-1.5 p-3'>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-teal-300/18 to-sky-400/12 text-teal-50 shadow-[inset_0_0_0_1px_rgba(94,234,212,0.26)]'
                    : 'text-slate-400 hover:bg-white/[0.055] hover:text-slate-100',
                )
              }
            >
              <Icon className='h-4 w-4 transition-transform duration-200 group-hover:scale-105' />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className='p-3'>
        <div className='rounded-2xl border border-white/10 bg-white/[0.035] p-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Workflow</p>
          <p className='mt-1 text-sm font-semibold text-white'>Ingest, validate, analyze.</p>
          <p className='mt-1 text-xs text-slate-400'>Start with data ingestion, then review risks and reports.</p>
        </div>
      </div>
    </aside>
  );
}
