import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { eq, min, ne, asc, and, gt } from 'drizzle-orm';
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  type CreateTicketInput,
  type UpdateTicketInput,
  type ReorderTicketInput,
  type Ticket,
  type TicketWithMeta,
  type TicketStatus,
  type BoardData,
} from '@/shared/types';
import { TicketNotFoundError } from '@/shared/errors';

// Type conversion from database to domain
type DbTicket = typeof tickets.$inferSelect;

function toTicket(row: DbTicket): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TicketStatus,
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

function toTicketWithMeta(row: DbTicket): TicketWithMeta {
  const ticket = toTicket(row);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue =
    ticket.dueDate !== null &&
    ticket.dueDate < today &&
    ticket.status !== TICKET_STATUS.DONE;
  return { ...ticket, isOverdue };
}

export const ticketService = {
  /**
   * FR-001: Create a new ticket in BACKLOG column
   */
  async create(input: CreateTicketInput): Promise<Ticket> {
    // Calculate position for BACKLOG column (new tickets at top)
    const position = await this.calculatePosition(TICKET_STATUS.BACKLOG);

    // Insert ticket with defaults
    const [row] = await db
      .insert(tickets)
      .values({
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? TICKET_PRIORITY.MEDIUM,
        plannedStartDate: input.plannedStartDate ?? null,
        dueDate: input.dueDate ?? null,
        status: TICKET_STATUS.BACKLOG,
        position,
        startedAt: null,
        completedAt: null,
      })
      .returning();

    return toTicket(row);
  },

  /**
   * Calculate position for new ticket in a column
   * Places new ticket at the top: min(position) - 1024
   */
  async calculatePosition(status: TicketStatus): Promise<number> {
    const result = await db
      .select({ minPosition: min(tickets.position) })
      .from(tickets)
      .where(eq(tickets.status, status));

    const minPosition = result[0]?.minPosition;

    // Empty column: start at 0
    // Non-empty: place above topmost ticket
    return minPosition !== null ? minPosition - 1024 : 0;
  },

  /**
   * FR-002: Get board view with all tickets grouped by status
   */
  async getBoard(): Promise<BoardData> {
    // Done: only tickets completed within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const allRows = await db
      .select()
      .from(tickets)
      .orderBy(asc(tickets.position));

    const board: BoardData['board'] = {
      [TICKET_STATUS.BACKLOG]: [],
      [TICKET_STATUS.TODO]: [],
      [TICKET_STATUS.IN_PROGRESS]: [],
      [TICKET_STATUS.DONE]: [],
    };

    let total = 0;

    for (const row of allRows) {
      // Filter Done tickets: only include if completedAt is within 24h
      if (row.status === TICKET_STATUS.DONE) {
        if (!row.completedAt || row.completedAt < oneDayAgo) {
          continue;
        }
      }

      const ticketWithMeta = toTicketWithMeta(row);
      board[ticketWithMeta.status].push(ticketWithMeta);
      total++;
    }

    return { board, total };
  },

  /**
   * FR-003: Get ticket by ID
   */
  async getById(id: number): Promise<TicketWithMeta> {
    const rows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new TicketNotFoundError(id);
    }

    return toTicketWithMeta(rows[0]);
  },

  /**
   * FR-004: Update ticket fields (partial update)
   */
  async update(id: number, input: UpdateTicketInput): Promise<TicketWithMeta> {
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.plannedStartDate !== undefined) updateData.plannedStartDate = input.plannedStartDate;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;

    const rows = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();

    if (rows.length === 0) {
      throw new TicketNotFoundError(id);
    }

    return toTicketWithMeta(rows[0]);
  },

  /**
   * FR-005: Mark ticket as complete
   */
  async complete(id: number): Promise<TicketWithMeta> {
    // Check ticket exists
    const existing = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new TicketNotFoundError(id);
    }

    // Calculate position for DONE column
    const position = await this.calculatePosition(TICKET_STATUS.DONE);

    const [row] = await db
      .update(tickets)
      .set({
        status: TICKET_STATUS.DONE,
        completedAt: new Date(),
        position,
      })
      .where(eq(tickets.id, id))
      .returning();

    return toTicketWithMeta(row);
  },

  /**
   * FR-006: Delete ticket (hard delete)
   */
  async remove(id: number): Promise<void> {
    const rows = await db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning({ id: tickets.id });

    if (rows.length === 0) {
      throw new TicketNotFoundError(id);
    }
  },

  /**
   * FR-007: Reorder ticket (drag & drop)
   */
  async reorder(
    input: ReorderTicketInput
  ): Promise<{ ticket: Ticket; affected: Array<{ id: number; position: number }> }> {
    return await db.transaction(async (tx) => {
      // Check ticket exists
      const existing = await tx
        .select()
        .from(tickets)
        .where(eq(tickets.id, input.ticketId))
        .limit(1);

      if (existing.length === 0) {
        throw new TicketNotFoundError(input.ticketId);
      }

      const currentTicket = existing[0];
      const updateData: Record<string, unknown> = {
        status: input.status,
        position: input.position,
      };

      // startedAt business logic
      if (input.status === TICKET_STATUS.TODO && currentTicket.status !== TICKET_STATUS.TODO) {
        updateData.startedAt = new Date();
      } else if (input.status === TICKET_STATUS.BACKLOG && currentTicket.status !== TICKET_STATUS.BACKLOG) {
        updateData.startedAt = null;
      }

      // completedAt business logic: moving out of DONE
      if (currentTicket.status === TICKET_STATUS.DONE) {
        updateData.completedAt = null;
      }

      const [row] = await tx
        .update(tickets)
        .set(updateData)
        .where(eq(tickets.id, input.ticketId))
        .returning();

      // Get other tickets in the target column that might need reordering
      const columnTickets = await tx
        .select({ id: tickets.id, position: tickets.position })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, input.status),
            ne(tickets.id, input.ticketId)
          )
        )
        .orderBy(asc(tickets.position));

      // Check if any positions need recalculation (gap < 1)
      const affected: Array<{ id: number; position: number }> = [];
      let needsRebalance = false;

      for (let i = 0; i < columnTickets.length - 1; i++) {
        if (Math.abs(columnTickets[i + 1].position - columnTickets[i].position) < 1) {
          needsRebalance = true;
          break;
        }
      }

      if (needsRebalance) {
        // Rebalance entire column with 1024 intervals
        for (let i = 0; i < columnTickets.length; i++) {
          const newPosition = (i + 1) * 1024;
          if (columnTickets[i].position !== newPosition) {
            await tx
              .update(tickets)
              .set({ position: newPosition })
              .where(eq(tickets.id, columnTickets[i].id));
            affected.push({ id: columnTickets[i].id, position: newPosition });
          }
        }
      }

      return { ticket: toTicket(row), affected };
    });
  },
};
