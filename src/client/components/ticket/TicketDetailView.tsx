'use client';

import type { TicketWithMeta } from '@/shared/types';

interface TicketDetailViewProps {
  ticket: TicketWithMeta;
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ko-KR');
}

export function TicketDetailView({ ticket }: TicketDetailViewProps) {
  return (
    <div>
      <div className="form-field">
        <span className="form-label">상태</span>
        <span className="form-readonly">{ticket.status}</span>
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
