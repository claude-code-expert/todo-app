import { ticketApi } from '@/client/api/ticketApi';

// global.fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('ticketApi', () => {
  // ------------------------------------------
  // getBoard
  // ------------------------------------------
  describe('getBoard', () => {
    it('GET /api/tickets 호출 후 BoardData를 반환한다', async () => {
      const boardData = {
        board: { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 0,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => boardData,
      });

      const result = await ticketApi.getBoard();

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets');
      expect(result).toEqual(boardData);
    });

    it('응답 실패 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '서버 오류' } }),
      });

      await expect(ticketApi.getBoard()).rejects.toThrow('서버 오류');
    });
  });

  // ------------------------------------------
  // create
  // ------------------------------------------
  describe('create', () => {
    it('POST /api/tickets 호출 후 생성된 Ticket을 반환한다', async () => {
      const input = { title: '새 티켓' };
      const created = { id: 1, title: '새 티켓', status: 'BACKLOG' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => created,
      });

      const result = await ticketApi.create(input);

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(created);
    });

    it('검증 실패 시 에러 메시지를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '제목을 입력해주세요' } }),
      });

      await expect(ticketApi.create({ title: '' })).rejects.toThrow('제목을 입력해주세요');
    });
  });

  // ------------------------------------------
  // update
  // ------------------------------------------
  describe('update', () => {
    it('PATCH /api/tickets/:id 호출 후 수정된 Ticket을 반환한다', async () => {
      const updated = { id: 1, title: '수정됨' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      });

      const result = await ticketApi.update(1, { title: '수정됨' });

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '수정됨' }),
      });
      expect(result).toEqual(updated);
    });

    it('404 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '티켓을 찾을 수 없습니다' } }),
      });

      await expect(ticketApi.update(999, { title: 'x' })).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });

  // ------------------------------------------
  // remove
  // ------------------------------------------
  describe('remove', () => {
    it('DELETE /api/tickets/:id 호출한다', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await ticketApi.remove(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets/1', {
        method: 'DELETE',
      });
    });

    it('404 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '티켓을 찾을 수 없습니다' } }),
      });

      await expect(ticketApi.remove(999)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });

  // ------------------------------------------
  // reorder
  // ------------------------------------------
  describe('reorder', () => {
    it('PATCH /api/tickets/reorder 호출 후 결과를 반환한다', async () => {
      const response = {
        ticket: { id: 1, status: 'TODO', position: 0 },
        affected: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await ticketApi.reorder(1, 'TODO', 0);

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: 1, status: 'TODO', position: 0 }),
      });
      expect(result).toEqual(response);
    });
  });

  // ------------------------------------------
  // complete
  // ------------------------------------------
  describe('complete', () => {
    it('PATCH /api/tickets/:id/complete 호출 후 완료된 Ticket을 반환한다', async () => {
      const completed = { id: 1, status: 'DONE', completedAt: '2026-02-14T00:00:00.000Z' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => completed,
      });

      const result = await ticketApi.complete(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/tickets/1/complete', {
        method: 'PATCH',
      });
      expect(result).toEqual(completed);
    });

    it('404 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: '티켓을 찾을 수 없습니다' } }),
      });

      await expect(ticketApi.complete(999)).rejects.toThrow('티켓을 찾을 수 없습니다');
    });
  });
});
