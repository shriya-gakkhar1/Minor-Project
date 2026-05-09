import Card from './Card';

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <Card className='h-full'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold text-slate-900'>{title}</h3>
          {subtitle ? <p className='mt-1 text-sm text-slate-600'>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className='h-[280px] rounded-xl border border-slate-100 bg-white p-2'>{children}</div>
    </Card>
  );
}
