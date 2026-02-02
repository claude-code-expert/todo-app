# Tika - 데이터 모델 명세 (DATA_MODEL.md)

> 버전: 1.0 (MVP)
> ORM: Drizzle ORM + Vercel Postgres

---

## 1. ERD (Entity Relationship Diagram)

### MVP: 단일 엔티티

```
┌───────────────────────────────────────────┐
│              tickets                      │
├───────────────────────────────────────────┤
│ id                SERIAL       PK         │
│ title             VARCHAR(200) NOT NULL   │
│ description       TEXT         NULLABLE   │
│ status            VARCHAR(20)  NOT NULL   │
│ priority          VARCHAR(10)  NOT NULL   │
│ position          INTEGER      NOT NULL   │
│ planned_start_date DATE        NULLABLE   │
│ due_date          DATE         NULLABLE   │
│ started_at        TIMESTAMP    NULLABLE   │
│ completed_at      TIMESTAMP    NULLABLE   │
│ created_at        TIMESTAMP    NOT NULL   │
│ updated_at        TIMESTAMP    NOT NULL   │
└───────────────────────────────────────────┘
```

> MVP는 단일 사용자이므로 User 테이블 없이 tickets 테이블만 사용한다.
> 2차에서 Google OAuth 도입 시 users 테이블을 추가하고 tickets에 user_id FK를 연결한다.

### 2차 확장 예상 ERD

```
┌──────────────┐       ┌─────────────────┐
│    users     │       │    tickets      │
├──────────────┤       ├─────────────────┤
│ id       PK  │──1:N─▶│ user_id    FK   │
│ email        │       │ id         PK   │
│ name         │       │ title           │
│ avatar_url   │       │ ...             │
│ created_at   │       └─────────────────┘
└──────────────┘
                        ┌─────────────────┐
                        │    columns      │
                        ├─────────────────┤
                        │ id         PK   │
                        │ name            │
                        │ position        │
                        │ board_id   FK   │
                        └─────────────────┘
```

---

## 2. 테이블 정의: tickets

### 칼럼 상세

| 칼럼 | 타입 | 제약조건 | 기본값 | 설명 |
|------|------|----------|--------|------|
| id | SERIAL | PK, auto-increment | - | 티켓 고유 식별자 |
| title | VARCHAR(200) | NOT NULL | - | 티켓 제목 |
| description | TEXT | NULLABLE | NULL | 티켓 상세 설명 |
| status | VARCHAR(20) | NOT NULL | 'BACKLOG' | 현재 상태 (칼럼) |
| priority | VARCHAR(10) | NOT NULL | 'MEDIUM' | 우선순위 |
| position | INTEGER | NOT NULL | 1 | 칼럼 내 표시 순서 |
| planned_start_date | DATE | NULLABLE | NULL | 시작예정일 (사용자 입력) |
| due_date | DATE | NULLABLE | NULL | 종료예정일 (사용자 입력) |
| started_at | TIMESTAMP | NULLABLE | NULL | 시작일 (TODO 이동 시 자동 설정) |
| completed_at | TIMESTAMP | NULLABLE | NULL | 종료일 (Done 이동 시 자동 설정) |
| created_at | TIMESTAMP | NOT NULL | now() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL | now() | 수정 시각 |

### 날짜 필드 구분

| 구분 | 필드명 | 한국어명 | 타입 | 입력 주체 | 설명 |
|------|--------|---------|------|----------|------|
| 사용자 입력 | planned_start_date | 시작예정일 | DATE | 사용자 | 티켓 생성/수정 시 사용자가 입력 |
| 사용자 입력 | due_date | 종료예정일 | DATE | 사용자 | 티켓 생성/수정 시 사용자가 입력 |
| 시스템 자동 | started_at | 시작일 | TIMESTAMP | 시스템 | TODO로 이동 시 자동 설정 (`PATCH /api/tickets/reorder`) |
| 시스템 자동 | completed_at | 종료일 | TIMESTAMP | 시스템 | Done으로 이동 시 자동 설정 (`PATCH /api/tickets/:id/complete`) |

### 칼럼 제약사항

