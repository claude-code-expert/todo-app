import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Ticket } from '@/shared/types';
import { TicketForm } from '@/client/components/ticket/TicketForm';

describe('TC-COMP-004: TicketForm', () => {
  const defaultProps = {
    mode: 'create' as const,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    defaultProps.onSubmit.mockClear();
    defaultProps.onCancel.mockClear();
  });

  // ------------------------------------------
  // C004-1: 생성 모드 → 빈 필드, 우선순위 MEDIUM 기본값
  // ------------------------------------------
  it('C004-1: 생성 모드에서 빈 필드와 우선순위 MEDIUM 기본값이 표시된다', () => {
    render(<TicketForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('제목');
    expect(titleInput).toHaveValue('');

    const prioritySelect = screen.getByLabelText('우선순위');
    expect(prioritySelect).toHaveValue('MEDIUM');
  });

  // ------------------------------------------
  // C004-2: 수정 모드 → initialData 반영
  // ------------------------------------------
  it('C004-2: 수정 모드에서 initialData가 각 필드에 반영된다', () => {
    const initialData: Partial<Ticket> = {
      title: '기존 제목',
      description: '기존 설명',
      priority: 'HIGH',
      plannedStartDate: '2026-03-01',
      dueDate: '2026-03-15',
    };

    render(
      <TicketForm {...defaultProps} mode="edit" initialData={initialData} />
    );

    expect(screen.getByLabelText('제목')).toHaveValue('기존 제목');
    expect(screen.getByLabelText('설명')).toHaveValue('기존 설명');
    expect(screen.getByLabelText('우선순위')).toHaveValue('HIGH');
    expect(screen.getByLabelText('시작예정일')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('종료예정일')).toHaveValue('2026-03-15');
  });

  // ------------------------------------------
  // C004-3: 빈 제목 제출 → 에러 메시지
  // ------------------------------------------
  it('C004-3: 빈 제목으로 제출하면 에러 메시지가 표시된다', async () => {
    render(<TicketForm {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: /저장|생성/ }));

    expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // C004-4: 과거 종료예정일 → 에러 메시지
  // ------------------------------------------
  it('C004-4: 과거 종료예정일을 입력하면 에러 메시지가 표시된다', async () => {
    render(<TicketForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('제목'), '테스트 티켓');
    await userEvent.clear(screen.getByLabelText('종료예정일'));
    await userEvent.type(screen.getByLabelText('종료예정일'), '2020-01-01');
    await userEvent.click(screen.getByRole('button', { name: /저장|생성/ }));

    expect(screen.getByText('종료예정일은 오늘 이후 날짜를 선택해주세요')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // C004-5: plannedStartDate date input 렌더링
  // ------------------------------------------
  it('C004-5: 시작예정일 날짜 입력 필드가 렌더링된다', () => {
    render(<TicketForm {...defaultProps} />);

    const plannedStartInput = screen.getByLabelText('시작예정일');
    expect(plannedStartInput).toBeInTheDocument();
    expect(plannedStartInput).toHaveAttribute('type', 'date');
  });

  // ------------------------------------------
  // C004-6: 정상 제출 → onSubmit 호출 + 데이터 확인
  // ------------------------------------------
  it('C004-6: 정상적으로 제출하면 onSubmit이 올바른 데이터와 함께 호출된다', async () => {
    render(<TicketForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('제목'), '새 티켓');
    await userEvent.click(screen.getByRole('button', { name: /저장|생성/ }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: '새 티켓' })
    );
  });

  // ------------------------------------------
  // C004-7: isLoading=true → 버튼 비활성화 + 스피너
  // ------------------------------------------
  it('C004-7: isLoading=true이면 제출 버튼이 비활성화되고 로딩 표시된다', () => {
    render(<TicketForm {...defaultProps} isLoading={true} />);

    const submitBtn = screen.getByRole('button', { name: /처리중/ });
    expect(submitBtn).toBeDisabled();
  });
});
