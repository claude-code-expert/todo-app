/**
 * @jest-environment node
 *
 * TC-API-007: PATCH /api/tickets/reorder — Route Handler 검증 테스트
 * Zod 스키마 레벨에서만 검증 가능한 케이스 (007-9, 007-10)
 */
import { PATCH } from '@/app/api/tickets/reorder/route';
import { NextRequest } from 'next/server';

function createRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/tickets/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/tickets/reorder', () => {
  it('007-9: DONE을 status로 전송하면 400 에러', async () => {
    const request = createRequest({
      ticketId: 1,
      status: 'DONE',
      position: 0,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toBe('상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요');
  });

  it('007-10: 잘못된 status 값이면 400 에러', async () => {
    const request = createRequest({
      ticketId: 1,
      status: 'INVALID',
      position: 0,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toBe('상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요');
  });

  it('007-11: 없는 티켓이면 404 에러', async () => {
    const request = createRequest({
      ticketId: 99999,
      status: 'TODO',
      position: 0,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('TICKET_NOT_FOUND');
  });
});
