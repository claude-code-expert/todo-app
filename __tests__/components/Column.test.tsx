import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Column } from '@/client/components/board/Column';
import type { TicketWithMeta } from '@/shared/types';

// dnd-kit mock
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

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

const mockTickets: TicketWithMeta[] = [
  {
    id: 1,
    title: '첫 번째 티켓',
    description: null,
    status: 'TODO',
    priority: 'HIGH',
    position: -1024,
    plannedStartDate: null,
    dueDate: '2026-03-01',
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-02-17'),
    updatedAt: new Date('2026-02-17'),
    isOverdue: false,
  },
  {
    id: 2,
    title: '두 번째 티켓',
    description: null,
    status: 'TODO',
    priority: 'LOW',
    position: 0,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2026-02-17'),
    updatedAt: new Date('2026-02-17'),
    isOverdue: false,
  },
];

describe('Column', () => {
  // C002-1: 티켓 있는 칼럼
  it('티켓이 있으면 카드 목록이 표시된다', () => {
    render(<Column status="TODO" tickets={mockTickets} onTicketClick={jest.fn()} />);

    expect(screen.getByText('첫 번째 티켓')).toBeInTheDocument();
    expect(screen.getByText('두 번째 티켓')).toBeInTheDocument();
  });

  it('티켓 수가 뱃지에 표시된다', () => {
    render(<Column status="TODO" tickets={mockTickets} onTicketClick={jest.fn()} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // C002-2: 빈 칼럼
  it('티켓이 없으면 안내 메시지가 표시된다', () => {
    render(<Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />);

    expect(screen.getByText('이 칼럼에 티켓이 없습니다')).toBeInTheDocument();
  });

  // C002-3: 칼럼 헤더
  it('칼럼 헤더에 한글 칼럼명이 표시된다', () => {
    render(<Column status="TODO" tickets={mockTickets} onTicketClick={jest.fn()} />);

    expect(screen.getByText('할 일')).toBeInTheDocument();
  });

  it('column 클래스가 적용된다', () => {
    const { container } = render(
      <Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />
    );

    expect(container.querySelector('.column')).toBeInTheDocument();
  });

  it('빈 칼럼에 column-empty 클래스가 적용된다', () => {
    const { container } = render(
      <Column status="TODO" tickets={[]} onTicketClick={jest.fn()} />
    );

    expect(container.querySelector('.column-empty')).toBeInTheDocument();
  });

  it('카드 클릭 시 onTicketClick이 해당 티켓으로 호출된다', async () => {
    const user = userEvent.setup();
    const onTicketClick = jest.fn();
    render(<Column status="TODO" tickets={mockTickets} onTicketClick={onTicketClick} />);

    await user.click(screen.getByText('첫 번째 티켓'));
    expect(onTicketClick).toHaveBeenCalledWith(mockTickets[0]);
  });

  it('column-cards 영역에 카드가 렌더링된다', () => {
    const { container } = render(
      <Column status="TODO" tickets={mockTickets} onTicketClick={jest.fn()} />
    );

    const cardsContainer = container.querySelector('.column-cards');
    expect(cardsContainer).toBeInTheDocument();
    expect(cardsContainer?.children.length).toBe(2);
  });
});
