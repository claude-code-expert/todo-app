import type {
  BoardData,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
} from '@/shared/types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? 'Unknown error');
  }
  return res.json();
}

export const ticketApi = {
  async getBoard(): Promise<BoardData> {
    const res = await fetch('/api/tickets');
    return handleResponse<BoardData>(res);
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Ticket>(res);
  },

  async update(id: number, input: UpdateTicketInput): Promise<Ticket> {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Ticket>(res);
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error?.message ?? 'Unknown error');
    }
  },

  async reorder(
    ticketId: number,
    status: string,
    position: number,
  ): Promise<{ ticket: Ticket; affected: Array<{ id: number; position: number }> }> {
    const res = await fetch('/api/tickets/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status, position }),
    });
    return handleResponse(res);
  },

  async complete(id: number): Promise<Ticket> {
    const res = await fetch(`/api/tickets/${id}/complete`, {
      method: 'PATCH',
    });
    return handleResponse<Ticket>(res);
  },
};
