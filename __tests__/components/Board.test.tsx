import { render, screen } from '@testing-library/react';
import { Board } from '@/client/components/board/Board';
import type { BoardData } from '@/shared/types';

// dnd-kit mock
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  MouseSensor: jest.fn(),
  TouchSensor: jest.fn(),
  closestCorners: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

const emptyBoard: BoardData = {
  board: {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  },
  total: 0,
};

describe('Board', () => {
  // C003-1: 4칼럼 렌더링
  it('4개 칼럼이 모두 렌더링된다', () => {
    render(<Board board={emptyBoard} onTicketClick={jest.fn()} />);

    expect(screen.getByText('백로그')).toBeInTheDocument();
    expect(screen.getByText('할 일')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  // C003-2: Backlog 사이드바
  it('Backlog가 board-sidebar에 배치된다', () => {
    const { container } = render(
      <Board board={emptyBoard} onTicketClick={jest.fn()} />
    );

    const sidebar = container.querySelector('.board-sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar?.textContent).toContain('백로그');
  });

  it('TODO, IN_PROGRESS, DONE이 columns-container에 배치된다', () => {
    const { container } = render(
      <Board board={emptyBoard} onTicketClick={jest.fn()} />
    );

    const main = container.querySelector('.columns-container');
    expect(main).toBeInTheDocument();
    expect(main?.textContent).toContain('할 일');
    expect(main?.textContent).toContain('진행 중');
    expect(main?.textContent).toContain('완료');
  });

  it('board-content 레이아웃 클래스가 적용된다', () => {
    const { container } = render(
      <Board board={emptyBoard} onTicketClick={jest.fn()} />
    );

    expect(container.querySelector('.board-content')).toBeInTheDocument();
  });
});
