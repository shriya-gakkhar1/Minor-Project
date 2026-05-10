import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import { buildOperationalIntelligence } from '../services/placementIntelligenceService';
import { usePlacementStore } from '../store/usePlacementStore';

function statusClasses(value) {
  const key = String(value || '').toLowerCase();
  if (key.includes('selected') || key.includes('placed')) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/20';
  if (key.includes('short') || key.includes('interview')) return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-400/10 dark:text-sky-200 dark:border-sky-400/20';
  if (key.includes('reject')) return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:border-rose-400/20';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
}

function riskClasses(value) {
  if (value === 'At Risk') return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:border-rose-400/20';
  if (value === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:border-emerald-400/20';
}

export default function StudentsPage() {
  const students = usePlacementStore((state) => state.studentPlacementRows);
  const companies = usePlacementStore((state) => state.companies);
  const [query, setQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const intelligence = useMemo(() => buildOperationalIntelligence({ students, companies }), [companies, students]);
  const riskByName = useMemo(() => {
    return new Map(intelligence.riskRows.map((student) => [student.name, student]));
  }, [intelligence.riskRows]);

  const branches = useMemo(() => {
    return Array.from(new Set(students.map((student) => student.branch).filter(Boolean))).sort();
  }, [students]);

  const filteredRows = useMemo(() => {
    return students
      .map((student) => {
        const risk = riskByName.get(student.name);
        return {
          ...student,
          riskCategory: risk?.risk.category || 'Medium',
          readiness: Math.max(0, Math.min(100, Math.round((Number(student.cgpa || 0) * 8) + (Number(student.resumeScore || student.atsScore || 0) * 0.2)))),
          blocker: risk?.eligibility.blockers[0] || (risk?.resumeUploaded ? 'No major blocker' : 'Resume missing'),
        };
      })
      .filter((student) => {
        const haystack = `${student.name} ${student.email || ''} ${student.branch || ''} ${student.company || ''}`.toLowerCase();
        const queryMatch = !query || haystack.includes(query.toLowerCase());
        const branchMatch = branchFilter === 'all' || student.branch === branchFilter;
        const statusMatch = statusFilter === 'all' || String(student.status || '').toLowerCase() === statusFilter;
        return queryMatch && branchMatch && statusMatch;
      });
  }, [branchFilter, query, riskByName, statusFilter, students]);

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'branch', label: 'Branch' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'attendance', label: 'Attendance', render: (value) => `${value || 0}%` },
    {
      key: 'readiness',
      label: 'Readiness',
      render: (value) => (
        <div className='min-w-28'>
          <div className='mb-1 flex justify-between text-xs text-[var(--pf-muted)]'>
            <span>Score</span>
            <span>{value}%</span>
          </div>
          <div className='h-1.5 rounded-full bg-slate-200 dark:bg-slate-800'>
            <div className='h-1.5 rounded-full bg-teal-300' style={{ width: `${value}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClasses(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'riskCategory',
      label: 'Risk',
      render: (value) => (
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${riskClasses(value)}`}>
          {value}
        </span>
      ),
    },
    { key: 'blocker', label: 'Main Blocker' },
  ];

  return (
    <PageContainer className='space-y-5'>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[var(--pf-muted)]'>Students</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-[var(--pf-text)]'>Student readiness table</h1>
          <p className='mt-2 text-sm text-[var(--pf-muted)]'>Search students, filter branches, and see the main reason someone may need help.</p>
        </div>
        <div className='rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm text-[var(--pf-text)] shadow-[var(--pf-shadow)]'>
          {filteredRows.length} of {students.length} students
        </div>
      </section>

      <section className='grid gap-3 rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-[var(--pf-shadow)] md:grid-cols-3'>
        <Input placeholder='Search student, branch, company' value={query} onChange={(event) => setQuery(event.target.value)} />

        <select
          value={branchFilter}
          onChange={(event) => setBranchFilter(event.target.value)}
          className='h-10 rounded-xl border border-[var(--pf-border)] bg-white/70 px-3 text-sm text-[var(--pf-text)] outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20 dark:bg-slate-950/70'
        >
          <option value='all'>All branches</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className='h-10 rounded-xl border border-[var(--pf-border)] bg-white/70 px-3 text-sm text-[var(--pf-text)] outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20 dark:bg-slate-950/70'
        >
          <option value='all'>All statuses</option>
          <option value='applied'>Applied</option>
          <option value='shortlisted'>Shortlisted</option>
          <option value='interview'>Interview</option>
          <option value='selected'>Selected</option>
          <option value='rejected'>Rejected</option>
        </select>
      </section>

      <DataTable columns={columns} rows={filteredRows} emptyText='No students match current filters.' />
    </PageContainer>
  );
}
