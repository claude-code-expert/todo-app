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
import { Column } from './Column';
import { TICKET_STATUS } from '@/shared/types';
import type { BoardData, TicketWithMeta } from '@/shared/types';

interface BoardProps {
  board: BoardData;
  onTicketClick: (ticket: TicketWithMeta) => void;
}

const MAIN_STATUSES = [
  TICKET_STATUS.TODO,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.DONE,
] as const;

export function Board({ board, onTicketClick }: BoardProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}>
      <div className="board-content">
        <div className="board-sidebar">
          <Column
            status={TICKET_STATUS.BACKLOG}
            tickets={board.board.BACKLOG}
            onTicketClick={onTicketClick}
          />
        </div>
        <div className="board-main">
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
      <DragOverlay />
    </DndContext>
  );
}
