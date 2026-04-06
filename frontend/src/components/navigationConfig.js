import { BarChart3, BrainCircuit, DatabaseBackup, FilePenLine, LayoutDashboard, PlusCircle, ScanLine, User, Users } from 'lucide-react';

export const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/migration', label: 'Migration', icon: DatabaseBackup },
  { to: '/insights-lab', label: 'Insights Lab', icon: BarChart3 },
  { to: '/campus-predictor', label: 'Campus Predictor', icon: ScanLine },
  { to: '/student-predictor', label: 'Student Predictor', icon: BrainCircuit },
  { to: '/resume-studio', label: 'Resume Studio', icon: FilePenLine },
  { to: '/add-company', label: 'Add Company', icon: PlusCircle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export const studentNav = [
  { to: '/student', label: 'Student Home', icon: LayoutDashboard },
  { to: '/student/predictor', label: 'Placement Analyzer', icon: BrainCircuit },
  { to: '/student/resume-studio', label: 'Resume Studio', icon: FilePenLine },
  { to: '/student/profile', label: 'Profile', icon: User },
];

export function getNavItemsForRole(role) {
  return role === 'admin' ? adminNav : studentNav;
}
