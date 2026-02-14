import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TicketWithMeta } from '@/shared/types';
import { TicketCard } from '@/client/components/ticket/TicketCard';

// dnd-kit mock: TicketCard 내부에서 useSortable 사용
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
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

// ============================================
// 테스트 헬퍼: 기본 티켓 데이터 생성
// ============================================
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

// ============================================
// TC-COMP-001: TicketCard 컴포넌트
// ============================================
describe('TC-COMP-001: TicketCard', () => {
  const defaultOnClick = jest.fn();

  beforeEach(() => {
    defaultOnClick.mockClear();
  });

  // ------------------------------------------
  // C001-1: 기본 렌더링
  // 조건: 티켓 데이터 전달
  // 기대: 제목, 우선순위 뱃지, 종료예정일 표시
  // ------------------------------------------
  it('C001-1: 제목, 우선순위 뱃지, 종료예정일이 렌더링된다', () => {
    const ticket = createTicket({
      title: '프런트엔드 개발',
      priority: 'HIGH',
      dueDate: '2026-02-20',
    });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    // 제목
    expect(screen.getByText('프런트엔드 개발')).toBeInTheDocument();

    // 우선순위 뱃지
    expect(screen.getByText('High')).toBeInTheDocument();

    // 종료예정일
    expect(screen.getByText('2026-02-20')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C001-2: 오버듀 표시
  // 조건: isOverdue = true
  // 기대: data-overdue="true" 속성 적용 (CSS에서 빨간 테두리)
  // ------------------------------------------
  it('C001-2: isOverdue=true일 때 data-overdue 속성이 적용된다', () => {
    const ticket = createTicket({
      title: '기한 지난 티켓',
      dueDate: '2026-02-01',
      isOverdue: true,
    });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    const card = screen.getByRole('button', { name: '티켓: 기한 지난 티켓' });
    expect(card).toHaveAttribute('data-overdue', 'true');
  });

  // ------------------------------------------
  // C001-3: 완료 상태
  // 조건: status = DONE
  // 기대: 카드가 정상 렌더링됨 (완료 스타일은 CSS로 처리)
  // ------------------------------------------
  it('C001-3: status=DONE인 티켓이 정상 렌더링된다', () => {
    const ticket = createTicket({
      title: '완료된 업무',
      status: 'DONE',
      completedAt: new Date('2026-02-14T10:00:00'),
    });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    expect(screen.getByText('완료된 업무')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C001-4: 날짜 영역 숨김
  // 조건: dueDate = null
  // 기대: DueDateBadge가 렌더링되지 않음
  // ------------------------------------------
  it('C001-4: dueDate가 null이면 날짜 영역이 렌더링되지 않는다', () => {
    const ticket = createTicket({ dueDate: null });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    const card = screen.getByRole('button');
    expect(card.querySelector('.ticket-card__due-date')).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // C001-5: 클릭 이벤트
  // 조건: 카드 클릭
  // 기대: onClick 핸들러가 호출됨
  // ------------------------------------------
  it('C001-5: 카드를 클릭하면 onClick이 호출된다', async () => {
    const ticket = createTicket({ title: '클릭 테스트' });
    const handleClick = jest.fn();

    render(<TicketCard ticket={ticket} onClick={handleClick} />);

    const card = screen.getByRole('button', { name: '티켓: 클릭 테스트' });
    await userEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // C001-6: 긴 제목 말줄임
  // 조건: 제목이 길 때
  // 기대: 제목 요소에 truncate 클래스 적용
  // ------------------------------------------
  it('C001-6: 제목 요소에 말줄임(truncate) 클래스가 적용된다', () => {
    const longTitle = '이것은 매우 긴 제목입니다 '.repeat(10).trim();
    const ticket = createTicket({ title: longTitle });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    const titleEl = screen.getByText(longTitle);
    expect(titleEl).toHaveClass('ticket-card__title--truncate');
  });

  // ------------------------------------------
  // C001-7: 우선순위별 뱃지 색상
  // 조건: 각 우선순위 값
  // 기대: data-priority 속성으로 CSS 색상 제어
  // ------------------------------------------
  it.each([
    ['LOW', 'Low'],
    ['MEDIUM', 'Medium'],
    ['HIGH', 'High'],
  ] as const)('C001-7: priority=%s일 때 뱃지에 data-priority="%s"가 적용된다', (priority, label) => {
    const ticket = createTicket({ priority });

    render(<TicketCard ticket={ticket} onClick={defaultOnClick} />);

    const badge = screen.getByText(label);
    expect(badge).toHaveAttribute('data-priority', priority);
  });
});
