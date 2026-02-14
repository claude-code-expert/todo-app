/**
 * @jest-environment node
 *
 * TC-API-005: PATCH /api/tickets/:id/complete — 티켓 완료
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TICKET_STATUS } from '@/shared/types';
import { TicketNotFoundError } from '@/shared/errors';

describe('ticketService.complete', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('005-1: 정상 완료 처리 시 status=DONE, completedAt 설정', async () => {
    const created = await ticketService.create({ title: 'Complete me' });

    const completed = await ticketService.complete(created.id);

    expect(completed.status).toBe(TICKET_STATUS.DONE);
    expect(completed.completedAt).not.toBeNull();
  });

  test('005-2: completedAt이 현재 시각에 근접', async () => {
    const before = new Date();
    const created = await ticketService.create({ title: 'Timestamp test' });
    const completed = await ticketService.complete(created.id);
    const after = new Date();

    expect(completed.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(completed.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  test('005-3: Done 칼럼 맨 위 position 할당', async () => {
    const t1 = await ticketService.create({ title: 'First' });
    const t2 = await ticketService.create({ title: 'Second' });

    const c1 = await ticketService.complete(t1.id);
    const c2 = await ticketService.complete(t2.id);

    // 나중에 완료된 티켓의 position이 더 작음 (맨 위)
    expect(c2.position).toBeLessThan(c1.position);
  });

  test('005-4: 없는 티켓 완료 시 TicketNotFoundError', async () => {
    await expect(ticketService.complete(99999)).rejects.toThrow(TicketNotFoundError);
  });

  test('005-5: 완료 시 updatedAt이 유효한 Date', async () => {
    const created = await ticketService.create({ title: 'Test' });

    const completed = await ticketService.complete(created.id);

    expect(completed.updatedAt).toBeInstanceOf(Date);
    expect(completed.status).toBe('DONE');
  });
});
