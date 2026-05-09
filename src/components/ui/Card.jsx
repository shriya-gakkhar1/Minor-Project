import clsx from "clsx";

export function Card({ className, children }) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-white/10 bg-white/[0.045] shadow-glow backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, eyebrow, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mint">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-base font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
