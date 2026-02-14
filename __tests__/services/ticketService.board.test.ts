/**
 * @jest-environment node
 *
 * TC-API-002: GET /api/tickets — 보드 조회
 * 서비스 레이어 통합 테스트
 */
import { ticketService } from '@/server/services/ticketService';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { TICKET_STATUS, TICKET_PRIORITY } from '@/shared/types';
import { eq } from 'drizzle-orm';

describe('ticketService.getBoard', () => {
  beforeEach(async () => {
    await db.delete(tickets);
  });

  afterAll(async () => {
    await db.delete(tickets);
  });

  test('002-1: 빈 보드 조회 시 4개 빈 배열 반환', async () => {
    const result = await ticketService.getBoard();

    expect(result.board.BACKLOG).toEqual([]);
    expect(result.board.TODO).toEqual([]);
    expect(result.board.IN_PROGRESS).toEqual([]);
    expect(result.board.DONE).toEqual([]);
    expect(result.total).toBe(0);
  });

  test('002-2: 여러 상태의 티켓이 상태별로 그룹화된다', async () => {
    // Arrange: 다양한 상태의 티켓 생성
    const t1 = await ticketService.create({ title: 'Backlog 1' });
    const t2 = await ticketService.create({ title: 'Backlog 2' });

    // TODO로 이동
    await ticketService.reorder({ ticketId: t2.id, status: 'TODO', position: 0 });

    const result = await ticketService.getBoard();

    expect(result.board.BACKLOG.length).toBe(1);
    expect(result.board.TODO.length).toBe(1);
    expect(result.board.BACKLOG[0].title).toBe('Backlog 1');
    expect(result.board.TODO[0].title).toBe('Backlog 2');
  });

  test('002-3: 같은 칼럼 내 position 오름차순 정렬', async () => {
    const t1 = await ticketService.create({ title: 'First' });
    const t2 = await ticketService.create({ title: 'Second' });
    const t3 = await ticketService.create({ title: 'Third' });

    const result = await ticketService.getBoard();

    // position 오름차순이므로 가장 작은 position이 먼저 (= 가장 최근 생성)
    const positions = result.board.BACKLOG.map((t) => t.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test('002-4: total은 표시되는 전체 티켓 수', async () => {
    await ticketService.create({ title: 'T1' });
    await ticketService.create({ title: 'T2' });
    await ticketService.create({ title: 'T3' });

    const result = await ticketService.getBoard();

    expect(result.total).toBe(3);
  });

  test('002-5: Done 24시간 이내 티켓은 Done 칼럼에 포함', async () => {
    const ticket = await ticketService.create({ title: 'To complete' });
    await ticketService.complete(ticket.id);

    const result = await ticketService.getBoard();

    expect(result.board.DONE.length).toBe(1);
    expect(result.board.DONE[0].title).toBe('To complete');
  });

  test('002-6: Done 24시간 초과 티켓은 Done 칼럼에서 제외', async () => {
    const ticket = await ticketService.create({ title: 'Old done' });
    await ticketService.complete(ticket.id);

    // completedAt을 25시간 전으로 강제 설정
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await db
      .update(tickets)
      .set({ completedAt: twentyFiveHoursAgo })
      .where(eq(tickets.id, ticket.id));

    const result = await ticketService.getBoard();

    expect(result.board.DONE.length).toBe(0);
  });

  test('002-7: 각 티켓에 isOverdue 파생 필드 포함', async () => {
    await ticketService.create({ title: 'Test ticket' });

    const result = await ticketService.getBoard();

    expect(result.board.BACKLOG[0]).toHaveProperty('isOverdue');
    expect(typeof result.board.BACKLOG[0].isOverdue).toBe('boolean');
  });

  test('002-8: 모든 날짜 필드 포함', async () => {
    await ticketService.create({
      title: 'Date test',
      plannedStartDate: '2026-03-01',
      dueDate: '2026-03-15',
    });

    const result = await ticketService.getBoard();
    const ticket = result.board.BACKLOG[0];

    expect(ticket).toHaveProperty('plannedStartDate');
    expect(ticket).toHaveProperty('dueDate');
    expect(ticket).toHaveProperty('startedAt');
    expect(ticket).toHaveProperty('completedAt');
    expect(ticket.plannedStartDate).toBe('2026-03-01');
    expect(ticket.dueDate).toBe('2026-03-15');
  });
});
