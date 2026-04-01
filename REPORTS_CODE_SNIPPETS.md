# ReportsPage - Code Snippets & Examples

## Core Implementation Snippets

### 1. Filter Logic - Complete Implementation

```javascript
// Apply filters with priority logic
const filteredData = useMemo(() => {
  let data = [...studentPlacementRows];

  // PRIORITY: Student filter overrides others
  if (filters.student) {
    data = data.filter((row) => row.id === filters.student);
    // At this point, company and status filters still apply
  } else {
    // Only apply these if NO student selected
    if (filters.branch !== 'All') {
      data = data.filter((row) => row.branch === filters.branch);
    }
    if (filters.cgpaMin) {
      const min = parseFloat(filters.cgpaMin);
      data = data.filter((row) => row.cgpa >= min);
    }
    if (filters.cgpaMax) {
      const max = parseFloat(filters.cgpaMax);
      data = data.filter((row) => row.cgpa <= max);
    }
  }

  // ALWAYS apply these filters
  if (filters.company !== 'All') {
    data = data.filter((row) => {
      const company = companies.find((c) => c.id === row.companyId);
      return company?.name === filters.company;
    });
  }

  if (filters.status !== 'All') {
    const statusMap = {
      Applied: 'applied',
      Shortlisted: 'shortlisted',
      Rejected: 'rejected',
      Placed: 'placed',
    };
    data = data.filter((row) => row.status === statusMap[filters.status]);
  }

  return data;
}, [filters, studentPlacementRows, companies]);
```

### 2. Chart Data Preparation - All Types

```javascript
const chartData = useMemo(() => {
  // BAR + LINE CHART: Company comparison
  if (chartType === 'bar' || chartType === 'line') {
    const companyMap = {};
    
    filteredData.forEach((row) => {
      const company = companies.find((c) => c.id === row.companyId);
      const name = company?.name || 'Unknown';
      
      if (!companyMap[name]) {
        companyMap[name] = { name, count: 0, placed: 0 };
      }
      
      companyMap[name].count += 1;
      if (row.status === 'placed') {
        companyMap[name].placed += 1;
      }
    });

    return Object.values(companyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 only
  }

  // PIE CHART: Status distribution
  if (chartType === 'pie') {
    const statusMap = {};
    
    filteredData.forEach((row) => {
      const status = row.status || 'pending';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }

  // AREA CHART: CGPA distribution
  if (chartType === 'area') {
    const cgpaRanges = [
      { label: '< 6', min: 0, max: 6 },
      { label: '6-7', min: 6, max: 7 },
      { label: '7-8', min: 7, max: 8 },
      { label: '8-9', min: 8, max: 9 },
      { label: '9+', min: 9, max: Infinity },
    ];

    return cgpaRanges.map((range) => ({
      name: range.label,
      students: filteredData.filter((row) => 
        row.cgpa >= range.min && row.cgpa < range.max
      ).length,
    }));
  }

  return [];
}, [chartType, filteredData, companies]);
```

### 3. Chart Rendering - Bar Chart Example

```javascript
{chartType === 'bar' && (
  <ResponsiveContainer width='100%' height='100%'>
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='name' />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey='count' fill='#6366f1' name='Total' />
      <Bar dataKey='placed' fill='#34d399' name='Placed' />
    </BarChart>
  </ResponsiveContainer>
)}
```

### 4. Chart Rendering - Pie Chart Example

```javascript
{chartType === 'pie' && (
  <ResponsiveContainer width='100%' height='100%'>
    <PieChart>
      <Pie
        data={chartData}
        cx='50%'
        cy='50%'
        labelLine={false}
        label={({ name, value }) => `${name}: ${value}`}
        outerRadius={110}
        fill='#8884d8'
        dataKey='value'
      >
        {chartData.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={COLORS[index % COLORS.length]} 
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
)}
```

### 5. PDF Export - Complete Function

