import { getMode, isOnlineMode } from './modeService';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseService';

const DB_KEY = 'placeflow-db-v1';
const SUPABASE_STATE_ID = 'global';

const seedData = {
  auth: {
    role: 'guest',
    userId: null,
    name: null,
    email: null,
  },
  students: [
    { id: 'stu_01', name: 'Aarav Sharma', email: 'aarav@college.edu', enrollment: 'JU20251001', cgpa: 8.7, attendance: 88, activeBacklogs: 0, branch: 'CSE', skills: ['DSA', 'React', 'Node.js', 'SQL'], projects: 3, internships: 1, resumeUploaded: true, resumeScore: 82, atsScore: 82, aptitudeScore: 76, communicationScore: 72, status: 'Interview' },
    { id: 'stu_02', name: 'Diya Patel', email: 'diya@college.edu', enrollment: 'JU20251002', cgpa: 9.1, attendance: 91, activeBacklogs: 0, branch: 'IT', skills: ['Python', 'SQL', 'Machine Learning', 'Cloud'], projects: 4, internships: 2, resumeUploaded: true, resumeScore: 88, atsScore: 88, aptitudeScore: 82, communicationScore: 80, status: 'Selected' },
    { id: 'stu_03', name: 'Rohan Mehta', email: 'rohan@college.edu', enrollment: 'JU20251003', cgpa: 7.9, attendance: 79, activeBacklogs: 0, branch: 'ECE', skills: ['C', 'Python', 'Embedded Systems'], projects: 2, internships: 1, resumeUploaded: true, resumeScore: 72, atsScore: 72, aptitudeScore: 68, communicationScore: 62, status: 'Applied' },
    { id: 'stu_04', name: 'Ananya Singh', email: 'ananya@college.edu', enrollment: 'JU20251004', cgpa: 8.4, attendance: 84, activeBacklogs: 0, branch: 'CSE', skills: ['JavaScript', 'React', 'DBMS', 'Communication'], projects: 3, internships: 1, resumeUploaded: true, resumeScore: 79, atsScore: 79, aptitudeScore: 73, communicationScore: 78, status: 'Applied' },
    { id: 'stu_05', name: 'Ishaan Gupta', email: 'ishaan@college.edu', enrollment: 'JU20251005', cgpa: 7.5, attendance: 69, activeBacklogs: 1, branch: 'ME', skills: ['Excel', 'Problem Solving'], projects: 1, internships: 0, resumeUploaded: true, resumeScore: 58, atsScore: 58, aptitudeScore: 54, communicationScore: 57, status: 'Unassigned' },
    { id: 'stu_06', name: 'Kavya Nair', email: 'kavya@college.edu', enrollment: 'JU20251006', cgpa: 8.9, attendance: 92, activeBacklogs: 0, branch: 'IT', skills: ['DSA', 'React', 'Cloud', 'Docker'], projects: 4, internships: 2, resumeUploaded: true, resumeScore: 86, atsScore: 86, aptitudeScore: 80, communicationScore: 77, status: 'Applied' },
  ],
  companies: [
    { id: 'cmp_01', name: 'Microsoft', role: 'SWE Intern', description: 'Software engineering internship focused on product systems, data structures, and reliable services.', package: 18, eligibility: 8, deadline: '2026-04-16', branch: 'CSE,IT', requiredSkills: ['DSA', 'React', 'DBMS', 'Git'], preferredSkills: ['Docker', 'AWS'], preferredCertifications: ['AWS'], preferredTechnologies: ['Docker', 'PostgreSQL'], internshipPreference: 'Preferred', status: 'Open' },
    { id: 'cmp_02', name: 'Nexora', role: 'Data Analyst', description: 'Analytics role focused on dashboards, SQL, and business insights.', package: 8, eligibility: 7, deadline: '2026-04-21', branch: 'All', requiredSkills: ['SQL', 'Excel', 'Communication'], preferredSkills: ['Python', 'Power BI'], preferredCertifications: ['Google Data Analytics'], preferredTechnologies: ['Power BI'], internshipPreference: 'Not Required', status: 'Screening' },
    { id: 'cmp_03', name: 'Cloudnest', role: 'Platform Engineer', description: 'Cloud platform role for distributed systems and deployment workflows.', package: 12, eligibility: 8, deadline: '2026-04-18', branch: 'CSE,IT,ECE', requiredSkills: ['Cloud', 'Docker', 'DSA'], preferredSkills: ['Node.js', 'Linux'], preferredCertifications: ['AWS', 'Azure'], preferredTechnologies: ['Kubernetes', 'Linux'], internshipPreference: 'Preferred', status: 'Open' },
  ],
  applications: [
    { id: 'app_01', studentId: 'stu_01', companyId: 'cmp_01', status: 'Interview', createdAt: '2026-03-10T11:30:00.000Z' },
    { id: 'app_02', studentId: 'stu_01', companyId: 'cmp_02', status: 'Applied', createdAt: '2026-03-12T09:10:00.000Z' },
    { id: 'app_03', studentId: 'stu_02', companyId: 'cmp_02', status: 'Selected', createdAt: '2026-03-14T15:40:00.000Z' },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage() {
  try {
    return localStorage.getItem(DB_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value) {
  try {
    localStorage.setItem(DB_KEY, value);
  } catch {
    // Keep app functional when storage is unavailable.
  }
}

export function loadDb() {
  const raw = readStorage();
  if (!raw) return clone(seedData);

  try {
    const parsed = JSON.parse(raw);
    return {
      auth: parsed.auth || clone(seedData.auth),
      students: Array.isArray(parsed.students) ? parsed.students : clone(seedData.students),
      companies: Array.isArray(parsed.companies) ? parsed.companies : clone(seedData.companies),
      applications: Array.isArray(parsed.applications) ? parsed.applications : clone(seedData.applications),
      demoStudents: Array.isArray(parsed.demoStudents) ? parsed.demoStudents : [],
    };
  } catch {
    return clone(seedData);
  }
}

export function saveDb(nextState) {
  writeStorage(JSON.stringify(nextState));
  if (isOnlineMode()) {
    void pushStateToSupabase(nextState);
  }
  return clone(nextState);
}

export function resetDb() {
  writeStorage(JSON.stringify(seedData));
  return clone(seedData);
}

export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getDataMode() {
  return getMode();
}

export async function hydrateFromOnline() {
  if (!isOnlineMode() || !isSupabaseConfigured()) return loadDb();
  const supabase = getSupabaseClient();
  if (!supabase) return loadDb();

  try {
    const { data, error } = await supabase
      .from('placeflow_state')
      .select('payload')
      .eq('id', SUPABASE_STATE_ID)
      .single();

    if (error || !data?.payload) {
      return loadDb();
    }

    const next = {
      auth: data.payload.auth || clone(seedData.auth),
      students: Array.isArray(data.payload.students) ? data.payload.students : clone(seedData.students),
      companies: Array.isArray(data.payload.companies) ? data.payload.companies : clone(seedData.companies),
      applications: Array.isArray(data.payload.applications) ? data.payload.applications : clone(seedData.applications),
      demoStudents: Array.isArray(data.payload.demoStudents) ? data.payload.demoStudents : [],
    };

    writeStorage(JSON.stringify(next));
    return clone(next);
  } catch {
    return loadDb();
  }
}

export async function pushStateToSupabase(state) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('placeflow_state').upsert({
      id: SUPABASE_STATE_ID,
      payload: state,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Keep offline behavior intact if sync fails.
  }
}
