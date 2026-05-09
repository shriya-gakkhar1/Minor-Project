import { useEffect, useMemo, useRef, useState } from 'react';
import { FilePenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { STUDENT_TRACK_STAGES } from '../lib/utils';
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
        .split(',')
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
      <SectionHeader
        title={`Hello, ${currentStudent?.name || 'Student'}`}
        subtitle='Track drives, apply quickly, and keep your placement pipeline moving forward.'
      />

      <div className='pf-stagger grid gap-4 sm:grid-cols-2'>
        <StatCard label='Applications' value={myApplications.length} helper='Total submitted forms' />
        <StatCard label='Ongoing Drives' value={ongoingDrives.length} helper='Open opportunities this cycle' />
      </div>

      <Card className='border-teal-100 bg-gradient-to-br from-teal-50 to-white'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Resume Upgrade</p>
            <h3 className='mt-1 text-lg font-semibold text-slate-900'>Resume Studio</h3>
            <p className='mt-1 text-sm text-slate-600'>Upload old resume, optimize for ATS, and download a modern version with one click.</p>
          </div>
          <Button onClick={() => navigate('/student/resume-studio')}>
            <FilePenLine className='h-4 w-4' />
            Open Resume Studio
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHeader title='Eligible Companies' subtitle='Only eligible drives are highlighted for quick action' />
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
    </PageContainer>
  );
}
