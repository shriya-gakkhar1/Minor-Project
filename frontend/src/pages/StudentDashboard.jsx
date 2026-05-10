import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BrainCircuit, FilePenLine, Gauge, MessagesSquare, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { STUDENT_TRACK_STAGES } from '../lib/utils';
import { calculateJobMatch, calculateRiskProfile, inferStudentProfile } from '../services/jobMatchService';
import { usePlacementStore } from '../store/usePlacementStore';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const currentStudentId = usePlacementStore((state) => state.currentStudentId);
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applicationViews = usePlacementStore((state) => state.applicationViews);
  const applyToCompany = usePlacementStore((state) => state.applyToCompany);
  const [applyMessage, setApplyMessage] = useState('');
  const messageTimerRef = useRef(null);

  const currentStudent = students.find((student) => student.id === currentStudentId);

  const myApplications = useMemo(
    () => applicationViews.filter((application) => application.studentId === currentStudentId),
    [applicationViews, currentStudentId],
  );

  const ongoingDrives = useMemo(() => {
    if (!currentStudent) return [];
    return companies.map((company) => {
      const branchValue = String(company.branch || 'All');
      const normalizedBranches = branchValue
        .split(/[,/|]/)
        .map((value) => value.trim())
        .filter(Boolean);
      const branchMatch = branchValue === 'All' || normalizedBranches.includes(currentStudent.branch);
      const cgpaMatch = currentStudent.cgpa >= Number(company.eligibility || 0);
      const hasApplied = myApplications.some((application) => application.companyId === company.id);
      return {
        ...company,
        eligible: branchMatch && cgpaMatch,
        hasApplied,
      };
    });
  }, [companies, currentStudent, myApplications]);

  const highlightedApplication = myApplications[0];
  const statusToStepIndex = {
    Applied: 0,
    Shortlisted: 1,
    Interview: 1,
    Selected: 3,
    Rejected: 0,
  };
  const currentStepIndex = statusToStepIndex[highlightedApplication?.status] ?? 0;

  const eligibleCompanies = ongoingDrives.filter((drive) => drive.eligible);
  const ineligibleCompanies = ongoingDrives.filter((drive) => !drive.eligible);
  const profile = inferStudentProfile(currentStudent);
  const risk = calculateRiskProfile(currentStudent, companies);
  const matchedDrives = ongoingDrives
    .map((drive) => ({ ...drive, match: calculateJobMatch(currentStudent, drive) }))
    .sort((a, b) => b.match.matchScore - a.match.matchScore);
  const bestMatch = matchedDrives[0]?.match;
  const readinessScore = bestMatch?.readinessScore || Math.round((profile.resumeScore * 0.35) + (risk.bestMatch * 0.45) + Math.min(20, profile.projects * 5));
  const topSuggestions = bestMatch?.suggestedImprovements?.slice(0, 4) || [];

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const handleApply = (companyId) => {
    const result = applyToCompany(companyId);
    setApplyMessage(result?.ok ? 'Application submitted successfully.' : result?.error || 'Unable to apply.');
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setApplyMessage(''), 2200);
  };

  if (!currentStudent) {
    return (
      <PageContainer>
        <Card>
          <SectionHeader title='Student Workspace' subtitle='No active student session was found.' />
          <p className='text-sm text-slate-600'>Sign in again as a student to access personalized company and application data.</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='space-y-6'>
      <section className='overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]'>
        <div className='grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-7'>
          <div>
            <span className='inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100'>
              <Sparkles className='h-3.5 w-3.5' />
              Your AI placement coach
            </span>
            <h1 className='mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl'>
              Hi {currentStudent?.name || 'Student'}, let’s improve your next shortlist.
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-400'>
              Placify AI compares your profile with active roles, explains why scores change, and turns weak signals into weekly actions.
            </p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <Button onClick={() => navigate('/student/resume')}>
                <FilePenLine className='h-4 w-4' />
                Improve Resume
              </Button>
              <Button variant='secondary' onClick={() => navigate('/student/mock-interview')}>
                <MessagesSquare className='h-4 w-4' />
                Practice Interview
              </Button>
            </div>
          </div>

          <div className='rounded-3xl border border-white/10 bg-white/[0.045] p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Placement readiness</p>
                <p className='mt-2 text-5xl font-bold text-white'>{readinessScore}%</p>
              </div>
              <div className='relative grid h-28 w-28 place-items-center rounded-full border border-teal-300/30 bg-teal-300/10'>
                <Gauge className='h-10 w-10 text-teal-100' />
              </div>
            </div>
            <div className='mt-5 grid grid-cols-3 gap-2'>
              <PulseMetric label='Shortlist' value={`${bestMatch?.shortlistedProbability || 0}%`} />
              <PulseMetric label='Placement' value={`${bestMatch?.placementProbability || 0}%`} />
              <PulseMetric label='Confidence' value={`${bestMatch?.confidence || 0}%`} />
            </div>
          </div>
        </div>
      </section>

      <div className='pf-stagger grid gap-4 md:grid-cols-4'>
        <StatCard label='Applications' value={myApplications.length} helper='Total submitted forms' icon={<Activity className='h-4 w-4' />} />
        <StatCard label='Active Roles' value={ongoingDrives.length} helper='Open opportunities this cycle' icon={<Target className='h-4 w-4' />} />
        <StatCard label='Best Match' value={`${bestMatch?.matchScore || risk.bestMatch}%`} helper={bestMatch?.job?.companyName || 'No active role'} icon={<TrendingUp className='h-4 w-4' />} />
        <StatCard label='Risk Level' value={risk.level} helper={risk.factors.slice(0, 2).join(', ')} icon={<Gauge className='h-4 w-4' />} />
      </div>

      {bestMatch ? (
        <section className='grid gap-4 xl:grid-cols-[1.15fr_0.85fr]'>
          <Card>
            <SectionHeader
              title={`${bestMatch.job.companyName} Match Breakdown`}
              subtitle={`${bestMatch.job.roleName} | Model: ${bestMatch.modelUsed} | Confidence ${bestMatch.confidence}%`}
            />
            <div className='space-y-3'>
              {Object.entries(bestMatch.breakdown).map(([key, item]) => (
                <BreakdownBar key={key} label={item.label} value={item.score} note={item.score >= 78 ? item.positive : item.reason} />
              ))}
            </div>
          </Card>

          <Card className='border-teal-300/20 bg-gradient-to-br from-teal-300/10 to-sky-400/10'>
            <SectionHeader title='Why This Prediction?' subtitle='Transparent factors behind your score.' />
            <div className='space-y-3'>
              {(bestMatch.strengths.length ? bestMatch.strengths : ['Your profile has enough baseline data for prediction.']).slice(0, 3).map((item) => (
                <InsightLine key={item} tone='good' text={item} />
              ))}
              {(bestMatch.weakAreas.length ? bestMatch.weakAreas : ['No major weakness detected for this role.']).slice(0, 3).map((item) => (
                <InsightLine key={item} tone='weak' text={item} />
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      <Card>
        <SectionHeader title='Improvement Suggestions' subtitle='Prioritized actions to raise shortlist and selection probability.' />
        <div className='grid gap-3 lg:grid-cols-4'>
          {(topSuggestions.length ? topSuggestions : [
            'Upload or improve your resume to unlock stronger ATS signals.',
            'Add role-specific projects with measurable outcomes.',
            'Practice mock interviews to improve communication and confidence.',
            'Apply to roles where your branch, CGPA, and skills are aligned.',
          ]).map((item, index) => (
            <div key={item} className='rounded-2xl border border-white/10 bg-slate-950/50 p-4'>
              <p className='text-xs font-semibold text-teal-200'>0{index + 1}</p>
              <p className='mt-2 text-sm leading-6 text-slate-300'>{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title='Role Match Cards' subtitle='Each card shows match score, hiring probability, missing skills, and the reason behind the prediction.' />
        <div className='grid gap-3 lg:grid-cols-3'>
          {matchedDrives.slice(0, 6).map((drive) => (
            <div key={drive.id} className='rounded-2xl border border-white/10 bg-slate-950/50 p-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='font-semibold text-white'>{drive.name}</p>
                  <p className='text-xs text-slate-500'>{drive.role} | {drive.package} LPA</p>
                </div>
                <span className='rounded-full border border-teal-300/20 bg-teal-300/10 px-2 py-1 text-xs font-semibold text-teal-100'>
                  {drive.match.matchScore}%
                </span>
              </div>
              <div className='mt-3 h-2 rounded-full bg-white/10'>
                <div className='h-2 rounded-full bg-teal-300' style={{ width: `${drive.match.matchScore}%` }} />
              </div>
              <div className='mt-3 space-y-2 text-xs text-slate-400'>
                <p className='flex items-center gap-2'><Gauge className='h-3.5 w-3.5 text-teal-200' />Hiring probability {drive.match.hiringProbability}%</p>
                <p className='flex items-center gap-2'><BrainCircuit className='h-3.5 w-3.5 text-sky-200' />Shortlist probability {drive.match.shortlistedProbability}%</p>
                <p className='flex items-center gap-2'><Target className='h-3.5 w-3.5 text-amber-200' />{drive.match.missingSkills.slice(0, 2).join(', ') || 'No critical missing skills'}</p>
              </div>
              <Button
                size='sm'
                className='mt-4 w-full'
                onClick={() => handleApply(drive.id)}
                disabled={!drive.eligible || drive.hasApplied}
              >
                {drive.hasApplied ? 'Applied' : drive.eligible ? 'Apply' : 'Not Eligible'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title='Active Opportunities' subtitle='Quick application list filtered by branch and CGPA eligibility.' />
        {applyMessage ? <p className='mb-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700'>{applyMessage}</p> : null}
        <div className='grid gap-3 md:grid-cols-2'>
          {eligibleCompanies.map((drive) => (
            <div key={drive.id} className='rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-200'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>{drive.name}</p>
                  <p className='text-xs text-slate-500'>{drive.role}</p>
                </div>
                <span className='rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600'>{drive.package} LPA</span>
              </div>

              <p className='mt-2 text-xs text-slate-500'>
                Eligibility: CGPA {drive.eligibility}+ | Branch: {drive.branch}
              </p>

              <div className='mt-3'>
                <Button
                  size='sm'
                  onClick={() => handleApply(drive.id)}
                  disabled={!drive.eligible || drive.hasApplied}
                >
                  {drive.hasApplied ? 'Applied' : drive.eligible ? 'Apply' : 'Not Eligible'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {ineligibleCompanies.length > 0 ? (
          <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50/90 p-3'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Not eligible now</p>
            <div className='flex flex-wrap gap-2'>
              {ineligibleCompanies.map((company) => (
                <span key={company.id} className='rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-500'>
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <SectionHeader title='My Applications' subtitle='Live statuses across each company pipeline' />
        {myApplications.length > 0 ? (
          <div className='space-y-2'>
            {myApplications.map((application) => (
              <div key={application.id} className='flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2'>
                <div>
                  <p className='text-sm font-medium text-slate-900'>{application.companyName}</p>
                  <p className='text-xs text-slate-500'>{application.role}</p>
                </div>
                <span className='rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700'>{application.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-slate-500'>No applications yet. Start with an ongoing drive.</p>
        )}
      </Card>

      <Card>
        <SectionHeader title='Status Tracker' subtitle='Applied -> Interview -> HR -> Selected' />
        <div className='flex flex-wrap items-center gap-2 md:gap-4'>
          {STUDENT_TRACK_STAGES.map((stage, index) => (
            <div key={stage} className='flex items-center gap-2'>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  index <= currentStepIndex ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {stage}
              </div>
              {index < STUDENT_TRACK_STAGES.length - 1 ? <div className='h-px w-6 bg-slate-300' /> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title='Interview Preparation' subtitle='Practice with an AI interviewer before company rounds.' />
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='max-w-2xl text-sm leading-6 text-slate-400'>
            Generate role-specific HR, technical, resume, behavioral, and project questions from your profile and target role.
          </p>
          <Button onClick={() => navigate('/student/mock-interview')}>
            <BrainCircuit className='h-4 w-4' />
            Start Mock Interview
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}

function PulseMetric({ label, value }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-slate-950/60 p-3'>
      <p className='text-xs text-slate-500'>{label}</p>
      <p className='mt-1 text-xl font-semibold text-white'>{value}</p>
    </div>
  );
}

function BreakdownBar({ label, value, note }) {
  const tone = value >= 78 ? 'bg-emerald-300' : value >= 62 ? 'bg-amber-300' : 'bg-rose-300';
  return (
    <div className='rounded-2xl border border-white/10 bg-slate-950/50 p-3'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <p className='text-sm font-semibold text-white'>{label}</p>
        <span className='text-sm font-semibold text-slate-300'>{value}%</span>
      </div>
      <div className='h-2 rounded-full bg-white/10'>
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <p className='mt-2 text-xs leading-5 text-slate-500'>{note}</p>
    </div>
  );
}

function InsightLine({ tone, text }) {
  const classes = tone === 'good'
    ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
    : 'border-amber-300/20 bg-amber-300/10 text-amber-100';
  return <p className={`rounded-2xl border px-3 py-2 text-sm leading-6 ${classes}`}>{text}</p>;
}
