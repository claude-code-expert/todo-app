'use client';

import { useState, useMemo } from 'react';
import type {
  BoardData,
  TicketWithMeta,
  CreateTicketInput,
  UpdateTicketInput,
  TicketStatus,
} from '@/shared/types';
import { useTickets } from '@/client/hooks/useTickets';
import { BoardHeader } from './BoardHeader';
import { FilterBar } from './FilterBar';
import { Board } from './Board';
import { Modal } from '@/client/components/ui/Modal';
import { TicketForm } from '@/client/components/ticket/TicketForm';
import { TicketModal } from '@/client/components/ticket/TicketModal';

type FilterType = 'all' | 'thisWeek' | 'overdue';

interface BoardContainerProps {
  initialData: BoardData;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isThisWeek(ticket: TicketWithMeta): boolean {
  if (!ticket.dueDate) return false;
  if (ticket.status === 'BACKLOG' || ticket.status === 'DONE') return false;
  const today = new Date();
  const monday = getMonday(today);
  const sunday = getSunday(today);
  return ticket.dueDate >= toDateString(monday) && ticket.dueDate <= toDateString(sunday);
}

function filterBoard(board: BoardData, filter: FilterType): BoardData {
  if (filter === 'all') return board;

  const filtered: BoardData['board'] = {
    BACKLOG: board.board.BACKLOG,
    TODO: [],
    IN_PROGRESS: [],
    DONE: board.board.DONE,
  };

  const filterFn = filter === 'overdue'
    ? (t: TicketWithMeta) => t.isOverdue
    : isThisWeek;

  const filterableStatuses: TicketStatus[] = ['TODO', 'IN_PROGRESS'];
  for (const status of filterableStatuses) {
    filtered[status] = board.board[status].filter(filterFn);
  }

  const total = Object.values(filtered).reduce((sum, arr) => sum + arr.length, 0);
  return { board: filtered, total };
}

function countFilters(board: BoardData): { thisWeek: number; overdue: number } {
  const allTickets = [...board.board.TODO, ...board.board.IN_PROGRESS];
  return {
    thisWeek: allTickets.filter(isThisWeek).length,
    overdue: allTickets.filter((t) => t.isOverdue).length,
  };
}

export function BoardContainer({ initialData }: BoardContainerProps) {
  const { board, isLoading, create, update, remove } = useTickets(initialData);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);

  const filteredBoard = useMemo(() => filterBoard(board, activeFilter), [board, activeFilter]);
  const counts = useMemo(() => countFilters(board), [board]);

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
    <div className="board-container">
      <BoardHeader onCreateClick={() => setIsCreating(true)} />
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      <Board
        board={filteredBoard}
        onTicketClick={(ticket) => setSelectedTicket(ticket)}
      />

      {/* 생성 모달 */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
        <TicketForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* 상세/수정 모달 */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
