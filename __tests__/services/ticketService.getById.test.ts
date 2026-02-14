/**
 * @jest-environment node
 *
 * TC-API-003: GET /api/tickets/:id — 티켓 상세 조회
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TicketNotFoundError } from '@/shared/errors';

describe('ticketService.getById', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('003-1: 존재하는 티켓 조회 시 전체 데이터 반환', async () => {
    const created = await ticketService.create({
      title: 'Test Ticket',
      description: 'Test description',
      priority: 'HIGH',
      plannedStartDate: '2026-03-01',
      dueDate: '2026-03-15',
    });

    const ticket = await ticketService.getById(created.id);

    expect(ticket.id).toBe(created.id);
    expect(ticket.title).toBe('Test Ticket');
    expect(ticket.description).toBe('Test description');
    expect(ticket.priority).toBe('HIGH');
    expect(ticket.status).toBe('BACKLOG');
    expect(ticket.plannedStartDate).toBe('2026-03-01');
    expect(ticket.dueDate).toBe('2026-03-15');
    expect(ticket.startedAt).toBeNull();
    expect(ticket.completedAt).toBeNull();
    expect(ticket.createdAt).toBeInstanceOf(Date);
    expect(ticket.updatedAt).toBeInstanceOf(Date);
  });

  test('003-2: 없는 티켓 조회 시 TicketNotFoundError', async () => {
    await expect(ticketService.getById(99999)).rejects.toThrow(TicketNotFoundError);
  });

  test('003-4: isOverdue 파생 필드 포함', async () => {
    const created = await ticketService.create({ title: 'Overdue test' });

    const ticket = await ticketService.getById(created.id);

    expect(ticket).toHaveProperty('isOverdue');
    expect(typeof ticket.isOverdue).toBe('boolean');
  });
});
