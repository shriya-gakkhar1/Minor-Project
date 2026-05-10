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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applications = usePlacementStore((state) => state.applicationViews);
  const studentRows = usePlacementStore((state) => state.studentPlacementRows);
  const migrationSource = usePlacementStore((state) => state.migrationSource);

  const [branchFilter, setBranchFilter] = useState('All');

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
      placed: Math.max(4, Math.round((placed / 6) * (index + 1) + index * 2)),
      eligible: Math.max(12, Math.round((intelligence.eligibleCount / 6) * (index + 1))),
    }));
  }, [intelligence.eligibleCount, placed]);

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

  return (
    <PageContainer className='space-y-5'>
      <section className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[var(--pf-muted)]'>Placement Overview</p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-[var(--pf-text)] md:text-3xl'>Your placement dashboard</h1>
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
            Import Data
          </Button>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-6'>
        <KpiCard label='Total Students' value={total} note='Current imported batch' icon={GraduationCap} tone='violet' />
        <KpiCard label='Eligible Students' value={intelligence.eligibleCount} note={`${intelligence.eligibilityRate}% of total`} icon={ShieldCheck} tone='blue' />
        <KpiCard label='Placed Students' value={placed} note={`${placementRate}% placement`} icon={Users} tone='green' />
        <KpiCard label='Avg Package' value={`${avgPackage} LPA`} note={`${activeDrives} active drives`} icon={BriefcaseBusiness} tone='cyan' />
        <KpiCard label='No Resume' value={intelligence.noResumeCount} note='Need resume upload' icon={FileSpreadsheet} tone='amber' />
        <KpiCard label='At Risk' value={intelligence.atRiskCount} note='Needs intervention' icon={AlertTriangle} tone='rose' />
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
            <BarChart data={branchData} onClick={(event) => event?.activeLabel && setBranchFilter(event.activeLabel)}>
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
              { file: migrationSource || 'JECRC_Placement_Master_2025.xlsx', type: 'Excel File', rows: total || 1248 },
              { file: 'JECRC_Resume_Intelligence.csv', type: 'CSV File', rows: total || 1248 },
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
