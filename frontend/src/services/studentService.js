import { loadDb } from './dbService';

export function listStudents() {
  return loadDb().students;
}

export function getStudentById(studentId) {
  return loadDb().students.find((item) => item.id === studentId) || null;
}

export function enrichStudentsWithPlacement(students, applications, companies) {
  const companyMap = new Map(companies.map((company) => [company.id, company]));

  return students.map((student) => {
    const studentApplications = applications
      .filter((application) => application.studentId === student.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latest = studentApplications[0];
    const company = latest ? companyMap.get(latest.companyId) : null;

    return {
      ...student,
      status: latest?.status || 'Unassigned',
      company: company?.name || 'Unassigned',
    };
  });
}
