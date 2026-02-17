import { render, screen, fireEvent } from '@testing-library/react';
import { BoardHeader } from '@/client/components/board/BoardHeader';

describe('BoardHeader', () => {
  const defaultProps = {
    onCreateClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 5-1-1: "Tika" 타이틀 렌더링
  it('"Tika" 타이틀이 표시된다', () => {
    render(<BoardHeader {...defaultProps} />);

    expect(screen.getByText('Tika')).toBeInTheDocument();
  });

  // 5-1-2: "새 업무" 버튼 렌더링
  it('"새 업무" 버튼이 표시된다', () => {
    render(<BoardHeader {...defaultProps} />);

    expect(screen.getByText('새 업무')).toBeInTheDocument();
  });

  // 5-1-3: "새 업무" 클릭 → onCreateClick 호출
  it('"새 업무" 클릭 시 onCreateClick이 호출된다', () => {
    render(<BoardHeader {...defaultProps} />);

    fireEvent.click(screen.getByText('새 업무'));

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  // 5-1-4: 검색 placeholder + disabled
  it('검색 input이 비활성 placeholder로 표시된다', () => {
    render(<BoardHeader {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('검색 (준비 중)');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeDisabled();
  });
});
