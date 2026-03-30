const allowedTransitions = {
  Applied: ['Shortlisted', 'Rejected'],
  Shortlisted: ['Interview', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: [],
  Rejected: [],
};

export function isValidTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  return (allowedTransitions[currentStatus] || []).includes(nextStatus);
}

export function assertValidTransition(currentStatus, nextStatus) {
  if (!isValidTransition(currentStatus, nextStatus)) {
    return {
      ok: false,
      error: `Invalid status transition: ${currentStatus} -> ${nextStatus}`,
    };
  }
  return { ok: true };
}

export function getWorkflowTransitions(status) {
  return allowedTransitions[status] || [];
}

export const WORKFLOW_ORDER = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
