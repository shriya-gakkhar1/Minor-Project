import { loadDb, makeId, saveDb } from './dbService';

function normalizeCompany(payload) {
  const requiredSkills = String(payload.requiredSkills || payload.skills || '')
    .split(/[,;|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
  const preferredSkills = String(payload.preferredSkills || '')
    .split(/[,;|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
  const preferredCertifications = String(payload.preferredCertifications || '')
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const preferredTechnologies = String(payload.preferredTechnologies || '')
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: payload.id || makeId('cmp'),
    name: String(payload.name || '').trim(),
    company: String(payload.name || '').trim(),
    role: String(payload.role || '').trim(),
    description: String(payload.description || '').trim(),
    package: Number(payload.package || payload.packageLpa || 0),
    packageLpa: Number(payload.package || payload.packageLpa || 0),
    eligibility: Number(payload.eligibility || payload.minCgpa || 0),
    minCgpa: Number(payload.eligibility || payload.minCgpa || 0),
    minAttendance: Number(payload.minAttendance || 75),
    maxBacklogs: Number(payload.maxBacklogs || 0),
    deadline: payload.deadline || '',
    branch: payload.branch || payload.eligibleBranches || 'All',
    eligibleBranches: payload.eligibleBranches || payload.branch || 'All',
    requiredSkills,
    preferredSkills,
    preferredCertifications,
    preferredTechnologies,
    internshipPreference: payload.internshipPreference || 'Preferred',
    status: payload.status || 'Open',
  };
}

export function listCompanies() {
  return loadDb().companies;
}

export function getCompanyById(companyId) {
  return loadDb().companies.find((item) => item.id === companyId) || null;
}

export function createCompany(payload) {
  const db = loadDb();
  const company = normalizeCompany(payload);

  if (!company.name || !company.role) {
    return { ok: false, error: 'Company name and role are required.' };
  }

  const duplicate = db.companies.some(
    (item) => item.name.toLowerCase() === company.name.toLowerCase() && item.role.toLowerCase() === company.role.toLowerCase(),
  );
  if (duplicate) {
    return { ok: false, error: 'Company with same role already exists.' };
  }

  const nextDb = saveDb({ ...db, companies: [company, ...db.companies] });
  return { ok: true, data: nextDb.companies };
}
