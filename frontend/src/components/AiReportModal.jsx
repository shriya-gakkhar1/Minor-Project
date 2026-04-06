import { useMemo, useState } from 'react';
import Button from './Button';
import Input from './Input';
import { generateAiReport, generateLocalReport } from '../services/reportService';

export default function AiReportModal({ open, onClose, summary }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState('');

  const fallbackReport = useMemo(() => generateLocalReport(summary || {}), [summary]);

  if (!open) return null;

  const runReport = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    const result = await generateAiReport({ apiKey, summary: summary || {} });
    if (result.ok) {
      setReport(result.report);
    } else {
      setError(result.error);
      setReport(fallbackReport);
    }
    setLoading(false);
  };

  const downloadReport = () => {
    const content = report || fallbackReport;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'placeflow-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4'>
      <div className='w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-slate-900'>Generate Report</h3>
            <p className='text-sm text-slate-500'>Paste your Gemini API key for AI report. Fallback report is available without key.</p>
          </div>
          <Button variant='ghost' onClick={onClose}>Close</Button>
        </div>

        <div className='rounded-xl border border-teal-100 bg-teal-50 p-4'>
          <p className='mb-2 text-sm font-medium text-teal-700'>AI API Key</p>
          <div className='flex flex-col gap-2 md:flex-row'>
            <Input
              type='password'
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder='Paste Gemini API key'
            />
            <Button onClick={runReport} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
            <Button variant='secondary' onClick={() => setReport(fallbackReport)}>Use Fallback</Button>
          </div>
          {error ? <p className='mt-2 text-xs text-rose-600'>{error}</p> : null}
        </div>

        <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
          <pre className='max-h-[360px] overflow-auto whitespace-pre-wrap text-sm text-slate-700'>
            {report || 'Your report preview will appear here.'}
          </pre>
        </div>

        <div className='mt-4 flex justify-end gap-2'>
          <Button variant='secondary' onClick={downloadReport} disabled={!report && !fallbackReport}>Download</Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
