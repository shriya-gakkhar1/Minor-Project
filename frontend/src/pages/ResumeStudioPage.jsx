import { Download, FileScan, FileUp, Layers3, Loader2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { optimizeResumeWithOssPipeline } from '../services/predictionService';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toneClass(score) {
  if (score >= 80) return 'text-emerald-700';
  if (score >= 65) return 'text-amber-700';
  return 'text-rose-700';
}

function getVersionTag() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(filename, blob);
}

function createResumePdf({ profile, markdown }) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = 14;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(15, 92, 142);
  pdf.text(profile?.name || 'Optimized Resume', 14, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(90, 90, 90);
  const contact = [profile?.email, profile?.phone, profile?.linkedin, profile?.github].filter(Boolean).join(' | ');
  if (contact) {
    const contactLines = pdf.splitTextToSize(contact, 180);
    pdf.text(contactLines, 14, y);
    y += contactLines.length * 4 + 3;
  }

  pdf.setDrawColor(220, 220, 220);
  pdf.line(14, y, 196, y);
  y += 5;

  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(10);

  const lines = String(markdown || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => Boolean(line));

  lines.forEach((line) => {
    if (y > 285) {
      pdf.addPage();
      y = 14;
    }

    if (line.startsWith('# ')) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text(line.replace(/^#\s+/, ''), 14, y);
      y += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      return;
    }

    if (line.startsWith('## ')) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 118, 110);
      pdf.text(line.replace(/^##\s+/, ''), 14, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(20, 20, 20);
      return;
    }

    const body = line.startsWith('- ') ? `• ${line.slice(2)}` : line;
    const wrapped = pdf.splitTextToSize(body, 180);
    pdf.text(wrapped, 14, y);
    y += wrapped.length * 4.5 + 1;
  });

  return pdf;
}

function downloadResumePdf({ filename, profile, markdown }) {
  const pdf = createResumePdf({ profile, markdown });
  pdf.save(filename);
}

function buildAtsReportText(result) {
  const ats = result?.ats || {};
  const profile = result?.profile || {};
  const optimized = result?.optimized_resume || {};
  const pipeline = result?.pipeline || {};

  const lines = [
    'PlaceFlow Resume Studio - ATS Optimization Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Candidate: ${profile.name || 'N/A'}`,
    `Email: ${profile.email || 'N/A'}`,
    `Phone: ${profile.phone || 'N/A'}`,
    '',
    `Overall Score: ${ats.overall_score ?? 'N/A'}`,
    `Grade: ${ats.grade || 'N/A'}`,
    'Score Breakdown:',
    `- Keyword Match: ${ats.score_breakdown?.keyword_match ?? 'N/A'}`,
    `- Semantic Similarity: ${ats.score_breakdown?.semantic_similarity ?? 'N/A'}`,
    `- Section Completeness: ${ats.score_breakdown?.section_completeness ?? 'N/A'}`,
    `- Format Quality: ${ats.score_breakdown?.format_quality ?? 'N/A'}`,
    '',
    `Matched Keywords (${ats.keyword_stats?.matched_count || 0}):`,
    `- ${(ats.keyword_stats?.matched_keywords || []).join(', ') || 'None'}`,
    '',
    'Missing Keywords:',
    `- ${(ats.keyword_stats?.missing_keywords || []).join(', ') || 'None'}`,
    '',
    'Optimized Summary:',
    optimized.summary || 'N/A',
    '',
    'Pipeline Components:',
    ...(pipeline.components || []).map((item) => `- ${item.name}: ${item.purpose}`),
  ];

  return lines.join('\n');
}

export default function ResumeStudioPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [packaging, setPackaging] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const score = Number(result?.ats?.overall_score || 0);

  const sourceBadges = useMemo(() => {
    if (!result?.pipeline?.components) return [];
    return result.pipeline.components;
  }, [result]);

  const handleRunPipeline = async () => {
    if (!resumeFile) {
      setError('Upload a resume file first (PDF/DOCX/TXT/IMAGE).');
      return;
    }

    if (!String(jobDescription || '').trim()) {
      setError('Paste the job description to optimize against 2026 role trends.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await optimizeResumeWithOssPipeline({
        file: resumeFile,
        targetRole,
        jobDescription,
      });
      setResult(response);
    } catch (pipelineError) {
      setError(pipelineError.message || 'Resume optimization failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const jsonFilename = `${result?.exports?.filename_base || 'optimized-resume'}-reactive.json`;
  const pdfFilename = `${result?.exports?.filename_base || 'optimized-resume'}.pdf`;

  const handleDownloadZipPackage = async () => {
    if (!result || packaging) return;

    setPackaging(true);
    try {
      const base = result?.exports?.filename_base || 'optimized-resume';
      const versionTag = getVersionTag();
      const packageBase = `${base}-v${versionTag}`;

      const zip = new JSZip();
      zip.file(`${packageBase}-reactive.json`, JSON.stringify(result.exports?.reactive_resume_json || {}, null, 2));
      zip.file(`${packageBase}-ats-report.txt`, buildAtsReportText(result));

      const pdf = createResumePdf({
        profile: result.profile,
        markdown: result.optimized_resume?.markdown,
      });
      zip.file(`${packageBase}.pdf`, pdf.output('blob'));

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(`${packageBase}-package.zip`, blob);
    } catch (packageError) {
      setError(packageError.message || 'Failed to build ZIP package.');
    } finally {
      setPackaging(false);
    }
  };

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Resume Studio'
        subtitle='Upload old resume -> OCR/extract -> ATS optimize -> Reactive Resume JSON + polished PDF download.'
      />

      <div className='grid gap-4 xl:grid-cols-[1.25fr_1fr]'>
        <Card className='border-teal-100 bg-gradient-to-br from-teal-50/60 to-white'>
          <h3 className='text-base font-semibold text-slate-900'>Pipeline Control</h3>
          <p className='mt-1 text-sm text-slate-600'>Runs PaddleOCR-aware extraction with ATS optimization and builder-ready output.</p>

          <label className='mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-teal-300 hover:bg-teal-50'>
            <FileUp className='h-6 w-6 text-slate-500' />
            <span className='mt-2 text-sm font-medium text-slate-700'>Upload Old Resume</span>
            <span className='mt-1 text-xs text-slate-500'>PDF, DOC, DOCX, TXT, PNG, JPG</span>
            <input
              type='file'
              accept='.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.bmp,.tiff'
              className='hidden'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setResumeFile(file);
              }}
            />
          </label>

          {resumeFile ? <p className='mt-3 text-xs text-slate-600'>Selected file: {resumeFile.name}</p> : null}

          <div className='mt-4 grid gap-3'>
            <Input
              placeholder='Target role (example: AI Product Engineer)'
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
            />
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder='Paste complete job description to optimize your resume for ATS and recruiter readability.'
              className='min-h-[180px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
            />
          </div>

          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <Button onClick={handleRunPipeline} disabled={loading}>
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <FileScan className='h-4 w-4' />}
              {loading ? 'Optimizing Resume...' : 'Run OSS Resume Pipeline'}
            </Button>
            <span className='text-xs text-slate-500'>Source: {result?.source || 'not-run'}</span>
          </div>

          {error ? <p className='mt-3 text-xs text-rose-600'>{error}</p> : null}
        </Card>

        <Card>
          <h3 className='text-base font-semibold text-slate-900'>Pipeline Stack</h3>
          <p className='mt-1 text-sm text-slate-600'>Integrated OSS components working in sync.</p>
          <div className='mt-4 space-y-2'>
            {(sourceBadges.length ? sourceBadges : [
              { name: 'PaddleOCR', purpose: 'OCR extraction layer' },
              { name: 'ATS Matcher', purpose: 'Resume-job scoring layer' },
              { name: 'Reactive Resume', purpose: 'Builder/export compatibility' },
            ]).map((item) => (
              <div key={item.name} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-sm font-semibold text-slate-800'>{item.name}</p>
                <p className='text-xs text-slate-600'>{item.purpose}</p>
                {item.repo ? <p className='mt-1 text-[11px] text-slate-500'>{item.repo}</p> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {result ? (
        <>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='border-indigo-100 bg-gradient-to-br from-indigo-50 to-white'>
              <p className='text-sm text-slate-500'>ATS Match</p>
              <p className={`mt-2 text-4xl font-bold ${toneClass(score)}`}>{score}</p>
              <p className='mt-1 text-xs text-slate-500'>Grade: {result.ats?.grade}</p>
              <div className='mt-3 h-2 rounded-full bg-slate-100'>
                <div className='h-2 rounded-full bg-[linear-gradient(135deg,#0f5c8e,#0f766e)]' style={{ width: `${clamp(score, 0, 100)}%` }} />
              </div>
            </Card>

            <Card>
              <p className='text-sm text-slate-500'>Detected Profile</p>
              <p className='mt-2 text-lg font-semibold text-slate-900'>{result.profile?.name || 'Candidate'}</p>
              <p className='text-xs text-slate-600'>{result.profile?.email || 'No email detected'}</p>
              <p className='text-xs text-slate-600'>{result.profile?.phone || 'No phone detected'}</p>
            </Card>

            <Card>
              <p className='text-sm text-slate-500'>Exports</p>
              <div className='mt-3 space-y-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => downloadJsonFile(jsonFilename, result.exports?.reactive_resume_json || {})}
                >
                  <Download className='h-4 w-4' />
                  Download Reactive JSON
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() =>
                    downloadResumePdf({
                      filename: pdfFilename,
                      profile: result.profile,
                      markdown: result.optimized_resume?.markdown,
                    })
                  }
                >
                  <Download className='h-4 w-4' />
                  Download Optimized PDF
                </Button>
                <Button variant='secondary' size='sm' onClick={handleDownloadZipPackage} disabled={packaging}>
                  {packaging ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
                  {packaging ? 'Packaging...' : 'Download Versioned ZIP'}
                </Button>
                <a
                  href='https://rxresu.me/'
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex h-8 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-700 transition hover:brightness-105'
                >
                  Open Reactive Resume Import
                </a>
              </div>
            </Card>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <SectionHeader title='Optimized Summary' subtitle='Recruiter-readable profile tuned to role and ATS signals.' />
              <p className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                {result.optimized_resume?.summary}
              </p>
            </Card>

            <Card>
              <SectionHeader title='2026 Keyword Actions' subtitle='Priority skills and keywords to include naturally.' />
              <div className='space-y-2'>
                <div>
                  <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>Core</p>
                  <div className='flex flex-wrap gap-2'>
                    {(result.optimized_resume?.skills?.core || []).slice(0, 14).map((skill) => (
                      <span key={skill} className='rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>Add Next</p>
                  <div className='flex flex-wrap gap-2'>
                    {(result.optimized_resume?.skills?.addNext || []).slice(0, 10).map((skill) => (
                      <span key={skill} className='rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeader title='Experience Bullet Rewrite' subtitle='High-impact bullet style for resume modernization.' />
              <div className='space-y-2'>
                {(result.optimized_resume?.experience_bullets || []).map((line) => (
                  <p key={line} className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                    {line}
                  </p>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeader title='Project Bullet Rewrite' subtitle='Portfolio framing aligned with hiring filters.' />
              <div className='space-y-2'>
                {(result.optimized_resume?.project_bullets || []).map((line) => (
                  <p key={line} className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                    {line}
                  </p>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <SectionHeader title='Reactive Resume Ready Payload' subtitle='Import this JSON in builder workflows or keep as source of truth.' />
            <div className='rounded-2xl border border-slate-200 bg-slate-900 p-3'>
              <pre className='max-h-[380px] overflow-auto text-xs text-slate-100'>
                {JSON.stringify(result.exports?.reactive_resume_json || {}, null, 2)}
              </pre>
            </div>
            <p className='mt-2 flex items-center gap-2 text-xs text-slate-500'>
              <Layers3 className='h-3.5 w-3.5' />
              This payload follows JSON Resume compatible shape for high portability.
            </p>
          </Card>
        </>
      ) : (
        <Card className='border border-dashed border-slate-300 bg-slate-50'>
          <p className='flex items-center gap-2 text-sm text-slate-600'>
            <Sparkles className='h-4 w-4 text-teal-600' />
            Run the pipeline to generate a fully optimized resume package with ATS report, JSON export, and PDF download.
          </p>
        </Card>
      )}
    </PageContainer>
  );
}
