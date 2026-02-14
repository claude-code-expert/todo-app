'use client';

import type { BoardData, TicketWithMeta } from '@/shared/types';
import { TICKET_STATUS } from '@/shared/types';
import { Column } from './Column';

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
  return (
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
  );
}
