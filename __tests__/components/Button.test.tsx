import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/client/components/ui/Button';

describe('Button', () => {
  // ------------------------------------------
  // variant별 CSS 클래스 적용
  // ------------------------------------------
  it.each([
    ['primary', 'btn-primary'],
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-danger'],
    ['ghost', 'btn-ghost'],
  ] as const)('variant=%s일 때 %s 클래스가 적용된다', (variant, expectedClass) => {
    render(<Button variant={variant}>버튼</Button>);

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toHaveClass('btn', expectedClass);
  });

  // ------------------------------------------
  // size별 CSS 클래스 적용
  // ------------------------------------------
  it.each([
    ['sm', 'btn-sm'],
    ['md', 'btn-md'],
    ['lg', 'btn-lg'],
  ] as const)('size=%s일 때 %s 클래스가 적용된다', (size, expectedClass) => {
    render(<Button size={size}>버튼</Button>);

    const button = screen.getByRole('button', { name: '버튼' });
    expect(button).toHaveClass(expectedClass);
  });

  // ------------------------------------------
  // 기본값: variant=primary, size=md
  // ------------------------------------------
  it('기본값으로 variant=primary, size=md가 적용된다', () => {
    render(<Button>기본 버튼</Button>);

    const button = screen.getByRole('button', { name: '기본 버튼' });
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-md');
  });

  // ------------------------------------------
  // onClick 핸들러 호출
  // ------------------------------------------
  it('클릭하면 onClick 핸들러가 호출된다', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    await userEvent.click(screen.getByRole('button', { name: '클릭' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // isLoading=true → 비활성화 + 로딩 표시
  // ------------------------------------------
  it('isLoading=true이면 버튼이 비활성화되고 로딩 텍스트가 표시된다', () => {
    render(<Button isLoading>저장</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('처리중...');
  });

  // ------------------------------------------
  // isLoading=true일 때 클릭 무시
  // ------------------------------------------
  it('isLoading=true이면 클릭해도 onClick이 호출되지 않는다', async () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>저장</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // children 렌더링
  // ------------------------------------------
  it('children이 정상적으로 렌더링된다', () => {
    render(<Button>새 업무</Button>);

    expect(screen.getByRole('button', { name: '새 업무' })).toBeInTheDocument();
  });
});
