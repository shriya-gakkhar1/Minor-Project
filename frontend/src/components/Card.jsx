import { cn } from '../lib/utils';

export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--pf-border)] bg-white/90 p-5 shadow-[var(--pf-shadow)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}
