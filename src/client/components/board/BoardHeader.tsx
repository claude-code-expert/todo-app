'use client';

import { Button } from '@/client/components/ui/Button';

interface BoardHeaderProps {
  onCreateClick: () => void;
}

export function BoardHeader({ onCreateClick }: BoardHeaderProps) {
  return (
    <header className="board-header">
      <h1>Tika</h1>
      <div className="board-header-actions">
        <input
          className="form-input"
          type="text"
          placeholder="검색 (준비 중)"
          disabled
        />
        <Button onClick={onCreateClick}>새 업무</Button>
      </div>
    </header>
  );
}
