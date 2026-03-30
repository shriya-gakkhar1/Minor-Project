import { randomId } from './utils';

function getValue(row, keys, fallback = '') {
  const lowerMap = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase().trim()] = row[key];
    return acc;
  }, {});

  for (const key of keys) {
    const value = lowerMap[key.toLowerCase()];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return fallback;
}

export function normalizeMigrationRows(rows = []) {
  const students = rows
    .map((row) => {
      const name = getValue(row, ['name', 'student name', 'full name']);
      if (!name) return null;
      return {
        id: randomId('stu'),
        name,
        cgpa: Number(getValue(row, ['cgpa', 'gpa'], 0)),
        branch: getValue(row, ['branch', 'department'], 'Unknown'),
        status: getValue(row, ['status', 'application status'], 'Applied'),
        company: getValue(row, ['company', 'company name'], 'Unassigned'),
      };
    })
    .filter(Boolean);

  const companyMap = new Map();
  rows.forEach((row) => {
    const companyName = getValue(row, ['company', 'company name']);
    if (!companyName) return;
    if (companyMap.has(companyName)) return;

    companyMap.set(companyName, {
      id: randomId('cmp'),
      name: companyName,
      role: getValue(row, ['role', 'job role'], 'General Role'),
      package: Number(getValue(row, ['package', 'ctc'], 0)),
      eligibility: Number(getValue(row, ['eligibility', 'cgpa eligibility'], 0)),
      branch: getValue(row, ['branch', 'eligible branch'], 'All'),
      deadline: getValue(row, ['deadline', 'last date'], ''),
    });
  });

  return {
    students,
    companies: Array.from(companyMap.values()),
  };
}

export function mockParseGoogleSheet(url) {
  const sheetName = url.includes('docs.google.com') ? 'Google Sheet' : 'Shared Data Source';

  const rows = [
    {
      name: 'Neha Khanna',
      cgpa: 8.5,
      branch: 'IT',
      status: 'Shortlisted',
      company: 'NovaSys',
      role: 'Data Analyst',
      package: 7.5,
      eligibility: 7,
      deadline: '2026-04-25',
    },
    {
      name: 'Rahul Verma',
      cgpa: 9.0,
      branch: 'CSE',
      status: 'Applied',
      company: 'PixelCraft',
      role: 'Frontend Engineer',
      package: 9,
      eligibility: 7.5,
      deadline: '2026-04-24',
    },
  ];

  return {
    sourceName: sheetName,
    rows,
  };
}
