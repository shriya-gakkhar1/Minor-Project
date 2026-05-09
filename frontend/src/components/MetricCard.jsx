export default function MetricCard({ label, value, icon, trend, color, gradient }) {
  const gradientBg = gradient || `linear-gradient(135deg, ${color || '#6366f1'}, ${color || '#6366f1'}dd)`;

  return (
    <div className="group relative rounded-2xl overflow-hidden card-hover"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

      {/* Subtle top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: gradientBg }}></div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ background: gradientBg, boxShadow: `0 4px 14px ${color || '#6366f1'}33` }}>
            {icon}
          </div>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-full ${
              trend >= 0
                ? 'text-[var(--color-success)] bg-[var(--color-success-surface)]'
                : 'text-[var(--color-danger)] bg-[var(--color-danger-surface)]'
            }`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                style={{ transform: trend >= 0 ? 'none' : 'rotate(180deg)' }}>
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-[26px] font-bold text-[var(--color-text)] tracking-tight leading-none mb-1">{value}</div>
        <div className="text-[13px] text-[var(--color-text-muted)] font-medium">{label}</div>
      </div>
    </div>
  );
}
