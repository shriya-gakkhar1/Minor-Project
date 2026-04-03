import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, ClipboardCheck, Rocket, UserCheck } from 'lucide-react';
import AiReportModal from '../components/AiReportModal';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import Skeleton from '../components/ui/Skeleton';
import { statusTone } from '../lib/utils';
import { getWorkflowTransitions } from '../services/workflowService';
import { usePlacementStore } from '../store/usePlacementStore';

const AdminInsightsCharts = lazy(() => import('../components/charts/AdminInsightsCharts'));

function toneClasses(tone) {
  if (tone === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (tone === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (tone === 'info') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (tone === 'danger') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

const WORKFLOW_STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const studentPlacementRows = usePlacementStore((state) => state.studentPlacementRows);
  const applicationViews = usePlacementStore((state) => state.applicationViews);
  const selectedCompanyFilter = usePlacementStore((state) => state.selectedCompanyFilter);
  const setSelectedCompanyFilter = usePlacementStore((state) => state.setSelectedCompanyFilter);
  const updateStatus = usePlacementStore((state) => state.updateApplicationStatus);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeCompany, setActiveCompany] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  const latestApplicationByStudent = useMemo(() => {
    const latestMap = new Map();
    applicationViews.forEach((application) => {
      const previous = latestMap.get(application.studentId);
      if (!previous || new Date(previous.createdAt).getTime() < new Date(application.createdAt).getTime()) {
        latestMap.set(application.studentId, application);
      }
    });
    return latestMap;
  }, [applicationViews]);

  const baseRows = useMemo(() => {
    return studentPlacementRows.map((row) => {
      const latest = latestApplicationByStudent.get(row.id);
      return {
        ...row,
        latestApplicationId: latest?.id || null,
        latestRole: latest?.role || 'N/A',
        latestStatus: latest?.status || row.status || 'Unassigned',
      };
    });
  }, [studentPlacementRows, latestApplicationByStudent]);

  const filteredStudents = useMemo(() => {
    return baseRows.filter((row) => {
      const companyMatch = selectedCompanyFilter === 'all' || row.company === selectedCompanyFilter;
      const statusMatch = statusFilter === 'all' || row.latestStatus === statusFilter;
      const searchMatch = row.name.toLowerCase().includes(search.toLowerCase());
      return companyMatch && statusMatch && searchMatch;
    });
  }, [baseRows, search, selectedCompanyFilter, statusFilter]);

  const newApplicationsToday = useMemo(
    () => applicationViews.filter((application) => String(application.createdAt).startsWith(todayIso)).length,
    [applicationViews, todayIso],
  );

  const pendingInterviews = useMemo(
    () => applicationViews.filter((application) => ['Shortlisted', 'Interview'].includes(application.status)).length,
    [applicationViews],
  );

  const selectedCount = useMemo(
    () => applicationViews.filter((application) => application.status === 'Selected').length,
    [applicationViews],
  );

  const activeDrives = useMemo(() => {
    return companies.filter((company) => !company.deadline || company.deadline >= todayIso).length;
  }, [companies, todayIso]);

  const companyMetrics = useMemo(() => {
    const companyMap = new Map(companies.map((company) => [company.id, company]));
    const metrics = {};

    applicationViews.forEach((application) => {
      const company = companyMap.get(application.companyId);
      if (!company) return;
      if (!metrics[company.name]) {
        metrics[company.name] = {
          name: company.name,
          applicants: 0,
          selected: 0,
          students: [],
        };
      }

      metrics[company.name].applicants += 1;
      if (application.status === 'Selected') metrics[company.name].selected += 1;
      metrics[company.name].students.push({
        name: application.studentName,
        status: application.status,
        role: application.role,
      });
    });

    return Object.values(metrics)
      .map((item) => ({
        ...item,
        conversionRate: item.applicants ? ((item.selected / item.applicants) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.applicants - a.applicants);
  }, [applicationViews, companies]);

  const bestCompany = useMemo(() => {
    // Find best company excluding "Unassigned" or null company names
    const validCompanies = companyMetrics.filter(
      (company) => company.name && company.name.trim() !== '' && company.name !== 'Unassigned'
    );
    return validCompanies.length > 0 ? validCompanies[0].name : 'N/A';
  }, [companyMetrics]);
  const avgSelectionRate = applicationViews.length ? ((selectedCount / applicationViews.length) * 100).toFixed(1) : '0.0';

  const placementsByCompany = useMemo(() => {
    return companyMetrics
      .filter((company) => company.applicants > 0)
      .map((company) => ({ name: company.name, value: company.applicants }))
      .sort((a, b) => b.value - a.value);
  }, [companyMetrics]);

  const companyBarData = useMemo(() => {
    return companyMetrics
      .filter((company) => company.applicants > 0)
      .map((company) => ({ name: company.name, selected: company.selected }))
      .sort((a, b) => b.selected - a.selected);
  }, [companyMetrics]);

  const activeCompanyData = useMemo(
    () => companyMetrics.find((company) => company.name === activeCompany) || companyMetrics[0] || null,
    [activeCompany, companyMetrics],
  );

  const workflowCounts = useMemo(
    () =>
      WORKFLOW_STAGES.map((stage) => ({
        stage,
        count: applicationViews.filter((application) => application.status === stage).length,
      })),
    [applicationViews],
  );

  const tableColumns =
    selectedCompanyFilter === 'all'
      ? [
          { key: 'name', label: 'Name' },
          { key: 'cgpa', label: 'CGPA' },
          { key: 'company', label: 'Company' },
          {
            key: 'latestStatus',
            label: 'Status',
            render: (value, row) => {
              if (!row.latestApplicationId) return <span className='text-xs text-slate-500'>No application</span>;
              const options = [value, ...getWorkflowTransitions(value)].filter((s, i, arr) => arr.indexOf(s) === i);

              return (
                <select
                  value={value}
                  onChange={(event) => updateStatus(row.latestApplicationId, event.target.value)}
                  className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none ${toneClasses(statusTone(value))}`}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              );
            },
          },
        ]
      : [
          { key: 'name', label: 'Name' },
          { key: 'latestRole', label: 'Role' },
          {
            key: 'latestStatus',
            label: 'Status',
            render: (value, row) => {
              if (!row.latestApplicationId) return <span className='text-xs text-slate-500'>No application</span>;
              const options = [value, ...getWorkflowTransitions(value)].filter((s, i, arr) => arr.indexOf(s) === i);
              return (
                <select
                  value={value}
                  onChange={(event) => updateStatus(row.latestApplicationId, event.target.value)}
                  className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none ${toneClasses(statusTone(value))}`}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              );
            },
          },
        ];

  const reportSummary = {
    totalStudents: students.length,
    totalApplications: applicationViews.length,
    selectedCount,
    pendingInterviews,
    activeDrives,
    newApplicationsToday,
    bestCompany,
    selectionRate: avgSelectionRate,
    companyLines: companyMetrics.map(
      (company) => `- ${company.name}: ${company.selected}/${company.applicants} selected (${company.conversionRate}%)`,
    ),
  };

  if (!students.length && !companies.length) {
    return (
      <PageContainer className='space-y-5'>
        <Skeleton className='h-16 w-full' />
        <div className='grid gap-4 sm:grid-cols-4'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
        <Skeleton className='h-[320px] w-full' />
      </PageContainer>
    );
  }

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Placement Overview'
        subtitle='Action-driven control center for migration, workflow, and outcomes'
        action={
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='secondary' onClick={() => navigate('/migration')}>Import Data</Button>
            <Button variant='secondary' onClick={() => setReportOpen(true)}>Generate Report</Button>
            <Button onClick={() => navigate('/add-company')}>Add Company</Button>
          </div>
        }
      />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard label='New Applications Today' value={newApplicationsToday} icon={<Rocket className='h-5 w-5' />} />
        <StatCard label='Pending Interviews' value={pendingInterviews} icon={<ClipboardCheck className='h-5 w-5' />} />
        <StatCard label='Selected Count' value={selectedCount} icon={<UserCheck className='h-5 w-5' />} />
        <StatCard label='Active Drives' value={activeDrives} icon={<BriefcaseBusiness className='h-5 w-5' />} />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2'>
          <SectionHeader title='Smart Insights' subtitle='Real outcomes from live application data' />
          <div className='grid gap-3 md:grid-cols-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs uppercase tracking-wide text-slate-500'>Best Performing Company</p>
              <p className='mt-2 text-lg font-semibold text-slate-900'>{bestCompany}</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs uppercase tracking-wide text-slate-500'>Average Selection Rate</p>
              <p className='mt-2 text-lg font-semibold text-slate-900'>{avgSelectionRate}%</p>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <SectionHeader title='Quick Filters' subtitle='Admin search and filters' />
          <div className='space-y-2'>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search student'
              className='h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
            />
            <select
              value={selectedCompanyFilter}
              onChange={(event) => setSelectedCompanyFilter(event.target.value)}
              className='h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
            >
              <option value='all'>All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.name}>{company.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className='h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
            >
              <option value='all'>All Status</option>
              {WORKFLOW_STAGES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Suspense fallback={<Skeleton className='h-[320px] w-full' />}>
        <AdminInsightsCharts
          placementsByCompany={placementsByCompany}
          companyBarData={companyBarData}
          selectedCompanyFilter={selectedCompanyFilter}
          setSelectedCompanyFilter={setSelectedCompanyFilter}
        />
      </Suspense>

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2'>
          <SectionHeader
            title='Students'
            subtitle={selectedCompanyFilter === 'all' ? 'Global view with company and CGPA' : 'Company view with status and role'}
          />
          <DataTable columns={tableColumns} rows={filteredStudents} emptyText='No students in this filter.' />
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5'>
          <SectionHeader title='Company View' subtitle='Click a company to inspect conversion details' />
          <div className='mb-3 flex flex-wrap gap-2'>
            {companyMetrics.map((company) => (
              <button
                key={company.name}
                onClick={() => setActiveCompany(company.name)}
                className={`rounded-full border px-2 py-1 text-xs ${
                  activeCompanyData?.name === company.name
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {company.name}
              </button>
            ))}
          </div>

          {activeCompanyData ? (
            <div className='space-y-2'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Applicants: {activeCompanyData.applicants}</div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Selected: {activeCompanyData.selected}</div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Conversion: {activeCompanyData.conversionRate}%</div>
              <div className='max-h-40 space-y-1 overflow-auto rounded-xl border border-slate-200 p-2'>
                {activeCompanyData.students.map((student, index) => (
                  <p key={`${student.name}_${index}`} className='text-xs text-slate-600'>
                    {student.name} - {student.status}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className='text-sm text-slate-500'>No company analytics available.</p>
          )}
        </div>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-5'>
        <SectionHeader title='Workflow Visualization' subtitle='Applied -> Shortlisted -> Interview -> Selected / Rejected' />
        <div className='grid gap-3 md:grid-cols-5'>
          {workflowCounts.map((item) => (
            <div key={item.stage} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>{item.stage}</p>
              <p className='mt-2 text-xl font-semibold text-slate-900'>{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <AiReportModal open={reportOpen} onClose={() => setReportOpen(false)} summary={reportSummary} />
    </PageContainer>
  );
}
