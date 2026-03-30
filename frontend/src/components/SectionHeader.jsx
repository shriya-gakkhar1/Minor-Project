import { cn } from '../lib/utils';

export default function SectionHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h2 className='text-lg font-semibold text-slate-900'>{title}</h2>
        {subtitle ? <p className='mt-1 text-sm text-slate-500'>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
