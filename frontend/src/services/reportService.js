import { GoogleGenerativeAI } from '@google/generative-ai';

function buildPrompt(summary) {
  return `You are a placement analytics assistant. Generate a concise, professional report in bullet points and short sections.\n\nData:\n- Total students: ${summary.totalStudents}\n- Total applications: ${summary.totalApplications}\n- Selected count: ${summary.selectedCount}\n- Pending interviews: ${summary.pendingInterviews}\n- Active drives: ${summary.activeDrives}\n- New applications today: ${summary.newApplicationsToday}\n- Best performing company: ${summary.bestCompany}\n- Average selection rate: ${summary.selectionRate}%\n\nTop companies:\n${summary.companyLines.join('\n')}`;
}

export async function generateAiReport({ apiKey, summary }) {
  const key = String(apiKey || '').trim();
  if (!key) {
    return { ok: false, error: 'API key is required.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(buildPrompt(summary));
    const text = result.response.text();
    return { ok: true, report: text };
  } catch (error) {
    return { ok: false, error: error.message || 'Failed to generate AI report.' };
  }
}

export function generateLocalReport(summary) {
  return [
    'PlaceFlow Report',
    '',
    `Total Students: ${summary.totalStudents}`,
    `Total Applications: ${summary.totalApplications}`,
    `Selected Count: ${summary.selectedCount}`,
    `Pending Interviews: ${summary.pendingInterviews}`,
    `Active Drives: ${summary.activeDrives}`,
    `New Applications Today: ${summary.newApplicationsToday}`,
    `Best Performing Company: ${summary.bestCompany}`,
    `Average Selection Rate: ${summary.selectionRate}%`,
    '',
    'Company Overview:',
    ...summary.companyLines,
  ].join('\n');
}
