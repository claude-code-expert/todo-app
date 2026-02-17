'use client';

import type { TicketWithMeta } from '@/shared/types';

interface TicketDetailViewProps {
  ticket: TicketWithMeta;
}

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: '백로그',
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
};

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  return new Date(date).toISOString().split('T')[0];
}

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  return (
    <div className="ticket-detail-view">
      <div className="form-field">
        <span className="form-label">상태</span>
        <span className="form-readonly">{STATUS_LABELS[ticket.status] ?? ticket.status}</span>
      </div>
      <div className="form-field">
        <span className="form-label">시작일</span>
        <span className="form-readonly">{formatDate(ticket.startedAt)}</span>
      </div>
      <div className="form-field">
        <span className="form-label">종료일</span>
        <span className="form-readonly">{formatDate(ticket.completedAt)}</span>
      </div>
      <div className="form-field">
        <span className="form-label">생성일</span>
        <span className="form-readonly">{formatDate(ticket.createdAt)}</span>
      </div>
    </div>
  );
}
