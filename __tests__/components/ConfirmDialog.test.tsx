import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';

describe('TC-COMP-006: ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    message: '정말 삭제하시겠습니까?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onConfirm.mockClear();
    defaultProps.onCancel.mockClear();
  });

  // ------------------------------------------
  // C006-1: 확인 클릭 → onConfirm 호출
  // ------------------------------------------
  it('C006-1: 확인 버튼을 클릭하면 onConfirm이 호출된다', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // C006-2: 취소 클릭 → onCancel 호출
  // ------------------------------------------
  it('C006-2: 취소 버튼을 클릭하면 onCancel이 호출된다', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 메시지 표시
  // ------------------------------------------
  it('message가 화면에 표시된다', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  // ------------------------------------------
  // isOpen=false → 렌더링 안 됨
  // ------------------------------------------
  it('isOpen=false이면 아무것도 렌더링되지 않는다', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('정말 삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 확인 버튼은 danger 스타일
  // ------------------------------------------
  it('확인 버튼에 btn-danger 클래스가 적용된다', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmBtn = screen.getByRole('button', { name: '확인' });
    expect(confirmBtn).toHaveClass('btn-danger');
  });
});
