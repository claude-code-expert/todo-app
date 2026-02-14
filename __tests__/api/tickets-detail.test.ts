/**
 * @jest-environment node
 *
 * TC-API-003/004/005/006: Route Handler 테스트
 * ID 파싱, Zod 검증 등 Route Handler 레벨에서만 테스트 가능한 케이스
 */
import { GET, PATCH, DELETE } from '@/app/api/tickets/[id]/route';
import { PATCH as COMPLETE } from '@/app/api/tickets/[id]/complete/route';
import { NextRequest } from 'next/server';

function createContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function createPatchRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/tickets/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Route Handler: /api/tickets/[id]', () => {
  describe('GET /api/tickets/:id', () => {
    it('003-3: 잘못된 id 형식이면 400 에러', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/abc');
      const response = await GET(request, createContext('abc'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('003-2: 없는 티켓 조회 시 404', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/99999');
      const response = await GET(request, createContext('99999'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('TICKET_NOT_FOUND');
      expect(data.error.message).toBe('티켓을 찾을 수 없습니다');
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    it('004-9: status 필드를 보내도 VALIDATION_ERROR가 발생하지 않음', async () => {
      // status는 updateTicketSchema에 정의되지 않아 Zod가 strip함
      // 따라서 VALIDATION_ERROR(400)가 아닌 다른 응답이 반환됨
      const request = createPatchRequest({ status: 'DONE' });
      const response = await PATCH(request, createContext('99999'));

      expect(response.status).not.toBe(400);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('006-2: 없는 티켓 삭제 시 404', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/99999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, createContext('99999'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('TICKET_NOT_FOUND');
    });
  });

  describe('PATCH /api/tickets/:id/complete', () => {
    it('005-4: 없는 티켓 완료 시 404', async () => {
      const request = new NextRequest('http://localhost:3000/api/tickets/99999/complete', {
        method: 'PATCH',
      });
      const response = await COMPLETE(request, createContext('99999'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('TICKET_NOT_FOUND');
    });
  });
});
