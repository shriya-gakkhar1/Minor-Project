import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const WORKFLOW_STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
export const STUDENT_TRACK_STAGES = ['Applied', 'Interview', 'HR', 'Selected'];

export function formatCurrencyLpa(value) {
  return `INR ${Number(value || 0).toFixed(1)} LPA`;
}

export function statusTone(status) {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'selected') return 'success';
  if (normalized === 'interview' || normalized === 'shortlisted' || normalized === 'hr') return 'info';
  if (normalized === 'applied') return 'warning';
  if (normalized === 'rejected') return 'danger';
  return 'neutral';
}

export function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
