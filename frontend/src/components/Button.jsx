import { cn } from '../lib/utils';

export default function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600',
    secondary: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
