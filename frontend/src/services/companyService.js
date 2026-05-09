import { loadDb, makeId, saveDb } from './dbService';

function normalizeCompany(payload) {
  return {
    id: payload.id || makeId('cmp'),
    name: String(payload.name || '').trim(),
    role: String(payload.role || '').trim(),
    package: Number(payload.package || 0),
    eligibility: Number(payload.eligibility || 0),
    deadline: payload.deadline || '',
    branch: payload.branch || 'All',
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
