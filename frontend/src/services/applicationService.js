import { getCompanyById } from './companyService';
import { loadDb, makeId, saveDb } from './dbService';
import { getStudentById } from './studentService';
import { assertValidTransition } from './workflowService';

export function listApplications() {
  return loadDb().applications;
}

function isEligible(student, company) {
  if (!student || !company) return false;
  const cgpaOk = Number(student.cgpa) >= Number(company.eligibility || 0);
  const branchText = String(company.branch || 'All');
  const branchOk = branchText === 'All' || branchText.toLowerCase().includes(String(student.branch || '').toLowerCase());
  return cgpaOk && branchOk;
}

export function createApplication(studentId, companyId) {
  const db = loadDb();
  const student = getStudentById(studentId);
  const company = getCompanyById(companyId);

  if (!student || !company) {
    return { ok: false, error: 'Student or company not found.' };
  }

  if (!isEligible(student, company)) {
    return { ok: false, error: 'Student is not eligible for this company.' };
  }

  const duplicate = db.applications.some(
    (application) => application.studentId === studentId && application.companyId === companyId,
  );
  if (duplicate) {
    return { ok: false, error: 'Application already exists for this student and company.' };
  }

  const application = {
    id: makeId('app'),
    studentId,
    companyId,
    status: 'Applied',
    createdAt: new Date().toISOString(),
  };

  const nextDb = saveDb({ ...db, applications: [application, ...db.applications] });
  return { ok: true, data: nextDb.applications };
}

export function updateApplicationStatus(applicationId, nextStatus, actorRole = 'admin') {
  if (actorRole !== 'admin') {
    return { ok: false, error: 'Only admin can update application status.' };
  }

  const db = loadDb();
  const target = db.applications.find((item) => item.id === applicationId);
  if (!target) {
    return { ok: false, error: 'Application not found.' };
  }

  const validation = assertValidTransition(target.status, nextStatus);
  if (!validation.ok) {
    return validation;
  }

  const nextApplications = db.applications.map((item) =>
    item.id === applicationId ? { ...item, status: nextStatus } : item,
  );

  const nextDb = saveDb({ ...db, applications: nextApplications });
  return { ok: true, data: nextDb.applications };
}

export function listApplicationsByStudent(studentId) {
  return loadDb().applications.filter((item) => item.studentId === studentId);
}
