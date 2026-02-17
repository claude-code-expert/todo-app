import { render, screen } from '@testing-library/react';
import { ColumnHeader } from '@/client/components/board/ColumnHeader';

describe('ColumnHeader', () => {
  it('칼럼명이 표시된다', () => {
    render(<ColumnHeader title="TODO" count={3} />);
    expect(screen.getByText('할 일')).toBeInTheDocument();
  });

  it('티켓 수 뱃지가 표시된다', () => {
    render(<ColumnHeader title="TODO" count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it.each([
    ['BACKLOG', '백로그'],
    ['TODO', '할 일'],
    ['IN_PROGRESS', '진행 중'],
    ['DONE', '완료'],
  ])('title=%s이면 "%s"으로 표시된다', (title, expected) => {
    render(<ColumnHeader title={title} count={0} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('column-header 클래스가 적용된다', () => {
    const { container } = render(<ColumnHeader title="TODO" count={2} />);
    expect(container.querySelector('.column-header')).toBeInTheDocument();
  });
});
