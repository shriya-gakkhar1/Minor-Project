import { useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { STUDENT_TRACK_STAGES } from '../lib/utils';
import { usePlacementStore } from '../store/usePlacementStore';

export default function StudentDashboard() {
  const currentStudentId = usePlacementStore((state) => state.currentStudentId);
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applicationViews = usePlacementStore((state) => state.applicationViews);
  const applyToCompany = usePlacementStore((state) => state.applyToCompany);
  const [applyMessage, setApplyMessage] = useState('');

  const currentStudent = students.find((student) => student.id === currentStudentId);

  const myApplications = useMemo(
    () => applicationViews.filter((application) => application.studentId === currentStudentId),
    [applicationViews, currentStudentId],
  );

  const ongoingDrives = useMemo(() => {
    if (!currentStudent) return [];
    return companies.map((company) => {
      const branchMatch = company.branch === 'All' || company.branch.includes(currentStudent.branch);
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

  const handleApply = (companyId) => {
    const result = applyToCompany(companyId);
    setApplyMessage(result?.ok ? 'Application submitted successfully.' : result?.error || 'Unable to apply.');
    setTimeout(() => setApplyMessage(''), 2200);
  };

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title={`Hello, ${currentStudent?.name || 'Student'}`}
        subtitle='Track drives, apply instantly, and monitor your placement pipeline'
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        <StatCard label='Applications' value={myApplications.length} helper='Total submitted forms' />
        <StatCard label='Ongoing Drives' value={ongoingDrives.length} helper='Open opportunities this cycle' />
      </div>

      <Card>
        <SectionHeader title='Eligible Companies' subtitle='Only eligible drives are highlighted for quick action' />
        {applyMessage ? <p className='mb-2 text-sm text-indigo-700'>{applyMessage}</p> : null}
        <div className='grid gap-3 md:grid-cols-2'>
          {eligibleCompanies.map((drive) => (
            <div key={drive.id} className='rounded-xl border border-slate-200 p-4'>
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
          <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3'>
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
                <span className='rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700'>{application.status}</span>
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
                  index <= currentStepIndex ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
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
