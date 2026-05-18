import { createElement, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  DatabaseZap,
  Info,
  LineChart,
  ShieldCheck,
  Sparkles,
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
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { calculateJobMatch, inferStudentProfile } from '../services/jobMatchService';
import { usePlacementStore } from '../store/usePlacementStore';

const MODEL_FEATURES = [
  { name: 'CGPA', weight: 15, description: 'Academic cutoff and relative strength' },
  { name: 'Attendance', weight: 10, description: 'Drive eligibility and risk signal' },
  { name: 'Backlogs', weight: 12, description: 'Strict blocker for many companies' },
  { name: 'ATS Score', weight: 14, description: 'Resume readiness and keyword quality' },
  { name: 'Aptitude', weight: 10, description: 'Screening test preparation' },
  { name: 'Communication', weight: 9, description: 'Interview and HR readiness' },
  { name: 'Projects', weight: 12, description: 'Practical proof of skill' },
  { name: 'Internships', weight: 8, description: 'Industry exposure' },
  { name: 'Skills Count', weight: 6, description: 'Coverage of role requirements' },
  { name: 'Applications', weight: 4, description: 'Placement activity level' },
];
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function scoreLabel(probability) {
  if (probability >= 72) return 'High Chance';
  if (probability >= 46) return 'Medium';
  return 'At Risk';
}

function riskTone(category) {
  if (category === 'High Chance') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200';
  if (category === 'Medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200';
}

function MiniMetric({ label, value, helper, icon }) {
  return (
    <Card className='p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pf-muted)]'>{label}</p>
          <p className='mt-2 text-3xl font-semibold text-[var(--pf-text)]'>{value}</p>
          <p className='mt-1 text-xs text-[var(--pf-muted)]'>{helper}</p>
        </div>
        <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200'>
          {createElement(icon, { className: 'h-5 w-5' })}
        </span>
      </div>
    </Card>
  );
}

function PredictionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl border border-[var(--pf-border)] bg-white px-3 py-2 text-xs shadow-xl dark:bg-[#07111f]'>
      <p className='font-semibold text-[var(--pf-text)]'>{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className='mt-1 text-[var(--pf-muted)]'>
          <span style={{ color: item.color }}>●</span> {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function TpoPredictionPage() {
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const studentRows = usePlacementStore((state) => state.studentPlacementRows);
  const applications = usePlacementStore((state) => state.applicationViews);
  const migrationSource = usePlacementStore((state) => state.migrationSource);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${BACKEND_BASE}/api/intelligence/prediction-summary`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setModelInfo(data);
      })
      .catch(() => {
        if (active) setModelInfo(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const predictionRows = useMemo(() => {
    const sourceStudents = studentRows.length ? studentRows : students;
    const activeDrives = companies.filter((company) => !['closed', 'archived', 'draft'].includes(String(company.status || 'Open').toLowerCase()));

    return sourceStudents.map((student) => {
      const profile = inferStudentProfile(student);
      const matches = activeDrives
        .map((drive) => ({ drive, match: calculateJobMatch(profile, drive) }))
        .sort((a, b) => b.match.hiringProbability - a.match.hiringProbability);
      const best = matches[0];
      const probability = best?.match?.hiringProbability || Math.round(profile.resumeScore * 0.52 + profile.cgpa * 4.2);
      const category = scoreLabel(probability);
      const applicationsCount = applications.filter((application) => application.studentId === student.id).length;

      return {
        id: student.id || student.enrollment || student.email || student.name,
        name: student.name || 'Student',
        branch: student.branch || 'NA',
        cgpa: profile.cgpa,
        attendance: Number(student.attendance ?? profile.attendance ?? 0),
        atsScore: profile.atsScore,
        bestDrive: best?.drive?.name || best?.drive?.company || 'No active drive',
        role: best?.drive?.role || 'General placement',
        probability,
        shortlistProbability: best?.match?.shortlistedProbability || probability,
        category,
        positiveFactors: best?.match?.strengths?.length
          ? best.match.strengths.slice(0, 2)
          : [profile.cgpa >= 7.5 ? 'CGPA is in a healthy range.' : 'Profile has baseline placement data.'],
        negativeFactors: best?.match?.weakAreas?.length
          ? best.match.weakAreas.slice(0, 2)
          : [profile.activeBacklogs > 0 ? 'Active backlogs reduce eligibility.' : 'No company-specific role selected.'],
        suggestions: best?.match?.suggestedImprovements?.slice(0, 2) || ['Improve ATS keywords and add role-specific project proof.'],
        applicationsCount,
        modelUsed: modelInfo?.activeModel || 'rules-fallback-v1',
      };
    }).sort((a, b) => a.probability - b.probability);
  }, [applications, companies, modelInfo, studentRows, students]);

  const summary = useMemo(() => {
    const total = predictionRows.length;
    const average = total ? Math.round(predictionRows.reduce((sum, row) => sum + row.probability, 0) / total) : 0;
    const high = predictionRows.filter((row) => row.category === 'High Chance').length;
    const medium = predictionRows.filter((row) => row.category === 'Medium').length;
    const risk = predictionRows.filter((row) => row.category === 'At Risk').length;
    return { total, average, high, medium, risk };
  }, [predictionRows]);

  const pieData = [
    { name: 'High Chance', value: summary.high, color: '#34d399' },
    { name: 'Medium', value: summary.medium, color: '#f59e0b' },
    { name: 'At Risk', value: summary.risk, color: '#fb7185' },
  ];

  const tableRows = predictionRows.slice(0, 10).map((row) => ({
    id: row.id,
    name: row.name,
    branch: row.branch,
    bestDrive: row.bestDrive,
    probability: `${row.probability}%`,
    category: row.category,
    reason: row.negativeFactors[0] || row.positiveFactors[0],
  }));

  const tableColumns = [
    { key: 'name', label: 'Student' },
    { key: 'branch', label: 'Branch' },
    { key: 'bestDrive', label: 'Best Drive' },
    { key: 'probability', label: 'Probability' },
    {
      key: 'category',
      label: 'Risk',
      render: (value) => <span className={`rounded-full px-2 py-1 text-xs font-semibold ${riskTone(value)}`}>{value}</span>,
    },
    { key: 'reason', label: 'Top Factor' },
  ];

  return (
    <PageContainer className='space-y-5'>
      <section className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[var(--pf-muted)]'>Prediction</p>
          <h1 className='mt-2 text-2xl font-semibold tracking-tight text-[var(--pf-text)] md:text-3xl'>
            Explainable placement prediction
          </h1>
          <p className='mt-1 max-w-3xl text-sm leading-6 text-[var(--pf-muted)]'>
            CatBoost is prepared for tabular placement data, while transparent rules keep the minor-project demo reliable when the ML service is not running.
          </p>
        </div>
        <Button variant='secondary' onClick={() => window.location.reload()}>
          <LineChart className='h-4 w-4' />
          Refresh Scores
        </Button>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <MiniMetric label='Students Scored' value={summary.total} helper={migrationSource ? `From ${migrationSource}` : 'Current demo batch'} icon={DatabaseZap} />
        <MiniMetric label='Avg Probability' value={`${summary.average}%`} helper='Mean placement probability' icon={BrainCircuit} />
        <MiniMetric label='High Chance' value={summary.high} helper='Profiles ready for active drives' icon={CheckCircle2} />
        <MiniMetric label='At Risk' value={summary.risk} helper='Needs intervention before drives' icon={AlertTriangle} />
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.15fr_0.85fr]'>
        <Card className='p-5'>
          <SectionHeader
            title='Model Feature Weights'
            subtitle='Viva-friendly feature view for the CatBoost-ready placement model.'
          />
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={MODEL_FEATURES}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.18)' />
              <XAxis dataKey='name' tick={{ fill: '#8da0b8', fontSize: 11 }} interval={0} angle={-18} textAnchor='end' height={62} />
              <YAxis tick={{ fill: '#8da0b8', fontSize: 12 }} />
              <Tooltip content={<PredictionTooltip />} />
              <Bar dataKey='weight' name='Weight' radius={[8, 8, 0, 0]} fill='#38bdf8' />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className='p-5'>
          <SectionHeader
            title='Risk Distribution'
            subtitle='Students grouped by explainable placement probability.'
          />
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie data={pieData} dataKey='value' nameKey='name' innerRadius={62} outerRadius={94} paddingAngle={4}>
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<PredictionTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className='grid gap-2'>
            {pieData.map((item) => (
              <div key={item.name} className='flex items-center justify-between rounded-2xl border border-[var(--pf-border)] bg-white/60 px-3 py-2 text-sm dark:bg-white/[0.04]'>
                <span className='inline-flex items-center gap-2 text-[var(--pf-muted)]'>
                  <span className='h-2.5 w-2.5 rounded-full' style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className='font-semibold text-[var(--pf-text)]'>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className='grid gap-4 xl:grid-cols-3'>
        {[
          {
            icon: BrainCircuit,
            title: 'CatBoost tabular model',
            text: 'CatBoost, originally developed by Yandex, is suited for mixed placement data like branch, CGPA, attendance, backlogs, ATS score, and activity signals.',
          },
          {
            icon: ShieldCheck,
            title: 'Explainable fallback',
            text: 'If Python ML artifacts or the ML API are unavailable, Placify uses visible weighted scoring so the demo never fails during viva.',
          },
          {
            icon: Sparkles,
            title: 'Actionable output',
            text: 'Every prediction includes positive factors, blockers, missing skills, and next actions instead of a black-box score.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className='p-5'>
              <span className='grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200'>
                <Icon className='h-5 w-5' />
              </span>
              <h2 className='mt-4 text-base font-semibold text-[var(--pf-text)]'>{item.title}</h2>
              <p className='mt-2 text-sm leading-6 text-[var(--pf-muted)]'>{item.text}</p>
            </Card>
          );
        })}
      </section>

      <Card className='p-5'>
        <SectionHeader
          title='Prediction Queue'
          subtitle={`Model used: ${modelInfo?.activeModel || 'rules-fallback-v1'} · CatBoost status: ${modelInfo?.catBoost?.status || 'optional'}`}
        />
        {summary.total ? (
          <DataTable columns={tableColumns} rows={tableRows} emptyText='No prediction rows available.' />
        ) : (
          <div className='rounded-3xl border border-dashed border-[var(--pf-border)] bg-white/55 p-8 text-center dark:bg-white/[0.03]'>
            <Info className='mx-auto h-8 w-8 text-sky-500' />
            <h2 className='mt-3 text-base font-semibold text-[var(--pf-text)]'>Import student data to score predictions</h2>
            <p className='mt-1 text-sm text-[var(--pf-muted)]'>Upload CSV/XLSX or paste a public Google Sheet, then return here for placement probability and risk analysis.</p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
