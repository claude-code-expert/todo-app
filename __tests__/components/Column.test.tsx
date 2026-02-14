import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TicketWithMeta } from '@/shared/types';
import { Column } from '@/client/components/board/Column';

// dnd-kit mock
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

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
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
    status: 'TODO',
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

describe('TC-COMP-002: Column', () => {
  const defaultOnTicketClick = jest.fn();

  beforeEach(() => {
    defaultOnTicketClick.mockClear();
  });

  // ------------------------------------------
  // C002-1: 티켓 있는 칼럼 → 카드 목록 + 개수 뱃지
  // ------------------------------------------
  it('C002-1: 티켓이 있으면 카드 목록과 개수 뱃지가 표시된다', () => {
    const tickets = [
      createTicket({ id: 1, title: '첫 번째 티켓' }),
      createTicket({ id: 2, title: '두 번째 티켓' }),
      createTicket({ id: 3, title: '세 번째 티켓' }),
    ];

    render(
      <Column status="TODO" tickets={tickets} onTicketClick={defaultOnTicketClick} />
    );

    expect(screen.getByText('첫 번째 티켓')).toBeInTheDocument();
    expect(screen.getByText('두 번째 티켓')).toBeInTheDocument();
    expect(screen.getByText('세 번째 티켓')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C002-2: 빈 칼럼 → 안내 메시지
  // ------------------------------------------
  it('C002-2: 티켓이 없으면 안내 메시지가 표시된다', () => {
    render(
      <Column status="TODO" tickets={[]} onTicketClick={defaultOnTicketClick} />
    );

    expect(screen.getByText('이 칼럼에 티켓이 없습니다')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C002-3: 칼럼 헤더에 칼럼명 + 티켓 수
  // ------------------------------------------
  it('C002-3: 칼럼 헤더에 칼럼명과 티켓 수가 표시된다', () => {
    const tickets = [createTicket({ id: 1 }), createTicket({ id: 2 })];

    render(
      <Column status="IN_PROGRESS" tickets={tickets} onTicketClick={defaultOnTicketClick} />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // ------------------------------------------
  // 카드 클릭 시 onTicketClick 호출
  // ------------------------------------------
  it('카드를 클릭하면 onTicketClick에 해당 티켓이 전달된다', async () => {
    const ticket = createTicket({ id: 42, title: '클릭 테스트' });

    render(
      <Column status="TODO" tickets={[ticket]} onTicketClick={defaultOnTicketClick} />
    );

    await userEvent.click(screen.getByRole('button', { name: '티켓: 클릭 테스트' }));
    expect(defaultOnTicketClick).toHaveBeenCalledWith(ticket);
  });

  // ------------------------------------------
  // 각 status에 대한 칼럼명 표시
  // ------------------------------------------
  it.each([
    ['BACKLOG', 'Backlog'],
    ['TODO', 'Todo'],
    ['IN_PROGRESS', 'In Progress'],
    ['DONE', 'Done'],
  ] as const)('status=%s일 때 칼럼명 "%s"가 표시된다', (status, expectedLabel) => {
    render(
      <Column status={status} tickets={[]} onTicketClick={defaultOnTicketClick} />
    );

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
