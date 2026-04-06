import { cn } from '../lib/utils';

export default function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const variantStyles = {
    primary: 'border border-teal-700 bg-[linear-gradient(135deg,#0f5c8e,#0f766e)] text-white shadow-sm hover:brightness-105',
    secondary: 'border border-slate-200 bg-white text-slate-800 hover:border-teal-200 hover:bg-teal-50',
    ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
