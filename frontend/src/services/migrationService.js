import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { loadDb, makeId, saveDb } from './dbService';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_ALIASES = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  shortlisting: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  hired: 'Selected',
  rejected: 'Rejected',
  notselected: 'Rejected',
  unplaced: 'Applied',
  notplaced: 'Applied',
  placed: 'Selected',
  offered: 'Selected',
  offer: 'Selected',
  eligible: 'Shortlisted',
};

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractSheetMeta(url) {
  const text = normalizeText(url);
  const idMatch = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = text.match(/[?#&]gid=([0-9]+)/);

  return {
    spreadsheetId: idMatch ? idMatch[1] : null,
    gid: gidMatch ? gidMatch[1] : '0',
  };
}

function parseCsvText(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    const message = parsed.errors[0]?.message || 'Unable to parse CSV from sheet link.';
    throw new Error(message);
  }

  return parsed.data || [];
}

function getCellByAliases(row, aliases, fallback = '') {
  const keys = Object.keys(row || {});

  for (const key of keys) {
    const normalized = normalizeKey(key);
    const matched = aliases.some((alias) => {
      const aliasKey = normalizeKey(alias);
      return normalized === aliasKey || normalized.includes(aliasKey) || (normalized.length >= 7 && aliasKey.includes(normalized));
    });
    if (!matched) continue;

    const value = normalizeText(row[key]);
    if (value) return value;
  }

  return fallback;
}

function normalizeStatus(rawStatus) {
  const normalized = normalizeKey(rawStatus);
  if (normalized.includes('unplaced') || normalized.includes('notplaced')) return 'Applied';
  if (normalized.includes('selected') || normalized.includes('placed') || normalized.includes('offered')) return 'Selected';
  if (normalized.includes('shortlist') || normalized.includes('eligible')) return 'Shortlisted';
  if (normalized.includes('interview')) return 'Interview';
  if (normalized.includes('reject')) return 'Rejected';
  return STATUS_ALIASES[normalized] || 'Applied';
}

function toSafeNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolish(value) {
  const key = normalizeText(value).toLowerCase();
  return ['yes', 'true', '1', 'uploaded', 'done', 'submitted', 'selected', 'placed'].some((item) => key.includes(item));
}

function inferNameFromRow(row) {
  const values = Object.values(row || {}).map((value) => normalizeText(value));
  return values.find((value) => /^[a-zA-Z][a-zA-Z\s.'-]{2,}$/.test(value)) || '';
}

function inferCompanyFromRow(row) {
  const values = Object.values(row || {}).map((value) => normalizeText(value));
  return values.find((value) => /^[a-zA-Z][a-zA-Z0-9\s.&'-]{2,}$/.test(value)) || '';
}

export function parseCsvContent(file, onComplete) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: ({ data }) => onComplete(data || []),
  });
}

export async function parseTabularFile(file) {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, errors }) => {
          if (errors?.length) reject(new Error(errors[0].message));
          else resolve(data || []);
        },
        error: reject,
      });
    });
  }

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  throw new Error('Upload a CSV, XLSX, or XLS file.');
}

