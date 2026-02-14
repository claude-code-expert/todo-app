'use client';

import { useState, useCallback } from 'react';
import type {
  BoardData,
  CreateTicketInput,
  UpdateTicketInput,
} from '@/shared/types';
import { ticketApi } from '@/client/api/ticketApi';

type ReorderableStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS';

interface UseTicketsReturn {
  board: BoardData;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: ReorderableStatus, position: number) => Promise<void>;
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

  const reorder = useCallback(async (ticketId: number, status: ReorderableStatus, position: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketApi.reorder(ticketId, status, position);
      await refreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoard]);

  const complete = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketApi.complete(id);
      await refreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoard]);

  return { board, isLoading, error, create, update, remove, reorder, complete };
}
