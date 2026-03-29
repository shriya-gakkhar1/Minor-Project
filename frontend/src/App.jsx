import { useEffect, useState } from 'react';
import { getPlacements } from './services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

function App() {
  const [data, setData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");

  useEffect(() => {
    getPlacements()
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, []);

  // unique companies
  const companies = ["All", ...new Set(data.map(d => d.company))];

  // filter data
  const filteredData =
    selectedCompany === "All"
      ? data
      : data.filter(d => d.company === selectedCompany);

  // KPIs
  const totalAppeared = filteredData.reduce((sum, d) => sum + d.appeared, 0);
  const totalSelected = filteredData.reduce((sum, d) => sum + d.selected, 0);

  const selectionRate =
    totalAppeared === 0
      ? 0
      : ((totalSelected / totalAppeared) * 100).toFixed(2);

  // package data for pie chart
  const packageData = filteredData.map(d => ({
    name: d.company,
    value: d.package
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Placement Dashboard</h1>

      {/* Filter */}
      <select
        value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px" }}
      >
        {companies.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h3>Total Appeared</h3>
          <p>{totalAppeared}</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h3>Total Selected</h3>
          <p>{totalSelected}</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
          <h3>Selection Rate</h3>
          <p>{selectionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>

        {/* Chart 1: Selected */}
        <BarChart width={400} height={300} data={filteredData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="company" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="selected" fill="#8884d8" />
        </BarChart>

        {/* Chart 2: Appeared vs Selected */}
        <BarChart width={400} height={300} data={filteredData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="company" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="appeared" fill="#82ca9d" />
          <Bar dataKey="selected" fill="#8884d8" />
        </BarChart>

        {/* Chart 3: Package Distribution */}
        <PieChart width={400} height={300}>
          <Pie
            data={packageData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {packageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

      </div>
    </div>
  );
}

export default App;