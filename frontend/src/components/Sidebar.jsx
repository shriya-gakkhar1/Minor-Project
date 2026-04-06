import { NavLink } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { getNavItemsForRole } from './navigationConfig';
import { cn } from '../lib/utils';

export default function Sidebar({ role }) {
  const navItems = getNavItemsForRole(role);

  return (
    <aside className='hidden h-screen w-[272px] shrink-0 border-r border-slate-200/90 bg-white/85 backdrop-blur-md lg:block'>
      <div className='flex h-16 items-center gap-3 border-b border-slate-200/90 px-5'>
        <div className='pf-float rounded-xl bg-[linear-gradient(135deg,#0f5c8e,#0f766e)] p-2 text-white shadow-sm'>
          <Building2 className='h-4 w-4' />
        </div>
        <div>
          <p className='text-sm font-semibold text-slate-900'>Placify AI</p>
          <p className='text-xs text-slate-500'>{role === 'admin' ? 'TPO Coordinator' : 'Student Workspace'}</p>
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
                    ? 'bg-teal-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.25)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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
        <div className='rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50 p-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Placement Pulse</p>
          <p className='mt-1 text-sm font-semibold text-slate-900'>AI-assisted decision layer active</p>
          <p className='mt-1 text-xs text-slate-600'>Use Insights + Predictors for faster weekly planning.</p>
        </div>
      </div>
    </aside>
  );
}