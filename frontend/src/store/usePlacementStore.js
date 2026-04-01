import { create } from 'zustand';
import { createApplication, listApplications, updateApplicationStatus } from '../services/applicationService';
import { getSession, loginAs } from '../services/authService';
import { createCompany, listCompanies } from '../services/companyService';
import { getDataMode, hydrateFromOnline } from '../services/dbService';
import { importMigrationData, normalizeMigrationRows } from '../services/migrationService';
import { setMode } from '../services/modeService';
import { listStudents, enrichStudentsWithPlacement } from '../services/studentService';

function buildViewState() {
  const auth = getSession();
  const students = listStudents();
  const companies = listCompanies();
  const applications = listApplications();

  const companyMap = new Map(companies.map((company) => [company.id, company]));
  const studentMap = new Map(students.map((student) => [student.id, student]));

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

  return {
    auth,
    role: auth.role,
    dataMode: getDataMode(),
    lastRefreshedAt: new Date().toISOString(),
    currentStudentId: auth.role === 'student' ? auth.userId : students[0]?.id || null,
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
    });
    get().refreshData();
  },

  runMigrationImportFromRows: (rows, source) => {
    const normalized = normalizeMigrationRows(rows || []);
    importMigrationData({
      students: normalized.students,
      companies: normalized.companies,
      applications: normalized.applications,
    });

    set({
      migrationPreviewRows: (rows || []).slice(0, 10),
      migrationSource: source || null,
      migrationErrors: normalized.errors,
    });
    get().refreshData();
    return normalized;
  },

  clearMigrationPreview: () => set({ migrationPreviewRows: [], migrationSource: null, migrationErrors: [] }),
}));
