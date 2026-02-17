'use client';

import { Button } from '@/client/components/ui/Button';

interface BoardHeaderProps {
  onCreateClick: () => void;
}

export function BoardHeader({ onCreateClick }: BoardHeaderProps) {
  return (
    <div className="board-header">
      <h1 className="board-title">Tika</h1>
      <input
        type="text"
        placeholder="검색 (준비 중)"
        disabled
        className="search-input"
      />
      <Button variant="primary" onClick={onCreateClick}>
        새 업무
      </Button>
    </div>
  );
}