**status 허용값**: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`
**priority 허용값**: `LOW`, `MEDIUM`, `HIGH`

> status, priority는 PostgreSQL ENUM 타입을 사용하지 않는다.
> DB 레벨 ENUM은 값을 추가하거나 변경할 때 마이그레이션이 복잡해지므로,
> VARCHAR + 애플리케이션 레벨 검증(Zod)으로 제약한다.

### 인덱스

| 인덱스 | 칼럼 | 용도 |
|--------|------|------|
| idx_tickets_status_position | (status, position) | 칼럼별 정렬 조회 (보드 렌더링) |
| idx_tickets_due_date | (due_date) | 종료예정일 기준 조회 (오버듀 필터) |
| idx_tickets_completed_at | (completed_at) | Done 칼럼 24시간 필터 |

---

## 3. Drizzle 스키마 정의

```typescript
// src/server/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const tickets = pgTable(
  'tickets',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('BACKLOG'),
    priority: varchar('priority', { length: 10 }).notNull().default('MEDIUM'),
    position: integer('position').notNull().default(1),
    plannedStartDate: date('planned_start_date', { mode: 'string' }),
    dueDate: date('due_date', { mode: 'string' }),
    startedAt: timestamp('started_at', { mode: 'date' }),
    completedAt: timestamp('completed_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_tickets_status_position').on(table.status, table.position),
    index('idx_tickets_due_date').on(table.dueDate),
    index('idx_tickets_completed_at').on(table.completedAt),
  ]
);
```

---

## 4. TypeScript 타입 정의

```typescript
// src/shared/types/index.ts

// --- 상태 및 우선순위 ---
export const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

// --- 칼럼 순서 정의 ---
export const COLUMN_ORDER: TicketStatus[] = [
  TICKET_STATUS.BACKLOG,
  TICKET_STATUS.TODO,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.DONE,
];

export const COLUMN_LABELS: Record<TicketStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'TODO',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

// --- 티켓 타입 ---
export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;  // ISO 8601 date (YYYY-MM-DD), 시작예정일
  dueDate: string | null;           // ISO 8601 date (YYYY-MM-DD), 종료예정일
  startedAt: Date | null;           // 시작일 (TODO 이동 시 시스템 설정)
  completedAt: Date | null;         // 종료일 (Done 이동 시 시스템 설정)
  createdAt: Date;
  updatedAt: Date;
}

// 파생 필드 포함 (보드 조회 응답용)
export interface TicketWithMeta extends Ticket {
  isOverdue: boolean;               // dueDate < today && status !== DONE
}

// --- API 요청 타입 ---

// POST /api/tickets
export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  plannedStartDate?: string;        // YYYY-MM-DD
  dueDate?: string;                 // YYYY-MM-DD
}

