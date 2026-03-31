const DB_KEY = 'placeflow-db-v1';

const seedData = {
  auth: {
    role: 'guest',
    userId: null,
    name: null,
    email: null,
  },
  students: [
    { id: 'stu_01', name: 'Aarav Sharma', email: 'aarav@college.edu', cgpa: 8.7, branch: 'CSE' },
    { id: 'stu_02', name: 'Diya Patel', email: 'diya@college.edu', cgpa: 9.1, branch: 'IT' },
    { id: 'stu_03', name: 'Rohan Mehta', email: 'rohan@college.edu', cgpa: 7.9, branch: 'ECE' },
    { id: 'stu_04', name: 'Ananya Singh', email: 'ananya@college.edu', cgpa: 8.4, branch: 'CSE' },
    { id: 'stu_05', name: 'Ishaan Gupta', email: 'ishaan@college.edu', cgpa: 7.5, branch: 'ME' },
    { id: 'stu_06', name: 'Kavya Nair', email: 'kavya@college.edu', cgpa: 8.9, branch: 'IT' },
  ],
  companies: [
    { id: 'cmp_01', name: 'Bytewave', role: 'SDE Intern', package: 10, eligibility: 7.5, deadline: '2026-04-16', branch: 'CSE/IT' },
    { id: 'cmp_02', name: 'Nexora', role: 'Analyst', package: 8, eligibility: 7, deadline: '2026-04-21', branch: 'All' },
    { id: 'cmp_03', name: 'Cloudnest', role: 'Platform Engineer', package: 12, eligibility: 8, deadline: '2026-04-18', branch: 'CSE/IT/ECE' },
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

export function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return clone(seedData);

  try {
    const parsed = JSON.parse(raw);
    return {
      auth: parsed.auth || clone(seedData.auth),
      students: Array.isArray(parsed.students) ? parsed.students : clone(seedData.students),
      companies: Array.isArray(parsed.companies) ? parsed.companies : clone(seedData.companies),
      applications: Array.isArray(parsed.applications) ? parsed.applications : clone(seedData.applications),
    };
  } catch {
    return clone(seedData);
  }
}

export function saveDb(nextState) {
  localStorage.setItem(DB_KEY, JSON.stringify(nextState));
  return clone(nextState);
}

export function resetDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(seedData));
  return clone(seedData);
}

export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
