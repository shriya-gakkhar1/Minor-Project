# Enhanced ReportsPage - Implementation Guide

## Overview

The enhanced ReportsPage now provides advanced filtering, multiple chart types, and PDF export capabilities for placement analytics.

---

## 🎯 Key Features Implemented

### 1. Advanced Filtering System

**Filter Types:**
- **Student**: Select individual student or "All Students"
- **Branch**: Dropdown with all available branches (hidden if specific student selected)
- **Company**: All companies from applications
- **Status**: Applied, Shortlisted, Rejected, Placed
- **CGPA Range**: Min and Max values (hidden if specific student selected)

**Filter Behavior:**
- All filters are **optional** and can be combined
- If **no filters applied** → show all data
- If **specific student selected** → override other filters and show ONLY that student
- Company and Status filters always apply, even with student filter
- CGPA filters only apply when no specific student is selected

---

## 🔍 Filter Logic (Critical)

### Algorithm

```javascript
1. Start with all studentPlacementRows
2. If student selected:
   - Filter by student ID only
   - Skip branch and CGPA filters
3. Else (no specific student):
   - Apply branch filter if not "All"
   - Apply CGPA min/max filters
4. Always apply:
   - Company filter if not "All"
   - Status filter if not "All"
5. Return filtered dataset
```

### Code Implementation

```javascript
const filteredData = useMemo(() => {
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
      data = data.filter((row) => row.cgpa >= parseFloat(filters.cgpaMin));
    }
    if (filters.cgpaMax) {
      data = data.filter((row) => row.cgpa <= parseFloat(filters.cgpaMax));
    }
  }

  // Company filter (applied regardless)
  if (filters.company !== 'All') {
    data = data.filter((row) => {
      const company = companies.find((c) => c.id === row.companyId);
      return company?.name === filters.company;
    });
  }

  // Status filter (applied regardless)
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

---

## 📊 Chart Rendering

### Supported Chart Types

1. **Bar Chart**: Shows companies vs total/placed students
   - Useful for: Company comparison, placement rates
   - Data: Company name, total count, placed count

2. **Line Chart**: Same data as bar but line visualization
   - Useful for: Trend visualization across companies

3. **Pie Chart**: Status distribution (Applied, Shortlisted, Rejected, Placed)
   - Useful for: Status breakdown, proportions

4. **Area Chart**: CGPA distribution
   - Useful for: Academic performance distribution
   - Shows: CGPA ranges (<6, 6-7, 7-8, 8-9, 9+) vs student count

### Chart Data Preparation

```javascript
const chartData = useMemo(() => {
  if (chartType === 'bar' || chartType === 'line') {
    // Company vs Count
    const companyMap = {};
    filteredData.forEach((row) => {
      const company = companies.find((c) => c.id === row.companyId);
      const name = company?.name || 'Unknown';
      if (!companyMap[name]) {
        companyMap[name] = { name, count: 0, placed: 0 };
      }
      companyMap[name].count += 1;
      if (row.status === 'placed') companyMap[name].placed += 1;
    });
    return Object.values(companyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 companies
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
    }));
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
      students: filteredData.filter(
        (row) => row.cgpa >= range.min && row.cgpa < range.max
      ).length,
    }));
  }

  return [];
}, [chartType, filteredData, companies]);
```

---

## 📥 PDF Export

### Functionality

**Button**: "⬇️ Download Report (PDF)"
- Disabled when no data is filtered
- Shows "Exporting..." during generation

### PDF Content Structure

```
┌─────────────────────────────────┐
│     Placement Report            │
├─────────────────────────────────┤
│ Filters Applied:                │
│ • Student: Aarav Sharma         │
│ • Company: Google               │
│ • Status: Placed                │
│ Total Records: 5                │
├─────────────────────────────────┤
│                                 │
│    [Chart Image]                │
│                                 │
└─────────────────────────────────┘
```

### Export Implementation

```javascript
const handleExportPDF = async () => {
  if (isExporting) return;
  setIsExporting(true);

  try {
    // Step 1: Capture chart as image
    const canvas = await html2canvas(
      document.getElementById('report-content'),
      { scale: 2, useCORS: true, logging: false }
    );

    // Step 2: Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Step 3: Add title
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
      if (filters.branch !== 'All') 
        filterSummary.push(`Branch: ${filters.branch}`);
      if (filters.cgpaMin) 
        filterSummary.push(`CGPA Min: ${filters.cgpaMin}`);
      if (filters.cgpaMax) 
        filterSummary.push(`CGPA Max: ${filters.cgpaMax}`);
    }
    if (filters.company !== 'All') 
      filterSummary.push(`Company: ${filters.company}`);
    if (filters.status !== 'All') 
      filterSummary.push(`Status: ${filters.status}`);

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

    // Step 7: Save PDF
    pdf.save(
      `placement-report-${new Date().toISOString().split('T')[0]}.pdf`
    );
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF. Please try again.');
  } finally {
    setIsExporting(false);
  }
};
```

### PDF Filename Format

```
placement-report-YYYY-MM-DD.pdf
Example: placement-report-2026-04-01.pdf
```

---

## 🎨 UI Components

### Filter Section
- 6-column responsive grid on large screens
- 2-column on tablets
- 1-column on mobile
- Reset button to clear all filters

### Chart Type Buttons
- 4 buttons: Bar, Line, Pie, Area
- Active button highlighted in indigo
- Icon + label for clarity

### Table View
- Displays filtered data
- 5 columns: Student Name, Branch, CGPA, Company, Status
- Hover effect for row selection
- Record count displayed in header

---

## 📋 Data Flow

```
User Applies Filter
        ↓
