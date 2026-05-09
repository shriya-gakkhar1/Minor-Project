export function calculateRisk(student) {
  const factors = [];

  if (Number(student.cgpa) < 7) factors.push("Low CGPA");
  if (Number(student.internships) === 0) factors.push("No internships");
  if (Number(student.skills) < 3) factors.push("Few skills");
  if (Number(student.projects) === 0) factors.push("No projects");

  if (factors.length >= 3) return { level: "High Risk", score: 35, factors };
  if (factors.length >= 1) return { level: "Medium Risk", score: 65, factors };
  return { level: "Low Risk", score: 88, factors: ["Strong profile"] };
}

export function summarizeStudents(students) {
  const placed = students.filter((student) => student.status === "Placed");
  const companies = new Set(placed.map((student) => student.company).filter(Boolean));
  const totalPackage = placed.reduce((sum, student) => sum + Number(student.package || 0), 0);

  return {
    totalStudents: students.length,
    placedStudents: placed.length,
    unplacedStudents: students.length - placed.length,
    placementPercent: students.length ? Math.round((placed.length / students.length) * 100) : 0,
    avgPackage: placed.length ? Number((totalPackage / placed.length).toFixed(1)) : 0,
    highestPackage: placed.length ? Math.max(...placed.map((student) => Number(student.package || 0))) : 0,
    companiesVisited: companies.size,
  };
}

export function branchWisePlacement(students) {
  const branches = groupBy(students, "branch");
  return Object.entries(branches).map(([branch, rows]) => {
    const placed = rows.filter((student) => student.status === "Placed").length;
    return {
      branch,
      placed,
      unplaced: rows.length - placed,
      rate: Math.round((placed / rows.length) * 100),
    };
  });
}

export function companyDistribution(students) {
  const placed = students.filter((student) => student.status === "Placed" && student.company);
  const companies = groupBy(placed, "company");
  return Object.entries(companies).map(([company, rows]) => ({
    company,
    students: rows.length,
  }));
}

export function cgpaPlacementData(students) {
  return students.map((student) => ({
    name: student.name.split(" ")[0],
    cgpa: Number(student.cgpa),
    placed: student.status === "Placed" ? 1 : 0,
    package: Number(student.package || 0),
  }));
}

export function placementTrend(students) {
  const years = groupBy(students, "year");
  return Object.entries(years)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, rows]) => ({
      year,
      placed: rows.filter((student) => student.status === "Placed").length,
      total: rows.length,
      placement: Math.round((rows.filter((student) => student.status === "Placed").length / rows.length) * 100),
    }));
}

export function simulateCutoff(students, cutoff) {
  const eligible = students.filter((student) => Number(student.cgpa) >= Number(cutoff));
  const eligiblePlaced = eligible.filter((student) => student.status === "Placed").length;
  const currentPlaced = students.filter((student) => student.status === "Placed").length;
  const projectedPlaced = Math.min(eligible.length, currentPlaced);

  return {
    eligibleCount: eligible.length,
    eligiblePlaced,
    projectedPlaced,
    projectedPlacementPercent: students.length ? Math.round((projectedPlaced / students.length) * 100) : 0,
    impact: projectedPlaced - currentPlaced,
  };
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Unknown";
    acc[value] = acc[value] || [];
    acc[value].push(row);
    return acc;
  }, {});
}
