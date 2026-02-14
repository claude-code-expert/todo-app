import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BoardData, TicketWithMeta } from '@/shared/types';
import { BoardContainer } from '@/client/components/board/BoardContainer';

// dnd-kit mocks
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  useDroppable: () => ({ setNodeRef: jest.fn(), isOver: false }),
  closestCorners: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: 'vertical',
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

// useTickets mock
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();
const mockReorder = jest.fn();
const mockComplete = jest.fn();

jest.mock('@/client/hooks/useTickets', () => ({
  useTickets: (initialData: BoardData) => ({
    board: initialData,
    isLoading: false,
    error: null,
    create: mockCreate,
    update: mockUpdate,
    remove: mockRemove,
    reorder: mockReorder,
    complete: mockComplete,
  }),
}));

function createTicket(overrides: Partial<TicketWithMeta> = {}): TicketWithMeta {
  return {
    id: 1,
    title: '테스트 티켓',
    description: null,
    status: 'TODO',
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

function createBoard(overrides: Partial<BoardData['board']> = {}): BoardData {
  return {
    board: {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      ...overrides,
    },
    total: 0,
  };
}

describe('BoardContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // 렌더링
  // ------------------------------------------
  it('BoardHeader가 렌더링된다', () => {
    render(<BoardContainer initialData={createBoard()} />);
    expect(screen.getByText('Tika')).toBeInTheDocument();
  });

  it('FilterBar가 렌더링된다', () => {
    render(<BoardContainer initialData={createBoard()} />);
    expect(screen.getByRole('button', { name: /이번주 업무/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /일정 초과/ })).toBeInTheDocument();
  });

  it('Board에 4개 칼럼이 렌더링된다', () => {
    render(<BoardContainer initialData={createBoard()} />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  // ------------------------------------------
  // 생성 모달
  // ------------------------------------------
  it('"새 업무" 클릭 시 생성 모달이 열린다', async () => {
    render(<BoardContainer initialData={createBoard()} />);

    await userEvent.click(screen.getByRole('button', { name: '새 업무' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
  });

  // ------------------------------------------
  // 티켓 카드 클릭 → 상세 모달
  // ------------------------------------------
  it('티켓 카드 클릭 시 상세 모달이 열린다', async () => {
    const ticket = createTicket({ id: 1, title: '클릭할 티켓', status: 'TODO' });
    const board = createBoard({ TODO: [ticket] });

    render(<BoardContainer initialData={board} />);

    await userEvent.click(screen.getByRole('button', { name: '티켓: 클릭할 티켓' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('클릭할 티켓').length).toBeGreaterThanOrEqual(2);
  });

  // ------------------------------------------
  // 필터 연동
  // ------------------------------------------
  it('overdue 필터 적용 시 isOverdue=false 티켓이 숨겨진다', async () => {
    const normalTicket = createTicket({ id: 1, title: '정상 티켓', status: 'TODO', isOverdue: false });
    const overdueTicket = createTicket({ id: 2, title: '초과 티켓', status: 'TODO', isOverdue: true, dueDate: '2025-01-01' });
    const board = createBoard({ TODO: [normalTicket, overdueTicket] });

    render(<BoardContainer initialData={board} />);

    // 필터 전: 둘 다 보임
    expect(screen.getByText('정상 티켓')).toBeInTheDocument();
    expect(screen.getByText('초과 티켓')).toBeInTheDocument();

    // overdue 필터 적용
    await userEvent.click(screen.getByRole('button', { name: /일정 초과/ }));

    // 필터 후: 초과 티켓만 보임 (TODO/IN_PROGRESS 칼럼에서)
    expect(screen.queryByText('정상 티켓')).not.toBeInTheDocument();
    expect(screen.getByText('초과 티켓')).toBeInTheDocument();
  });
});
