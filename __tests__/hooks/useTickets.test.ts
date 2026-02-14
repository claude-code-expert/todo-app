import { renderHook, act } from '@testing-library/react';
import { useTickets } from '@/client/hooks/useTickets';
import { ticketApi } from '@/client/api/ticketApi';
import type { BoardData, TicketWithMeta } from '@/shared/types';

// ticketApi mock
jest.mock('@/client/api/ticketApi');
const mockedApi = ticketApi as jest.Mocked<typeof ticketApi>;

function createEmptyBoard(): BoardData {
  return {
    board: { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [] },
    total: 0,
  };
}

function createTicket(overrides: Partial<TicketWithMeta> = {}): TicketWithMeta {
  return {
    id: 1,
    title: '테스트 티켓',
    description: null,
    status: 'BACKLOG',
    priority: 'MEDIUM',
    position: 0,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-14'),
    isOverdue: false,
    ...overrides,
  };
}

describe('useTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // 초기 상태
  // ------------------------------------------
  it('initialData를 board 상태로 초기화한다', () => {
    const initialData = createEmptyBoard();
    const { result } = renderHook(() => useTickets(initialData));

    expect(result.current.board).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ------------------------------------------
  // create
  // ------------------------------------------
  describe('create', () => {
    it('티켓 생성 후 Backlog 맨 앞에 추가한다', async () => {
      const initialData = createEmptyBoard();
      const newTicket = createTicket({ id: 10, title: '새 티켓' });

      mockedApi.create.mockResolvedValueOnce(newTicket);
      mockedApi.getBoard.mockResolvedValueOnce({
        board: { BACKLOG: [newTicket], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 1,
      });

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.create({ title: '새 티켓' });
      });

      expect(mockedApi.create).toHaveBeenCalledWith({ title: '새 티켓' });
      expect(mockedApi.getBoard).toHaveBeenCalled();
    });

    it('생성 실패 시 에러 상태를 설정한다', async () => {
      const initialData = createEmptyBoard();
      mockedApi.create.mockRejectedValueOnce(new Error('제목을 입력해주세요'));

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.create({ title: '' });
      });

      expect(result.current.error).toBe('제목을 입력해주세요');
    });
  });

  // ------------------------------------------
  // update
  // ------------------------------------------
  describe('update', () => {
    it('티켓 수정 후 보드를 갱신한다', async () => {
      const ticket = createTicket({ id: 1 });
      const initialData: BoardData = {
        board: { BACKLOG: [ticket], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 1,
      };
      const updated = { ...ticket, title: '수정됨' };

      mockedApi.update.mockResolvedValueOnce(updated);
      mockedApi.getBoard.mockResolvedValueOnce({
        board: { BACKLOG: [{ ...updated, isOverdue: false }], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 1,
      });

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.update(1, { title: '수정됨' });
      });

      expect(mockedApi.update).toHaveBeenCalledWith(1, { title: '수정됨' });
      expect(mockedApi.getBoard).toHaveBeenCalled();
    });

    it('수정 실패 시 에러 상태를 설정한다', async () => {
      const initialData = createEmptyBoard();
      mockedApi.update.mockRejectedValueOnce(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.update(999, { title: 'x' });
      });

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  // ------------------------------------------
  // remove
  // ------------------------------------------
  describe('remove', () => {
    it('티켓 삭제 후 보드에서 제거한다', async () => {
      const ticket = createTicket({ id: 1 });
      const initialData: BoardData = {
        board: { BACKLOG: [ticket], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 1,
      };

      mockedApi.remove.mockResolvedValueOnce(undefined);
      mockedApi.getBoard.mockResolvedValueOnce(createEmptyBoard());

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.remove(1);
      });

      expect(mockedApi.remove).toHaveBeenCalledWith(1);
      expect(mockedApi.getBoard).toHaveBeenCalled();
    });

    it('삭제 실패 시 에러 상태를 설정한다', async () => {
      const initialData = createEmptyBoard();
      mockedApi.remove.mockRejectedValueOnce(new Error('티켓을 찾을 수 없습니다'));

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.remove(999);
      });

      expect(result.current.error).toBe('티켓을 찾을 수 없습니다');
    });
  });

  // ------------------------------------------
  // reorder
  // ------------------------------------------
  describe('reorder', () => {
    it('reorder 호출 후 보드를 갱신한다', async () => {
      const ticket = createTicket({ id: 1, status: 'BACKLOG' });
      const initialData: BoardData = {
        board: { BACKLOG: [ticket], TODO: [], IN_PROGRESS: [], DONE: [] },
        total: 1,
      };

      const reordered = { ...ticket, status: 'TODO' as const, position: 0 };
      mockedApi.reorder.mockResolvedValueOnce({ ticket: reordered, affected: [] });
      mockedApi.getBoard.mockResolvedValueOnce({
        board: { BACKLOG: [], TODO: [{ ...reordered, isOverdue: false }], IN_PROGRESS: [], DONE: [] },
        total: 1,
      });

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.reorder(1, 'TODO', 0);
      });

      expect(mockedApi.reorder).toHaveBeenCalledWith(1, 'TODO', 0);
      expect(mockedApi.getBoard).toHaveBeenCalled();
    });
  });

  // ------------------------------------------
  // complete
  // ------------------------------------------
  describe('complete', () => {
    it('complete 호출 후 보드를 갱신한다', async () => {
      const ticket = createTicket({ id: 1, status: 'IN_PROGRESS' });
      const initialData: BoardData = {
        board: { BACKLOG: [], TODO: [], IN_PROGRESS: [ticket], DONE: [] },
        total: 1,
      };

      const completed = { ...ticket, status: 'DONE' as const, completedAt: new Date() };
      mockedApi.complete.mockResolvedValueOnce(completed);
      mockedApi.getBoard.mockResolvedValueOnce({
        board: { BACKLOG: [], TODO: [], IN_PROGRESS: [], DONE: [{ ...completed, isOverdue: false }] },
        total: 1,
      });

      const { result } = renderHook(() => useTickets(initialData));

      await act(async () => {
        await result.current.complete(1);
      });

      expect(mockedApi.complete).toHaveBeenCalledWith(1);
      expect(mockedApi.getBoard).toHaveBeenCalled();
    });
  });

  // ------------------------------------------
  // isLoading
  // ------------------------------------------
  it('API 호출 중 isLoading이 true가 된다', async () => {
    const initialData = createEmptyBoard();
    let resolveCreate: (value: unknown) => void;
    const createPromise = new Promise((resolve) => { resolveCreate = resolve; });
    mockedApi.create.mockReturnValueOnce(createPromise as never);

    const { result } = renderHook(() => useTickets(initialData));

    act(() => {
      result.current.create({ title: '테스트' });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveCreate!(createTicket());
      mockedApi.getBoard.mockResolvedValueOnce(createEmptyBoard());
    });
  });
});
