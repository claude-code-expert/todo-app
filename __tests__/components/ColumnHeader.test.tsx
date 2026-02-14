import { render, screen } from '@testing-library/react';
import { ColumnHeader } from '@/client/components/board/ColumnHeader';

describe('ColumnHeader', () => {
  // ------------------------------------------
  // C002-3: 칼럼명 + 티켓 수 표시
  // ------------------------------------------
  it('C002-3: 칼럼명과 티켓 수가 표시된다', () => {
    render(<ColumnHeader title="TODO" count={5} />);

    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('티켓 수가 0일 때도 정상 표시된다', () => {
    render(<ColumnHeader title="Backlog" count={0} />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('column-header CSS 클래스가 적용된다', () => {
    const { container } = render(<ColumnHeader title="TODO" count={3} />);

    expect(container.querySelector('.column-header')).toBeInTheDocument();
  });

  it('column-count CSS 클래스가 개수 뱃지에 적용된다', () => {
    render(<ColumnHeader title="TODO" count={3} />);

    const countBadge = screen.getByText('3');
    expect(countBadge).toHaveClass('column-count');
  });
});
