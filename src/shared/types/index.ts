export const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;
  dueDate: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  plannedStartDate?: string;
  dueDate?: string;
}

export interface TicketWithMeta extends Ticket {
  isOverdue: boolean;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

export interface ReorderTicketInput {
  ticketId: number;
  status: Exclude<TicketStatus, 'DONE'>;
  position: number;
}

export interface BoardData {
  board: Record<TicketStatus, TicketWithMeta[]>;
  total: number;
}
