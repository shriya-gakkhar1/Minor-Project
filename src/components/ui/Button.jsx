import clsx from "clsx";

export function Button({ children, className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-mint/60 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-mint text-ink hover:bg-teal-300",
        variant === "secondary" &&
          "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
        variant === "ghost" && "text-slate-300 hover:bg-white/10 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
