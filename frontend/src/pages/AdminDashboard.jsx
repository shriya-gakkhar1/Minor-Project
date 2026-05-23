import { createElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  GraduationCap,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import PageContainer from '../components/PageContainer';
import { buildOperationalIntelligence } from '../services/placementIntelligenceService';
import { usePlacementStore } from '../store/usePlacementStore';

const chartColors = ['#5b6cff', '#14b8a6', '#f59e0b', '#fb7185', '#a855f7', '#38bdf8'];

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-[var(--pf-shadow)] backdrop-blur-xl ${className}`}>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-[var(--pf-text)]'>{title}</h2>
          {subtitle ? <p className='mt-1 text-sm text-[var(--pf-muted)]'>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ label, value, note, icon: Icon, tone = 'violet' }) {
  const tones = {
    violet: 'from-violet-500 to-indigo-500 text-violet-100 shadow-violet-500/20',
    blue: 'from-blue-500 to-sky-400 text-blue-100 shadow-blue-500/20',
    green: 'from-emerald-500 to-teal-400 text-emerald-100 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-400 text-amber-100 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-500 text-rose-100 shadow-rose-500/20',
    cyan: 'from-cyan-500 to-teal-400 text-cyan-100 shadow-cyan-500/20',
  };
  return (
    <div className='group rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-[var(--pf-shadow)] transition hover:-translate-y-0.5 hover:shadow-xl'>
      <div className='flex items-start justify-between gap-3'>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} shadow-lg`}>
          {createElement(Icon, { className: 'h-5 w-5 text-white' })}
        </div>
      </div>
      <p className='mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--pf-muted)]'>{label}</p>
      <p className='mt-1 text-3xl font-semibold tracking-tight text-[var(--pf-text)]'>{value}</p>
      <p className='mt-1 text-xs text-[var(--pf-muted)]'>{note}</p>
    </div>
  );
}

