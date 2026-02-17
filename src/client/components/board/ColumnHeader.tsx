'use client';

const COLUMN_LABELS: Record<string, string> = {
  BACKLOG: '백로그',
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  DONE: '완료',
};

interface ColumnHeaderProps {
  title: string;
  count: number;
}

export function ColumnHeader({ title, count }: ColumnHeaderProps) {
  return (
    <div className="column-header">
      <span>{COLUMN_LABELS[title] ?? title}</span>
      <span className="column-count">{count}</span>
    </div>
  );
}
