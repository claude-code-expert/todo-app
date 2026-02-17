'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import type { TicketWithMeta } from '@/shared/types';

interface TicketCardProps {
  ticket: TicketWithMeta;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const className = [
    'ticket-card',
    ticket.status === 'DONE' ? 'ticket-card--done' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      data-overdue={ticket.isOverdue ? 'true' : undefined}
      data-dragging={isDragging ? 'true' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`티켓: ${ticket.title}`}
    >
      <div className="ticket-card-title">{ticket.title}</div>
      {ticket.description && (
        <div className="ticket-card-description">{ticket.description}</div>
      )}
      <div className="ticket-card-meta">
        <PriorityBadge priority={ticket.priority} />
        {ticket.dueDate && (
          <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />
        )}
      </div>
    </div>
  );
}
