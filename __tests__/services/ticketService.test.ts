/**
 * @jest-environment node
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TICKET_STATUS, TICKET_PRIORITY } from '@/shared/types';

describe('ticketService.create', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.delete(tickets);
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(tickets);
  });

  describe('FR-001: Create ticket with required fields', () => {
    test('creates ticket with title only', async () => {
      // Arrange
      const input = {
        title: 'Test Ticket',
      };

      // Act
      const ticket = await ticketService.create(input);

      // Assert
      expect(ticket).toMatchObject({
        title: 'Test Ticket',
        status: TICKET_STATUS.BACKLOG,
        priority: TICKET_PRIORITY.MEDIUM,
        description: null,
        plannedStartDate: null,
        dueDate: null,
        startedAt: null,
        completedAt: null,
      });
      expect(ticket.id).toBeDefined();
      expect(ticket.position).toBeDefined();
      expect(ticket.createdAt).toBeInstanceOf(Date);
      expect(ticket.updatedAt).toBeInstanceOf(Date);
    });

    test('creates ticket with all optional fields', async () => {
      // Arrange
      const input = {
        title: 'Complete Ticket',
        description: 'Detailed description',
        priority: TICKET_PRIORITY.HIGH,
        plannedStartDate: '2026-02-10',
        dueDate: '2026-02-15',
      };

      // Act
      const ticket = await ticketService.create(input);

      // Assert
      expect(ticket).toMatchObject({
        title: 'Complete Ticket',
        description: 'Detailed description',
        priority: TICKET_PRIORITY.HIGH,
        plannedStartDate: '2026-02-10',
        dueDate: '2026-02-15',
        status: TICKET_STATUS.BACKLOG,
      });
    });
  });

  describe('FR-009: Position calculation', () => {
    test('sets position to 0 for first ticket in empty BACKLOG', async () => {
      // Arrange
      const input = { title: 'First Ticket' };

      // Act
      const ticket = await ticketService.create(input);

      // Assert
      expect(ticket.position).toBe(0);
    });

    test('places new ticket at top of BACKLOG (min - 1024)', async () => {
      // Arrange
      const existing = await ticketService.create({ title: 'Existing' });
      const input = { title: 'New Ticket' };

      // Act
      const newTicket = await ticketService.create(input);

      // Assert
      expect(newTicket.position).toBe(existing.position - 1024);
    });

    test('maintains correct order with multiple tickets', async () => {
      // Arrange
      const ticket1 = await ticketService.create({ title: 'First' });
      const ticket2 = await ticketService.create({ title: 'Second' });
      const ticket3 = await ticketService.create({ title: 'Third' });

      // Assert: Most recent ticket has lowest position (appears at top)
      expect(ticket3.position).toBeLessThan(ticket2.position);
      expect(ticket2.position).toBeLessThan(ticket1.position);
    });
  });

  describe('FR-011: Workflow timestamps', () => {
    test('sets startedAt and completedAt to null', async () => {
      // Arrange
      const input = { title: 'Test Ticket' };

      // Act
      const ticket = await ticketService.create(input);

      // Assert
      expect(ticket.startedAt).toBeNull();
      expect(ticket.completedAt).toBeNull();
    });
  });
});
