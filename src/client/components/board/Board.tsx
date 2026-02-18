'use client';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { TicketCard } from '@/client/components/ticket/TicketCard';
import { TICKET_STATUS } from '@/shared/types';
import type { BoardData, TicketWithMeta } from '@/shared/types';
import type { ReactNode } from 'react';

interface BoardProps {
  board: BoardData;
  activeTicket?: TicketWithMeta | null;
  onTicketClick: (ticket: TicketWithMeta) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  filterBar?: ReactNode;
}

const MAIN_STATUSES = [
  TICKET_STATUS.TODO,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.DONE,
] as const;

export function Board({ board, activeTicket, onTicketClick, onDragStart, onDragEnd, filterBar }: BoardProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  return (
    <DndContext
      id="board-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="board-content">
        <div className="board-sidebar">
          <Column
            status={TICKET_STATUS.BACKLOG}
            tickets={board.board.BACKLOG}
            onTicketClick={onTicketClick}
          />
        </div>
        <div className="board-main">
          {filterBar}
          <div className="columns-container">
            {MAIN_STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tickets={board.board[status]}
                onTicketClick={onTicketClick}
              />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTicket ? <TicketCard ticket={activeTicket} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
