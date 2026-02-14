import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TicketWithMeta } from '@/shared/types';
import { TicketModal } from '@/client/components/ticket/TicketModal';

function createTicket(overrides: Partial<TicketWithMeta> = {}): TicketWithMeta {
  return {
    id: 1,
    title: '테스트 티켓',
    description: '테스트 설명',
    status: 'TODO',
    priority: 'MEDIUM',
    position: 1024,
    plannedStartDate: '2026-03-01',
    dueDate: '2026-03-15',
    startedAt: new Date('2026-02-10T09:00:00'),
    completedAt: null,
    createdAt: new Date('2026-02-01T09:00:00'),
    updatedAt: new Date('2026-02-14T09:00:00'),
    isOverdue: false,
    ...overrides,
  };
}

describe('TC-COMP-005: TicketModal', () => {
  const defaultProps = {
    ticket: createTicket(),
    isOpen: true,
    onClose: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onClose.mockClear();
    defaultProps.onUpdate.mockClear();
    defaultProps.onDelete.mockClear();
  });

  // ------------------------------------------
  // C005-1: isOpen에 따라 표시/숨김
  // ------------------------------------------
  it('C005-1: isOpen=false이면 모달이 렌더링되지 않는다', () => {
    render(<TicketModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('C005-1: isOpen=true이면 모달이 렌더링된다', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C005-2: 읽기 전용 필드 표시
  // ------------------------------------------
  it('C005-2: status, 시작일, 생성일이 읽기 전용으로 표시된다', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('생성일')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C005-3: 편집 가능 필드
  // ------------------------------------------
  it('C005-3: 제목, 설명, 우선순위, 시작예정일, 종료예정일 편집 필드가 있다', () => {
    render(<TicketModal {...defaultProps} />);

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('우선순위')).toBeInTheDocument();
    expect(screen.getByLabelText('시작예정일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료예정일')).toBeInTheDocument();
  });

  // ------------------------------------------
  // C005-4: ESC → onClose
  // ------------------------------------------
  it('C005-4: ESC 키를 누르면 onClose가 호출된다', async () => {
    render(<TicketModal {...defaultProps} />);

    await userEvent.keyboard('{Escape}');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // C005-5: 바깥 클릭 → onClose
  // ------------------------------------------
  it('C005-5: 오버레이를 클릭하면 onClose가 호출된다', async () => {
    render(<TicketModal {...defaultProps} />);

    const overlay = screen.getByRole('dialog').parentElement!;
    await userEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // C005-6: 삭제 → ConfirmDialog → 확인 → onDelete
  // ------------------------------------------
  it('C005-6: 삭제 버튼 → 확인 다이얼로그 → 확인 클릭 → onDelete 호출', async () => {
    render(<TicketModal {...defaultProps} />);

    // 삭제 버튼 클릭
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));

    // ConfirmDialog 표시 확인
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    // 확인 버튼 클릭
    await userEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });
});