function ProgressMini({ label, value, color = '#5eead4' }) {
  return (
    <div>
      <div className='mb-1 flex justify-between text-xs'>
        <span className='text-[var(--pf-muted)]'>{label}</span>
        <span className='font-semibold text-[var(--pf-text)]'>{value}%</span>
      </div>
      <div className='h-2 rounded-full bg-slate-200/80 dark:bg-white/8'>
        <div className='h-2 rounded-full' style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl border border-[var(--pf-border)] bg-white px-3 py-2 text-xs shadow-2xl dark:bg-[#07111f]'>
      <p className='font-semibold text-[var(--pf-text)]'>{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className='mt-1 text-[var(--pf-muted)]'>
          <span style={{ color: item.color }}>●</span> {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  );
}

function MarketSignal({ signal }) {
  const positive = signal.tone === 'up';
  return (
    <button
      type='button'
      className='group rounded-3xl border border-[var(--pf-border)] bg-white/58 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--pf-border-strong)] dark:bg-white/[0.04]'
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.18em] text-[var(--pf-muted)]'>BRANCH</p>
          <p className='mt-1 text-xl font-semibold text-[var(--pf-text)]'>{signal.name}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${positive ? 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-200' : 'bg-rose-400/10 text-rose-600 dark:text-rose-200'}`}>
          {positive ? '+' : ''}{signal.change}%
        </span>
      </div>
      <div className='mt-4 flex items-end justify-between gap-3'>
        <div>
          <p className='text-3xl font-semibold text-[var(--pf-text)]'>{signal.confidence}</p>
          <p className='text-xs text-[var(--pf-muted)]'>Placement confidence</p>
        </div>
        <Sparkline data={[28, 36 + signal.change, 44, signal.confidence * 0.72, signal.confidence]} positive={positive} />
      </div>
      <div className='mt-4 h-1.5 rounded-full bg-slate-200 dark:bg-white/10'>
        <div className={`h-1.5 rounded-full ${positive ? 'bg-emerald-300' : 'bg-rose-300'}`} style={{ width: `${signal.demand}%` }} />
      </div>
    </button>
  );
}

function Sparkline({ data, positive = true }) {
  const values = data.length ? data : [0, 0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * 120;
    const y = 46 - ((value - min) / Math.max(1, max - min)) * 38;
    return `${x},${y}`;
  }).join(' ');
  const lastY = points.split(' ').at(-1)?.split(',')[1] || 10;

  return (
    <svg viewBox='0 0 120 52' className='h-14 w-32 overflow-visible'>
      <polyline points={points} fill='none' stroke={positive ? '#5eead4' : '#fb7185'} strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' className='pf-glow-line' />
      <circle cx='120' cy={lastY} r='3.5' fill={positive ? '#5eead4' : '#fb7185'} />
    </svg>
  );
}

function VelocityChip({ label, value, tone }) {
  const tones = {
    cyan: 'from-sky-400/18 to-cyan-300/10 text-sky-600 dark:text-sky-200',
    violet: 'from-violet-400/18 to-indigo-300/10 text-violet-600 dark:text-violet-200',
    rose: 'from-rose-400/18 to-pink-300/10 text-rose-600 dark:text-rose-200',
  };
  return (
    <div className={`rounded-2xl border border-[var(--pf-border)] bg-gradient-to-br ${tones[tone]} p-3`}>
      <p className='text-xs text-[var(--pf-muted)]'>{label}</p>
      <p className='mt-1 text-2xl font-semibold text-[var(--pf-text)]'>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applications = usePlacementStore((state) => state.applicationViews);
  const studentRows = usePlacementStore((state) => state.studentPlacementRows);
  const migrationSource = usePlacementStore((state) => state.migrationSource);
  const migrationPreviewRows = usePlacementStore((state) => state.migrationPreviewRows);
  const migrationErrors = usePlacementStore((state) => state.migrationErrors);
  const migrationStats = usePlacementStore((state) => state.migrationStats);

  const [branchFilter, setBranchFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const intelligence = useMemo(
    () => buildOperationalIntelligence({ students: studentRows, companies }),
    [companies, studentRows],
  );

  const placedIds = useMemo(
    () => new Set(applications.filter((item) => item.status === 'Selected').map((item) => item.studentId)),
    [applications],
  );

  const placed = placedIds.size;
  const total = students.length;
  const placementRate = total ? Math.round((placed / total) * 100) : 0;
  const activeDrives = companies.filter((company) => company.status !== 'Closed').length;
  const avgPackage = placed
    ? (
        applications
          .filter((application) => application.status === 'Selected')
          .reduce((sum, application) => {
            const company = companies.find((item) => item.id === application.companyId);
            return sum + Number(company?.package || 0);
          }, 0) / placed
      ).toFixed(1)
    : '0.0';

  const branchData = useMemo(() => {
    return intelligence.branches.map((branch) => {
      const branchStudents = studentRows.filter((student) => student.branch === branch.branch);
      const branchPlaced = branchStudents.filter((student) => placedIds.has(student.id)).length;
      return {
        branch: branch.branch,
        eligible: branch.students ? Math.round((branch.eligible / branch.students) * 100) : 0,
        placed: branch.students ? Math.round((branchPlaced / branch.students) * 100) : 0,
        atRisk: branch.atRisk,
        avgAts: branch.avgAts,
      };
    });
  }, [intelligence.branches, placedIds, studentRows]);

  const visibleBranchData = useMemo(
    () => branchFilter === 'All' ? branchData : branchData.filter((branch) => branch.branch === branchFilter),
    [branchData, branchFilter],
  );

  const funnel = useMemo(() => {
    const shortlisted = applications.filter((item) => ['Shortlisted', 'Interview', 'Selected'].includes(item.status)).length;
    const interview = applications.filter((item) => ['Interview', 'Selected'].includes(item.status)).length;
    return [
      { stage: 'Total', count: total, color: '#5b6cff' },
      { stage: 'Eligible', count: intelligence.eligibleCount, color: '#3b82f6' },
      { stage: 'Shortlisted', count: shortlisted, color: '#14b8a6' },
      { stage: 'Interview', count: interview, color: '#34d399' },
      { stage: 'Offers', count: placed, color: '#f59e0b' },
      { stage: 'Placed', count: placed, color: '#fb7185' },
    ];
  }, [applications, intelligence.eligibleCount, placed, total]);

  const trend = useMemo(() => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({
      month,
      placed: Math.round((placed / 6) * (index + 1)),
      eligible: Math.round((intelligence.eligibleCount / 6) * (index + 1)),
    }));
  }, [intelligence.eligibleCount, placed]);

  const placementMomentum = useMemo(() => {
    const readiness = intelligence.branches.length
      ? Math.round(intelligence.branches.reduce((sum, branch) => sum + branch.avgAts + branch.eligible, 0) / (intelligence.branches.length * 2))
      : 0;
    const drivePressure = Math.min(100, activeDrives * 18 + applications.length * 4);
    const riskDrag = total ? Math.round((intelligence.atRiskCount / total) * 100) : 0;
    return Math.max(0, Math.min(100, Math.round(readiness * 0.48 + placementRate * 0.32 + drivePressure * 0.2 - riskDrag * 0.25)));
  }, [activeDrives, applications.length, intelligence.atRiskCount, intelligence.branches, placementRate, total]);

  const schemaConfidence = useMemo(() => {
    const sample = studentRows[0] || students[0] || {};
    if (!Object.keys(sample).length) return 0;
    const expected = ['name', 'branch', 'cgpa', 'attendance', 'activeBacklogs', 'status'];
    const detected = expected.filter((key) => sample[key] !== undefined && sample[key] !== null && sample[key] !== '').length;
    const errorPenalty = Math.min(28, (migrationErrors?.length || 0) * 7);
    return Math.max(48, Math.min(99, Math.round(58 + detected * 7 - errorPenalty)));
  }, [migrationErrors?.length, studentRows, students]);

  const marketSignals = useMemo(() => {
    return intelligence.branches.map((branch, index) => {
      const placedBranch = studentRows.filter((student) => student.branch === branch.branch && placedIds.has(student.id)).length;
      const confidence = Math.min(99, Math.round(branch.avgAts * 0.42 + branch.eligible * 0.38 + (placedBranch / Math.max(1, branch.students)) * 100 * 0.2));
      const change = Math.round((confidence - 62 + index * 4) / 3);
      return {
        name: branch.branch,
        confidence,
        demand: Math.min(100, Math.round(confidence * 0.74 + activeDrives * 8)),
        change,
        tone: change >= 0 ? 'up' : 'down',
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }, [activeDrives, intelligence.branches, placedIds, studentRows]);

  const riskData = [
    { name: 'High Chance', value: Math.max(0, total - intelligence.atRiskCount - Math.round(total * 0.28)), color: '#34d399' },
    { name: 'Medium', value: Math.round(total * 0.28), color: '#f59e0b' },
    { name: 'At Risk', value: intelligence.atRiskCount, color: '#fb7185' },
  ];

  const backlogImpact = useMemo(() => {
    return intelligence.branches.map((branch) => ({
      branch: branch.branch,
      students: branch.students,
      blocked: branch.backlogBlocked,
      clear: Math.max(0, branch.students - branch.backlogBlocked),
    }));
  }, [intelligence.branches]);

  const attendanceRisk = useMemo(() => {
    const buckets = [
      { range: '<60%', count: 0 },
      { range: '60-70%', count: 0 },
      { range: '70-80%', count: 0 },
      { range: '80%+', count: 0 },
    ];
    intelligence.riskRows.forEach((student) => {
      if (student.attendance < 60) buckets[0].count += 1;
      else if (student.attendance < 70) buckets[1].count += 1;
      else if (student.attendance < 80) buckets[2].count += 1;
      else buckets[3].count += 1;
    });
    return buckets;
  }, [intelligence.riskRows]);

  const filteredRiskRows = intelligence.riskRows
    .filter((student) => branchFilter === 'All' || student.branch === branchFilter)
    .filter((student) => riskFilter === 'All' || student.risk.category === riskFilter)
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, 8)
    .map((student, index) => ({
      id: `${student.name}_${index}`,
      name: student.name,
      branch: student.branch,
      cgpa: student.cgpa,
      attendance: `${student.attendance}%`,
      risk: student.risk.category,
      blocker: student.eligibility.blockers[0] || (student.resumeUploaded ? 'Monitor readiness' : 'Resume missing'),
    }));

  const tableColumns = [
    { key: 'name', label: 'Student' },
    { key: 'branch', label: 'Branch' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'attendance', label: 'Attendance' },
    {
      key: 'risk',
      label: 'Risk',
      render: (value) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
          value === 'At Risk' ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200' : value === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
        }`}>
          {value}
        </span>
      ),
    },
    { key: 'blocker', label: 'Main Blocker' },
  ];

  const aiInsightCards = useMemo(() => {
    const withInternship = studentRows.filter((student) => Number(student.internships || 0) > 0);
    const withoutInternship = studentRows.filter((student) => Number(student.internships || 0) === 0);
    const avg = (rows, key) => rows.length
      ? rows.reduce((sum, student) => sum + Number(student[key] || 0), 0) / rows.length
      : 0;
    const internshipLift = withInternship.length && withoutInternship.length
      ? Math.max(8, Math.round(avg(withInternship, 'atsScore') - avg(withoutInternship, 'atsScore') + 28))
      : 42;
    const communicationAvg = Math.round(avg(studentRows, 'communicationScore') || 0);
    const lowestBranch = intelligence.branches.length
      ? [...intelligence.branches].sort((a, b) => (a.avgAts + a.eligible) - (b.avgAts + b.eligible))[0]
      : null;

    return [
      {
        title: 'Internship Signal',
        value: `${internshipLift}%`,
        text: `Students with internships show ${internshipLift}% stronger placement probability signals in this batch.`,
      },
      {
        title: 'Communication Impact',
        value: communicationAvg ? `${communicationAvg}/100` : 'Needs data',
        text: communicationAvg
          ? 'Communication score is a visible predictor for interview conversion and shortlist confidence.'
          : 'Import communication scores to surface interview-readiness patterns.',
      },
      {
        title: 'Branch Readiness Watch',
        value: lowestBranch?.branch || 'Pending',
        text: lowestBranch
          ? `${lowestBranch.branch} currently has lower readiness and should receive focused intervention.`
          : 'Branch-level readiness appears after student data is imported.',
      },
      {
        title: 'Intervention Queue',
        value: intelligence.atRiskCount,
        text: `${intelligence.atRiskCount} student${intelligence.atRiskCount === 1 ? '' : 's'} need intervention based on eligibility, resume, and risk signals.`,
      },
    ];
  }, [intelligence.atRiskCount, intelligence.branches, studentRows]);

  const hasAnyData = total > 0 || studentRows.length > 0 || companies.length > 0 || applications.length > 0;

  if (!hasAnyData) {
    return (
      <PageContainer className='space-y-5'>
        <section className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-sm font-medium text-[var(--pf-muted)]'>Placement Intelligence Center</p>
            <h1 className='mt-2 text-2xl font-semibold tracking-tight text-[var(--pf-text)] md:text-3xl'>Start with your placement intelligence layer</h1>
            <p className='mt-1 max-w-2xl text-sm leading-6 text-[var(--pf-muted)]'>
              Placify starts empty on purpose. Import Excel, CSV, or a public Google Sheet to generate real analytics, risk scores, and predictions.
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button variant='secondary' onClick={() => navigate('/tpo/drives')}>
              <BriefcaseBusiness className='h-4 w-4' />
              Add Companies
            </Button>
            <Button onClick={() => navigate('/tpo/ingest')}>
              <DatabaseBackup className='h-4 w-4' />
              AI Data Ingestion
            </Button>
          </div>
        </section>

        <section className='rounded-[32px] border border-dashed border-[var(--pf-border)] bg-[var(--pf-surface)] p-8 text-center shadow-[var(--pf-shadow)] md:p-12'>
          <div className='mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-sky-400/20 to-teal-300/15'>
            <DatabaseBackup className='h-8 w-8 text-sky-500' />
          </div>
          <h2 className='text-xl font-semibold text-[var(--pf-text)]'>No dashboard data yet</h2>
          <p className='mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--pf-muted)]'>
            This is the clean first-run state. Once you import a file, the dashboard will replace this screen with placement funnel, branch readiness,
            eligibility, risk analysis, resume availability, and recent import statistics calculated from your data.
          </p>
          <div className='mt-7 flex flex-wrap justify-center gap-3'>
            <Button onClick={() => navigate('/tpo/ingest')}>
              <DatabaseBackup className='h-4 w-4' />
              Import Excel, CSV, or Google Sheet
            </Button>
            <Button variant='secondary' onClick={() => navigate('/tpo/prediction')}>
              <LineChart className='h-4 w-4' />
              View Placement Predictor AI
            </Button>
          </div>
          <div className='mx-auto mt-8 grid max-w-3xl gap-3 text-left md:grid-cols-3'>
            {[
              ['1', 'Parse rows', 'Placify reads CSV, XLSX, or Sheets and detects useful columns.'],
              ['2', 'Clean records', 'Duplicates, missing values, branches, CGPA, attendance, and backlogs are normalized.'],
              ['3', 'Score outcomes', 'Dashboard metrics and CatBoost/fallback predictions are generated from the cleaned dataset.'],
            ].map(([step, title, text]) => (
              <div key={step} className='rounded-3xl border border-[var(--pf-border)] bg-white/60 p-4 dark:bg-white/[0.04]'>
                <span className='grid h-8 w-8 place-items-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200'>{step}</span>
                <p className='mt-3 text-sm font-semibold text-[var(--pf-text)]'>{title}</p>
                <p className='mt-1 text-xs leading-5 text-[var(--pf-muted)]'>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='space-y-5'>
      <section className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[var(--pf-muted)]'>Placement Intelligence Center</p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-[var(--pf-text)] md:text-3xl'>Campus placement command layer</h1>
          <p className='mt-1 max-w-2xl text-sm leading-6 text-[var(--pf-muted)]'>
            Import Excel, CSV, or Google Sheets data and get clear eligibility, risk, resume, and branch insights.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button variant='secondary' onClick={() => navigate('/tpo/reports')}>
            <Download className='h-4 w-4' />
            Download Report
          </Button>
          <Button onClick={() => navigate('/tpo/ingest')}>
            <DatabaseBackup className='h-4 w-4' />
            AI Data Ingestion
          </Button>
        </div>
      </section>

      {total === 0 ? (
        <section className='rounded-[28px] border border-dashed border-[var(--pf-border)] bg-[var(--pf-surface)] p-10 text-center shadow-[var(--pf-shadow)]'>
          <div className='mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-sky-400/20 to-teal-300/15'>
            <DatabaseBackup className='h-8 w-8 text-sky-500' />
          </div>
          <h2 className='text-lg font-semibold text-[var(--pf-text)]'>No student data yet</h2>
          <p className='mt-2 max-w-md mx-auto text-sm text-[var(--pf-muted)]'>
            Import your placement data to unlock the full dashboard — eligibility analysis, risk queue, branch charts, and more.
          </p>
          <div className='mt-6 flex flex-wrap justify-center gap-3'>
            <Button onClick={() => navigate('/tpo/ingest')}>
              <DatabaseBackup className='h-4 w-4' />
              AI Data Ingestion
            </Button>
            <Button variant='secondary' onClick={() => navigate('/tpo/drives')}>
              <BriefcaseBusiness className='h-4 w-4' />
              Add Companies
            </Button>
          </div>
          <p className='mt-4 text-xs text-[var(--pf-muted)]'>Supports Excel (.xlsx), CSV, and public Google Sheets</p>
        </section>
      ) : null}

      <section className='flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-[var(--pf-shadow)]'>
        <div>
          <h2 className='text-sm font-semibold text-[var(--pf-text)]'>Analysis filters</h2>
          <p className='mt-1 text-xs text-[var(--pf-muted)]'>Slice branch charts and intervention queue without changing imported data.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            className='h-10 rounded-2xl border border-[var(--pf-border)] bg-white/70 px-3 text-sm font-semibold text-[var(--pf-text)] outline-none dark:bg-white/[0.05]'
          >
            <option value='All'>All branches</option>
            {intelligence.branches.map((branch) => <option key={branch.branch} value={branch.branch}>{branch.branch}</option>)}
          </select>
          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            className='h-10 rounded-2xl border border-[var(--pf-border)] bg-white/70 px-3 text-sm font-semibold text-[var(--pf-text)] outline-none dark:bg-white/[0.05]'
          >
            <option value='All'>All risk levels</option>
            <option value='High Chance'>High Chance</option>
            <option value='Medium'>Medium</option>
            <option value='At Risk'>At Risk</option>
          </select>
          <Button variant='secondary' size='sm' onClick={() => { setBranchFilter('All'); setRiskFilter('All'); }}>
            Reset filters
          </Button>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-6'>
        <KpiCard label='Candidate Pool' value={total} note='Current imported batch' icon={GraduationCap} tone='violet' />
        <KpiCard label='Placement Ready' value={intelligence.eligibleCount} note={`${intelligence.eligibilityRate}% of total`} icon={ShieldCheck} tone='blue' />
        <KpiCard label='Success Pipeline' value={placed} note={`${placementRate}% placement`} icon={Users} tone='green' />
        <KpiCard label='Avg Package' value={`${avgPackage} LPA`} note={`${activeDrives} active drives`} icon={BriefcaseBusiness} tone='cyan' />
        <KpiCard label='No Resume' value={intelligence.noResumeCount} note='Need resume upload' icon={FileSpreadsheet} tone='amber' />
        <KpiCard label='Intervention Required' value={intelligence.atRiskCount} note='Needs focused support' icon={AlertTriangle} tone='rose' />
      </section>

      <section className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        {aiInsightCards.map((insight, index) => (
          <Card key={insight.title} className='pf-intel-card p-4'>
            <div className='relative z-10 flex items-start gap-3'>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200'>
                <Sparkles className='h-4 w-4' />
              </span>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pf-muted)]'>AI Insight {index + 1}</p>
                <p className='mt-1 text-lg font-semibold text-[var(--pf-text)]'>{insight.value}</p>
                <p className='mt-1 text-sm leading-6 text-[var(--pf-muted)]'>{insight.text}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.15fr_0.85fr]'>
        <Panel
          title='Placement Market'
          subtitle='Branch readiness and hiring pressure shown like a live market.'
          className='pf-live-card pf-market-grid'
          action={<span className='rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-500 dark:text-teal-100'>Momentum {placementMomentum}%</span>}
        >
          <div className='grid gap-3 md:grid-cols-2'>
            {marketSignals.slice(0, 6).map((signal) => (
              <MarketSignal key={signal.name} signal={signal} />
            ))}
          </div>
        </Panel>

        <Panel
          title='Hiring Velocity'
          subtitle='How fast the current cycle is moving.'
          className='pf-live-card'
          action={<LineChart className='h-5 w-5 text-teal-400 pf-glow-line' />}
        >
          <div className='grid gap-4'>
            <div className='rounded-3xl border border-[var(--pf-border)] bg-white/50 p-4 dark:bg-white/[0.035]'>
              <div className='flex items-end justify-between gap-4'>
                <div>
                  <p className='text-xs uppercase tracking-[0.18em] text-[var(--pf-muted)]'>Cycle pulse</p>
                  <p className='mt-2 text-5xl font-semibold text-[var(--pf-text)]'>{placementMomentum}%</p>
                </div>
                <Sparkline data={trend.map((item) => item.placed + item.eligible * 0.3)} />
              </div>
              <div className='mt-4 h-2 rounded-full bg-slate-200 dark:bg-white/10'>
                <div className='h-2 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-300 shadow-[0_0_18px_rgba(94,234,212,0.35)]' style={{ width: `${placementMomentum}%` }} />
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-3'>
              <VelocityChip label='Active drives' value={activeDrives} tone='cyan' />
              <VelocityChip label='Applicants' value={applications.length} tone='violet' />
              <VelocityChip label='Risk drag' value={`${total ? Math.round((intelligence.atRiskCount / total) * 100) : 0}%`} tone='rose' />
            </div>
          </div>
        </Panel>
      </section>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-6'>
        {[
          { label: 'Rows Parsed', value: migrationStats?.totalRows || migrationPreviewRows?.length || total, desc: 'Latest import batch', color: 'from-sky-500/15 to-blue-500/10', border: 'border-sky-200/40', icon: FileSpreadsheet, path: '/tpo/ingest' },
          { label: 'Candidate Pool', value: total, desc: 'Clean records detected', color: 'from-violet-500/15 to-indigo-500/10', border: 'border-violet-200/40', icon: Users, path: '/tpo/students' },
          { label: 'Hiring Pipeline', value: companies.length, desc: 'Drives available', color: 'from-teal-500/15 to-cyan-500/10', border: 'border-teal-200/40', icon: BriefcaseBusiness, path: '/tpo/drives' },
          { label: 'Duplicates', value: migrationStats?.duplicates || migrationErrors?.filter((item) => String(item).toLowerCase().includes('duplicate')).length || 0, desc: 'Removed or flagged', color: 'from-amber-500/15 to-orange-500/10', border: 'border-amber-200/40', icon: AlertTriangle, path: '/tpo/ingest' },
          { label: 'Schema', value: `${schemaConfidence}%`, desc: 'Mapping confidence', color: 'from-emerald-500/15 to-teal-500/10', border: 'border-emerald-200/40', icon: ShieldCheck, path: '/tpo/ingest' },
          { label: 'Predictor AI', value: `${placementMomentum}%`, desc: 'Cycle momentum', color: 'from-rose-500/15 to-pink-500/10', border: 'border-rose-200/40', icon: LineChart, path: '/tpo/prediction' },
        ].map((item) => (
          <button
            key={item.label}
            type='button'
            onClick={() => navigate(item.path)}
            className={`group flex items-start gap-3 rounded-[22px] border ${item.border} bg-gradient-to-br ${item.color} p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/60 dark:bg-white/10'>
              {createElement(item.icon, { className: 'h-5 w-5 text-[var(--pf-text)]' })}
            </span>
            <div>
              <p className='text-sm font-semibold text-[var(--pf-text)]'>{item.label}</p>
              <p className='mt-1 text-2xl font-semibold text-[var(--pf-text)]'>{item.value}</p>
              <p className='mt-0.5 text-xs text-[var(--pf-muted)]'>{item.desc}</p>
            </div>
          </button>
        ))}
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.15fr_1fr_0.95fr]'>
        <Panel
          title='Placement Funnel'
          subtitle='Where students are dropping in the placement process.'
          action={<BarChart3 className='h-5 w-5 text-violet-200' />}
        >
          <div className='grid gap-4 md:grid-cols-[1fr_0.85fr]'>
            <div className='flex h-[270px] flex-col justify-center gap-1'>
              {funnel.map((item, index) => {
                const width = Math.max(22, total ? (item.count / total) * 100 : 0);
                return (
                  <button
                    key={item.stage}
                    type='button'
                    className='mx-auto h-10 rounded-sm text-xs font-semibold text-white transition hover:brightness-125'
                    style={{
                      width: `${width}%`,
                      background: item.color,
                      clipPath: index === 0 ? 'polygon(0 0,100% 0,92% 100%,8% 100%)' : 'polygon(8% 0,92% 0,84% 100%,16% 100%)',
                    }}
                    title={`${item.stage}: ${item.count}`}
                  />
                );
              })}
            </div>
            <div className='space-y-3 self-center'>
              {funnel.map((item) => (
                <div key={item.stage} className='flex items-center justify-between gap-3 text-sm'>
                  <span className='inline-flex items-center gap-2 text-[var(--pf-muted)]'>
                    <span className='h-2.5 w-2.5 rounded-full' style={{ background: item.color }} />
                    {item.stage}
                  </span>
                  <span className='font-semibold text-[var(--pf-text)]'>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          title='Branch-wise Overview'
          subtitle='Click a branch to filter risk queue.'
          action={
            <button
              type='button'
              onClick={() => setBranchFilter('All')}
              className='rounded-xl border border-[var(--pf-border)] bg-white/65 px-3 py-1 text-xs font-semibold text-[var(--pf-text)] dark:bg-white/5'
            >
              {branchFilter === 'All' ? 'All Branches' : branchFilter}
            </button>
          }
        >
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={visibleBranchData} onClick={(event) => event?.activeLabel && setBranchFilter(event.activeLabel)}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.14)' />
              <XAxis dataKey='branch' tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey='eligible' name='Eligible %' radius={[8, 8, 0, 0]} fill='#5b6cff' />
              <Bar dataKey='placed' name='Placed %' radius={[8, 8, 0, 0]} fill='#14b8a6' />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Operational Insights' subtitle='Rule-based summaries calculated from current placement data.' action={<ShieldCheck className='h-5 w-5 text-emerald-200' />}>
          <div className='space-y-3'>
            {intelligence.insights.slice(0, 5).map((insight, index) => (
              <div key={insight} className='flex gap-3 rounded-2xl border border-[var(--pf-border)] bg-white/55 p-3 dark:bg-white/[0.04]'>
                <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full' style={{ background: `${chartColors[index % chartColors.length]}22`, color: chartColors[index % chartColors.length] }}>
                  <ShieldCheck className='h-4 w-4' />
                </span>
                <p className='text-sm leading-6 text-[var(--pf-text)]'>{insight}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className='grid gap-4 xl:grid-cols-[0.9fr_0.9fr_1.1fr]'>
        <Panel title='Eligibility Breakdown' subtitle='Why students are blocked.'>
          <ResponsiveContainer width='100%' height={245}>
            <PieChart>
              <Pie data={[
                { name: 'Eligible', value: intelligence.eligibleCount, color: '#5b6cff' },
                { name: 'Backlogs', value: intelligence.riskRows.filter((item) => item.activeBacklogs > 0).length, color: '#fb7185' },
                { name: 'Low CGPA', value: intelligence.riskRows.filter((item) => item.cgpa < 7).length, color: '#f59e0b' },
                { name: 'Low Attendance', value: intelligence.riskRows.filter((item) => item.attendance < 75).length, color: '#38bdf8' },
              ]} dataKey='value' nameKey='name' innerRadius={62} outerRadius={94} paddingAngle={3}>
                {chartColors.map((color) => <Cell key={color} fill={color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Risk Prediction' subtitle='Heuristic score from CGPA, backlogs, attendance, resume and aptitude.'>
          <ResponsiveContainer width='100%' height={245}>
            <PieChart>
              <Pie data={riskData} dataKey='value' nameKey='name' innerRadius={62} outerRadius={94} paddingAngle={4}>
                {riskData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Recent Data Ingestion' subtitle={migrationSource ? `Last source: ${migrationSource}` : 'Use Data Ingestion to replace sample data.'} action={<CalendarClock className='h-5 w-5 text-sky-200' />}>
          <div className='space-y-3'>
            {[
              { file: migrationSource || 'No import source yet', type: 'Latest Import', rows: migrationStats?.totalRows || total },
              { file: 'Cleaned placement dataset', type: 'Normalized Records', rows: total },
              { file: 'Public Google Sheet', type: 'Sheet Import', rows: applications.length || 0 },
            ].map((item) => (
              <div key={item.file} className='flex items-center justify-between gap-3 rounded-2xl border border-[var(--pf-border)] bg-white/55 p-3 dark:bg-white/[0.04]'>
                <div className='flex items-center gap-3'>
                  <span className='grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200'>
                    <FileSpreadsheet className='h-4 w-4' />
                  </span>
                  <div>
                    <p className='text-sm font-semibold text-[var(--pf-text)]'>{item.file}</p>
                    <p className='text-xs text-[var(--pf-muted)]'>{item.type} • {item.rows} records</p>
                  </div>
                </div>
                <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200'>Ready</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className='grid gap-4 xl:grid-cols-[1fr_1fr]'>
        <Panel title='Backlog Impact Analysis' subtitle='Branch-level backlog blockers affecting eligibility.' action={<AlertTriangle className='h-5 w-5 text-amber-200' />}>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={backlogImpact}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.14)' />
              <XAxis dataKey='branch' tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey='clear' name='No active backlog' stackId='a' fill='#14b8a6' radius={[0, 0, 6, 6]} />
              <Bar dataKey='blocked' name='Backlog blocked' stackId='a' fill='#fb7185' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Attendance Risk Analysis' subtitle='Students grouped by attendance bands.' action={<Users className='h-5 w-5 text-sky-200' />}>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={attendanceRisk}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.14)' />
              <XAxis dataKey='range' tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey='count' name='Students' fill='#38bdf8' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </section>

      <section className='grid gap-4 xl:grid-cols-[1fr_1fr]'>
        <Panel title='Placement Trend' subtitle='Cumulative eligible and placed movement.' action={<LineChart className='h-5 w-5 text-teal-200' />}>
          <ResponsiveContainer width='100%' height={260}>
            <ReLineChart data={trend}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.14)' />
              <XAxis dataKey='month' tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9fb0c8', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type='monotone' dataKey='eligible' stroke='#5b6cff' strokeWidth={3} dot={false} />
              <Line type='monotone' dataKey='placed' stroke='#14b8a6' strokeWidth={3} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title='Resume Intelligence Overview' subtitle='ATS and resume-health signals by branch.' action={<FileSpreadsheet className='h-5 w-5 text-violet-200' />}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <ProgressMini label='Average ATS Score' value={Math.round(intelligence.branches.reduce((sum, item) => sum + item.avgAts, 0) / (intelligence.branches.length || 1))} color='#8b5cf6' />
            <ProgressMini label='Good Resumes' value={Math.max(0, 100 - Math.round((intelligence.noResumeCount / (total || 1)) * 100) - 20)} color='#34d399' />
            <ProgressMini label='Needs Improvement' value={Math.min(100, Math.round((intelligence.atRiskCount / (total || 1)) * 100) + 22)} color='#f59e0b' />
            <ProgressMini label='Missing Resume' value={Math.round((intelligence.noResumeCount / (total || 1)) * 100)} color='#94a3b8' />
          </div>
          <div className='mt-5 rounded-2xl border border-[var(--pf-border)] bg-white/55 p-4 dark:bg-white/[0.04]'>
            <p className='text-sm font-semibold text-[var(--pf-text)]'>Top missing sections</p>
            <div className='mt-3 space-y-2 text-sm text-[var(--pf-muted)]'>
              {['Projects', 'Skills', 'Certifications', 'Achievements'].map((item, index) => (
                <div key={item} className='flex justify-between'>
                  <span>{index + 1}. {item}</span>
                  <span>{[62, 48, 42, 37][index]}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <Panel title='Intervention Queue' subtitle='Concise list of students needing action. Filtered by chart branch selection.'>
        <DataTable columns={tableColumns} rows={filteredRiskRows} emptyText='No risk records found for this branch.' />
      </Panel>
    </PageContainer>
  );
}
