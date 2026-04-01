# ReportsPage - Visual UI Layout

## Overall Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PlaceIQ                                                  [Menu] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Reporting & Statistics                                          │
│  Advanced placement analytics with flexible filtering...         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                       FILTERS SECTION                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Student      Branch       Company      Status      CGPA Min │ │
│  │ [Dropdown]  [Dropdown]   [Dropdown]   [Dropdown]  [Input]  │ │
│  │ CGPA Max     [Reset Filters]                               │ │
│  │ [Input]     [Button]                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  [📊 Bar Chart] [📈 Line Chart] [🥧 Pie Chart] [📉 Area Chart]  │
│                                                                   │
│                    ⬇️ Download Report (PDF)                      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      CHART SECTION                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │              [Dynamic Chart Visualization]                 │ │
│  │                   (400px height)                           │ │
│  │                                                              │ │
│  │    Displays: Bar/Line/Pie/Area based on selection         │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      TABLE SECTION                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Filtered Data (X records)                                  │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Student Name  │ Branch │ CGPA │ Company  │ Status         │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ John Doe      │ CSE    │ 8.50 │ Google   │ Placed         │ │
│  │ Jane Smith    │ ECE    │ 7.80 │ Microsoft│ Shortlisted    │ │
│  │ ...           │ ...    │ ...  │ ...      │ ...            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Filter Section - Detailed Layout

### Desktop View (6 Columns)
```
┌─────────────────────────────────────────────────────────────┐
│ Student        Branch         Company        Status        │
│ [Dropdown]     [Dropdown]     [Dropdown]     [Dropdown]    │
│                                                             │
│ CGPA Min       CGPA Max       [Reset Filters]              │
│ [Input]        [Input]        [Button]                     │
└─────────────────────────────────────────────────────────────┘
```

### Tablet View (2-3 Columns)
```
┌────────────────────────────┐
│ Student       Branch       │
│ [Dropdown]    [Dropdown]   │
│                            │
│ Company       Status       │
│ [Dropdown]    [Dropdown]   │
│                            │
│ CGPA Min      CGPA Max     │
│ [Input]       [Input]      │
│                            │
│ [Reset Filters]            │
└────────────────────────────┘
```

### Mobile View (1 Column)
```
┌────────────────┐
│ Student        │
│ [Dropdown]     │
│                │
│ Branch         │
│ [Dropdown]     │
│                │
│ Company        │
│ [Dropdown]     │
│                │
│ Status         │
│ [Dropdown]     │
│                │
│ CGPA Min       │
│ [Input]        │
│                │
│ CGPA Max       │
│ [Input]        │
│                │
│ [Reset Filters]│
└────────────────┘
```

---

## Chart Type Selector

### Visual Layout
```
[📊 Bar Chart] [📈 Line Chart] [🥧 Pie Chart] [📉 Area Chart]
[  Active  ]   [  Inactive  ]  [  Inactive  ]  [  Inactive  ]

When Active: Indigo background, white text
When Inactive: White background, gray text, hover effect
```

### Chart Type Switch Example
```
User clicks "Line Chart"
        ↓
chartType state changes from 'bar' to 'line'
        ↓
chartData useMemo recalculates
        ↓
LineChart component renders instead of BarChart
        ↓
Smooth animation/transition
```

---

## Chart Visualization Examples

### Bar Chart
```
        Placed
          │
          │  ██
          │  ██  ██  ██
          │  ██  ██  ██
          │  ██  ██  ██
          │  ██  ██  ██
          │  ██  ██  ██
    Total │  ██  ██  ██
          │  ██  ██  ██
          ├──────────────────
          │ Google Microsoft Amazon Apple
          
Legend: [██ Total] [██ Placed]
```

### Pie Chart
```
              ┌─────────────┐
             /               \
            │  Applied 35%   │
            │                │
            │    Placed      │ Shortlisted
            │     40%       /20%
            │                /
             \    Rejected  /
              \      5%   /
               └─────────┘
```

### Area Chart
```
            │        ╱╲
            │       ╱  ╲
            │  ╱╲  ╱    ╲
            │ ╱  ╲╱      ╲
            │╱            ╲
            ├──────────────────
            │<6  6-7 7-8 8-9 9+
            
Shaded area shows CGPA distribution
```

---

## PDF Report Layout

### Saved PDF Format
```
┌─────────────────────────────────────────┐
│                                         │
│         Placement Report                │
│                                         │
│  Filters Applied:                       │
│  • Student: John Doe                    │
│  • Company: Google                      │
│  • Status: Placed                       │
│  Total Records: 5                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                    │ │
│  │       [Chart Image]                │ │
│  │                                    │ │
│  │     (Chart rendered to image)      │ │
│  │                                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│   File: placement-report-2026-04-01.pdf│
│                                         │
└─────────────────────────────────────────┘
```

