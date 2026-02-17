import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketCard } from '@/client/components/ticket/TicketCard';
import type { TicketWithMeta } from '@/shared/types';

// dnd-kit mock
jest.mock('@dnd-kit/sortable', () => ({
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

const baseTicket: TicketWithMeta = {
  id: 1,
  title: 'API 설계 문서 작성',
  description: 'REST API 엔드포인트를 정의한다',
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: '2026-03-01',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-02-17'),
  updatedAt: new Date('2026-02-17'),
  isOverdue: false,
};

describe('TicketCard', () => {
  // C001-1: 기본 렌더링
  it('제목, 우선순위 뱃지, 종료예정일이 표시된다', () => {
    render(<TicketCard ticket={baseTicket} />);

    expect(screen.getByText('API 설계 문서 작성')).toBeInTheDocument();
    expect(screen.getByText('보통')).toBeInTheDocument();
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();
  });

  // C001-2: 오버듀 표시
  it('isOverdue=true이면 data-overdue 속성이 설정된다', () => {
    const overdueTicket = { ...baseTicket, isOverdue: true };
    const { container } = render(<TicketCard ticket={overdueTicket} />);

    const card = container.querySelector('.ticket-card');
    expect(card).toHaveAttribute('data-overdue', 'true');
  });

  // C001-3: 완료 상태
  it('status=DONE이면 ticket-card--done 클래스가 적용된다', () => {
    const doneTicket = { ...baseTicket, status: 'DONE' as const };
    const { container } = render(<TicketCard ticket={doneTicket} />);

    const card = container.querySelector('.ticket-card');
    expect(card).toHaveClass('ticket-card--done');
  });

  // C001-4: 종료예정일 없는 티켓
  it('dueDate=null이면 종료예정일이 표시되지 않는다', () => {
    const noDueDateTicket = { ...baseTicket, dueDate: null };
    render(<TicketCard ticket={noDueDateTicket} />);

    expect(screen.queryByText('2026-03-01')).not.toBeInTheDocument();
  });

  // C001-5: 클릭 이벤트
  it('카드를 클릭하면 onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<TicketCard ticket={baseTicket} onClick={onClick} />);

    await user.click(screen.getByText('API 설계 문서 작성'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // C001-6: 긴 제목 말줄임
  it('제목에 ticket-card-title 클래스가 적용된다', () => {
    const longTitle = 'a'.repeat(200);
    const longTicket = { ...baseTicket, title: longTitle };
    render(<TicketCard ticket={longTicket} />);

    const titleEl = screen.getByText(longTitle);
    expect(titleEl).toHaveClass('ticket-card-title');
  });

  // C001-7: 우선순위별 뱃지 data-priority 속성
  it.each([
    ['LOW', '낮음'],
    ['MEDIUM', '보통'],
    ['HIGH', '높음'],
  ] as const)('priority=%s이면 data-priority="%s" 뱃지가 표시된다', (priority, label) => {
    const ticket = { ...baseTicket, priority };
    render(<TicketCard ticket={ticket} />);

    const badge = screen.getByText(label);
    expect(badge).toHaveAttribute('data-priority', priority);
  });
});
