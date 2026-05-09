import {
  AlertTriangle,
  BarChart3,
  Download,
  FileSpreadsheet,
  GraduationCap,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card, CardHeader } from "./components/ui/Card";
import {
  branchWisePlacement,
  calculateRisk,
  cgpaPlacementData,
  companyDistribution,
  placementTrend,
  simulateCutoff,
  summarizeStudents,
} from "./lib/analytics";
import { usePlacementStore } from "./store/usePlacementStore";

const formatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
});

export default function App() {
  const { students, importFile, resetSampleData } = usePlacementStore();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cutoff, setCutoff] = useState(7.5);

  const summary = useMemo(() => summarizeStudents(students), [students]);
  const branchData = useMemo(() => branchWisePlacement(students), [students]);
  const companyData = useMemo(() => companyDistribution(students), [students]);
  const cgpaData = useMemo(() => cgpaPlacementData(students), [students]);
  const trendData = useMemo(() => placementTrend(students), [students]);
  const simulation = useMemo(() => simulateCutoff(students, cutoff), [students, cutoff]);
  const branches = useMemo(() => ["All", ...new Set(students.map((student) => student.branch))], [students]);

  const enrichedStudents = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        risk: calculateRisk(student),
      })),
    [students],
  );

  const filteredStudents = enrichedStudents.filter((student) => {
    const matchesQuery = `${student.name} ${student.branch} ${student.company}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesBranch = branchFilter === "All" || student.branch === branchFilter;
    const matchesStatus = statusFilter === "All" || student.status === statusFilter;
    return matchesQuery && matchesBranch && matchesStatus;
  });

  const highRiskCount = enrichedStudents.filter((student) => student.risk.level === "High Risk").length;

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (file) await importFile(file);
    event.target.value = "";
  }

  function downloadReport() {
    const rows = [
      "Placify Placement Summary",
      `Total Students: ${summary.totalStudents}`,
      `Placed Students: ${summary.placedStudents}`,
      `Unplaced Students: ${summary.unplacedStudents}`,
      `Placement Percentage: ${summary.placementPercent}%`,
      `Average Package: ${summary.avgPackage} LPA`,
      `Highest Package: ${summary.highestPackage} LPA`,
      `Companies Visited: ${summary.companiesVisited}`,
      "",
      "Branch Stats",
      ...branchData.map((row) => `${row.branch}: ${row.placed}/${row.placed + row.unplaced} placed (${row.rate}%)`),
      "",
      "At-Risk Students",
      ...enrichedStudents
        .filter((student) => student.risk.level !== "Low Risk")
        .map((student) => `${student.name} - ${student.risk.level} - ${student.risk.factors.join(", ")}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "placify-placement-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint text-ink">
              <GraduationCap size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Placify
              </h1>
              <p className="text-sm text-slate-400">
                Placement Analytics Dashboard for TPOs
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              <Upload size={17} />
              Import CSV/XLSX
              <input className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} />
            </label>
            <Button variant="secondary" onClick={resetSampleData}>
              <RefreshCcw size={17} />
              Reset Demo
            </Button>
            <Button onClick={downloadReport}>
              <Download size={17} />
              Report
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="Total Students" value={summary.totalStudents} icon={Users} />
          <Metric title="Placed Students" value={summary.placedStudents} icon={TrendingUp} accent="text-emerald-300" />
          <Metric title="Placement %" value={`${summary.placementPercent}%`} icon={BarChart3} accent="text-sky-300" />
          <Metric title="Avg Package" value={`${summary.avgPackage} LPA`} icon={FileSpreadsheet} accent="text-amber-300" />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Placement Performance" eyebrow="dashboard" />
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <MiniStat label="Unplaced" value={summary.unplacedStudents} />
              <MiniStat label="Highest Package" value={`${summary.highestPackage} LPA`} />
              <MiniStat label="Companies Visited" value={summary.companiesVisited} />
            </div>
            <div className="h-72 px-2 pb-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="placement" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#26354d" strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="placement" stroke="#2dd4bf" fill="url(#placement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="At-Risk Detection" eyebrow="rule based" />
            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-rose-300/20 bg-rose-400/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-rose-100">High-risk students</p>
                  <AlertTriangle className="text-rose-300" size={20} />
                </div>
                <p className="mt-2 text-4xl font-bold text-white">{highRiskCount}</p>
              </div>
              <RiskRule text="CGPA below 7" />
              <RiskRule text="No internships" />
              <RiskRule text="Fewer than 3 skills" />
              <RiskRule text="No projects" />
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Branch-wise Placement">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={branchData}>
                <CartesianGrid stroke="#26354d" strokeDasharray="3 3" />
                <XAxis dataKey="branch" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="placed" stackId="a" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unplaced" stackId="a" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Company Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyData} layout="vertical">
                <CartesianGrid stroke="#26354d" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                <YAxis dataKey="company" type="category" stroke="#94a3b8" width={92} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="students" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="CGPA vs Placement">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid stroke="#26354d" strokeDasharray="3 3" />
                <XAxis dataKey="cgpa" name="CGPA" stroke="#94a3b8" domain={[5, 10]} />
                <YAxis dataKey="package" name="Package" stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={cgpaData} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardHeader title="Placement Simulator" eyebrow="cutoff impact" />
            <div className="space-y-5 p-5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="text-mint" size={20} />
                <label className="flex-1">
                  <span className="text-sm text-slate-300">Company CGPA cutoff: {cutoff}</span>
                  <input
                    className="mt-3 w-full accent-teal-300"
                    type="range"
                    min="5"
                    max="10"
                    step="0.1"
                    value={cutoff}
                    onChange={(event) => setCutoff(Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="Eligible" value={simulation.eligibleCount} />
                <MiniStat label="Projected Placed" value={simulation.projectedPlaced} />
                <MiniStat label="Projected %" value={`${simulation.projectedPlacementPercent}%`} />
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={[{ name: "Current", value: summary.placementPercent }, { name: "Projected", value: simulation.projectedPlacementPercent }]}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} dot={{ fill: "#2dd4bf" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <Card>
          <CardHeader title="Student Analytics" eyebrow="search and filter" />
          <div className="grid gap-3 border-b border-white/10 p-5 lg:grid-cols-[1fr_180px_180px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                className="h-11 w-full rounded-md border border-white/10 bg-ink/70 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint"
                placeholder="Search student, branch, or company"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Select value={branchFilter} onChange={setBranchFilter} options={branches} />
            <Select value={statusFilter} onChange={setStatusFilter} options={["All", "Placed", "Unplaced"]} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">CGPA</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Readiness</th>
                  <th className="px-5 py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.035]">
                    <td className="px-5 py-4 font-medium text-white">{student.name}</td>
                    <td className="px-5 py-4 text-slate-300">{student.branch}</td>
                    <td className="px-5 py-4 text-slate-300">{student.cgpa}</td>
                    <td className="px-5 py-4">
                      <Badge variant={student.status === "Placed" ? "success" : "neutral"}>{student.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{student.company || "Open"}</td>
                    <td className="px-5 py-4">
                      <div className="h-2 w-28 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-mint" style={{ width: `${student.risk.score}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={riskVariant(student.risk.level)}>{student.risk.level}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}

function Metric({ title, value, icon: Icon, accent = "text-mint" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon className={accent} size={20} />
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </Card>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink/40 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{formatter.format(value)}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card>
      <CardHeader title={title} eyebrow="analytics" />
      <div className="p-5">{children}</div>
    </Card>
  );
}

function RiskRule({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-ink/40 px-3 py-2 text-sm text-slate-300">
      <span className="h-2 w-2 rounded-full bg-rose-300" />
      {text}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="h-11 rounded-md border border-white/10 bg-ink/70 px-3 text-sm text-white outline-none transition focus:border-mint"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function riskVariant(level) {
  if (level === "High Risk") return "danger";
  if (level === "Medium Risk") return "warning";
  return "success";
}

const tooltipStyle = {
  background: "#0f1a2c",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#e5edf7",
};