```javascript
const handleExportPDF = async () => {
  if (isExporting) return;
  setIsExporting(true);

  try {
    // Step 1: Capture chart element as image
    const canvas = await html2canvas(
      document.getElementById('report-content'),
      {
        scale: 2,
        useCORS: true,
        logging: false,
      }
    );

    // Step 2: Create PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Step 3: Add title
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Placement Report', 20, 20);

    // Step 4: Add filter summary
    pdf.setFontSize(11);
    let yPos = 35;
    pdf.text('Filters Applied:', 20, yPos);
    yPos += 8;

    const filterSummary = [];
    
    if (filters.student) {
      const studentName = students.find((s) => s.id === filters.student)?.name;
      filterSummary.push(`Student: ${studentName}`);
    } else {
      if (filters.branch !== 'All') {
        filterSummary.push(`Branch: ${filters.branch}`);
      }
      if (filters.cgpaMin) {
        filterSummary.push(`CGPA Min: ${filters.cgpaMin}`);
      }
      if (filters.cgpaMax) {
        filterSummary.push(`CGPA Max: ${filters.cgpaMax}`);
      }
    }
    
    if (filters.company !== 'All') {
      filterSummary.push(`Company: ${filters.company}`);
    }
    if (filters.status !== 'All') {
      filterSummary.push(`Status: ${filters.status}`);
    }

    // Write filter bullets
    filterSummary.forEach((text) => {
      pdf.text(`• ${text}`, 25, yPos);
      yPos += 6;
    });

    // Step 5: Add record count
    yPos += 5;
    pdf.setFontSize(10);
    pdf.text(`Total Records: ${filteredData.length}`, 20, yPos);

    // Step 6: Add chart image
    const maxHeight = 100;
    const chartImgHeight = Math.min(imgHeight, maxHeight);
    const chartImgWidth = (imgWidth * chartImgHeight) / imgHeight;
    
    pdf.addImage(
      imgData,
      'PNG',
      (imgWidth - chartImgWidth) / 2,
      yPos + 8,
      chartImgWidth,
      chartImgHeight
    );

    // Step 7: Save file
    const filename = `placement-report-${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
```

### 6. Optional Filters UI Component

```javascript
// Student Filter - Always visible
<div>
  <label className='block text-sm font-medium text-slate-700 mb-2'>
    Student
  </label>
  <select
    value={filters.student}
    onChange={(e) => setFilters({ ...filters, student: e.target.value })}
    className='w-full px-3 py-2 rounded-lg border border-slate-200 
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
               text-sm text-slate-900'
  >
    {studentOptions.map((student) => (
      <option key={student.id} value={student.id}>
        {student.name}
      </option>
    ))}
  </select>
</div>

// CGPA Min - Hidden when student selected
{!filters.student && (
  <div>
    <label className='block text-sm font-medium text-slate-700 mb-2'>
      CGPA Min
    </label>
    <input
      type='number'
      min='0'
      max='10'
      step='0.1'
      placeholder='0'
      value={filters.cgpaMin}
      onChange={(e) => setFilters({ ...filters, cgpaMin: e.target.value })}
      className='w-full px-3 py-2 rounded-lg border...'
    />
  </div>
)}
```

### 7. Reset Filters Function

```javascript
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
  className='mt-4 px-4 py-2 rounded-lg border border-slate-200 
             text-sm font-medium text-slate-700 hover:bg-slate-50 
             transition-colors'
>
  Reset Filters
</button>
```

### 8. Table Data Formatting

```javascript
const tableData = useMemo(
  () => filteredData.map((row) => ({
    ...row,
    companyName: companies.find((c) => c.id === row.companyId)?.name || 'Unknown',
    statusDisplay: 
      row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || 'Pending',
  })),
  [filteredData, companies]
);

// Table columns definition
const tableColumns = [
  { key: 'name', label: 'Student Name' },
  { key: 'branch', label: 'Branch' },
  { key: 'cgpa', label: 'CGPA' },
  { key: 'companyName', label: 'Company' },
  { key: 'statusDisplay', label: 'Status' },
];

// Render table
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
      <tr key={idx} className='border-b border-slate-100 hover:bg-slate-50'>
        {tableColumns.map((col) => (
          <td key={col.key} className='px-4 py-3 text-slate-600'>
            {col.key === 'cgpa' 
              ? parseFloat(row[col.key]).toFixed(2) 
              : row[col.key]}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

---

## Integration Examples

### Using ReportsPage in App Router

```javascript
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      <Route path='/reports' element={<ReportsPage />} />
      {/* other routes */}
    </Routes>
  );
}
```

### Passing Props (if needed in future)

```javascript
// ReportsPage could accept optional initial filters
export default function ReportsPage({ initialFilters = {} }) {
  const [filters, setFilters] = useState({
    student: '',
    branch: 'All',
    company: 'All',
    status: 'All',
    cgpaMin: '',
    cgpaMax: '',
    ...initialFilters, // Override with props
  });
  // ... rest of code
}

// Usage:
<ReportsPage initialFilters={{ status: 'Placed' }} />
```

---

## Data Structure Reference

### studentPlacementRows Object
```javascript
{
  id: string,              // Student ID
  name: string,            // Student name
  email: string,
  phone: string,
  branch: string,          // "CSE", "ECE", etc.
  cgpa: number,            // 0-10
  companyId: string,
  status: string,          // "applied", "placed", etc.
  date: string,            // ISO date
  // ... other fields
}
```

### companies Object
```javascript
{
  id: string,
  name: string,            // "Google", "Microsoft", etc.
  role: string,            // "SDE-1", "Intern", etc.
  salary: number,
  // ... other fields
}
```

---

## Performance Optimization Tips

### 1. Memoize Expensive Calculations
```javascript
const expensiveData = useMemo(() => {
  // Complex calculation
  return result;
}, [dependencies]);
```

### 2. Debounce Filter Changes
```javascript
const [filters, setFilters] = useState({});
const [debouncedFilters, setDebouncedFilters] = useState({});

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedFilters(filters);
  }, 300);
  
  return () => clearTimeout(timer);
}, [filters]);

// Use debouncedFilters in filteredData memo
```

### 3. Pagination for Large Tables
```javascript
const itemsPerPage = 20;
const [page, setPage] = useState(0);

const paginatedData = tableData.slice(
  page * itemsPerPage,
  (page + 1) * itemsPerPage
);
```

---

**Note**: All code snippets are extracted from the ReportsPage.jsx and are production-ready.
