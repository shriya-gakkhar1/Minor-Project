import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { statusTone } from '../lib/utils';
import { usePlacementStore } from '../store/usePlacementStore';

function toneClasses(tone) {
  if (tone === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (tone === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (tone === 'info') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (tone === 'danger') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function StudentsPage() {
  const students = usePlacementStore((state) => state.studentPlacementRows);
  const companies = usePlacementStore((state) => state.companies);
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(() => {
    return students.filter((student) => {
      const queryMatch = student.name.toLowerCase().includes(query.toLowerCase());
      const companyMatch = companyFilter === 'all' || student.company === companyFilter;
      const statusMatch = statusFilter === 'all' || student.status.toLowerCase() === statusFilter;
      return queryMatch && companyMatch && statusMatch;
    });
  }, [students, query, companyFilter, statusFilter]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'branch', label: 'Branch' },
    { key: 'company', label: 'Company' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${toneClasses(statusTone(value))}`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <PageContainer className='space-y-4'>
      <SectionHeader title='Student Data' subtitle='Search and filter students by company and status' />

      <div className='grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3'>
        <Input placeholder='Search by student name' value={query} onChange={(event) => setQuery(event.target.value)} />

        <select
          value={companyFilter}
          onChange={(event) => setCompanyFilter(event.target.value)}
          className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
        >
          <option value='all'>All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
        >
          <option value='all'>All Statuses</option>
          <option value='applied'>Applied</option>
          <option value='shortlisted'>Shortlisted</option>
          <option value='interview'>Interview</option>
          <option value='selected'>Selected</option>
          <option value='rejected'>Rejected</option>
        </select>
      </div>

      <DataTable columns={columns} rows={filteredRows} emptyText='No students match current filters.' />
    </PageContainer>
  );
}
