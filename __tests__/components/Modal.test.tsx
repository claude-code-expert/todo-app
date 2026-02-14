import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/client/components/ui/Modal';

describe('Modal', () => {
  const defaultOnClose = jest.fn();

  beforeEach(() => {
    defaultOnClose.mockClear();
  });

  // ------------------------------------------
  // isOpen=false → 렌더링 안 됨
  // ------------------------------------------
  it('isOpen=false이면 아무것도 렌더링되지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={defaultOnClose}>
        <p>모달 내용</p>
      </Modal>
    );

    expect(screen.queryByText('모달 내용')).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // isOpen=true → 오버레이 + 컨텐츠 표시
  // ------------------------------------------
  it('isOpen=true이면 오버레이와 컨텐츠가 표시된다', () => {
    render(
      <Modal isOpen={true} onClose={defaultOnClose}>
        <p>모달 내용</p>
      </Modal>
    );

    expect(screen.getByText('모달 내용')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ------------------------------------------
  // ESC 키 → onClose 호출
  // ------------------------------------------
  it('ESC 키를 누르면 onClose가 호출된다', async () => {
    render(
      <Modal isOpen={true} onClose={defaultOnClose}>
        <p>모달 내용</p>
      </Modal>
    );

    await userEvent.keyboard('{Escape}');
    expect(defaultOnClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 오버레이 클릭 → onClose 호출
  // ------------------------------------------
  it('오버레이를 클릭하면 onClose가 호출된다', async () => {
    render(
      <Modal isOpen={true} onClose={defaultOnClose}>
        <p>모달 내용</p>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement!;
    await userEvent.click(overlay);
    expect(defaultOnClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 컨텐츠 영역 클릭 → onClose 호출 안 됨
  // ------------------------------------------
  it('컨텐츠 영역을 클릭하면 onClose가 호출되지 않는다', async () => {
    render(
      <Modal isOpen={true} onClose={defaultOnClose}>
        <p>모달 내용</p>
      </Modal>
    );

    await userEvent.click(screen.getByText('모달 내용'));
    expect(defaultOnClose).not.toHaveBeenCalled();
  });
});