// PATCH /api/tickets/:id
export interface UpdateTicketInput {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

// PATCH /api/tickets/reorder
// DONE은 허용하지 않음 — Done 이동은 PATCH /api/tickets/:id/complete 사용
export type ReorderableStatus = Exclude<TicketStatus, typeof TICKET_STATUS.DONE>;

export interface ReorderTicketInput {
  ticketId: number;
  status: ReorderableStatus;        // BACKLOG | TODO | IN_PROGRESS (DONE 제외)
  position: number;
}

// --- 보드 데이터 구조 ---
export type BoardData = Record<TicketStatus, TicketWithMeta[]>;
```

---

## 5. 비즈니스 규칙

### 5.1 시작 처리 자동화

> API: `PATCH /api/tickets/reorder` (FR-007)

| 이벤트 | 동작 |
|--------|------|
| status가 TODO로 변경 | startedAt = 현재 시각 |
| status가 TODO에서 BACKLOG로 변경 | startedAt = null |
| TODO가 아닌 상태 간 이동 | startedAt 변경 없음 |

> startedAt은 시스템이 자동 관리하는 필드로, 사용자가 직접 수정할 수 없다.

### 5.2 완료 처리 자동화

> API: `PATCH /api/tickets/:id/complete` (FR-005), `PATCH /api/tickets/reorder` (FR-007)

| 이벤트 | 동작 | API |
|--------|------|-----|
| status가 DONE으로 변경 | completedAt = 현재 시각 | `/api/tickets/:id/complete` |
| status가 DONE에서 다른 값으로 변경 | completedAt = null | `/api/tickets/reorder` |
| DONE이 아닌 상태 간 이동 | completedAt 변경 없음 | `/api/tickets/reorder` |

> completedAt은 시스템이 자동 관리하는 필드로, 사용자가 직접 수정할 수 없다.

### 5.3 오버듀 판정

> 관련 FR: FR-008 (파생 필드, DB에 저장하지 않음)

```typescript
function isOverdue(ticket: Ticket): boolean {
  if (!ticket.dueDate) return false;
  if (ticket.status === 'DONE') return false;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return ticket.dueDate < today;
}
```

> 종료예정일(dueDate)이 지났으나 Done이 아닌 티켓은 오버듀로 판정한다.
> 이 값은 DB에 저장하지 않고, `GET /api/tickets` 조회 시 계산하여 `isOverdue` 필드로 응답에 포함한다.

### 5.4 Done 칼럼 24시간 필터

- Done 칼럼에는 completedAt 기준으로 24시간 이내인 티켓만 표시한다.
- 24시간이 지난 Done 티켓은 보드에서 숨김 처리한다.
- 이 필터는 `GET /api/tickets` (보드 조회) 시 서버에서 적용한다.

```typescript
function isDoneVisible(ticket: Ticket): boolean {
  if (ticket.status !== 'DONE') return false;
  if (!ticket.completedAt) return false;
  const now = new Date();
  const diff = now.getTime() - ticket.completedAt.getTime();
  return diff <= 24 * 60 * 60 * 1000; // 24시간
}
```

### 5.5 Position 관리

- 각 칼럼(status) 내에서 position으로 순서 결정 (오름차순)
- 새 티켓 생성 시: 해당 칼럼의 `min(position) - 1024` (맨 위 배치)
- 드래그앤드롭 시: 인접 카드의 position 중간값 계산 `(prev + next) / 2`
- position 간격이 1 이하로 좁아지면 해당 칼럼 전체 재정렬 (1024 간격)
- 맨 앞 삽입: 첫 번째 카드의 `position - 1024`
- 맨 뒤 삽입: 마지막 카드의 `position + 1024`

---

## 6. 시드 데이터

개발 및 데모용 초기 데이터:

```typescript
const seedTickets = [
  {
    title: '프로젝트 요구사항 정리',
    status: 'DONE',
    priority: 'HIGH',
    position: 0,
    plannedStartDate: '2026-01-20',
    dueDate: '2026-01-25',
    startedAt: new Date('2026-01-20T09:00:00+09:00'),
    completedAt: new Date('2026-01-24T17:00:00+09:00'),
  },
  {
    title: 'UI 와이어프레임 작성',
    status: 'DONE',
    priority: 'MEDIUM',
    position: 1024,
    dueDate: '2026-01-28',
    startedAt: new Date('2026-01-25T10:00:00+09:00'),
    completedAt: new Date('2026-01-27T15:00:00+09:00'),
  },
  {
    title: 'API 설계 문서 작성',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    position: 0,
    dueDate: '2026-02-05',
    startedAt: new Date('2026-01-28T09:00:00+09:00'),
  },
  {
    title: 'DB 스키마 설계',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    position: 1024,
    plannedStartDate: '2026-01-30',
    dueDate: '2026-02-07',
    startedAt: new Date('2026-01-30T10:00:00+09:00'),
  },
  {
    title: '로그인 페이지 구현',
    status: 'TODO',
    priority: 'HIGH',
    position: 0,
    plannedStartDate: '2026-02-03',
    dueDate: '2026-02-10',
    startedAt: new Date('2026-02-01T09:00:00+09:00'),
  },
  {
    title: '대시보드 레이아웃',
    status: 'TODO',
    priority: 'MEDIUM',
    position: 1024,
    dueDate: '2026-02-14',
    startedAt: new Date('2026-02-01T14:00:00+09:00'),
  },
  {
    title: '알림 기능 조사',
    status: 'BACKLOG',
    priority: 'LOW',
    position: 0,
  },
  {
    title: '성능 테스트 계획',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    position: 1024,
    plannedStartDate: '2026-02-17',
  },
  {
    title: 'CI/CD 파이프라인 구축',
    status: 'BACKLOG',
    priority: 'LOW',
    position: 2048,
  },
];
```
