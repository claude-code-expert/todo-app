import type { CreateTicketInput, Ticket } from '@/shared/types';

let ticketIdCounter = 0;

export async function create(input: CreateTicketInput): Promise<Ticket> {
  ticketIdCounter++;
  const now = new Date();

  return {
    id: ticketIdCounter,
    title: input.title,
    description: input.description ?? null,
    status: 'BACKLOG',
    priority: input.priority ?? 'MEDIUM',
    position: -1024 * ticketIdCounter,
    plannedStartDate: input.plannedStartDate ?? null,
    dueDate: input.dueDate ?? null,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function __resetCounter() {
  ticketIdCounter = 0;
}
