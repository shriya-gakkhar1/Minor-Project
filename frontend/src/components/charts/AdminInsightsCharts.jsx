import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../ChartCard';

const PIE_COLORS = ['#4f46e5', '#2563eb', '#0891b2', '#0d9488', '#65a30d', '#d97706', '#dc2626'];

export default function AdminInsightsCharts({
  placementsByCompany,
  companyBarData,
  selectedCompanyFilter,
  setSelectedCompanyFilter,
}) {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <ChartCard
        title='Company-wise Placements'
        subtitle='Click pie slices to filter dashboard'
        action={
          selectedCompanyFilter !== 'all' ? (
            <button
              className='rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700'
              onClick={() => setSelectedCompanyFilter('all')}
            >
              Active: {selectedCompanyFilter}
            </button>
          ) : null
        }
      >
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={placementsByCompany}
              dataKey='value'
              nameKey='name'
              innerRadius={50}
              outerRadius={95}
              paddingAngle={4}
              onClick={(entry) => setSelectedCompanyFilter(entry.name)}
            >
              {placementsByCompany.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  opacity={selectedCompanyFilter === 'all' || selectedCompanyFilter === entry.name ? 1 : 0.35}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title='Company vs Selected Students' subtitle='Selection outcomes across drives'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={companyBarData}>
            <XAxis dataKey='name' tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey='selected' radius={[8, 8, 0, 0]} fill='#4f46e5' />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
