import { render, screen } from '@testing-library/react';
import type { TicketWithMeta } from '@/shared/types';
import { TicketDetailView } from '@/client/components/ticket/TicketDetailView';

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
    createdAt: new Date('2026-02-14T09:00:00'),
    updatedAt: new Date('2026-02-14T09:00:00'),
    isOverdue: false,
    ...overrides,
  };
}

describe('TicketDetailView', () => {
  // ------------------------------------------
  // C005-2: 읽기 전용 필드 표시
  // status, startedAt, completedAt, createdAt
  // ------------------------------------------
  it('C005-2: status, startedAt, completedAt, createdAt이 읽기 전용으로 표시된다', () => {
    const ticket = createTicket({
      status: 'IN_PROGRESS',
      startedAt: new Date('2026-02-10T09:00:00'),
      completedAt: new Date('2026-02-14T10:00:00'),
      createdAt: new Date('2026-02-01T09:00:00'),
    });

    render(<TicketDetailView ticket={ticket} />);

    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('종료일')).toBeInTheDocument();
    expect(screen.getByText('생성일')).toBeInTheDocument();
  });

  // ------------------------------------------
  // 값 없으면 "-" 표시
  // ------------------------------------------
  it('startedAt, completedAt이 null이면 "-"가 표시된다', () => {
    const ticket = createTicket({
      startedAt: null,
      completedAt: null,
    });

    render(<TicketDetailView ticket={ticket} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  // ------------------------------------------
  // form-readonly CSS 클래스 적용
  // ------------------------------------------
  it('읽기 전용 값에 form-readonly 클래스가 적용된다', () => {
    const ticket = createTicket({ status: 'TODO' });
    const { container } = render(<TicketDetailView ticket={ticket} />);

    const readonlyElements = container.querySelectorAll('.form-readonly');
    expect(readonlyElements.length).toBeGreaterThanOrEqual(4);
  });
});
