import { create } from "zustand";
import { persist } from "zustand/middleware";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { sampleStudents } from "../data/sampleStudents";

const normalizeStudent = (row, index) => ({
  id: row.id || row.ID || row.rollNo || row["Roll No"] || `STU${String(index + 1).padStart(3, "0")}`,
  name: row.name || row.Name || "Unnamed Student",
  branch: row.branch || row.Branch || "CSE",
  cgpa: Number(row.cgpa || row.CGPA || row.Cgpa || 0),
  status: row.status || row.Status || (Number(row.package || row.Package || 0) > 0 ? "Placed" : "Unplaced"),
  package: Number(row.package || row.Package || row.ctc || row.CTC || 0),
  company: row.company || row.Company || "",
  internships: Number(row.internships || row.Internships || 0),
  skills: Number(row.skills || row.Skills || 0),
  projects: Number(row.projects || row.Projects || 0),
  year: Number(row.year || row.Year || new Date().getFullYear()),
});

export const usePlacementStore = create(
  persist(
    (set) => ({
      students: sampleStudents,
      replaceStudents: (students) => set({ students }),
      resetSampleData: () => set({ students: sampleStudents }),
      importFile: async (file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const rows = extension === "csv" ? await readCsv(file) : await readWorkbook(file);
        set({ students: rows.map(normalizeStudent).filter((student) => student.name !== "Unnamed Student") });
      },
    }),
    { name: "placify-placement-data" },
  ),
);

function readCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: reject,
    });
  });
}

async function readWorkbook(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet);
}
