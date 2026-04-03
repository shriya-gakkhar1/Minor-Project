import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import DataTable from '../components/DataTable';
import { usePlacementStore } from '../store/usePlacementStore';

const COLORS = ['#6366f1', '#a78bfa', '#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#f87171', '#818cf8'];

const CHART_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: '📊' },
  { id: 'line', label: 'Line Chart', icon: '📈' },
  { id: 'pie', label: 'Pie Chart', icon: '🥧' },
  { id: 'area', label: 'Area Chart', icon: '📉' },
];

export default function ReportsPage() {
  // Get data from store - use separate selectors to avoid infinite loops
  const students = usePlacementStore((state) => state.students);
  const companies = usePlacementStore((state) => state.companies);
  const applications = usePlacementStore((state) => state.applications);
  const studentPlacementRows = usePlacementStore((state) => state.studentPlacementRows);

  // Filter states
  const [filters, setFilters] = useState({
    student: '', // Empty = All students
    branch: 'All',
    company: 'All',
    status: 'All',
    cgpaMin: '',
    cgpaMax: '',
  });

  const [chartType, setChartType] = useState('bar');
  const [isExporting, setIsExporting] = useState(false);

  // Get unique values for filters
  const studentOptions = useMemo(
    () => [{ id: '', name: 'All Students' }, ...students],
    [students]
  );

  const branchOptions = useMemo(() => {
    const branches = new Set(students.map((s) => s.branch).filter(Boolean));
    return ['All', ...Array.from(branches)];
  }, [students]);

  const companyOptions = useMemo(() => {
    const companys = new Set(applications.map((app) => {
      const company = companies.find((c) => c.id === app.companyId);
      return company?.name;
    }).filter(Boolean));
    // Include 'Unassigned' if it exists in data
    const hasUnassigned = applications.some((app) => !app.companyId || !companies.find((c) => c.id === app.companyId));
    const options = ['All', ...Array.from(companys)];
    if (hasUnassigned) options.push('Unassigned');
    return options;
  }, [applications, companies]);

  const statusOptions = ['All', 'Applied', 'Shortlisted', 'Rejected', 'Placed'];

  // Apply filters logic
  const filteredData = useMemo(() => {
    if (!studentPlacementRows || studentPlacementRows.length === 0) return [];
    
    let data = [...studentPlacementRows];

    // Priority: If student is selected, only show that student
    if (filters.student) {
      data = data.filter((row) => row.id === filters.student);
    } else {
      // Apply other filters only if no specific student selected
      if (filters.branch !== 'All') {
        data = data.filter((row) => row.branch === filters.branch);
      }

      if (filters.cgpaMin) {
        const min = parseFloat(filters.cgpaMin);
        if (!isNaN(min)) {
          data = data.filter((row) => row.cgpa >= min);
        }
      }

      if (filters.cgpaMax) {
        const max = parseFloat(filters.cgpaMax);
        if (!isNaN(max)) {
          data = data.filter((row) => row.cgpa <= max);
        }
      }
    }

    // Company filter (applied regardless)
    if (filters.company !== 'All') {
      data = data.filter((row) => {
        if (filters.company === 'Unassigned') {
          return !row.companyId || !companies.find((c) => c.id === row.companyId);
        }
        const company = companies.find((c) => c.id === row.companyId);
        return company?.name === filters.company;
      });
    }

    // Status filter (applied regardless)
    if (filters.status !== 'All') {
      data = data.filter((row) => {
        const statusMap = {
          Applied: 'applied',
          Shortlisted: 'shortlisted',
          Rejected: 'rejected',
          Placed: 'placed',
        };
        return row.status === statusMap[filters.status];
      });
    }

    return data;
  }, [filters, studentPlacementRows, companies]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    if (chartType === 'bar' || chartType === 'line') {
      // Company vs Count (including Unassigned)
      const companyMap = {};
      filteredData.forEach((row) => {
        let name = 'Unassigned';
        if (row.companyId) {
          const company = companies.find((c) => c.id === row.companyId);
          name = company?.name || 'Unassigned';
        }
        if (!companyMap[name]) {
          companyMap[name] = { name, count: 0, placed: 0, isUnassigned: name === 'Unassigned' };
        }
        companyMap[name].count += 1;
        if (row.status === 'placed') companyMap[name].placed += 1;
      });
      return Object.values(companyMap).sort((a, b) => b.count - a.count).slice(0, 10) || [];
    }

    if (chartType === 'pie') {
      // Status distribution
      const statusMap = {};
      filteredData.forEach((row) => {
        const status = row.status || 'pending';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      return Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })) || [];
    }

    if (chartType === 'area') {
      // CGPA distribution
      const cgpaRanges = [
        { label: '< 6', min: 0, max: 6 },
        { label: '6-7', min: 6, max: 7 },
        { label: '7-8', min: 7, max: 8 },
        { label: '8-9', min: 8, max: 9 },
        { label: '9+', min: 9, max: Infinity },
      ];
      return cgpaRanges.map((range) => ({
        name: range.label,
        students: filteredData.filter((row) => row.cgpa >= range.min && row.cgpa < range.max)
          .length,
      })) || [];
    }

    return [];
  }, [chartType, filteredData, companies]);

  // Table data
  const tableData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    return filteredData.map((row) => ({
      ...row,
      companyName: companies.find((c) => c.id === row.companyId)?.name || 'Unknown',
      statusDisplay: row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || 'Pending',
    }));
  }, [filteredData, companies]);

  const tableColumns = [
    { key: 'name', label: 'Student Name' },
    { key: 'branch', label: 'Branch' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'companyName', label: 'Company' },
    { key: 'statusDisplay', label: 'Status' },
  ];

  // PDF Export
  const handleExportPDF = async () => {
    if (isExporting || !filteredData || filteredData.length === 0) return;
    setIsExporting(true);

    try {
      const reportElement = document.getElementById('report-content');
      if (!reportElement) {
        throw new Error('Report element not found');
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPos = 15;

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(25, 25, 112); // Dark indigo
      pdf.text('Placement Analytics Report', 20, yPos);
      yPos += 12;

      // Report metadata
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
      yPos += 8;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPos, 190, yPos);
      yPos += 8;

      // Filters section
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Active Filters:', 20, yPos);
      yPos += 7;

      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      
      const filterSummary = [];
      if (filters.student) {
        const studentName = students.find((s) => s.id === filters.student)?.name;
        filterSummary.push(`Student: ${studentName}`);
      } else {
        if (filters.branch !== 'All') filterSummary.push(`Branch: ${filters.branch}`);
        if (filters.cgpaMin) filterSummary.push(`CGPA Min: ${filters.cgpaMin}`);
        if (filters.cgpaMax) filterSummary.push(`CGPA Max: ${filters.cgpaMax}`);
      }
      if (filters.company !== 'All') filterSummary.push(`Company: ${filters.company}`);
      if (filters.status !== 'All') filterSummary.push(`Status: ${filters.status}`);

      if (filterSummary.length === 0) {
        pdf.text('No filters applied (showing all data)', 25, yPos);
        yPos += 6;
      } else {
        filterSummary.forEach((text) => {
          pdf.text(`• ${text}`, 25, yPos);
          yPos += 6;
        });
      }

      yPos += 4;
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${filteredData.length}`, 20, yPos);
      yPos += 10;

      // Chart image with better scaling
      const chartImg = canvas.toDataURL('image/png');
      const maxWidth = 170; // Leave margins
      const maxHeight = 80;
      const imgWidth = Math.min(maxWidth, (canvas.width * maxHeight) / canvas.height);
      const imgHeight = (imgWidth * canvas.height) / canvas.width;
      const xCenter = (210 - imgWidth) / 2;
      
      if (yPos + imgHeight < 260) {
        pdf.addImage(chartImg, 'PNG', xCenter, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } else {
        pdf.addPage();
        yPos = 20;
        pdf.addImage(chartImg, 'PNG', xCenter, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      }

      // Table data on new page if needed
      if (tableData.length > 0 && yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }

      // Table header
      if (tableData.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(25, 25, 112);
        pdf.text('Data Summary', 20, yPos);
        yPos += 8;

        // Simple table - just show first 10 rows
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        
        const displayRows = tableData.slice(0, 10);
        const colWidths = [40, 20, 20, 50, 30];
        const headers = ['Student', 'Branch', 'CGPA', 'Company', 'Status'];
        
        // Headers
        pdf.setFillColor(240, 240, 240);
        let xPos = 20;
        headers.forEach((header, i) => {
          pdf.text(header, xPos, yPos, { maxWidth: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });
        yPos += 6;
        
        // Rows
        displayRows.forEach((row) => {
          xPos = 20;
          const values = [
            row.name || '',
            row.branch || '',
            row.cgpa?.toFixed(2) || '',
            row.companyName || '',
            row.statusDisplay || ''
          ];
          values.forEach((val, i) => {
            pdf.text(String(val).substring(0, 15), xPos, yPos, { maxWidth: colWidths[i], align: 'left' });
            xPos += colWidths[i];
          });
          yPos += 5;
        });
        
        if (tableData.length > 10) {
          yPos += 3;
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`... and ${tableData.length - 10} more records`, 20, yPos);
        }
      }

      pdf.save(`placement-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title='Reporting & Statistics'
        subtitle='Advanced placement analytics with flexible filtering and multi-format exports.'
      />

      {/* Filters Section */}
      <Card className='mb-6'>
        <h3 className='text-lg font-semibold text-slate-900 mb-4'>Filters</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
          {/* Student Filter */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Student</label>
            <select
              value={filters.student}
              onChange={(e) => setFilters({ ...filters, student: e.target.value })}
              className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
            >
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter (hidden if student selected) */}
          {!filters.student && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
              >
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Company Filter */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Company</label>
            <select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
            >
              {companyOptions.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* CGPA Min (hidden if student selected) */}
          {!filters.student && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>CGPA Min</label>
              <input
                type='number'
                min='0'
                max='10'
                step='0.1'
                placeholder='0'
                value={filters.cgpaMin}
                onChange={(e) => setFilters({ ...filters, cgpaMin: e.target.value })}
                className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
              />
            </div>
          )}

          {/* CGPA Max (hidden if student selected) */}
          {!filters.student && (
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>CGPA Max</label>
              <input
                type='number'
                min='0'
                max='10'
                step='0.1'
                placeholder='10'
                value={filters.cgpaMax}
                onChange={(e) => setFilters({ ...filters, cgpaMax: e.target.value })}
                className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900'
              />
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={() =>
            setFilters({
              student: '',
              branch: 'All',
              company: 'All',
              status: 'All',
              cgpaMin: '',
              cgpaMax: '',
            })
          }
          className='mt-4 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors'
        >
          Reset Filters
        </button>
      </Card>

      {/* Chart Type Selector and Export */}
      <div className='flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === type.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportPDF}
          disabled={isExporting || filteredData.length === 0}
          className='px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        >
          {isExporting ? 'Exporting...' : '⬇️ Download Report (PDF)'}
        </button>
      </div>

      {/* Charts Section */}
      {filteredData.length > 0 ? (
        <Card className='mb-6'>
          <h3 className='text-lg font-semibold text-slate-900 mb-4'>Chart Analysis</h3>
          <div id='report-content' style={{ width: '100%', height: '450px', minHeight: '450px' }}>
            <ResponsiveContainer width='100%' height='100%' minHeight={0}>
              {chartType === 'bar' && (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='count' fill='#6366f1' name='Total' />
                  <Bar dataKey='placed' fill='#34d399' name='Placed' />
                </BarChart>
              )}

              {chartType === 'line' && (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='count' stroke='#6366f1' name='Total' />
                  <Line type='monotone' dataKey='placed' stroke='#34d399' name='Placed' />
                </LineChart>
              )}

              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isUnassigned ? '#ef4444' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}

              {chartType === 'area' && (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='students'
                    fill='#6366f1'
                    stroke='#4f46e5'
                    fillOpacity={0.6}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className='mb-6'>
          <p className='text-center text-slate-500'>No data available for the selected filters.</p>
        </Card>
      )}

      {/* Table Section */}
      {tableData.length > 0 && (
        <Card>
          <h3 className='text-lg font-semibold text-slate-900 mb-4'>
            Filtered Data ({tableData.length} records)
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-slate-50 border-b border-slate-200'>
                <tr>
                  {tableColumns.map((col) => (
                    <th key={col.key} className='px-4 py-3 text-left font-medium text-slate-700'>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                    {tableColumns.map((col) => (
                      <td key={col.key} className='px-4 py-3 text-slate-600'>
                        {col.key === 'cgpa' ? parseFloat(row[col.key]).toFixed(2) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
