import { useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { importRowsFromGoogleSheetUrl, parseCsvContent } from '../services/migrationService';
import { usePlacementStore } from '../store/usePlacementStore';

export default function MigrationPage() {
  const runMigrationImportFromRows = usePlacementStore((state) => state.runMigrationImportFromRows);
  const migrationPreviewRows = usePlacementStore((state) => state.migrationPreviewRows);
  const migrationSource = usePlacementStore((state) => state.migrationSource);
  const migrationErrors = usePlacementStore((state) => state.migrationErrors);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [summary, setSummary] = useState({ students: 0, companies: 0, applications: 0 });

  const parseCsvFile = (file) => {
    parseCsvContent(file, (rows) => {
      const normalized = runMigrationImportFromRows(rows, file.name);
      setSummary({
        students: normalized.students.length,
        companies: normalized.companies.length,
        applications: normalized.applications.length,
      });
    });
  };

  const importFromSheet = async () => {
    try {
      setSheetLoading(true);
      setSheetError('');
      const payload = await importRowsFromGoogleSheetUrl(sheetUrl);
      const normalized = runMigrationImportFromRows(payload.rows, payload.sourceName);
      setSummary({
        students: normalized.students.length,
        companies: normalized.companies.length,
        applications: normalized.applications.length,
      });
    } catch (error) {
      setSheetError(error.message || 'Failed to import sheet data.');
    } finally {
      setSheetLoading(false);
    }
  };

  const previewColumns = useMemo(() => {
    const row = migrationPreviewRows[0];
    if (!row) return [];
    return Object.keys(row).slice(0, 6).map((key) => ({ key, label: key }));
  }, [migrationPreviewRows]);

  const previewRows = useMemo(() => {
    return migrationPreviewRows.map((row, index) => ({ id: `preview_${index}`, ...row }));
  }, [migrationPreviewRows]);

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Migration'
        subtitle='Import legacy CSV files or Google Sheets links and normalize to PlaceFlow data model'
      />

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <h3 className='text-base font-semibold text-slate-900'>Upload CSV</h3>
          <p className='mt-1 text-sm text-slate-500'>Use PapaParse to map tabular rows into students and companies.</p>

          <label className='mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50'>
            <Upload className='h-6 w-6 text-slate-500' />
            <span className='mt-2 text-sm font-medium text-slate-700'>Click to upload CSV</span>
            <span className='text-xs text-slate-500'>Supports name, cgpa, branch, status, company columns</span>
            <input
              type='file'
              accept='.csv'
              className='hidden'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) parseCsvFile(file);
              }}
            />
          </label>
        </Card>

        <Card>
          <h3 className='text-base font-semibold text-slate-900'>Google Sheets Link</h3>
          <p className='mt-1 text-sm text-slate-500'>Paste a public sheet link. PlaceFlow auto-detects columns and imports data.</p>

          <div className='mt-4 space-y-3'>
            <Input
              placeholder='https://docs.google.com/spreadsheets/...'
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
            />
            {sheetError ? <p className='text-xs text-rose-600'>{sheetError}</p> : null}
            <Button className='w-full' onClick={importFromSheet} disabled={!sheetUrl || sheetLoading}>
              {sheetLoading ? 'Importing...' : 'Import from Sheets'}
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title='Preview'
          subtitle={migrationSource ? `Showing normalized data from ${migrationSource}` : 'Upload data to preview before working with dashboards'}
        />

        <div className='mb-4 grid gap-3 md:grid-cols-3'>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Students: {summary.students}</div>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Companies: {summary.companies}</div>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Applications: {summary.applications}</div>
        </div>

        {migrationErrors.length > 0 ? (
          <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700'>
            {migrationErrors.slice(0, 4).map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {previewColumns.length > 0 ? (
          <DataTable columns={previewColumns} rows={previewRows} />
        ) : (
          <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'>
            No imported rows yet. Upload CSV or add a Google Sheets URL to start migration.
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
