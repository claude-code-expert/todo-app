/**
 * @jest-environment node
 *
 * TC-API-008: isOverdue 필드 계산
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

describe('isOverdue calculation', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('008-1: dueDate < 오늘, status=TODO → isOverdue=true', async () => {
    const ticket = await ticketService.create({ title: 'Overdue' });

    // TODO로 이동
    await ticketService.reorder({ ticketId: ticket.id, status: 'TODO', position: 0 });

    // dueDate를 과거로 설정
    await db
      .update(tickets)
      .set({ dueDate: '2020-01-01' })
      .where(eq(tickets.id, ticket.id));

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(true);
  });

  test('008-2: dueDate < 오늘, status=DONE → isOverdue=false', async () => {
    const ticket = await ticketService.create({ title: 'Done overdue' });
    await ticketService.complete(ticket.id);

    // dueDate를 과거로 설정
    await db
      .update(tickets)
      .set({ dueDate: '2020-01-01' })
      .where(eq(tickets.id, ticket.id));

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(false);
  });

  test('008-3: dueDate=null → isOverdue=false', async () => {
    const ticket = await ticketService.create({ title: 'No due date' });

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(false);
  });

  test('008-4: dueDate > 오늘 → isOverdue=false', async () => {
    const ticket = await ticketService.create({
      title: 'Future due',
      dueDate: '2099-12-31',
    });

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(false);
  });

  test('008-5: dueDate = 오늘 → isOverdue=false', async () => {
    const today = new Date().toISOString().split('T')[0];
    const ticket = await ticketService.create({
      title: 'Due today',
      dueDate: today,
    });

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(false);
  });

  test('008-6: dueDate < 오늘, status=BACKLOG → isOverdue=true', async () => {
    const ticket = await ticketService.create({ title: 'Backlog overdue' });

    await db
      .update(tickets)
      .set({ dueDate: '2020-01-01' })
      .where(eq(tickets.id, ticket.id));

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(true);
  });

  test('008-7: dueDate < 오늘, status=IN_PROGRESS → isOverdue=true', async () => {
    const ticket = await ticketService.create({ title: 'IP overdue' });

    // IN_PROGRESS로 이동
    await ticketService.reorder({
      ticketId: ticket.id,
      status: 'IN_PROGRESS',
      position: 0,
    });

    // dueDate를 과거로 설정
    await db
      .update(tickets)
      .set({ dueDate: '2020-01-01' })
      .where(eq(tickets.id, ticket.id));

    const result = await ticketService.getById(ticket.id);

    expect(result.isOverdue).toBe(true);
  });
});
