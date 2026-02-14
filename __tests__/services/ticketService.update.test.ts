/**
 * @jest-environment node
 *
 * TC-API-004: PATCH /api/tickets/:id — 티켓 수정
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TicketNotFoundError } from '@/shared/errors';

describe('ticketService.update', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('004-1: 제목만 수정하면 제목만 변경되고 나머지 유지', async () => {
    const created = await ticketService.create({
      title: '원래 제목',
      description: '설명',
      priority: 'HIGH',
    });

    const updated = await ticketService.update(created.id, { title: '새 제목' });

    expect(updated.title).toBe('새 제목');
    expect(updated.description).toBe('설명');
    expect(updated.priority).toBe('HIGH');
  });

  test('004-2: 우선순위 변경', async () => {
    const created = await ticketService.create({ title: 'Test', priority: 'HIGH' });

    const updated = await ticketService.update(created.id, { priority: 'LOW' });

    expect(updated.priority).toBe('LOW');
  });

  test('004-3: 설명을 null로 설정하면 삭제', async () => {
    const created = await ticketService.create({
      title: 'Test',
      description: '삭제할 설명',
    });

    const updated = await ticketService.update(created.id, { description: null });

    expect(updated.description).toBeNull();
  });

  test('004-4: 종료예정일을 null로 설정하면 삭제', async () => {
    const created = await ticketService.create({
      title: 'Test',
      dueDate: '2026-12-31',
    });

    const updated = await ticketService.update(created.id, { dueDate: null });

    expect(updated.dueDate).toBeNull();
  });

  test('004-5: 시작예정일 수정', async () => {
    const created = await ticketService.create({ title: 'Test' });

    const updated = await ticketService.update(created.id, {
      plannedStartDate: '2026-03-01',
    });

    expect(updated.plannedStartDate).toBe('2026-03-01');
  });

  test('004-6: 시작예정일을 null로 설정하면 삭제', async () => {
    const created = await ticketService.create({
      title: 'Test',
      plannedStartDate: '2026-03-01',
    });

    const updated = await ticketService.update(created.id, { plannedStartDate: null });

    expect(updated.plannedStartDate).toBeNull();
  });

  test('004-7: 없는 티켓 수정 시 TicketNotFoundError', async () => {
    await expect(
      ticketService.update(99999, { title: '없는 티켓' })
    ).rejects.toThrow(TicketNotFoundError);
  });

  test('004-8: 수정 시 updatedAt이 유효한 Date', async () => {
    const created = await ticketService.create({ title: 'Test' });

    const updated = await ticketService.update(created.id, { title: '변경' });

    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.title).toBe('변경');
  });
});
