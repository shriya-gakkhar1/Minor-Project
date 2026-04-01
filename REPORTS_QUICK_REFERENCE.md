# ReportsPage - Quick Reference

## File Location
`frontend/src/pages/ReportsPage.jsx`

---

## Component Structure

```
ReportsPage
├── Filters Section
│   ├── Student dropdown
│   ├── Branch dropdown (conditional)
│   ├── Company dropdown
│   ├── Status dropdown
│   ├── CGPA Min (conditional)
│   ├── CGPA Max (conditional)
│   └── Reset button
├── Chart Type Selector
│   ├── Bar Chart
│   ├── Line Chart
│   ├── Pie Chart
│   └── Area Chart
├── Export Button (PDF)
├── Chart Display
│   └── Dynamic chart based on chartType
└── Data Table
    └── Filtered student data
```

---

## State Management

### Hooks Used
```javascript
const [filters, setFilters] = useState({...})
const [chartType, setChartType] = useState('bar')
const [isExporting, setIsExporting] = useState(false)

// From Zustand
const { students, companies, applications, studentPlacementRows } = usePlacementStore(...)
```

### Filter State
```javascript
filters = {
  student: '',           // Student ID
  branch: 'All',         // Branch name
  company: 'All',        // Company name
  status: 'All',         // Applied|Shortlisted|Rejected|Placed
  cgpaMin: '',           // String, will be parsed to float
  cgpaMax: '',           // String, will be parsed to float
}
```

---

## Critical Functions

### filteredData Computation
**Purpose**: Apply all filters to studentPlacementRows  
**Triggers**: When filters change  
**Returns**: Array of filtered student records

```javascript
const filteredData = useMemo(() => {
  // Logic: See REPORTS_PAGE_GUIDE.md for full implementation
}, [filters, studentPlacementRows, companies])
```

### chartData Computation
**Purpose**: Prepare data based on chart type  
**Triggers**: When chartType or filteredData changes  
**Returns**: Formatted data for Recharts component

| Chart Type | Data Format | Use Case |
|-----------|------------|----------|
| bar/line | `[{name, count, placed}, ...]` | Company comparison |
| pie | `[{name, value}, ...]` | Status distribution |
| area | `[{name, students}, ...]` | CGPA distribution |

### handleExportPDF()
**Purpose**: Generate and download PDF report  
**Parameters**: None (uses component state)  
**Process**:
1. Capture chart as canvas image
2. Create PDF document
3. Add title and filter summary
4. Add chart image
5. Download with timestamp filename

---

## Filter Combinations

### Example 1: Single Student View
```
Student: "John Doe" (ID: stu_001)
Branch: (hidden)
Company: All
Status: All
CGPA: (hidden)

Result: Only John's records
```

### Example 2: Branch + Status
```
Student: All
Branch: "Computer Science"
Company: All
Status: "Placed"
CGPA: Min 7.0, Max 10

Result: CS graduates, CGPA 7-10, who are placed
```

### Example 3: Company Specific
```
Student: All
Branch: All
Company: "Google"
Status: All
CGPA: (no filter)

Result: All students who applied to Google
```

---

## Chart Types

### Bar Chart
- **Data**: Top 10 companies, total vs placed students
- **X-Axis**: Company name
- **Y-Axis**: Count
- **Best For**: Comparing company applications

### Line Chart
- **Data**: Same as bar
- **Good For**: Showing trends across companies

### Pie Chart
- **Data**: Status distribution (Applied, Shortlisted, etc.)
- **Best For**: Seeing proportions of outcomes

### Area Chart
- **Data**: CGPA ranges vs student count
- **Y-Axis**: Number of students
- **Best For**: Academic performance distribution

---

## Key Implementation Details

### Conditional Rendering
```javascript
// Branch filter only shows when NO specific student selected
{!filters.student && (
  <div>
    <label>Branch</label>
    <select>{/* ... */}</select>
  </div>
)}
```

### Data Updates
```javascript
// When user changes a filter
onChange={(e) => setFilters({ ...filters, student: e.target.value })}
```

### Empty State Handling
```javascript
{filteredData.length > 0 ? (
  <Card>Chart and Table</Card>
) : (
  <Card>No data available</Card>
)}
```

---

## Usage Examples

### View All Student Data
1. Don't select any filters
2. Leave filters at default ("All" or empty)
3. Click "Reset Filters" to ensure
4. Chart shows all companies and status distribution

### Export Student's Placement Record
1. Select student from dropdown
2. (All other filters automatically reset)
3. Choose chart type
4. Click "⬇️ Download Report (PDF)"

### Find Placed Students from Specific Branch
1. Select Branch: "Electronics"
2. Select Status: "Placed"
3. View chart and table
4. Export if needed

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| recharts | ^3.8.1 | Chart rendering |
| jspdf | ^2.5.0 | PDF generation |
| html2canvas | ^1.4.1 | Chart to image |
| zustand | ^5.0.12 | State management |
| react | ^19.2.4 | UI framework |

---

## Common Issues & Solutions

| Issue | Cause | Fix |
|-------|-------|-----|
| Chart blank | No data matches filters | Check filter logic or reset |
| PDF export fails | Chart not rendered | Wait for chart to fully load |
| Filters not applying | Cache/state issue | Hard refresh (Ctrl+Shift+R) |
| CGPA filter not working | Student filter active | Select "All Students" first |
| Wrong company shown | Data mismatch | Check company ID mapping |

---

## Performance Notes

- ✅ Efficient: useMemo prevents unnecessary recalculations
- ✅ Scalable: Top 10 companies shown in bar/line charts
- ⚠️ Large dataset (>10k rows): Consider pagination
- ⚠️ Real-time sync: Add debouncing if data updates frequently

---

## Testing

### Manual Test Cases

- [ ] Apply each filter individually
- [ ] Combine multiple filters
- [ ] Verify student selection hides other filters
- [ ] Check each chart type renders
- [ ] Export PDF with various filter combinations
- [ ] Verify PDF includes correct filter summary
- [ ] Reset filters works
- [ ] Empty state displays when no results

### Edge Cases

- [ ] No data in database
- [ ] Student with no applications
- [ ] Company with no applicants
- [ ] CGPA range with no matches
- [ ] PDF export with large dataset

---

## File Size & Performance

- ReportsPage.jsx: ~18KB
- PDF Export Time: < 2 seconds (typical)
- Chart Rendering: < 500ms (useMemo optimized)
- Table Rendering: O(n) where n = filtered records

---

**Version**: 1.0  
**Created**: April 1, 2026  
**Maintained By**: Development Team
