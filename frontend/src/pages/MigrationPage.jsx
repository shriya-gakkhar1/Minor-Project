import { createElement, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  DatabaseBackup,
  FileSpreadsheet,
  Link,
  Loader2,
  Rows3,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import { importRowsFromGoogleSheetUrl, normalizeMigrationRows, parseTabularFile } from '../services/migrationService';
import { buildOperationalIntelligence } from '../services/placementIntelligenceService';
import { usePlacementStore } from '../store/usePlacementStore';

function Metric({ label, value, icon, tone = 'slate' }) {
  const tones = {
    slate: 'border-[var(--pf-border)] bg-white/60 text-[var(--pf-text)] dark:bg-white/[0.04]',
    emerald: 'border-emerald-400/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100',
    amber: 'border-amber-400/20 bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-100',
    rose: 'border-rose-400/20 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-100',
    sky: 'border-sky-400/20 bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-100',
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--pf-muted)]'>{label}</p>
        {createElement(icon, { className: 'h-4 w-4 opacity-80' })}
      </div>
      <p className='mt-3 text-2xl font-semibold text-[var(--pf-text)]'>{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className='grid gap-3 md:grid-cols-3'>
      {[1, 2, 3].map((item) => (
        <div key={item} className='h-24 animate-pulse rounded-2xl border border-[var(--pf-border)] bg-white/60 dark:bg-white/[0.04]' />
      ))}
    </div>
  );
}

export default function MigrationPage() {
  const runMigrationImportFromRows = usePlacementStore((state) => state.runMigrationImportFromRows);
  const migrationPreviewRows = usePlacementStore((state) => state.migrationPreviewRows);
  const migrationSource = usePlacementStore((state) => state.migrationSource);
  const migrationErrors = usePlacementStore((state) => state.migrationErrors);

  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [pendingRows, setPendingRows] = useState([]);
  const [pendingSource, setPendingSource] = useState('');
  const [lastBackendPreview, setLastBackendPreview] = useState(null);

  const visibleRows = pendingRows.length ? pendingRows : migrationPreviewRows;
  const normalized = useMemo(() => normalizeMigrationRows(visibleRows), [visibleRows]);
  const intelligence = useMemo(() => buildOperationalIntelligence({ rows: visibleRows }), [visibleRows]);

  const previewColumns = useMemo(() => {
    const row = visibleRows[0];
    if (!row) return [];
    return Object.keys(row).slice(0, 8).map((key) => ({ key, label: key }));
  }, [visibleRows]);

  const previewRows = useMemo(() => {
    return visibleRows.slice(0, 12).map((row, index) => ({ id: `preview_${index}`, ...row }));
  }, [visibleRows]);

  const setPreview = (rows, source, backendPreview = null) => {
    setPendingRows(rows);
    setPendingSource(source);
    setLastBackendPreview(backendPreview);
    setSheetError('');
  };

  const parseImportFile = async (file) => {
    try {
      setLoading(true);
      setSheetError('');
      const rows = await parseTabularFile(file);
      if (!rows.length) throw new Error('No rows were found in this file.');
      setPreview(rows, file.name);
    } catch (error) {
      setSheetError(error.message || 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  const importFromSheet = async () => {
    try {
      setLoading(true);
      setSheetError('');
      const payload = await importRowsFromGoogleSheetUrl(sheetUrl);
      setPreview(payload.rows, payload.sourceName, payload.backendPreview || null);
    } catch (error) {
      setSheetError(error.message || 'Failed to import sheet data.');
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = () => {
    if (!pendingRows.length) return;
    runMigrationImportFromRows(pendingRows, pendingSource);
    setPendingRows([]);
    setPendingSource('');
    setLastBackendPreview(null);
  };

  const clearPreview = () => {
    setPendingRows([]);
    setPendingSource('');
    setLastBackendPreview(null);
    setSheetError('');
  };

  const mappedCount = intelligence.mappings.filter((mapping) => mapping.field !== 'unmapped').length;
  const mappingRate = intelligence.mappings.length ? Math.round((mappedCount / intelligence.mappings.length) * 100) : 0;

  return (
    <PageContainer className='space-y-6'>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[var(--pf-muted)]'>Import Student Data</p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-[var(--pf-text)]'>Paste a sheet. Get a dashboard.</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-[var(--pf-muted)]'>
            Upload Excel/CSV files or paste a public Google Sheets link. Placify maps columns, removes duplicates,
            and updates your dashboard instantly.
          </p>
        </div>
        {pendingRows.length ? (
          <div className='flex gap-2'>
            <Button variant='secondary' onClick={clearPreview}>
              <X className='h-4 w-4' />
              Clear
            </Button>
            <Button onClick={confirmImport}>
              <DatabaseBackup className='h-4 w-4' />
              Commit data
            </Button>
          </div>
        ) : null}
      </section>

      <section className='grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]'>
        <Card className='p-5'>
          <div className='flex items-start gap-3'>
            <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-950'>
              <Upload className='h-5 w-5' />
            </span>
            <div>
              <h2 className='font-semibold text-[var(--pf-text)]'>Upload file</h2>
              <p className='mt-1 text-sm text-[var(--pf-muted)]'>CSV, XLS, and XLSX files with placement or academic rows.</p>
            </div>
          </div>

          <label className='mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-6 py-8 text-center transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg dark:border-white/10 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-cyan-950/30'>
            <FileSpreadsheet className='h-7 w-7 text-sky-500' />
            <span className='mt-3 text-sm font-semibold text-[var(--pf-text)]'>Choose CSV or Excel</span>
            <span className='mt-1 text-xs text-[var(--pf-muted)]'>Supports CGPA, SGPA, current back, attendance_percent, package_lpa</span>
            <input
              type='file'
              accept='.csv,.xlsx,.xls'
              className='hidden'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void parseImportFile(file);
              }}
            />
          </label>
        </Card>

        <Card className='p-5'>
          <div className='flex items-start gap-3'>
            <span className='grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-950'>
              <Link className='h-5 w-5' />
            </span>
            <div>
              <h2 className='font-semibold text-[var(--pf-text)]'>Connect Google Sheet</h2>
              <p className='mt-1 text-sm text-[var(--pf-muted)]'>Paste a public sheet URL. Placify reads it and builds a preview.</p>
            </div>
          </div>

          <div className='mt-5 space-y-3'>
            <Input
              placeholder='https://docs.google.com/spreadsheets/d/...'
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
            />
            <Button className='w-full' onClick={importFromSheet} disabled={!sheetUrl || loading}>
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Link className='h-4 w-4' />}
              {loading ? 'Reading sheet...' : 'Fetch public sheet'}
            </Button>
            <p className='text-xs leading-5 text-[var(--pf-muted)]'>Only public sheets are supported. Use Share {'->'} Anyone with the link {'->'} Viewer.</p>
          </div>
        </Card>

        <Card className='p-5'>
          <h2 className='font-semibold text-[var(--pf-text)]'>Import status</h2>
          <div className='mt-4 space-y-3 text-sm'>
            {[
              ['Parse rows', visibleRows.length > 0],
              ['Map schema', mappingRate >= 50],
              ['Validate records', visibleRows.length > 0],
              ['Commit analytics', !pendingRows.length && Boolean(migrationSource)],
            ].map(([label, done]) => (
              <div key={label} className='flex items-center justify-between rounded-xl border border-[var(--pf-border)] bg-white/55 px-3 py-2 dark:bg-white/[0.035]'>
                <span className='text-[var(--pf-text)]'>{label}</span>
                {done ? <CheckCircle2 className='h-4 w-4 text-emerald-300' /> : <span className='h-2 w-2 rounded-full bg-slate-600' />}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {sheetError ? (
        <div className='flex gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{sheetError}</p>
        </div>
      ) : null}

      {loading ? <LoadingState /> : null}

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
        <Metric label='Rows parsed' value={visibleRows.length} icon={Rows3} tone='sky' />
        <Metric label='Students detected' value={normalized.students.length} icon={ShieldCheck} tone='emerald' />
        <Metric label='Schema mapped' value={`${mappingRate}%`} icon={DatabaseBackup} />
        <Metric label='Duplicates' value={intelligence.duplicateCount} icon={AlertCircle} tone={intelligence.duplicateCount ? 'amber' : 'slate'} />
        <Metric label='At risk' value={intelligence.atRiskCount} icon={AlertCircle} tone={intelligence.atRiskCount ? 'rose' : 'slate'} />
      </section>

      <section className='grid gap-4 xl:grid-cols-[1fr_0.95fr]'>
        <Card className='p-5'>
          <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h2 className='font-semibold text-[var(--pf-text)]'>Smart column mapping</h2>
              <p className='mt-1 text-sm text-[var(--pf-muted)]'>
                {pendingSource ? `Previewing ${pendingSource}` : migrationSource ? `Last imported from ${migrationSource}` : 'Upload or connect data to inspect schema.'}
              </p>
            </div>
            {lastBackendPreview ? (
              <span className='rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100'>Backend verified</span>
            ) : null}
          </div>

          {visibleRows.length ? (
            <div className='grid gap-2 sm:grid-cols-2'>
              {intelligence.mappings.slice(0, 12).map((mapping) => (
                <div key={mapping.column} className='rounded-2xl border border-[var(--pf-border)] bg-white/55 p-3 dark:bg-white/[0.035]'>
                  <p className='truncate text-xs text-slate-500'>{mapping.column}</p>
                  <div className='mt-2 flex items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-[var(--pf-text)]'>
                      {mapping.field === 'unmapped' ? 'Needs review' : mapping.field}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      mapping.confidence >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200' : mapping.confidence >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {mapping.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-[var(--pf-border)] bg-white/55 p-8 text-center dark:bg-slate-950/45'>
              <FileSpreadsheet className='mx-auto h-8 w-8 text-slate-500' />
              <p className='mt-3 text-sm font-medium text-[var(--pf-text)]'>No dataset selected</p>
              <p className='mt-1 text-xs text-[var(--pf-muted)]'>Choose a file or paste a public Google Sheet URL.</p>
            </div>
          )}
        </Card>

        <Card className='p-5'>
          <h2 className='font-semibold text-[var(--pf-text)]'>Generated insights</h2>
          <p className='mt-1 text-sm text-[var(--pf-muted)]'>Useful summaries calculated from the current preview.</p>

          <div className='mt-4 space-y-3'>
            {intelligence.insights.length ? intelligence.insights.map((insight) => (
              <div key={insight} className='rounded-2xl border border-[var(--pf-border)] bg-white/55 p-3 text-sm leading-6 text-[var(--pf-text)] dark:bg-white/[0.035]'>
                {insight}
              </div>
            )) : (
              <div className='rounded-2xl border border-dashed border-[var(--pf-border)] bg-white/55 p-6 text-sm text-[var(--pf-muted)] dark:bg-slate-950/45'>
                Insights appear after rows are parsed.
              </div>
            )}

            {migrationErrors.length ? (
              <div className='rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100'>
                {migrationErrors.slice(0, 4).map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <Card className='p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='font-semibold text-[var(--pf-text)]'>Row preview</h2>
            <p className='mt-1 text-sm text-[var(--pf-muted)]'>First 12 rows. Data is saved only after commit.</p>
          </div>
          {pendingRows.length ? (
            <Button onClick={confirmImport}>
              <DatabaseBackup className='h-4 w-4' />
              Commit data
            </Button>
          ) : null}
        </div>

        {previewColumns.length ? (
          <DataTable columns={previewColumns} rows={previewRows} />
        ) : (
          <div className='rounded-2xl border border-dashed border-[var(--pf-border)] bg-white/55 p-10 text-center text-sm text-[var(--pf-muted)] dark:bg-slate-950/45'>
            No rows to preview yet.
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