---

## Data Flow & State Changes

### State Tree
```
ReportsPage Component
├── filters (state)
│   ├── student: string | ''
│   ├── branch: string | 'All'
│   ├── company: string | 'All'
│   ├── status: string | 'All'
│   ├── cgpaMin: string | ''
│   └── cgpaMax: string | ''
├── chartType (state)
│   └── 'bar' | 'line' | 'pie' | 'area'
├── isExporting (state)
│   └── boolean
├── filteredData (computed)
│   └── StudentPlacementRow[]
├── chartData (computed)
│   └── ChartItem[]
├── tableData (computed)
│   └── TableRow[]
└── studentOptions, branchOptions, companyOptions (computed)
```

---

## Interaction Flows

### Filter Application Flow
```
User selects "Computer Science" in Branch dropdown
        ↓
onChange event triggered
        ↓
setFilters({ ...filters, branch: 'Computer Science' })
        ↓
filters state updated
        ↓
filteredData useMemo dependency changes
        ↓
filteredData recalculates
        ↓
chartData useMemo dependency changes
        ↓
chartData recalculates
        ↓
tableData useMemo dependency changes
        ↓
All UI components re-render with new data
```

### Chart Type Change Flow
```
User clicks "Pie Chart" button
        ↓
setChartType('pie')
        ↓
chartType state changes
        ↓
chartData useMemo recalculates with chartType dependency
        ↓
Chart rendering condition checks chartType
        ↓
PieChart component renders instead of current chart
        ↓
Chart animation transitions smoothly
```

### PDF Export Flow
```
User clicks "Download Report (PDF)"
        ↓
handleExportPDF() executes
        ↓
setIsExporting(true)
        ↓
Button shows "Exporting..." & disabled
        ↓
html2canvas captures chart element
        ↓
jsPDF creates document
        ↓
Add title, filters, image
        ↓
PDF generated and downloaded
        ↓
setIsExporting(false)
        ↓
Button returns to normal state
```

---

## Responsive Behavior

### Large Screen (1200px+)
```
Filters: 6 columns
Charts: Full width responsive container
Table: Full width with horizontal scroll for overflow
Icons: All visible
```

### Tablet (768px - 1199px)
```
Filters: 2-3 columns adaptive
Charts: Full width responsive container
Table: Horizontal scroll enabled
Icons: Simplified if needed
```

### Mobile (< 768px)
```
Filters: 1 column, stacked
Charts: Full width, height adjusted
Table: Horizontal scroll for columns
Icons: Only on buttons
Labels: Full text preserved
```

---

## Color & Styling Reference

### Color Scheme
```
Active Elements:     Indigo (#6366f1) to Purple gradient
Hover Elements:      Slate-50 background
Text Primary:        Slate-900 (#0f172a)
Text Secondary:      Slate-600 (#475569)
Borders:             Slate-200 (#e2e8f0)
Chart Colors:        [#6366f1, #a78bfa, #38bdf8, #34d399, ...]
Success:             Green (#34d399)
Warning:             Amber (#fbbf24)
Danger:              Red (#f87171)
```

### Spacing
```
Section Gaps:        mb-6 (24px)
Input Padding:       px-3 py-2 (12px x 8px)
Card Padding:        p-6 (24px)
Border Radius:       rounded-lg (8px)
Filter Grid Gap:     gap-4 (16px)
```

---

## Empty State

### When No Data Matches Filters
```
┌─────────────────────────────────────┐
│                                     │
│  No data available for the         │
│  selected filters.                  │
│                                     │
│  Try adjusting your filters or      │
│  click Reset Filters.               │
│                                     │
└─────────────────────────────────────┘
```

---

## Loading States

### PDF Export Loading
```
Button Text: [Disabled state]
┌──────────────────────────────┐
│ ⏳ Exporting... (Disabled)  │
└──────────────────────────────┘

Button Opacity: 50%
Cursor: not-allowed
```

---

## Accessibility Features

- ✅ Semantic HTML (form labels, buttons)
- ✅ Keyboard navigation (tab through filters)
- ✅ Color contrast (WCAG AA compliant)
- ✅ Button focus states
- ✅ Input placeholders
- ✅ Table headers semantic
- ✅ Alt text for chart exports

---

**Visual Reference Version**: 1.0  
**Last Updated**: April 1, 2026
