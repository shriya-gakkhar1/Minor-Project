import { create } from 'zustand';
import { createApplication, listApplications, updateApplicationStatus } from '../services/applicationService';
import { getSession, loginAs } from '../services/authService';
import { createCompany, deleteCompany, duplicateCompany, listCompanies, updateCompany } from '../services/companyService';
import { getDataMode, hydrateFromOnline, loadDb, saveDb } from '../services/dbService';
import { importMigrationData, normalizeMigrationRows } from '../services/migrationService';
import { setMode } from '../services/modeService';
import { listStudents, enrichStudentsWithPlacement, updateStudentProfile as persistStudentProfile } from '../services/studentService';

function sanitizeRecords(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item && typeof item === 'object');
}

function buildViewState() {
  const rawAuth = getSession();
  const auth = rawAuth && typeof rawAuth === 'object'
    ? rawAuth
    : { role: 'guest', userId: null, name: null, email: null };
  const students = sanitizeRecords(listStudents());
  const companies = sanitizeRecords(listCompanies());
  const applications = sanitizeRecords(listApplications());

  const companyMap = new Map(companies.map((company) => [company.id, company]).filter(([id]) => Boolean(id)));
  const studentMap = new Map(students.map((student) => [student.id, student]).filter(([id]) => Boolean(id)));

  const studentPlacementRows = enrichStudentsWithPlacement(students, applications, companies);

  const applicationViews = applications.map((application) => {
    const company = companyMap.get(application.companyId);
    const student = studentMap.get(application.studentId);
    return {
      ...application,
      companyName: company?.name || 'Unknown Company',
      role: company?.role || 'Role not found',
      studentName: student?.name || 'Unknown Student',
    };
  });

  const activeStudentId = auth.role === 'student'
    ? students.find((student) => student.id === auth.userId)?.id ||
      students.find((student) => String(student.email || '').toLowerCase() === String(auth.email || '').toLowerCase())?.id ||
      students[0]?.id ||
      auth.userId ||
      null
    : students[0]?.id || null;

  return {
    auth,
    role: auth.role,
    dataMode: getDataMode(),
    lastRefreshedAt: new Date().toISOString(),
    currentStudentId: activeStudentId,
    students,
    companies,
    applications,
    studentPlacementRows,
    applicationViews,
  };
}

export const usePlacementStore = create((set, get) => ({
  ...buildViewState(),
  selectedCompanyFilter: 'all',
  migrationPreviewRows: [],
  migrationSource: null,
  migrationErrors: [],
  migrationStats: null,
  campusPrediction: null,
  studentPrediction: null,
  studentSkillSuggestions: [],

  refreshData: () => {
    set((state) => ({ ...state, ...buildViewState(), lastRefreshedAt: new Date().toISOString() }));
  },

  hydrateOnlineMode: async () => {
    await hydrateFromOnline();
    get().refreshData();
  },

  setDataMode: async (mode) => {
    const nextMode = setMode(mode);
    if (nextMode === 'online') {
      await get().hydrateOnlineMode();
    }
    get().refreshData();
  },

  loginAsRole: (role) => {
    loginAs(role);
    get().refreshData();
  },

  triggerRealtimeRefresh: async () => {
    if (get().dataMode === 'online') {
      await get().hydrateOnlineMode();
    } else {
      get().refreshData();
    }
  },

  setSelectedCompanyFilter: (selectedCompanyFilter) => set({ selectedCompanyFilter }),

  addCompany: (payload) => {
    const result = createCompany(payload);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  updateCompany: (companyId, payload) => {
    const result = updateCompany(companyId, payload);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  deleteCompany: (companyId) => {
    const result = deleteCompany(companyId);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  duplicateCompany: (companyId) => {
    const result = duplicateCompany(companyId);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  applyToCompany: (companyId) => {
    const state = get();
    if (!state.currentStudentId) {
      return { ok: false, error: 'No student selected in session.' };
    }

    const result = createApplication(state.currentStudentId, companyId);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  updateApplicationStatus: (applicationId, nextStatus) => {
    const state = get();
    const result = updateApplicationStatus(applicationId, nextStatus, state.role);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  updateStudentProfile: (studentId, updates) => {
    const result = persistStudentProfile(studentId, updates);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  updateCurrentStudentProfile: (updates) => {
    const state = get();
    if (!state.currentStudentId) {
      return { ok: false, error: 'No student selected in session.' };
    }

    const result = persistStudentProfile(state.currentStudentId, updates);
    if (result.ok) {
      get().refreshData();
    }
    return result;
  },

  importMigrationData: ({ students, companies, previewRows, source }) => {
    const normalized = normalizeMigrationRows(
      (previewRows || []).length ? previewRows : students.map((student) => ({ ...student })),
    );

    importMigrationData({
      students: (students || []).length ? students : normalized.students,
      companies: (companies || []).length ? companies : normalized.companies,
      applications: normalized.applications,
    });

    set({
      migrationPreviewRows: previewRows || [],
      migrationSource: source || null,
      migrationErrors: normalized.errors || [],
      migrationStats: {
        totalRows: (previewRows || []).length || normalized.students.length,
        students: ((students || []).length ? students : normalized.students).length,
        companies: ((companies || []).length ? companies : normalized.companies).length,
        applications: normalized.applications.length,
        duplicates: normalized.duplicateCount || 0,
        committedAt: new Date().toISOString(),
      },
    });
    get().refreshData();
  },

  runMigrationImportFromRows: (rows, source, mode = 'replace') => {
    const normalized = normalizeMigrationRows(rows || []);
    importMigrationData({
      students: normalized.students,
      companies: normalized.companies,
      applications: normalized.applications,
      mode,
    });

    set({
      migrationPreviewRows: rows || [],
      migrationSource: source || null,
      migrationErrors: normalized.errors,
      migrationStats: {
        totalRows: (rows || []).length,
        students: normalized.students.length,
        companies: normalized.companies.length,
        applications: normalized.applications.length,
        duplicates: normalized.duplicateCount || 0,
        committedAt: new Date().toISOString(),
      },
    });
    get().refreshData();
    return normalized;
  },

  resetPlacementData: () => {
    const db = loadDb();
    saveDb({
      ...db,
      students: [],
      companies: [],
      applications: [],
    });
    set({
      migrationPreviewRows: [],
      migrationSource: null,
      migrationErrors: [],
      migrationStats: null,
      campusPrediction: null,
      studentPrediction: null,
      studentSkillSuggestions: [],
    });
    get().refreshData();
  },

  setCampusPrediction: (campusPrediction) => set({ campusPrediction }),

  setStudentPredictionResult: (studentPrediction, studentSkillSuggestions = []) =>
    set({ studentPrediction, studentSkillSuggestions }),

  clearPredictionResults: () => set({
    campusPrediction: null,
    studentPrediction: null,
    studentSkillSuggestions: [],
  }),

  clearMigrationPreview: () => set({ migrationPreviewRows: [], migrationSource: null, migrationErrors: [], migrationStats: null }),
}));