export async function importRowsFromGoogleSheetUrl(url) {
  const { spreadsheetId, gid } = extractSheetMeta(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL. Please paste a valid sheet link.');
  }

  try {
    const response = await fetch(`${BACKEND_BASE}/api/ingest/google-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'Backend could not read this sheet.');
    if (!Array.isArray(payload.rows) || !payload.rows.length) throw new Error('No rows found in this sheet tab.');
    return {
      sourceName: payload.sourceName || `Google Sheet (${spreadsheetId.slice(0, 6)}...)`,
      rows: payload.rows,
      backendPreview: payload,
    };
  } catch (backendError) {
    if (!String(backendError?.message || '').includes('Failed to fetch')) {
      throw backendError;
    }
  }

  const csvEndpoints = [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
  ];

  let lastError = null;
  for (const endpoint of csvEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const rows = parseCsvText(text);
      if (!rows.length) {
        throw new Error('No rows found in this sheet tab.');
      }

      return {
        sourceName: `Google Sheet (${spreadsheetId.slice(0, 6)}...)`,
        rows,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to read sheet data. Make sure sheet is public (anyone with link can view). ${lastError?.message || ''}`,
  );
}

export function normalizeMigrationRows(rows) {
  const errors = [];
  const studentMap = new Map();
  const companyMap = new Map();
  const applications = [];

  rows.forEach((row, index) => {
    const name =
      getCellByAliases(row, ['studentname', 'name', 'candidate', 'student']) || inferNameFromRow(row);
    const email = getCellByAliases(row, ['email', 'mail']);
    const companyName =
      getCellByAliases(row, ['companyname', 'company', 'employer', 'organization']) || inferCompanyFromRow(row);

    const role = getCellByAliases(row, ['role', 'jobrole', 'position', 'profile'], 'General Role');
    const status = normalizeStatus(getCellByAliases(row, ['status', 'stage', 'result', 'placed', 'placementstatus'], 'Applied'));
    const shortlistedStatus = normalizeStatus(getCellByAliases(row, ['shortlisted', 'eligible', 'screened'], status));
    const cgpa = toSafeNumber(getCellByAliases(row, ['cgpa', 'gpa', 'sgpa', 'grade', 'score', 'aggregate'], 0));
    const packageValue = toSafeNumber(getCellByAliases(row, ['package', 'package lpa', 'package_lpa', 'ctc', 'salary', 'stipend'], 0));
    const eligibility = toSafeNumber(getCellByAliases(row, ['eligibility', 'mincgpa', 'minimumcgpa', 'cgpaeligibility'], 0));
    const branch = getCellByAliases(row, ['branch', 'department', 'dept', 'stream'], 'Unknown');
    const attendance = toSafeNumber(getCellByAliases(row, ['attendance', 'attendancepercent', 'attendence', 'att'], 75));
    const activeBacklogs = toSafeNumber(getCellByAliases(row, ['activebacklogs', 'currentback', 'currentbacks', 'backlogs', 'backs', 'kt'], 0));
    const aptitudeScore = toSafeNumber(getCellByAliases(row, ['aptitudescore', 'aptitude', 'testscore', 'assessment'], 55));
    const communicationScore = toSafeNumber(getCellByAliases(row, ['communicationscore', 'communication', 'spoken', 'softskills'], 55));
    const deadline = getCellByAliases(row, ['deadline', 'lastdate', 'date', 'applyby'], '');
    const requiredSkills = getCellByAliases(row, ['requiredskills', 'skillsrequired', 'skills'], '');
    const preferredSkills = getCellByAliases(row, ['preferredskills', 'goodtohave'], '');
    const preferredCertifications = getCellByAliases(row, ['preferredcertifications', 'certifications'], '');
    const preferredTechnologies = getCellByAliases(row, ['preferredtechnologies', 'technologies', 'tools'], '');
    const internshipPreference = getCellByAliases(row, ['internshippreference', 'internshiprequired'], 'Preferred');
    const projects = toSafeNumber(getCellByAliases(row, ['projects', 'projectcount', 'noofprojects'], 0));
    const internships = toSafeNumber(getCellByAliases(row, ['internships', 'internshipcount'], 0));
    const resumeUploadedRaw = getCellByAliases(row, ['resumeuploaded', 'resume', 'cvuploaded', 'cv'], '');
    const resumeScore = toSafeNumber(getCellByAliases(row, ['resumescore', 'atsscore', 'ats'], boolish(resumeUploadedRaw) ? 68 : 0));

    let student = null;
    if (name || email) {
      const studentEmail = email || `${normalizeText(name).toLowerCase().replace(/\s+/g, '.')}@college.edu`;
      const studentKey = normalizeKey(studentEmail || name);

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          id: makeId('stu'),
          name: normalizeText(name) || 'Unknown Student',
          email: studentEmail,
          cgpa: Number.isFinite(cgpa) ? cgpa : 0,
          branch,
          projects: Number.isFinite(projects) ? projects : 0,
          internships: Number.isFinite(internships) ? internships : 0,
          resumeScore: Number.isFinite(resumeScore) ? resumeScore : 0,
          atsScore: Number.isFinite(resumeScore) ? resumeScore : 0,
          attendance,
          activeBacklogs,
          aptitudeScore,
          communicationScore,
          resumeUploaded: boolish(resumeUploadedRaw) || resumeScore > 0,
          shortlistedStatus,
        });
      }
      student = studentMap.get(studentKey);
    }

    let company = null;
    if (companyName) {
      const companyKey = `${normalizeKey(companyName)}::${normalizeKey(role)}`;
      if (!companyMap.has(companyKey)) {
        companyMap.set(companyKey, {
          id: makeId('cmp'),
          name: companyName,
          role,
          package: Number.isFinite(packageValue) ? packageValue : 0,
          eligibility: Number.isFinite(eligibility) ? eligibility : 0,
          deadline,
          branch: branch || 'All',
          requiredSkills,
          preferredSkills,
          preferredCertifications,
          preferredTechnologies,
          internshipPreference,
          status: 'Open',
        });
      }
      company = companyMap.get(companyKey);
    }

    if (student && company) {
      applications.push({
        id: makeId('app'),
        studentId: student.id,
        companyId: company.id,
        status,
        createdAt: new Date().toISOString(),
      });
    }

    if (!student && !company) {
      errors.push(`Row ${index + 1}: could not detect student or company fields.`);
    }
  });

  const students = Array.from(studentMap.values());
  const companies = Array.from(companyMap.values());

  if (!students.length && !companies.length) {
    errors.push('No valid student or company records found. Check column names and sheet structure.');
  }

  return {
    students,
    companies,
    applications,
    errors,
  };
}

