'use client';

type FilterType = 'all' | 'thisWeek' | 'overdue';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: { thisWeek: number; overdue: number };
}

export function FilterBar({ activeFilter, onFilterChange, counts }: FilterBarProps) {
  const handleClick = (filter: FilterType) => {
    onFilterChange(activeFilter === filter ? 'all' : filter);
  };

  return (
    <div className="filter-bar">
      <button
        className="filter-btn"
        data-active={activeFilter === 'thisWeek' ? 'true' : undefined}
        onClick={() => handleClick('thisWeek')}
      >
        이번주 업무
        <span className="filter-count">{counts.thisWeek}</span>
      </button>
      <button
        className="filter-btn"
        data-active={activeFilter === 'overdue' ? 'true' : undefined}
        onClick={() => handleClick('overdue')}
      >
        일정 초과
        <span className="filter-count">{counts.overdue}</span>
      </button>
    </div>
  );
}
