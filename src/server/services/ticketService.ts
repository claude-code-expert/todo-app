import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { eq, min } from 'drizzle-orm';
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  type CreateTicketInput,
  type Ticket,
} from '@/shared/types';

type DbTicket = typeof tickets.$inferSelect;

function toTicket(row: DbTicket): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Ticket['status'],
    priority: row.priority as Ticket['priority'],
    position: row.position,
    plannedStartDate: row.plannedStartDate,
    dueDate: row.dueDate,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function create(input: CreateTicketInput): Promise<Ticket> {
  const minPositionResult = await db
    .select({ minPosition: min(tickets.position) })
    .from(tickets)
    .where(eq(tickets.status, TICKET_STATUS.BACKLOG));

  const minPosition = minPositionResult[0]?.minPosition ?? 0;
  const newPosition = minPosition - 1024;

  const [row] = await db
    .insert(tickets)
    .values({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? TICKET_PRIORITY.MEDIUM,
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
      position: newPosition,
    })
    .returning();

  return toTicket(row);
}