export function importMigrationData({ students, companies, applications }) {
  const db = loadDb();

  const dedupedStudents = [];
  const seenStudentEmails = new Set();
  (students || []).forEach((student) => {
    const key = normalizeText(student.email).toLowerCase();
    if (!key || seenStudentEmails.has(key)) return;
    seenStudentEmails.add(key);
    dedupedStudents.push(student);
  });

  const dedupedCompanies = [];
  const seenCompanies = new Set();
  (companies || []).forEach((company) => {
    const key = `${normalizeText(company.name).toLowerCase()}::${normalizeText(company.role).toLowerCase()}`;
    if (!key || seenCompanies.has(key)) return;
    seenCompanies.add(key);
    dedupedCompanies.push(company);
  });

  const effectiveStudents = dedupedStudents.length ? dedupedStudents : db.students;
  const effectiveCompanies = dedupedCompanies.length ? dedupedCompanies : db.companies;

  const studentIds = new Set(effectiveStudents.map((student) => student.id));
  const companyIds = new Set(effectiveCompanies.map((company) => company.id));

  const dedupedApplications = [];
  const seenApplications = new Set();
  (applications || []).forEach((application) => {
    if (!studentIds.has(application.studentId) || !companyIds.has(application.companyId)) return;
    const key = `${application.studentId}::${application.companyId}`;
    if (seenApplications.has(key)) return;
    seenApplications.add(key);
    dedupedApplications.push(application);
  });

  const nextApplications = dedupedApplications.length
    ? dedupedApplications
    : dedupedStudents.length || dedupedCompanies.length
      ? []
      : db.applications;

  const nextState = {
    ...db,
    students: effectiveStudents,
    companies: effectiveCompanies,
    applications: nextApplications,
  };

  return saveDb(nextState);
}

export function mockGoogleSheetData(url) {
  const sourceName = url.includes('docs.google.com') ? 'Google Sheet' : 'Shared Link';
  return {
    sourceName,
    rows: [
      {
        name: 'Neha Khanna',
        email: 'neha@college.edu',
        cgpa: 8.5,
        branch: 'IT',
        company: 'NovaSys',
        role: 'Data Analyst',
        package: 7.5,
        eligibility: 7,
        deadline: '2026-04-25',
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@college.edu',
        cgpa: 9,
        branch: 'CSE',
        company: 'PixelCraft',
        role: 'Frontend Engineer',
        package: 9,
        eligibility: 7.5,
        deadline: '2026-04-24',
      },
    ],
  };
}
