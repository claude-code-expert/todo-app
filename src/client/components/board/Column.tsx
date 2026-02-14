'use client';

import type { TicketStatus, TicketWithMeta } from '@/shared/types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ColumnHeader } from './ColumnHeader';
import { TicketCard } from '@/client/components/ticket/TicketCard';

const STATUS_LABELS: Record<TicketStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithMeta[];
  onTicketClick: (ticket: TicketWithMeta) => void;
}

export function Column({ status, tickets, onTicketClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const ticketIds = tickets.map((t) => t.id);

  return (
    <div className="column" ref={setNodeRef}>
      <ColumnHeader title={STATUS_LABELS[status]} count={tickets.length} />
      <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
        <div className="column-cards">
          {tickets.length === 0 ? (
            <div className="column-empty">이 칼럼에 티켓이 없습니다</div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick(ticket)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
