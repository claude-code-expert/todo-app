import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/client/components/board/FilterBar';

describe('FilterBar', () => {
  const defaultOnFilterChange = jest.fn();
  const defaultCounts = { thisWeek: 3, overdue: 1 };

  beforeEach(() => {
    defaultOnFilterChange.mockClear();
  });

  it('"이번주 업무" 버튼에 카운트가 표시된다', () => {
    render(
      <FilterBar activeFilter="all" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    expect(screen.getByRole('button', { name: /이번주 업무/ })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('"일정 초과" 버튼에 카운트가 표시된다', () => {
    render(
      <FilterBar activeFilter="all" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    expect(screen.getByRole('button', { name: /일정 초과/ })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('"이번주 업무" 클릭 시 thisWeek 필터가 전달된다', async () => {
    render(
      <FilterBar activeFilter="all" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    await userEvent.click(screen.getByRole('button', { name: /이번주 업무/ }));
    expect(defaultOnFilterChange).toHaveBeenCalledWith('thisWeek');
  });

  it('"일정 초과" 클릭 시 overdue 필터가 전달된다', async () => {
    render(
      <FilterBar activeFilter="all" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    await userEvent.click(screen.getByRole('button', { name: /일정 초과/ }));
    expect(defaultOnFilterChange).toHaveBeenCalledWith('overdue');
  });

  it('이미 활성화된 필터 클릭 시 all로 토글된다', async () => {
    render(
      <FilterBar activeFilter="thisWeek" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    await userEvent.click(screen.getByRole('button', { name: /이번주 업무/ }));
    expect(defaultOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('활성 필터 버튼에 active 클래스가 적용된다', () => {
    render(
      <FilterBar activeFilter="overdue" onFilterChange={defaultOnFilterChange} counts={defaultCounts} />
    );
    const overdueBtn = screen.getByRole('button', { name: /일정 초과/ });
    expect(overdueBtn.className).toContain('active');
  });
});
