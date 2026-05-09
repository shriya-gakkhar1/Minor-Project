import { useMemo } from 'react';

export default function FilterBar({ data, selectedCompany, onCompanyChange, dateRange, onDateRangeChange }) {
  const companies = useMemo(() => {
    const set = new Set(data.map(d => d.company).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Company filter */}
      <div className="flex items-center gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-3 pr-1 py-1 shadow-sm transition-all focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent-glow)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
          <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87"/>
        </svg>
        <div className="h-4 w-px bg-[var(--color-border)]"></div>
        <select
          value={selectedCompany}
          onChange={e => onCompanyChange(e.target.value)}
          className="bg-transparent border-none text-[13px] font-medium text-[var(--color-text)] focus:outline-none cursor-pointer py-1 pr-6"
        >
          {companies.map(c => (
            <option key={c} value={c} className="bg-[var(--color-surface)] text-[var(--color-text)]">
              {c === 'All' ? 'All Companies' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Group */}
      <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm transition-all focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent-glow)]">
        <label className="flex items-center gap-2.5 pl-3 pr-2 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div className="h-4 w-px bg-[var(--color-border)]"></div>
          <input
            type="date"
            value={dateRange.from}
            onChange={e => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="bg-transparent text-[13px] text-[var(--color-text-secondary)] focus:text-[var(--color-text)] focus:outline-none w-[110px]"
            style={{ colorScheme: 'dark' }}
          />
        </label>
        <span className="text-[12px] text-[var(--color-text-muted)] font-medium px-1">—</span>
        <label className="px-2 py-2">
          <input
            type="date"
            value={dateRange.to}
            onChange={e => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="bg-transparent text-[13px] text-[var(--color-text-secondary)] focus:text-[var(--color-text)] focus:outline-none w-[110px]"
            style={{ colorScheme: 'dark' }}
          />
        </label>
      </div>

      {/* Reset */}
      {(selectedCompany !== 'All' || dateRange.from || dateRange.to) && (
        <button
          onClick={() => { onCompanyChange('All'); onDateRangeChange({ from: '', to: '' }); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] font-medium cursor-pointer transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Reset
        </button>
      )}
    </div>
  );
}
