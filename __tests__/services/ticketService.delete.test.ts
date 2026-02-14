/**
 * @jest-environment node
 *
 * TC-API-006: DELETE /api/tickets/:id — 티켓 삭제
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TicketNotFoundError } from '@/shared/errors';

describe('ticketService.remove', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('006-1: 정상 삭제 후 재조회 시 TicketNotFoundError', async () => {
    const created = await ticketService.create({ title: 'Delete me' });

    await ticketService.remove(created.id);

    await expect(ticketService.getById(created.id)).rejects.toThrow(TicketNotFoundError);
  });

  test('006-2: 없는 티켓 삭제 시 TicketNotFoundError', async () => {
    await expect(ticketService.remove(99999)).rejects.toThrow(TicketNotFoundError);
  });
});
