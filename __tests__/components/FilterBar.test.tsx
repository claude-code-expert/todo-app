import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/client/components/board/FilterBar';

describe('FilterBar', () => {
  const defaultProps = {
    activeFilter: 'all' as const,
    onFilterChange: jest.fn(),
    counts: { thisWeek: 3, overdue: 2 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 5-2-1: "이번주 업무" 버튼 + 카운트 표시
  it('"이번주 업무" 버튼과 카운트(3)가 표시된다', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('이번주 업무')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // 5-2-2: "일정 초과" 버튼 + 카운트 표시
  it('"일정 초과" 버튼과 카운트(2)가 표시된다', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('일정 초과')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // 5-2-3: "이번주 업무" 클릭 → onFilterChange('thisWeek')
  it('"이번주 업무" 클릭 시 onFilterChange("thisWeek")이 호출된다', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByText('이번주 업무'));

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('thisWeek');
  });

  // 5-2-4: "일정 초과" 클릭 → onFilterChange('overdue')
  it('"일정 초과" 클릭 시 onFilterChange("overdue")이 호출된다', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByText('일정 초과'));

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('overdue');
  });

  // 5-2-5: 이미 활성 필터 클릭 → 'all' 토글
  it('이미 활성화된 필터를 클릭하면 onFilterChange("all")이 호출된다', () => {
    render(<FilterBar {...defaultProps} activeFilter="thisWeek" />);

    fireEvent.click(screen.getByText('이번주 업무'));

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('all');
  });

  // 5-2-6: 활성 필터 버튼에 data-active="true"
  it('활성 필터 버튼에 data-active="true" 속성이 적용된다', () => {
    render(<FilterBar {...defaultProps} activeFilter="overdue" />);

    const overdueBtn = screen.getByText('일정 초과').closest('button');
    const thisWeekBtn = screen.getByText('이번주 업무').closest('button');

    expect(overdueBtn).toHaveAttribute('data-active', 'true');
    expect(thisWeekBtn).not.toHaveAttribute('data-active');
  });
});
