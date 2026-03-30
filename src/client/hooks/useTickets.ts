'use client';

import { useState, useCallback } from 'react';
import { ticketApi } from '@/client/api/ticketApi';
import type {
  BoardData,
  CreateTicketInput,
  UpdateTicketInput,
  TicketStatus,
  TicketWithMeta,
} from '@/shared/types';

export interface UseTicketsReturn {
  board: BoardData;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: string, position: number) => Promise<void>;
  complete: (id: number) => Promise<void>;
}

export function useTickets(initialData: BoardData): UseTicketsReturn {
  const [board, setBoard] = useState<BoardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBoard = useCallback(async () => {
    const data = await ticketApi.getBoard();
    setBoard(data);
  }, []);

  const create = useCallback(async (data: CreateTicketInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketApi.create(data);
      await refreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoard]);

  const update = useCallback(async (id: number, data: UpdateTicketInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketApi.update(id, data);
      await refreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoard]);

  const remove = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketApi.remove(id);
      await refreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoard]);

  const reorder = useCallback(async (ticketId: number, status: string, position: number) => {
    console.log('[DnD] useTickets.reorder called', { ticketId, status, position });
    setError(null);
    const backup = board;

    setBoard((prev) => {
      const newBoard = { ...prev.board };
      let movedTicket: TicketWithMeta | undefined;

      for (const col of Object.keys(newBoard) as TicketStatus[]) {
        const idx = newBoard[col].findIndex((t) => t.id === ticketId);
        if (idx !== -1) {
          movedTicket = newBoard[col][idx];
          newBoard[col] = newBoard[col].filter((t) => t.id !== ticketId);
          break;
        }
      }

      if (!movedTicket) return prev;

      const updated = { ...movedTicket, status: status as TicketStatus, position };
      const targetCol = status as TicketStatus;
      newBoard[targetCol] = [updated, ...newBoard[targetCol]];

      return { ...prev, board: newBoard };
    });

    try {
      console.log('[DnD] useTickets.reorder → API call', { ticketId, status, position });
      await ticketApi.reorder({ ticketId, status: status as 'BACKLOG' | 'TODO' | 'IN_PROGRESS', position });
      console.log('[DnD] useTickets.reorder → API success, refreshing board');
      await refreshBoard();
    } catch (err) {
      console.error('[DnD] useTickets.reorder → API error', err);
      setBoard(backup);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [board, refreshBoard]);

  const complete = useCallback(async (id: number) => {
    console.log('[DnD] useTickets.complete called', { id });
    setError(null);
    const backup = board;

    setBoard((prev) => {
      const newBoard = { ...prev.board };
      let movedTicket: TicketWithMeta | undefined;

      for (const col of Object.keys(newBoard) as TicketStatus[]) {
        const idx = newBoard[col].findIndex((t) => t.id === id);
        if (idx !== -1) {
          movedTicket = newBoard[col][idx];
          newBoard[col] = newBoard[col].filter((t) => t.id !== id);
          break;
        }
      }

      if (!movedTicket) return prev;

      const updated = {
        ...movedTicket,
        status: 'DONE' as TicketStatus,
        completedAt: new Date(),
        isOverdue: false,
      };
      newBoard.DONE = [updated, ...newBoard.DONE];

      return { ...prev, board: newBoard };
    });

    try {
      console.log('[DnD] useTickets.complete → API call', { id });
      await ticketApi.complete(id);
      console.log('[DnD] useTickets.complete → API success, refreshing board');
      await refreshBoard();
    } catch (err) {
      console.error('[DnD] useTickets.complete → API error', err);
      setBoard(backup);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [board, refreshBoard]);

  return { board, isLoading, error, create, update, remove, reorder, complete };
}
