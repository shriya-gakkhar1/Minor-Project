import { lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, GraduationCap, UserCheck } from 'lucide-react';
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

  const selectedCount = useMemo(
    () => applicationViews.filter((application) => application.status === 'Selected').length,
    [applicationViews],
  );

  const activeDrives = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return companies.filter((company) => !company.deadline || company.deadline >= today).length;
  }, [companies]);

  const placementsByCompany = useMemo(() => {
    const counts = studentPlacementRows.reduce((acc, student) => {
      if (!student.company || student.company === 'Unassigned') return acc;
      acc[student.company] = (acc[student.company] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [studentPlacementRows]);

  const companyBarData = useMemo(() => {
    return companies.map((company) => ({
      name: company.name,
      selected: applicationViews.filter(
        (application) => application.companyId === company.id && application.status === 'Selected',
      ).length,
    }));
  }, [companies, applicationViews]);

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

  const filteredStudents = useMemo(() => {
    const rows = selectedCompanyFilter === 'all'
      ? studentPlacementRows
      : studentPlacementRows.filter((student) => student.company === selectedCompanyFilter);

    return rows.map((row) => ({
      ...row,
      latestApplicationId: latestApplicationByStudent.get(row.id)?.id || null,
    }));
  }, [selectedCompanyFilter, studentPlacementRows, latestApplicationByStudent]);

  const workflowCounts = useMemo(
    () =>
      WORKFLOW_STAGES.map((stage) => ({
        stage,
        count: applicationViews.filter((application) => application.status === stage).length,
      })),
    [applicationViews],
  );

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'company', label: 'Company' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        if (!row.latestApplicationId) {
          return <span className='text-xs text-slate-500'>No application</span>;
        }

        const options = [value, ...getWorkflowTransitions(value)].filter(
          (status, index, array) => array.indexOf(status) === index,
        );

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

  if (!students.length && !companies.length) {
    return (
      <PageContainer className='space-y-5'>
        <Skeleton className='h-16 w-full' />
        <div className='grid gap-4 sm:grid-cols-3'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
        <Skeleton className='h-[320px] w-full' />
      </PageContainer>
    );
  }

  if (!students.length) {
    return (
      <PageContainer>
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center'>
          <h3 className='text-lg font-semibold text-slate-900'>No student data yet</h3>
          <p className='mt-2 text-sm text-slate-500'>Start from migration to import CSV or Google Sheets data.</p>
          <Button className='mt-4' onClick={() => navigate('/migration')}>
            Open Migration
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Placement Overview'
        subtitle='Workflow-driven placement control center'
        action={
          <div className='flex items-center gap-2'>
            <select
              value={selectedCompanyFilter}
              onChange={(event) => setSelectedCompanyFilter(event.target.value)}
              className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100'
            >
              <option value='all'>All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
            <Button onClick={() => navigate('/add-company')}>Add Company</Button>
          </div>
        }
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <StatCard label='Total Students' value={students.length} icon={<GraduationCap className='h-5 w-5' />} />
        <StatCard label='Selected Students' value={selectedCount} icon={<UserCheck className='h-5 w-5' />} />
        <StatCard label='Active Drives' value={activeDrives} icon={<BriefcaseBusiness className='h-5 w-5' />} />
      </div>

      <Suspense fallback={<Skeleton className='h-[320px] w-full' />}>
        <AdminInsightsCharts
          placementsByCompany={placementsByCompany}
          companyBarData={companyBarData}
          selectedCompanyFilter={selectedCompanyFilter}
          setSelectedCompanyFilter={setSelectedCompanyFilter}
        />
      </Suspense>

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

      <div>
        <SectionHeader title='Students' subtitle='Filtered student list with admin-safe workflow transitions' />
        <DataTable columns={tableColumns} rows={filteredStudents} emptyText='No students in this filter.' />
      </div>
    </PageContainer>
  );
}
