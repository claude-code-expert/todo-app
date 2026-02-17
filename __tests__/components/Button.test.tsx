import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/client/components/ui/Button';

describe('Button', () => {
  // variant 테스트
  it.each([
    ['primary', 'btn-primary'],
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-danger'],
    ['ghost', 'btn-ghost'],
  ] as const)('variant=%s일 때 %s 클래스가 적용된다', (variant, expected) => {
    render(<Button variant={variant}>테스트</Button>);
    expect(screen.getByRole('button')).toHaveClass(expected);
  });

  // size 테스트
  it.each([
    ['sm', 'btn-sm'],
    ['md', 'btn-md'],
    ['lg', 'btn-lg'],
  ] as const)('size=%s일 때 %s 클래스가 적용된다', (size, expected) => {
    render(<Button size={size}>테스트</Button>);
    expect(screen.getByRole('button')).toHaveClass(expected);
  });

  it('기본값으로 variant=primary, size=md가 적용된다', () => {
    render(<Button>테스트</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveClass('btn-md');
  });

  it('클릭하면 onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true이면 버튼이 비활성화되고 로딩 텍스트가 표시된다', () => {
    render(<Button isLoading>저장</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('처리중...');
  });

  it('isLoading=true이면 클릭해도 onClick이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button isLoading onClick={onClick}>저장</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('children이 정상적으로 렌더링된다', () => {
    render(<Button>새 업무</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('새 업무');
  });
});
