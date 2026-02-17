import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/client/components/ui/Modal';

describe('Modal', () => {
  it('isOpen=false이면 렌더링되지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.queryByText('모달 내용')).not.toBeInTheDocument();
  });

  it('isOpen=true이면 오버레이와 컨텐츠가 표시된다', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('ESC 키를 누르면 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>모달 내용</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이를 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>모달 내용</p>
      </Modal>
    );
    await user.click(document.querySelector('.modal-overlay')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('컨텐츠를 클릭해도 onClose가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>모달 내용</p>
      </Modal>
    );
    await user.click(screen.getByText('모달 내용'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
