import { BarChart3, BriefcaseBusiness, DatabaseBackup, FilePenLine, LayoutDashboard, MessagesSquare, User, Users } from 'lucide-react';

export const adminNav = [
  { to: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tpo/ingest', label: 'Import Data', icon: DatabaseBackup },
  { to: '/tpo/students', label: 'Students', icon: Users },
  { to: '/tpo/reports', label: 'Reports', icon: BarChart3 },
  { to: '/tpo/drives', label: 'Companies', icon: BriefcaseBusiness },
];

export const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { to: '/student/resume', label: 'Resume', icon: FilePenLine },
  { to: '/student/mock-interview', label: 'Mock Interview', icon: MessagesSquare },
  { to: '/student/profile', label: 'Profile', icon: User },
];

export function getNavItemsForRole(role) {
  return role === 'admin' ? adminNav : studentNav;
}
