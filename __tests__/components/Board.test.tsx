import { render, screen } from '@testing-library/react';
import type { TicketWithMeta, BoardData } from '@/shared/types';
import { Board } from '@/client/components/board/Board';

// dnd-kit mock
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCorners: jest.fn(),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
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

function createTicket(overrides: Partial<TicketWithMeta> = {}): TicketWithMeta {
  return {
    id: 1,
    title: '테스트 티켓',
    description: null,
    status: 'BACKLOG',
    priority: 'MEDIUM',
    position: 1024,
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

describe('TC-COMP-003: Board', () => {
  const defaultOnTicketClick = jest.fn();

  beforeEach(() => {
    defaultOnTicketClick.mockClear();
  });

  // ------------------------------------------
  // C003-1: 4칼럼 렌더링 (BACKLOG, TODO, IN_PROGRESS, DONE)
  // ------------------------------------------
  it('C003-1: 4개 칼럼이 모두 렌더링된다', () => {
    const board = createBoard();

    render(<Board board={board} onTicketClick={defaultOnTicketClick} />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C003-2: Backlog가 좌측 사이드바로 배치
  // ------------------------------------------
  it('C003-2: Backlog 칼럼이 board-sidebar 안에 배치된다', () => {
    const board = createBoard();
    const { container } = render(
      <Board board={board} onTicketClick={defaultOnTicketClick} />
    );

    const sidebar = container.querySelector('.board-sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar!.textContent).toContain('Backlog');
  });

  // ------------------------------------------
  // 나머지 3칼럼은 columns-container 안에 배치
  // ------------------------------------------
  it('TODO, In Progress, Done 칼럼이 columns-container 안에 배치된다', () => {
    const board = createBoard();
    const { container } = render(
      <Board board={board} onTicketClick={defaultOnTicketClick} />
    );

    const columnsContainer = container.querySelector('.columns-container');
    expect(columnsContainer).toBeInTheDocument();
    expect(columnsContainer!.textContent).toContain('Todo');
    expect(columnsContainer!.textContent).toContain('In Progress');
    expect(columnsContainer!.textContent).toContain('Done');
  });

  // ------------------------------------------
  // 각 칼럼에 해당 티켓 표시
  // ------------------------------------------
  it('각 칼럼에 해당하는 티켓이 표시된다', () => {
    const board = createBoard({
      BACKLOG: [createTicket({ id: 1, title: '백로그 티켓', status: 'BACKLOG' })],
      TODO: [createTicket({ id: 2, title: 'TODO 티켓', status: 'TODO' })],
      IN_PROGRESS: [createTicket({ id: 3, title: '진행중 티켓', status: 'IN_PROGRESS' })],
      DONE: [createTicket({ id: 4, title: '완료 티켓', status: 'DONE' })],
    });

    render(<Board board={board} onTicketClick={defaultOnTicketClick} />);

    expect(screen.getByText('백로그 티켓')).toBeInTheDocument();
    expect(screen.getByText('TODO 티켓')).toBeInTheDocument();
    expect(screen.getByText('진행중 티켓')).toBeInTheDocument();
    expect(screen.getByText('완료 티켓')).toBeInTheDocument();
  });
});
