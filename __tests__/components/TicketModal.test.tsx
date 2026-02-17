import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketModal } from '@/client/components/ticket/TicketModal';
import type { TicketWithMeta } from '@/shared/types';

const mockOnClose = jest.fn();
const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const ticket: TicketWithMeta = {
  id: 42,
  title: '테스트 티켓',
  description: '설명 텍스트',
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

describe('TicketModal', () => {
  // C005-1: isOpen에 따라 표시/숨김
  it('isOpen=false이면 렌더링되지 않는다', () => {
    render(
      <TicketModal
        ticket={ticket}
        isOpen={false}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true이면 모달이 티켓 제목과 함께 표시된다', () => {
    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '테스트 티켓' })).toBeInTheDocument();
  });

  // C005-2: 읽기 전용 필드 표시
  it('읽기 전용 필드(상태, 시작일, 종료일, 생성일)가 표시된다', () => {
    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('생성일')).toBeInTheDocument();
  });

  // C005-3: 편집 가능 필드
  it('편집 가능한 필드(제목, 설명, 우선순위, 시작예정일, 종료예정일)가 표시된다', () => {
    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('우선순위')).toBeInTheDocument();
    expect(screen.getByLabelText('시작예정일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료예정일')).toBeInTheDocument();
  });

  // C005-4: ESC → onClose
  it('ESC 키를 누르면 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalled();
  });

  // C005-5: 바깥 클릭 → onClose
  it('오버레이를 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole('dialog'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // C005-6: 삭제 → ConfirmDialog → 확인 → onDelete
  it('삭제 버튼 클릭 후 확인하면 onDelete가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketModal
        ticket={ticket}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // 1단계: 삭제 버튼 클릭
    await user.click(screen.getByRole('button', { name: '삭제' }));

    // 2단계: ConfirmDialog 표시 확인
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    // 3단계: 확인 버튼 클릭
    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(mockOnDelete).toHaveBeenCalledWith(42);
  });
});
