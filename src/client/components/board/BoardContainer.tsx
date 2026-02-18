'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useTickets } from '@/client/hooks/useTickets';
import { BoardHeader } from './BoardHeader';
import { FilterBar } from './FilterBar';
import { Board } from './Board';
import { Modal } from '@/client/components/ui/Modal';
import { TicketForm } from '@/client/components/ticket/TicketForm';
import { TicketModal } from '@/client/components/ticket/TicketModal';
import { TICKET_STATUS } from '@/shared/types';
import type {
  BoardData,
  TicketStatus,
  TicketWithMeta,
  CreateTicketInput,
  UpdateTicketInput,
} from '@/shared/types';

type FilterType = 'all' | 'thisWeek' | 'overdue';

interface BoardContainerProps {
  initialData: BoardData;
}

function findTicketById(board: BoardData, id: number): TicketWithMeta | null {
  for (const tickets of Object.values(board.board)) {
    const found = tickets.find((t) => t.id === id);
    if (found) return found;
  }
  return null;
}

function calculateDropPosition(
  tickets: TicketWithMeta[],
  activeId: number,
  overId: number | string
): number {
  const filtered = tickets.filter((t) => t.id !== activeId);

  if (filtered.length === 0) return 0;

  const overIndex = filtered.findIndex((t) => t.id === Number(overId));

  if (overIndex === -1) {
    return filtered[0].position - 1024;
  }

  if (overIndex === 0) {
    return filtered[0].position - 1024;
  }

  const above = filtered[overIndex - 1].position;
  const below = filtered[overIndex].position;
  return Math.floor((above + below) / 2);
}

function findDropTargetStatus(overId: string | number, board: BoardData): TicketStatus | null {
  const statuses = Object.keys(board.board) as TicketStatus[];
  if (statuses.includes(overId as TicketStatus)) {
    return overId as TicketStatus;
  }
  for (const status of statuses) {
    if (board.board[status].some((t) => t.id === overId)) {
      return status;
    }
  }
  return null;
}

export function BoardContainer({ initialData }: BoardContainerProps) {
  const { board, create, update, remove, reorder, complete } = useTickets(initialData);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTicket, setActiveTicket] = useState<TicketWithMeta | null>(null);

  const counts = useMemo(() => {
    const allTickets = [
      ...board.board.TODO,
      ...board.board.IN_PROGRESS,
    ];
    return {
      thisWeek: allTickets.filter((t) => {
        if (!t.dueDate) return false;
        const today = new Date();
        const day = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        const due = new Date(t.dueDate);
        return due >= monday && due <= sunday;
      }).length,
      overdue: allTickets.filter((t) => t.isOverdue).length,
    };
  }, [board]);

  const filteredBoard = useMemo((): BoardData => {
    if (activeFilter === 'all') return board;

    const filterFn = (ticket: TicketWithMeta) => {
      if (activeFilter === 'overdue') return ticket.isOverdue;
      if (!ticket.dueDate) return false;
      const today = new Date();
      const day = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      const due = new Date(ticket.dueDate);
      return due >= monday && due <= sunday;
    };

    return {
      ...board,
      board: {
        BACKLOG: board.board.BACKLOG,
        TODO: board.board.TODO.filter(filterFn),
        IN_PROGRESS: board.board.IN_PROGRESS.filter(filterFn),
        DONE: board.board.DONE.filter(filterFn),
      },
    };
  }, [board, activeFilter]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const ticketId = Number(event.active.id);
    const ticket = findTicketById(board, ticketId);
    setActiveTicket(ticket);
  }, [board]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTicket(null);

    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const ticketId = Number(active.id);
    const targetStatus = findDropTargetStatus(over.id, board);
    if (!targetStatus) return;

    const sourceTicket = findTicketById(board, ticketId);
    if (!sourceTicket) return;

    if (targetStatus === TICKET_STATUS.DONE) {
      await complete(ticketId);
    } else {
      const position = calculateDropPosition(board.board[targetStatus], ticketId, over.id);
      await reorder(ticketId, targetStatus, position);
    }
  }, [board, complete, reorder]);

  const handleCreate = async (data: CreateTicketInput | UpdateTicketInput) => {
    await create(data as CreateTicketInput);
    setIsCreating(false);
  };

  const handleUpdate = async (id: number, data: UpdateTicketInput) => {
    await update(id, data);
    setSelectedTicket(null);
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    setSelectedTicket(null);
  };

  return (
    <>
      <BoardHeader onCreateClick={() => setIsCreating(true)} />
      <Board
        board={filteredBoard}
        activeTicket={activeTicket}
        onTicketClick={(ticket) => setSelectedTicket(ticket)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        filterBar={
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        }
      />

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
        <div className="modal-header">
          <h2>새 업무 생성</h2>
        </div>
        <div className="modal-body">
          <TicketForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      </Modal>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
