'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ColumnHeader } from './ColumnHeader';
import { TicketCard } from '@/client/components/ticket/TicketCard';
import type { TicketStatus, TicketWithMeta } from '@/shared/types';

interface ColumnProps {
  status: TicketStatus;
  tickets: TicketWithMeta[];
  onTicketClick: (ticket: TicketWithMeta) => void;
}

export function Column({ status, tickets, onTicketClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const ticketIds = tickets.map((t) => t.id);

  return (
    <div className="column" data-status={status}>
      <ColumnHeader title={status} count={tickets.length} />
      <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="column-cards">
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
