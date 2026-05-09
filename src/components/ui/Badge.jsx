import clsx from "clsx";

const variants = {
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  neutral: "border-slate-400/20 bg-slate-400/10 text-slate-200",
};

export function Badge({ children, variant = "neutral" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}
