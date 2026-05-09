import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ClipboardCheck,
  DatabaseBackup,
  FilePenLine,
  Gauge,
  GraduationCap,
  LineChart,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
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
import AiReportModal from '../components/AiReportModal';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import PageContainer from '../components/PageContainer';
import { statusTone } from '../lib/utils';
import { getWorkflowTransitions } from '../services/workflowService';
import { usePlacementStore } from '../store/usePlacementStore';

const WORKFLOW_STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
const CHART_COLORS = ['#0f766e', '#0f5c8e', '#14b8a6', '#f59e0b', '#e11d48', '#4f46e5'];

function panelClass(extra = '') {
  return `rounded-lg border border-slate-200 bg-white/92 shadow-sm ${extra}`;
}

function toneClasses(tone) {
  if (tone === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (tone === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (tone === 'info') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (tone === 'danger') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function MiniMetric({ label, value, note, icon, tone = 'teal' }) {
  const toneMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <div className={panelClass('p-4')}>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase text-slate-500'>{label}</p>
          <p className='mt-2 text-2xl font-semibold text-slate-950'>{value}</p>
          {note ? <p className='mt-1 text-xs text-slate-500'>{note}</p> : null}
        </div>
        <div className={`rounded-lg border p-2 ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={panelClass(`p-5 ${className}`)}>
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-slate-950'>{title}</h2>
          {subtitle ? <p className='mt-1 text-sm text-slate-500'>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SliderControl({ label, value, min, max, step = 1, suffix = '', onChange }) {
  return (
    <label className='block'>
      <div className='mb-2 flex items-center justify-between gap-3 text-sm'>
        <span className='font-medium text-slate-700'>{label}</span>
        <span className='rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700'>
          {value}{suffix}
        </span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className='w-full accent-teal-700'
      />
    </label>
  );
}

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
  const [scenario, setScenario] = useState({
    trainingLift: 18,
    interviewCapacity: 8,
    offerRate: 34,
  });

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
        latestRole: latest?.role || 'Not mapped',
        latestStatus: latest?.status || row.status || 'Unassigned',
      };
    });
  }, [studentPlacementRows, latestApplicationByStudent]);

  const selectedCount = useMemo(
    () => applicationViews.filter((application) => application.status === 'Selected').length,
    [applicationViews],
  );

  const interviewQueue = useMemo(
    () => applicationViews.filter((application) => ['Shortlisted', 'Interview'].includes(application.status)).length,
    [applicationViews],
  );

  const activeDrives = useMemo(
    () => companies.filter((company) => !company.deadline || company.deadline >= todayIso).length,
    [companies, todayIso],
  );

  const averageEligibility = useMemo(() => {
    if (!companies.length) return 7.5;
    return companies.reduce((sum, company) => sum + Number(company.eligibility || 7), 0) / companies.length;
  }, [companies]);

  const riskStudents = useMemo(() => {
    return baseRows
      .map((student) => {
        const cgpaGap = Math.max(0, averageEligibility - Number(student.cgpa || 0));
        const noApplication = student.latestStatus === 'Unassigned';
        const rejected = student.latestStatus === 'Rejected';
        const score = Math.round((cgpaGap * 18) + (noApplication ? 32 : 0) + (rejected ? 24 : 0));
        return {
          ...student,
          riskScore: Math.min(100, score),
          blocker: noApplication ? 'No active application' : rejected ? 'Rejected in latest drive' : 'Eligibility gap',
        };
      })
      .filter((student) => student.riskScore > 20)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [averageEligibility, baseRows]);

  const companyMetrics = useMemo(() => {
    const companyMap = new Map(companies.map((company) => [company.id, company]));
    const metrics = {};

    applicationViews.forEach((application) => {
      const company = companyMap.get(application.companyId);
      const safeCompanyName = String(company?.name || 'Unassigned').trim() || 'Unassigned';
      if (!metrics[safeCompanyName]) {
        metrics[safeCompanyName] = {
          id: company?.id || safeCompanyName,
          name: safeCompanyName,
          role: company?.role || 'Role not mapped',
          package: company?.package || 0,
          applicants: 0,
          selected: 0,
          interview: 0,
          rejected: 0,
          applications: [],
        };
      }

      metrics[safeCompanyName].applicants += 1;
      if (application.status === 'Selected') metrics[safeCompanyName].selected += 1;
      if (['Shortlisted', 'Interview'].includes(application.status)) metrics[safeCompanyName].interview += 1;
      if (application.status === 'Rejected') metrics[safeCompanyName].rejected += 1;
      metrics[safeCompanyName].applications.push(application);
    });

    return Object.values(metrics)
      .map((item) => ({
        ...item,
        conversionRate: item.applicants ? Number(((item.selected / item.applicants) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.applicants - a.applicants);
  }, [applicationViews, companies]);

  const activeCompanyData = useMemo(
    () => companyMetrics.find((company) => company.name === activeCompany) || companyMetrics[0] || null,
    [activeCompany, companyMetrics],
  );

  const branchReadiness = useMemo(() => {
    const branchMap = {};
    baseRows.forEach((student) => {
      const branch = student.branch || 'Other';
      if (!branchMap[branch]) branchMap[branch] = { branch, students: 0, ready: 0, selected: 0 };
      branchMap[branch].students += 1;
      if (Number(student.cgpa || 0) >= averageEligibility) branchMap[branch].ready += 1;
      if (student.latestStatus === 'Selected') branchMap[branch].selected += 1;
    });

    return Object.values(branchMap).map((item) => ({
      ...item,
      readiness: item.students ? Math.round((item.ready / item.students) * 100) : 0,
    }));
  }, [averageEligibility, baseRows]);

  const workflowCounts = useMemo(
    () =>
      WORKFLOW_STAGES.map((stage) => ({
        stage,
        count: applicationViews.filter((application) => application.status === stage).length,
      })),
    [applicationViews],
  );

  const filteredStudents = useMemo(() => {
    return baseRows.filter((row) => {
      const companyMatch = selectedCompanyFilter === 'all' || row.company === selectedCompanyFilter;
      const statusMatch = statusFilter === 'all' || row.latestStatus === statusFilter;
      const searchMatch = [row.name, row.branch, row.company, row.latestRole]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      return companyMatch && statusMatch && searchMatch;
    });
  }, [baseRows, search, selectedCompanyFilter, statusFilter]);

  const scenarioOutput = useMemo(() => {
    const recoverableRisk = Math.ceil(riskStudents.length * (scenario.trainingLift / 100));
    const interviewWins = Math.round(Math.min(interviewQueue, scenario.interviewCapacity) * (scenario.offerRate / 100));
    const projectedSelections = selectedCount + recoverableRisk + interviewWins;
    const projectedRate = students.length ? Math.min(100, Math.round((projectedSelections / students.length) * 100)) : 0;
    const currentRate = students.length ? Math.round((selectedCount / students.length) * 100) : 0;

    return {
      recoverableRisk,
      interviewWins,
      projectedSelections,
      projectedRate,
      currentRate,
      lift: Math.max(0, projectedRate - currentRate),
    };
  }, [interviewQueue, riskStudents.length, scenario, selectedCount, students.length]);

  const tableColumns = [
    { key: 'name', label: 'Student' },
    { key: 'branch', label: 'Branch' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'company', label: 'Company' },
    {
      key: 'latestStatus',
      label: 'Status',
      render: (value, row) => {
        if (!row.latestApplicationId) return <span className='text-xs text-slate-500'>No application</span>;
        const options = [value, ...getWorkflowTransitions(value)].filter((status, index, list) => list.indexOf(status) === index);

        return (
          <select
            value={value}
            onChange={(event) => updateStatus(row.latestApplicationId, event.target.value)}
            className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-200 ${toneClasses(statusTone(value))}`}
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
    pendingInterviews: interviewQueue,
    activeDrives,
    newApplicationsToday: applicationViews.filter((application) => String(application.createdAt).startsWith(todayIso)).length,
    bestCompany: companyMetrics[0]?.name || 'N/A',
    selectionRate: students.length ? ((selectedCount / students.length) * 100).toFixed(1) : '0.0',
    companyLines: companyMetrics.map(
      (company) => `- ${company.name}: ${company.selected}/${company.applicants} selected (${company.conversionRate}%)`,
    ),
  };

  const advanceNextCandidate = (targetStatus) => {
    if (!activeCompanyData) return;
    const nextCandidate = activeCompanyData.applications.find((application) => {
      const transitions = getWorkflowTransitions(application.status);
      return transitions.includes(targetStatus);
    });

    if (nextCandidate) updateStatus(nextCandidate.id, targetStatus);
  };

  return (
    <PageContainer className='space-y-5'>
      <section className='overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm'>
        <div className='grid gap-5 p-5 lg:grid-cols-[1.35fr_0.65fr] lg:p-6'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-md border border-teal-400/30 bg-teal-400/10 px-2 py-1 text-xs font-semibold text-teal-100'>
                <Sparkles className='h-3.5 w-3.5' />
                Placify AI Decision OS
              </span>
              <span className='rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300'>
                Excel/CSV to insight-ready dashboard
              </span>
            </div>
            <h1 className='mt-4 max-w-3xl text-3xl font-semibold text-white md:text-4xl'>
              Turn raw placement sheets into actions TPO teams can take today.
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-300'>
              Import data, clean the pipeline, inspect chart-driven patterns, update workflow status, and simulate how training,
              interview capacity, and offer rates change campus outcomes.
            </p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <Button onClick={() => navigate('/migration')} className='border-teal-500 bg-teal-500 text-slate-950 hover:bg-teal-400'>
                <DatabaseBackup className='h-4 w-4' />
                Import Sheets
              </Button>
              <Button variant='secondary' onClick={() => navigate('/campus-predictor')} className='border-white/15 bg-white/10 text-white hover:bg-white/15'>
                <BrainCircuit className='h-4 w-4' />
                Run Predictor
              </Button>
              <Button variant='secondary' onClick={() => setReportOpen(true)} className='border-white/15 bg-white/10 text-white hover:bg-white/15'>
                <FilePenLine className='h-4 w-4' />
                Generate Report
              </Button>
            </div>
          </div>

          <div className='rounded-lg border border-white/10 bg-white/5 p-4'>
            <p className='text-xs font-semibold uppercase text-slate-400'>Live campus pulse</p>
            <div className='mt-4 grid grid-cols-2 gap-3'>
              <div>
                <p className='text-2xl font-semibold'>{students.length}</p>
                <p className='text-xs text-slate-400'>students</p>
              </div>
              <div>
                <p className='text-2xl font-semibold'>{activeDrives}</p>
                <p className='text-xs text-slate-400'>active drives</p>
              </div>
              <div>
                <p className='text-2xl font-semibold'>{selectedCount}</p>
                <p className='text-xs text-slate-400'>selected</p>
              </div>
              <div>
                <p className='text-2xl font-semibold'>{scenarioOutput.lift}%</p>
                <p className='text-xs text-slate-400'>scenario lift</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <MiniMetric
          label='Placement Rate'
          value={`${scenarioOutput.currentRate}%`}
          note={`${selectedCount} selected students`}
          icon={<Target className='h-4 w-4' />}
        />
        <MiniMetric
          label='Interview Queue'
          value={interviewQueue}
          note='Shortlisted and interview stage'
          icon={<ClipboardCheck className='h-4 w-4' />}
          tone='sky'
        />
        <MiniMetric
          label='At-Risk Students'
          value={riskStudents.length}
          note='Needs TPO intervention'
          icon={<AlertTriangle className='h-4 w-4' />}
          tone='amber'
        />
        <MiniMetric
          label='Active Companies'
          value={activeDrives}
          note='Open placement drives'
          icon={<BriefcaseBusiness className='h-4 w-4' />}
          tone='slate'
        />
      </div>

      <div className='grid gap-5 xl:grid-cols-[1.25fr_0.75fr]'>
        <DashboardPanel
          title='Interactive Placement Pipeline'
          subtitle='Click a company slice to filter the student table and drill into conversion.'
          action={
            selectedCompanyFilter !== 'all' ? (
              <button
                type='button'
                onClick={() => setSelectedCompanyFilter('all')}
                className='rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700'
              >
                Clear {selectedCompanyFilter}
              </button>
            ) : null
          }
        >
          <div className='grid min-h-[320px] gap-4 lg:grid-cols-[0.95fr_1.05fr]'>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={companyMetrics}
                  dataKey='applicants'
                  nameKey='name'
                  innerRadius={58}
                  outerRadius={105}
                  paddingAngle={3}
                  onClick={(entry) => {
                    setSelectedCompanyFilter(entry.name);
                    setActiveCompany(entry.name);
                  }}
                >
                  {companyMetrics.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={workflowCounts}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                <XAxis dataKey='stage' tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey='count' radius={[6, 6, 0, 0]} fill='#0f766e' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title='Scenario Simulator'
          subtitle='Model placement outcomes before changing real data.'
          action={<SlidersHorizontal className='h-5 w-5 text-teal-700' />}
        >
          <div className='space-y-5'>
            <SliderControl
              label='Training lift'
              value={scenario.trainingLift}
              min={0}
              max={60}
              suffix='%'
              onChange={(trainingLift) => setScenario((current) => ({ ...current, trainingLift }))}
            />
            <SliderControl
              label='Interview capacity'
              value={scenario.interviewCapacity}
              min={0}
              max={20}
              onChange={(interviewCapacity) => setScenario((current) => ({ ...current, interviewCapacity }))}
            />
            <SliderControl
              label='Expected offer rate'
              value={scenario.offerRate}
              min={5}
              max={90}
              suffix='%'
              onChange={(offerRate) => setScenario((current) => ({ ...current, offerRate }))}
            />

            <div className='grid grid-cols-3 gap-2'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs text-slate-500'>Recovered</p>
                <p className='mt-1 text-xl font-semibold text-slate-950'>{scenarioOutput.recoverableRisk}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs text-slate-500'>Offer wins</p>
                <p className='mt-1 text-xl font-semibold text-slate-950'>{scenarioOutput.interviewWins}</p>
              </div>
              <div className='rounded-lg border border-teal-200 bg-teal-50 p-3'>
                <p className='text-xs text-teal-700'>Projected</p>
                <p className='mt-1 text-xl font-semibold text-teal-900'>{scenarioOutput.projectedRate}%</p>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div className='grid gap-5 xl:grid-cols-[0.8fr_1.2fr]'>
        <DashboardPanel
          title='Company Drill-Down'
          subtitle='Use this panel during TPO reviews to update outcomes from the chart context.'
          action={<BarChart3 className='h-5 w-5 text-teal-700' />}
        >
          {companyMetrics.length ? (
            <>
              <div className='mb-4 flex flex-wrap gap-2'>
                {companyMetrics.map((company) => (
                  <button
                    key={company.name}
                    type='button'
                    onClick={() => {
                      setActiveCompany(company.name);
                      setSelectedCompanyFilter(company.name);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      activeCompanyData?.name === company.name
                        ? 'border-teal-200 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {company.name}
                  </button>
                ))}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                  <p className='text-xs text-slate-500'>Applicants</p>
                  <p className='mt-1 text-xl font-semibold text-slate-950'>{activeCompanyData?.applicants || 0}</p>
                </div>
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                  <p className='text-xs text-slate-500'>Conversion</p>
                  <p className='mt-1 text-xl font-semibold text-slate-950'>{activeCompanyData?.conversionRate || 0}%</p>
                </div>
              </div>

              <div className='mt-4 flex flex-wrap gap-2'>
                <Button variant='secondary' onClick={() => advanceNextCandidate('Shortlisted')}>
                  <ArrowUpRight className='h-4 w-4' />
                  Shortlist Next
                </Button>
                <Button variant='secondary' onClick={() => advanceNextCandidate('Interview')}>
                  <Users className='h-4 w-4' />
                  Move To Interview
                </Button>
                <Button onClick={() => advanceNextCandidate('Selected')}>
                  <UserCheck className='h-4 w-4' />
                  Mark Offer
                </Button>
              </div>
            </>
          ) : (
            <p className='text-sm text-slate-500'>Add drives and applications to unlock company analytics.</p>
          )}
        </DashboardPanel>

        <DashboardPanel
          title='Branch Readiness'
          subtitle='Eligibility coverage and selected outcomes by branch.'
          action={<Gauge className='h-5 w-5 text-teal-700' />}
        >
          <ResponsiveContainer width='100%' height={260}>
            <BarChart data={branchReadiness}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis dataKey='branch' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey='readiness' name='Readiness %' radius={[6, 6, 0, 0]} fill='#0f5c8e' />
              <Bar dataKey='selected' name='Selected' radius={[6, 6, 0, 0]} fill='#14b8a6' />
            </BarChart>
          </ResponsiveContainer>
        </DashboardPanel>
      </div>

      <div className='grid gap-5 xl:grid-cols-[1.15fr_0.85fr]'>
        <DashboardPanel
          title='Student Operations Table'
          subtitle='Filter, search, and update workflow status without leaving the dashboard.'
          action={
            <div className='flex flex-wrap gap-2'>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search student, branch, company'
                className='h-9 w-56 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className='h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
              >
                <option value='all'>All status</option>
                {WORKFLOW_STAGES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <DataTable columns={tableColumns} rows={filteredStudents} emptyText='No students match this decision view.' className='rounded-lg' />
        </DashboardPanel>

        <DashboardPanel
          title='At-Risk Intervention Queue'
          subtitle='Students Placify AI would prioritize for mentoring, resume work, or eligibility planning.'
          action={<AlertTriangle className='h-5 w-5 text-amber-600' />}
        >
          <div className='space-y-3'>
            {riskStudents.length ? (
              riskStudents.map((student) => (
                <div key={student.id} className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-slate-950'>{student.name}</p>
                      <p className='mt-1 text-xs text-slate-500'>
                        {student.branch} | CGPA {student.cgpa} | {student.blocker}
                      </p>
                    </div>
                    <span className='rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'>
                      {student.riskScore}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800'>
                No high-risk students in the current dataset.
              </div>
            )}
            <Button variant='secondary' onClick={() => navigate('/student-predictor')} className='w-full'>
              <GraduationCap className='h-4 w-4' />
              Open Student Predictor
            </Button>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title='Data Pipeline Story'
        subtitle='A college evaluator can understand the technical pipeline in one glance.'
        action={<LineChart className='h-5 w-5 text-teal-700' />}
      >
        <div className='grid gap-3 md:grid-cols-5'>
          {['Collect', 'Clean', 'Transform', 'Analyze', 'Act'].map((step, index) => (
            <div key={step} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs font-semibold text-teal-700'>0{index + 1}</p>
              <p className='mt-2 font-semibold text-slate-950'>{step}</p>
              <p className='mt-1 text-xs leading-5 text-slate-500'>
                {index === 0 && 'Excel, CSV, Google Sheet, or manual entries.'}
                {index === 1 && 'Normalize branches, CGPA, status, and company fields.'}
                {index === 2 && 'Create placement-ready metrics and workflow rows.'}
                {index === 3 && 'Run dashboards, predictors, and scenario logic.'}
                {index === 4 && 'Update status, export reports, and plan interventions.'}
              </p>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <AiReportModal open={reportOpen} onClose={() => setReportOpen(false)} summary={reportSummary} />
    </PageContainer>
  );
}
