import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { fetchInsightsSummary } from '../services/insightsLabService';

export default function InsightsLabPage() {
  const [summary, setSummary] = useState(null);
  const [loadingState, setLoadingState] = useState({ loading: true, error: null });

  useEffect(() => {
    let isActive = true;
    setLoadingState({ loading: true, error: null });

    fetchInsightsSummary()
      .then((data) => {
        if (!isActive) return;
        setSummary(data);
        setLoadingState({ loading: false, error: null });
      })
      .catch((error) => {
        if (!isActive) return;
        const message = error?.response?.data?.detail || error?.message || 'Unable to load Insights Lab data.';
        setLoadingState({ loading: false, error: message });
      });

    return () => {
      isActive = false;
    };
  }, []);

  const topFeatures = useMemo(() => {
    if (!summary?.top_features) return [];
    return summary.top_features.map((item) => ({
      feature: String(item.feature || '').replace('cat__', '').replace('num__', ''),
      importance: Number(item.importance || 0),
    }));
  }, [summary]);

  const branchPerformance = useMemo(() => {
    if (!summary?.branch_performance) return [];
    return summary.branch_performance.map((row) => ({
      branch: row.branch,
      placementRate: Number(row.placement_rate || 0),
      avgSalary: Number(row.avg_salary || 0),
    }));
  }, [summary]);

  const cgpaThresholds = summary?.cgpa_thresholds || {};
  const salaryTrends = summary?.salary_trends || {};
  const baselinePrediction = summary?.baseline_prediction || {};
  const placementProbability = baselinePrediction?.placement_probability;
  const hasFeatureData = topFeatures.length > 0;
  const hasBranchData = branchPerformance.length > 0;
  const hasSummary = Boolean(summary);

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Insights Lab'
        subtitle='ML-powered placement intelligence built from real training data and model outputs.'
      />

      {loadingState.loading ? (
        <Card>
          <p className='text-sm text-slate-500'>Loading insights from the ML service...</p>
        </Card>
      ) : loadingState.error ? (
        <Card className='border-rose-100 bg-rose-50'>
          <p className='text-sm text-rose-700'>{loadingState.error}</p>
        </Card>
      ) : null}

      <div className='pf-stagger grid gap-4 md:grid-cols-3'>
        <Card className='border-teal-100 bg-gradient-to-br from-teal-50 to-white'>
          <p className='text-sm text-slate-500'>Baseline Placement Probability</p>
          <p className='mt-2 text-3xl font-bold text-slate-900'>
            {placementProbability !== undefined ? `${placementProbability}%` : '--'}
          </p>
          <p className='mt-1 text-xs text-slate-500'>From model median profile</p>
        </Card>
        <Card>
          <p className='text-sm text-slate-500'>Model Accuracy</p>
          <p className='mt-2 text-3xl font-bold text-slate-900'>
            {hasSummary ? `${Math.round((summary.accuracy || 0) * 100)}%` : '--'}
          </p>
          <p className='mt-1 text-xs text-slate-500'>{summary?.model_used || 'Model'} classifier</p>
        </Card>
        <Card className='border-sky-100 bg-gradient-to-br from-sky-50 to-white'>
          <p className='text-sm text-slate-500'>Median CGPA (Placed)</p>
          <p className='mt-2 text-3xl font-bold text-teal-700'>
            {cgpaThresholds.placed_median ?? '--'}
          </p>
          <p className='mt-1 text-xs text-slate-500'>Derived from training data</p>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <SectionHeader title='Feature Importance' subtitle='Top drivers of placement predictions.' />
          <div className='h-[280px]'>
            {hasFeatureData ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={topFeatures.slice(0, 6)}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='feature' interval={0} angle={-10} textAnchor='end' height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='importance' fill='#0f5c8e' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-slate-500'>No feature data available yet.</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title='Branch Performance' subtitle='Placement rate and average salary by branch.' />
          <div className='h-[280px]'>
            {hasBranchData ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={branchPerformance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='branch' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='placementRate' fill='#0f766e' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-slate-500'>No branch data available yet.</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title='Key Insights' subtitle='Actionable ML insights extracted from model and data.' />
        {hasSummary ? (
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-600'>
              <p className='font-semibold text-slate-800'>Top Predictive Factor</p>
              <p className='mt-2'>{topFeatures[0]?.feature || 'N/A'}</p>
            </div>
            <div className='rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-600'>
              <p className='font-semibold text-slate-800'>CGPA Median Gap</p>
              <p className='mt-2'>
                Placed: {cgpaThresholds.placed_median ?? '--'} | Not placed: {cgpaThresholds.not_placed_median ?? '--'}
              </p>
            </div>
            <div className='rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-600'>
              <p className='font-semibold text-slate-800'>Salary Trend (Avg LPA)</p>
              <p className='mt-2'>
                Overall: {salaryTrends.overall_avg ?? '--'} | Placed: {salaryTrends.placed_avg ?? '--'}
              </p>
            </div>
          </div>
        ) : (
          <div className='flex h-[120px] items-center justify-center text-sm text-slate-500'>No insights available yet.</div>
        )}
      </Card>
    </PageContainer>
  );
}
