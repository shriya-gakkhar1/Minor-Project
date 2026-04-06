import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { usePlacementStore } from '../store/usePlacementStore';

const PIE_COLORS = ['#0f766e', '#0f5c8e', '#f59e0b', '#e11d48', '#14b8a6'];

function normalizeStatus(value) {
  const key = String(value || '').toLowerCase();
  if (key.includes('select')) return 'Selected';
  if (key.includes('shortlist') || key.includes('interview')) return 'Interview';
  if (key.includes('reject')) return 'Rejected';
  if (key.includes('apply')) return 'Applied';
  return 'Unassigned';
}

export default function InsightsLabPage() {
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applicationViews = usePlacementStore((state) => state.applicationViews);
  const studentPlacementRows = usePlacementStore((state) => state.studentPlacementRows);

  const statusData = useMemo(() => {
    const map = new Map();
    applicationViews.forEach((app) => {
      const status = normalizeStatus(app.status);
      map.set(status, (map.get(status) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [applicationViews]);

  const branchData = useMemo(() => {
    const branchMap = new Map();

    studentPlacementRows.forEach((row) => {
      if (!branchMap.has(row.branch)) {
        branchMap.set(row.branch, { branch: row.branch, total: 0, selected: 0 });
      }

      const target = branchMap.get(row.branch);
      target.total += 1;
      if (normalizeStatus(row.status) === 'Selected') target.selected += 1;
    });

    return Array.from(branchMap.values())
      .map((row) => ({
        ...row,
        placementRate: row.total ? Number(((row.selected / row.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.placementRate - a.placementRate);
  }, [studentPlacementRows]);

  const companyData = useMemo(() => {
    const map = new Map();

    applicationViews.forEach((row) => {
      const key = row.companyName || 'Unknown Company';
      if (!map.has(key)) {
        map.set(key, { company: key, applicants: 0, selected: 0 });
      }

      const target = map.get(key);
      target.applicants += 1;
      if (normalizeStatus(row.status) === 'Selected') target.selected += 1;
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        conversion: item.applicants ? Number(((item.selected / item.applicants) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.selected - a.selected)
      .slice(0, 8);
  }, [applicationViews]);

  const selectedCount = statusData.find((row) => row.name === 'Selected')?.value || 0;
  const placementRate = students.length ? Number(((selectedCount / students.length) * 100).toFixed(1)) : 0;
  const hasStatusData = statusData.length > 0;
  const hasBranchData = branchData.length > 0;
  const hasCompanyData = companyData.length > 0;

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Insights Lab'
        subtitle='Unified analytics surface for outcome intelligence, trend spotting, and weekly decision support.'
      />

      <div className='pf-stagger grid gap-4 md:grid-cols-3'>
        <Card className='border-teal-100 bg-gradient-to-br from-teal-50 to-white'>
          <p className='text-sm text-slate-500'>Students</p>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{students.length}</p>
        </Card>
        <Card>
          <p className='text-sm text-slate-500'>Companies</p>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{companies.length}</p>
        </Card>
        <Card className='border-sky-100 bg-gradient-to-br from-sky-50 to-white'>
          <p className='text-sm text-slate-500'>Placement Rate</p>
          <p className='mt-2 text-3xl font-bold text-teal-700'>{placementRate}%</p>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <SectionHeader title='Status Distribution' subtitle='Application pipeline share by stage.' />
          <div className='h-[280px]'>
            {hasStatusData ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={statusData} dataKey='value' nameKey='name' outerRadius={100} innerRadius={50}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-slate-500'>No status data available yet.</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title='Branch Placement Rate' subtitle='Selected share by branch.' />
          <div className='h-[280px]'>
            {hasBranchData ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='branch' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='placementRate' fill='#0f5c8e' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-slate-500'>No branch trend data available yet.</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title='Top Companies by Selection' subtitle='Highest selected counts in current workflow data.' />
        <div className='h-[300px]'>
          {hasCompanyData ? (
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='company' interval={0} angle={-10} textAnchor='end' height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey='selected' fill='#0f766e' radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-slate-500'>No company selection data available yet.</div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
