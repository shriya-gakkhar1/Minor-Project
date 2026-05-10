import { cn } from '../lib/utils';

export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-[var(--pf-shadow)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--pf-border-strong)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
