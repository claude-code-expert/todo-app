import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('isOpen=false이면 렌더링되지 않는다', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        message="삭제하시겠습니까?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.queryByText('삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  it('메시지가 표시된다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="정말 삭제하시겠습니까?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 버튼을 클릭하면 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="삭제하시겠습니까?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼을 클릭하면 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="삭제하시겠습니까?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('확인 버튼에 btn-danger 클래스가 적용된다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="삭제하시겠습니까?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: '확인' })).toHaveClass('btn-danger');
  });
});
