import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  DatabaseBackup,
  LayoutDashboard,
  MessagesSquare,
  Target,
  User,
  Users,
} from 'lucide-react';

export const adminNav = [
  { to: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tpo/ingest', label: 'Import Data', icon: DatabaseBackup },
  { to: '/tpo/students', label: 'Students', icon: Users },
  { to: '/tpo/drives', label: 'Drives', icon: BriefcaseBusiness },
  { to: '/tpo/prediction', label: 'Prediction', icon: BrainCircuit },
  { to: '/tpo/reports', label: 'Reports', icon: BarChart3 },
];

export const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/opportunities', label: 'Opportunities', icon: Target },
  { to: '/student/mock-interview', label: 'Mock Interview', icon: MessagesSquare },
  { to: '/student/profile', label: 'Profile', icon: User },
];

export function getNavItemsForRole(role) {
  return role === 'admin' ? adminNav : studentNav;
}
