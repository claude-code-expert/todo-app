import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardHeader } from '@/client/components/board/BoardHeader';

describe('BoardHeader', () => {
  const defaultOnCreateClick = jest.fn();

  beforeEach(() => {
    defaultOnCreateClick.mockClear();
  });

  it('타이틀 "Tika"가 표시된다', () => {
    render(<BoardHeader onCreateClick={defaultOnCreateClick} />);
    expect(screen.getByText('Tika')).toBeInTheDocument();
  });

  it('"새 업무" 버튼이 표시된다', () => {
    render(<BoardHeader onCreateClick={defaultOnCreateClick} />);
    expect(screen.getByRole('button', { name: '새 업무' })).toBeInTheDocument();
  });

  it('"새 업무" 버튼 클릭 시 onCreateClick이 호출된다', async () => {
    render(<BoardHeader onCreateClick={defaultOnCreateClick} />);
    await userEvent.click(screen.getByRole('button', { name: '새 업무' }));
    expect(defaultOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('검색 placeholder가 표시된다 (MVP - 비활성)', () => {
    render(<BoardHeader onCreateClick={defaultOnCreateClick} />);
    const searchInput = screen.getByPlaceholderText('검색 (준비 중)');
    expect(searchInput).toBeDisabled();
  });
});
