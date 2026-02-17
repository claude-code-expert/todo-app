'use client';

import type { TicketPriority } from '@/shared/types';

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`badge-priority-${priority.toLowerCase()}`}
      data-priority={priority}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

interface DueDateBadgeProps {
  dueDate: string;
  isOverdue: boolean;
}

export function DueDateBadge({ dueDate, isOverdue }: DueDateBadgeProps) {
  return (
    <span className="badge-due-date" data-overdue={isOverdue}>
      {dueDate}
    </span>
  );
}