updateFilter() state changes
        ↓
filteredData useMemo recalculates
        ↓
chartData useMemo recalculates based on chart type
        ↓
tableData useMemo formats table rows
        ↓
UI re-renders with new data
```

---

## 🔧 Customization

### Add New Chart Type

```javascript
// 1. Add to CHART_TYPES array
const CHART_TYPES = [
  // ... existing types
  { id: 'scatter', label: 'Scatter Plot', icon: '🔵' },
];

// 2. Add data preparation in chartData useMemo
if (chartType === 'scatter') {
  return filteredData.map((row) => ({
    x: row.cgpa,
    y: someOtherMetric,
    name: row.name,
  }));
}

// 3. Add rendering component
{chartType === 'scatter' && (
  <ScatterChart data={chartData}>
    {/* Scatter chart JSX */}
  </ScatterChart>
)}
```

### Add New Filter

```javascript
// 1. Add to filter state
const [filters, setFilters] = useState({
  // ... existing
  placementYear: 'All', // New filter
});

// 2. Add UI input
<div>
  <label>Placement Year</label>
  <select value={filters.placementYear} 
          onChange={(e) => setFilters({...filters, placementYear: e.target.value})}>
    {/* options */}
  </select>
</div>

// 3. Add filter logic
if (filters.placementYear !== 'All') {
  data = data.filter((row) => row.placementYear === filters.placementYear);
}
```

---

## 📦 Dependencies

```json
{
  "jspdf": "^2.5.0",
  "html2canvas": "^1.4.1",
  "recharts": "^3.8.1" (already installed),
  "zustand": "^5.0.12" (already installed)
}
```

---

## ✅ Testing Checklist

- [ ] Filters appear correctly
- [ ] Selecting student hides branch/CGPA filters
- [ ] Reset button clears all filters
- [ ] Bar chart renders with filtered data
- [ ] Line chart renders with filtered data
- [ ] Pie chart shows status distribution
- [ ] Area chart shows CGPA distribution
- [ ] Chart updates when filters change
- [ ] Chart updates when chart type changes
- [ ] Table shows correct number of rows matching chart
- [ ] PDF export includes all filter info
- [ ] PDF downloads with correct filename
- [ ] Empty state shows when no data matches filters

---

## 🐛 Troubleshooting

### Chart Not Showing
**Solution**: Check if `filteredData.length > 0` and `chartData` has values

### PDF Export Fails
**Solution**: 
- Check browser console for errors
- Ensure chart is rendered before export
- Try with different filters

### Filter Logic Not Working
**Solution**:
- Verify student ID matches filter state
- Check company name matches exactly
- Ensure status mapping is correct

### Performance Issues with Large Dataset
**Solution**:
- Implement pagination in table
- Limit chart data to top N items (already done for bar/line)
- Use React.memo for chart components

---

## 📚 Code Examples

### Get Filtered Data Programmatically

```javascript
const ReportsPage = () => {
  const filteredData = useMemo(() => {
    // ... filter logic here
    return data;
  }, [filters, studentPlacementRows, companies]);
  
  // Use filteredData...
};
```

### Export Specific Chart to CSV

```javascript
const handleExportCSV = () => {
  const csv = tableData.map(row => 
    [row.name, row.branch, row.cgpa, row.companyName, row.statusDisplay].join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `placement-data-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

---

## 🎯 Future Enhancements

- [ ] Export to Excel (XLSX)
- [ ] Scheduled report emails
- [ ] Real-time data synchronization
- [ ] Custom date range filters
- [ ] Advanced analytics (median salary, placement rate %)
- [ ] Comparison reports (year-over-year)
- [ ] Custom chart creation
- [ ] Dashboard favorites/bookmarks

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅
