import { render, screen } from '@testing-library/react';
import { TicketDetailView } from '@/client/components/ticket/TicketDetailView';
import type { TicketWithMeta } from '@/shared/types';

const ticket: TicketWithMeta = {
  id: 1,
  title: '테스트 티켓',
  description: '설명',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  position: 0,
  plannedStartDate: '2026-03-01',
  dueDate: '2026-03-15',
  startedAt: new Date('2026-02-10T00:00:00.000Z'),
  completedAt: null,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-17T00:00:00.000Z'),
  isOverdue: false,
};

describe('TicketDetailView', () => {
  // C005-2: 읽기 전용 필드 표시
  it('status, startedAt, completedAt, createdAt을 읽기 전용으로 표시한다', () => {
    render(<TicketDetailView ticket={ticket} />);

    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('2026-02-10')).toBeInTheDocument();
    expect(screen.getByText('종료일')).toBeInTheDocument();
    expect(screen.getByText('생성일')).toBeInTheDocument();
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();
  });

  it('값이 없으면 "-"을 표시한다', () => {
    const nullTicket: TicketWithMeta = {
      ...ticket,
      startedAt: null,
      completedAt: null,
    };
    render(<TicketDetailView ticket={nullTicket} />);

    // startedAt, completedAt 모두 null → "-" 2개
    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(2);
  });

  it('form-readonly 클래스가 적용된다', () => {
    const { container } = render(<TicketDetailView ticket={ticket} />);

    const readonlyElements = container.querySelectorAll('.form-readonly');
    expect(readonlyElements).toHaveLength(4);
  });
});
