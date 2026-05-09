import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Download, FileUp, Sparkles } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { predictCampusPlacements } from '../services/predictionService';
import { usePlacementStore } from '../store/usePlacementStore';

function csvFromRows(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    lines.push(headers.map((key) => {
      const value = String(row[key] ?? '');
      if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
      return value;
    }).join(','));
  });

  return lines.join('\n');
}

export default function CampusPredictorPage() {
  const studentPlacementRows = usePlacementStore((state) => state.studentPlacementRows);
  const campusPrediction = usePlacementStore((state) => state.campusPrediction);
  const setCampusPrediction = usePlacementStore((state) => state.setCampusPrediction);

  const [uploadedRows, setUploadedRows] = useState([]);
  const [sourceName, setSourceName] = useState('Current workflow data');
  const [result, setResult] = useState(campusPrediction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadSampleTemplate = async () => {
    try {
      const response = await fetch('/campus_predictor_sample.csv');
      if (!response.ok) {
        setError('Unable to download sample template right now.');
        return;
      }

      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'campus_predictor_sample.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      setError('Template download failed. Please try again.');
    }
  };

  const fallbackRows = useMemo(() => {
    return studentPlacementRows.map((row) => ({
      name: row.name,
      branch: row.branch,
      cgpa: row.cgpa,
      status: row.status,
      company: row.company,
      package: 0,
      internships: 0,
      no_of_projects: 0,
      no_of_programming_languages: 0,
      dsa: 0,
      web_dev: 0,
      machine_learning: 0,
      cloud: 0,
    }));
  }, [studentPlacementRows]);

  const activeRows = uploadedRows.length ? uploadedRows : fallbackRows;

  const handleCsvUpload = (file) => {
    setError('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors?.length) {
          setError(errors[0].message || 'Invalid CSV format.');
          return;
        }

        if (!data?.length) {
          setError('CSV has no usable rows. Upload a file with headers and data.');
          setUploadedRows([]);
          return;
        }

        setUploadedRows(data || []);
        setSourceName(file.name || 'Uploaded CSV');
      },
    });
  };

  const runPrediction = async () => {
    if (!activeRows.length) {
      setError('No rows available to predict. Upload CSV or ensure workflow data exists.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await predictCampusPlacements(activeRows);
      setResult(response);
      setCampusPrediction(response);
    } catch (predictError) {
      setError(predictError.message || 'Unable to generate campus prediction.');
      setResult(null);
      setCampusPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPredictedInput = () => {
    if (!activeRows.length) return;
    const content = csvFromRows(activeRows);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campus-predictor-input-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const branchColumns = [
    { key: 'branch', label: 'Branch' },
    { key: 'total', label: 'Students' },
    { key: 'placed', label: 'Placed' },
    {
      key: 'placement_rate',
      label: 'Placement %',
      render: (value) => `${value}%`,
    },
    {
      key: 'avg_package',
      label: 'Avg Package',
      render: (value) => `${Number(value || 0).toFixed(2)} LPA`,
    },
  ];

  const branchRows = (result?.highest_sal_in_each_branch || []).map((row, index) => ({
    id: `branch_${row.branch}_${index}`,
    ...row,
  }));

  const companyRows = (result?.top_companies || []).map((row, index) => ({
    id: `cmp_${row.company}_${index}`,
    ...row,
  }));

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Campus Predictor'
        subtitle='Campus-level analytics and prediction engine for planning offers, branches, and placement actions.'
        action={
          <div className='flex flex-wrap gap-2'>
            <Button variant='secondary' onClick={downloadSampleTemplate}>
              <Download className='h-4 w-4' />
              Sample Template
            </Button>
            <Button variant='secondary' onClick={downloadPredictedInput} disabled={!activeRows.length}>
              <Download className='h-4 w-4' />
              Download Current Input
            </Button>
          </div>
        }
      />

      <div className='pf-stagger grid gap-4 lg:grid-cols-2'>
        <Card className='border-teal-100 bg-gradient-to-br from-teal-50/70 to-white'>
          <h3 className='text-base font-semibold text-slate-900'>Upload Campus Data CSV</h3>
          <p className='mt-1 text-sm text-slate-500'>Use donor-style template columns for best results (tier, cgpa, projects, skills, status, package).</p>

          <label className='mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-teal-300 hover:bg-teal-50'>
            <FileUp className='h-6 w-6 text-slate-500' />
            <span className='mt-2 text-sm font-medium text-slate-700'>Click to upload campus CSV</span>
            <input
              type='file'
              accept='.csv'
              className='hidden'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleCsvUpload(file);
              }}
            />
          </label>

          <p className='mt-3 text-xs text-slate-500'>Input source: {sourceName}</p>
        </Card>

        <Card>
          <h3 className='text-base font-semibold text-slate-900'>Run Predictor</h3>
          <p className='mt-1 text-sm text-slate-500'>Runs campus placement prediction with backend-first and local fallback strategy.</p>

          <div className='mt-4 grid gap-3 md:grid-cols-2'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Rows available: {activeRows.length}</div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>Prediction source: {result?.source || 'not run yet'}</div>
          </div>

          <Button className='mt-4 w-full' onClick={runPrediction} disabled={loading || !activeRows.length}>
            <Sparkles className='h-4 w-4' />
            {loading ? 'Predicting...' : 'Run Campus Prediction'}
          </Button>

          {error ? <p className='mt-3 text-xs text-rose-600'>{error}</p> : null}
        </Card>
      </div>

      {!result && !loading && !activeRows.length ? (
        <Card>
          <p className='text-sm text-slate-600'>No campus rows available yet. Upload a CSV template to start prediction.</p>
        </Card>
      ) : null}

      {result ? (
        <>
          {(result.warnings || []).length ? (
            <Card>
              <SectionHeader title='Input Warnings' subtitle='Predictor completed, but some quality warnings were detected.' />
              <div className='space-y-2'>
                {result.warnings.map((warning) => (
                  <p key={warning} className='rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
                    {warning}
                  </p>
                ))}
              </div>
            </Card>
          ) : null}

          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <p className='text-sm text-slate-500'>Total Students</p>
              <p className='mt-2 text-3xl font-bold text-slate-900'>{result.total_no_of_students}</p>
            </Card>
            <Card>
              <p className='text-sm text-slate-500'>Placed</p>
              <p className='mt-2 text-3xl font-bold text-emerald-700'>{result.total_placed}</p>
            </Card>
            <Card>
              <p className='text-sm text-slate-500'>Not Placed</p>
              <p className='mt-2 text-3xl font-bold text-rose-700'>{result.total_not_placed}</p>
            </Card>
            <Card>
              <p className='text-sm text-slate-500'>Placement Rate</p>
              <p className='mt-2 text-3xl font-bold text-teal-700'>{result.placement_rate}%</p>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <p className='text-sm text-slate-500'>Highest Salary</p>
              <p className='mt-2 text-2xl font-bold text-emerald-700'>{result.Overall_highest_average_least?.highest || 0} LPA</p>
            </Card>
            <Card>
              <p className='text-sm text-slate-500'>Average Salary</p>
              <p className='mt-2 text-2xl font-bold text-teal-700'>{result.Overall_highest_average_least?.Average || 0} LPA</p>
            </Card>
            <Card>
              <p className='text-sm text-slate-500'>Least Salary</p>
              <p className='mt-2 text-2xl font-bold text-slate-900'>{result.Overall_highest_average_least?.least || 0} LPA</p>
            </Card>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <SectionHeader title='Top Factors' subtitle='Key insights affecting campus outcomes.' />
              <div className='space-y-2'>
                {(result.top_factors_affecting_placements || []).map((line) => (
                  <p key={line} className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                    {line}
                  </p>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeader title='Important Technical Skills' subtitle='Derived from donor-style feature correlation logic.' />
              <div className='flex flex-wrap gap-2'>
                {(result.imp_technical_skills || []).length ? (
                  result.imp_technical_skills.map((skill) => (
                    <span key={skill} className='rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700'>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className='text-sm text-slate-500'>No high-correlation technical skills detected from current data.</p>
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader title='Branch Placement Rate' subtitle='Prediction-ready branch level view.' />
              <div className='h-[260px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={result.highest_sal_in_each_branch || []}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='branch' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='placement_rate' fill='#0f5c8e' radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <SectionHeader title='Branch Breakdown Table' subtitle='Operational detail for action planning.' />
            <DataTable columns={branchColumns} rows={branchRows} emptyText='No branch data available.' />
          </Card>

          <Card>
            <SectionHeader title='Top Companies' subtitle='Company-level selection conversion snapshot.' />
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 text-sm'>
                <thead className='bg-slate-50'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-500'>Company</th>
                    <th className='px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-500'>Applicants</th>
                    <th className='px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-500'>Selected</th>
                    <th className='px-4 py-2 text-left text-xs uppercase tracking-wide text-slate-500'>Conversion</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {companyRows.length ? (
                    companyRows.map((row) => (
                      <tr key={row.id}>
                        <td className='px-4 py-2 text-slate-700'>{row.company}</td>
                        <td className='px-4 py-2 text-slate-700'>{row.applicants}</td>
                        <td className='px-4 py-2 text-slate-700'>{row.selected}</td>
                        <td className='px-4 py-2 text-slate-700'>{row.conversion_rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className='px-4 py-4 text-slate-500' colSpan={4}>No company stats available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </PageContainer>
  );
}
