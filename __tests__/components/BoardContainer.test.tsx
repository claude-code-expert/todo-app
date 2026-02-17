import { render, screen, fireEvent } from '@testing-library/react';
import { BoardContainer } from '@/client/components/board/BoardContainer';
import { useTickets } from '@/client/hooks/useTickets';
import type { BoardData, TicketWithMeta } from '@/shared/types';

// useTickets mock
jest.mock('@/client/hooks/useTickets');
const mockedUseTickets = useTickets as jest.MockedFunction<typeof useTickets>;

// dnd-kit mock
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  MouseSensor: jest.fn(),
  TouchSensor: jest.fn(),
  closestCorners: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
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

const overdueTicket: TicketWithMeta = {
  id: 1,
  title: '마감 초과 티켓',
  description: null,
  status: 'TODO',
  priority: 'HIGH',
  position: -1024,
  plannedStartDate: null,
  dueDate: '2026-02-10',
  startedAt: new Date(),
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isOverdue: true,
};

const normalTicket: TicketWithMeta = {
  id: 2,
  title: '정상 티켓',
  description: null,
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: '2026-03-15',
  startedAt: new Date(),
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isOverdue: false,
};

const mockBoard: BoardData = {
  board: {
    BACKLOG: [],
    TODO: [overdueTicket, normalTicket],
    IN_PROGRESS: [],
    DONE: [],
  },
  total: 2,
};

const mockActions = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  reorder: jest.fn(),
  complete: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTickets.mockReturnValue({
    board: mockBoard,
    isLoading: false,
    error: null,
    ...mockActions,
  });
});

describe('BoardContainer', () => {
  // 5-3-1: BoardHeader 렌더링
  it('BoardHeader가 렌더링된다 (Tika 타이틀)', () => {
    render(<BoardContainer initialData={mockBoard} />);

    expect(screen.getByText('Tika')).toBeInTheDocument();
  });

  // 5-3-2: FilterBar 렌더링
  it('FilterBar가 렌더링된다 (이번주 업무, 일정 초과)', () => {
    render(<BoardContainer initialData={mockBoard} />);

    expect(screen.getByText('이번주 업무')).toBeInTheDocument();
    expect(screen.getByText('일정 초과')).toBeInTheDocument();
  });

  // 5-3-3: Board 4칼럼 렌더링
  it('Board 4칼럼이 렌더링된다', () => {
    render(<BoardContainer initialData={mockBoard} />);

    expect(screen.getByText('백로그')).toBeInTheDocument();
    expect(screen.getByText('할 일')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  // 5-3-4: "새 업무" 클릭 → 생성 모달 열기
  it('"새 업무" 클릭 시 생성 모달이 열린다', () => {
    render(<BoardContainer initialData={mockBoard} />);

    fireEvent.click(screen.getByText('새 업무'));

    expect(screen.getByText('새 업무 생성')).toBeInTheDocument();
  });

  // 5-3-5: 티켓 카드 클릭 → 상세 모달 열기
  it('티켓 카드 클릭 시 상세 모달이 열린다', () => {
    render(<BoardContainer initialData={mockBoard} />);

    fireEvent.click(screen.getByText('마감 초과 티켓'));

    // TicketModal이 열리면 티켓 제목이 모달 헤더에도 표시됨
    const titles = screen.getAllByText('마감 초과 티켓');
    expect(titles.length).toBeGreaterThanOrEqual(2); // 카드 + 모달 헤더
  });

  // 5-3-6: overdue 필터 적용 시 isOverdue=false 티켓 숨기기
  it('overdue 필터 적용 시 isOverdue=false 티켓이 숨겨진다', () => {
    render(<BoardContainer initialData={mockBoard} />);

    // 필터 적용 전: 두 티켓 모두 보임
    expect(screen.getByText('마감 초과 티켓')).toBeInTheDocument();
    expect(screen.getByText('정상 티켓')).toBeInTheDocument();

    // "일정 초과" 필터 클릭
    fireEvent.click(screen.getByText('일정 초과'));

    // isOverdue=true인 티켓만 보임
    expect(screen.getByText('마감 초과 티켓')).toBeInTheDocument();
    expect(screen.queryByText('정상 티켓')).not.toBeInTheDocument();
  });
});
