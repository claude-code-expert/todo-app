# Tika - 컴포넌트 명세 (COMPONENT_SPEC.md)

> React 컴포넌트 계층, Props, 동작, 이벤트 흐름, Hook 정의
> 관련 문서: PRD.md, REQUIREMENTS.md, API_SPEC.md, DATA_MODEL.md, [FRONTEND_TASKS.md](./FRONTEND_TASKS.md) (구현 순서)

---

## 1. 컴포넌트 계층 구조

```
App (page.tsx — 서버 컴포넌트, async)
│   ticketService.getBoard() → initialData
│
└── BoardContainer (클라이언트 컴포넌트, useTickets Hook)
    │
    ├── BoardHeader
    │   ├── <input> 검색 (disabled, MVP placeholder)
    │   └── Button "새 업무" → setIsCreating(true)
    │
    ├── FilterBar (이번주 업무 | 일정 초과, 토글 방식)
    │
    ├── Board (board-content)
    │   ├── board-sidebar
    │   │   └── Column (BACKLOG)
    │   │       ├── ColumnHeader (칼럼명 + 카드 수)
    │   │       └── SortableContext + useDroppable
    │   │           ├── TicketCard (useSortable)
    │   │           │   ├── PriorityBadge
    │   │           │   └── DueDateBadge
    │   │           └── ...
    │   └── board-main > columns-container
    │       ├── Column (TODO)
    │       ├── Column (IN_PROGRESS)
    │       └── Column (DONE)
    │
    ├── Modal (생성 모달, isCreating)
    │   └── TicketForm (mode="create")
    │       └── Button "생성" / "취소"
    │
    └── TicketModal (상세/수정 모달, selectedTicket)
        ├── Modal
        │   ├── modal-header: <h2> 제목 + Button "삭제" (danger)
        │   ├── TicketDetailView (읽기 전용: 상태, 시작일, 종료일, 생성일)
        │   └── TicketForm (mode="edit")
        │       └── Button "저장" / "취소"
        └── ConfirmDialog (삭제 확인)
            ├── Modal
            ├── Button "확인" (danger)
            └── Button "취소" (secondary)
```

### 레이아웃 구성 (PRD 기준)

```
┌──────────────────────────────────────────────────┐
│ BoardHeader: [검색창(2차)]            [새 업무 버튼] │
├──────────┬───────────────────────────────────────┤
│          │ FilterBar: [이번주 업무] [일정 초과]     │
│ Backlog  ├───────────┬───────────┬───────────────┤
│ (사이드바) │   TODO    │In Progress│     Done      │
│          │           │           │               │
│          │           │           │               │
└──────────┴───────────┴───────────┴───────────────┘
```

- **Backlog**: 좌측 사이드바 (별도 스크롤)
- **TODO / In Progress / Done**: 우측 메인 영역 3칼럼 그리드
- **FilterBar**: 우측 메인 영역 상단에 배치

---

## 2. 핵심 컴포넌트 상세

### 2.1 BoardContainer

**역할**: 보드 전체의 상태 관리, DnD 컨텍스트 제공, API 통신 총괄

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| initialData | BoardData | 서버에서 초기 로드한 보드 데이터 |

**내부 상태**:
| 상태 | 타입 | 설명 |
|------|------|------|
| board | BoardData | 현재 보드 상태 (4개 칼럼의 티켓 배열) |
| activeTicket | TicketWithMeta \| null | 드래그 중인 티켓 |
| selectedTicket | TicketWithMeta \| null | 모달에 표시할 선택된 티켓 |
| isCreating | boolean | 생성 모달 열림 여부 |
| activeFilter | 'all' \| 'thisWeek' \| 'overdue' | 현재 필터 상태 |

**핵심 동작**:
1. useTickets Hook으로 티켓 CRUD 및 DnD 상태 관리
2. DndContext의 onDragStart, onDragOver, onDragEnd 핸들링
3. 드래그 완료 시 대상 칼럼에 따라 API 분기:
   - Done 칼럼 → `useTickets.complete()` → `PATCH /api/tickets/:id/complete`
   - 그 외 칼럼 → `useTickets.reorder()` → `PATCH /api/tickets/reorder`
4. 낙관적 업데이트: UI 즉시 반영 → API 호출 → 실패 시 롤백

---

### 2.2 BoardHeader

**역할**: 상단 영역 — 검색과 새 업무 생성 버튼

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| onCreateClick | () => void | "새 업무" 버튼 클릭 핸들러 |

**구성 요소**:
- **SearchInput**: 2차 구현 예정. MVP에서는 비활성 placeholder로 렌더링
- **CreateTicketButton**: "새 업무" 버튼. 클릭 시 TicketForm 생성 모달 열림

---

### 2.3 FilterBar

**역할**: 우측 메인 영역 상단의 필터 버튼 — 이번주 업무, 일정 초과 필터

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| activeFilter | 'all' \| 'thisWeek' \| 'overdue' | 현재 활성 필터 |
| onFilterChange | (filter: 'all' \| 'thisWeek' \| 'overdue') => void | 필터 변경 핸들러 |
| counts | { thisWeek: number; overdue: number } | 각 필터 해당 티켓 수 |

**동작**:
1. "이번주 업무" 버튼: TODO, IN_PROGRESS 칼럼에서 이번 주 종료예정일(dueDate) 기준 필터링
2. "일정 초과" 버튼: isOverdue === true인 티켓만 필터링
3. 이미 활성화된 필터를 다시 클릭하면 필터 해제 (전체 보기)
4. 필터는 클라이언트 사이드에서 board 데이터를 필터링 (별도 API 호출 없음)
5. Backlog 칼럼에는 필터가 적용되지 않음 (항상 전체 표시)

**필터 로직**:
```typescript
// 이번주 업무: 이번 주 월~일 범위 내 dueDate를 가진 TODO/IN_PROGRESS 티켓
function isThisWeek(ticket: TicketWithMeta): boolean {
  if (!ticket.dueDate) return false;
  if (ticket.status === 'BACKLOG' || ticket.status === 'DONE') return false;
  const today = new Date();
  const monday = getMonday(today);
  const sunday = getSunday(today);
  return ticket.dueDate >= toDateString(monday)
      && ticket.dueDate <= toDateString(sunday);
}
```

---

### 2.4 Board

**역할**: DnD 영역을 정의하고 Backlog 사이드바 + 3칼럼 메인 보드 배치

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| board | BoardData | 칼럼별 티켓 데이터 (필터 적용 후) |
| onTicketClick | (ticket: TicketWithMeta) => void | 카드 클릭 핸들러 |

**레이아웃**:
- 데스크톱 (1024px~): Backlog 사이드바 + 3칼럼 가로 배치
- 태블릿 (768px~): Backlog 접기 가능 + 2칼럼 그리드
- 모바일 (360px~): 단일 칼럼 세로 스크롤, 탭으로 칼럼 전환

**DnD 설정**:
- DndContext: 전체 보드를 감싸는 드래그앤드롭 컨텍스트
- DragOverlay: 드래그 중 카드의 복제본 표시
- 칼럼 간 이동 + 칼럼 내 순서 변경 모두 지원

---

### 2.5 Column

**역할**: 단일 칼럼(상태)에 속하는 카드 목록 표시, 드롭 영역

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| status | TicketStatus | 칼럼 상태 값 |
| tickets | TicketWithMeta[] | 이 칼럼의 티켓 목록 (position 오름차순) |
| onTicketClick | (ticket: TicketWithMeta) => void | 카드 클릭 핸들러 |

**동작**:
1. SortableContext로 칼럼 내 정렬 지원
2. useDroppable로 드롭 대상 영역 설정
3. 비어있을 때 "이 칼럼에 티켓이 없습니다" 안내 표시
4. 칼럼 헤더에 칼럼명 + 티켓 수 뱃지 표시

**칼럼별 특수 동작**:
- **BACKLOG**: 사이드바 스타일, 필터 적용 대상 아님
- **DONE**: completedAt 기준 24시간 이내 티켓만 표시 (서버에서 필터링)

**스타일**:
- 배경: 연한 회색 (구분감)
- 최소 높이: 화면 높이에 맞춤
- 카드 간격: 8px

---

### 2.6 TicketCard

**역할**: 개별 티켓을 카드 형태로 표시, 드래그 소스

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| ticket | TicketWithMeta | 티켓 데이터 |
| onClick | () => void | 클릭 핸들러 (상세 모달) |

**표시 정보**:
- 제목 (1줄, 넘치면 말줄임)
- 우선순위 뱃지 (색상 구분: LOW 회색, MEDIUM 파란색, HIGH 빨간색)
- 종료예정일 (있을 경우, YYYY-MM-DD 형식)
- 오버듀 표시 (isOverdue === true일 때 빨간 테두리 또는 아이콘)

**동작**:
1. useSortable로 드래그 가능하게 설정
2. 클릭 시 onClick 호출 (드래그와 클릭 구분 필요)
3. 드래그 중일 때 반투명 + 그림자 스타일

**접근성**:
- `role="button"`
- `aria-label="티켓: {title}"`
- 키보드 포커스 가능 (Tab), Enter로 상세 열기

---

### 2.7 TicketModal

**역할**: 티켓 상세 정보 표시 및 수정/삭제

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| ticket | TicketWithMeta | 표시할 티켓 |
| isOpen | boolean | 모달 열림 상태 |
| onClose | () => void | 닫기 핸들러 |
| onUpdate | (id: number, data: UpdateTicketInput) => void | 수정 핸들러 |
| onDelete | (id: number) => void | 삭제 핸들러 |

**표시 필드** (PRD FR-003 기준):

| 필드 | 표시명 | 편집 가능 | 설명 |
|------|--------|----------|------|
| title | 제목 | O | 인라인 편집 |
| description | 설명 | O | 인라인 편집 |
| priority | 우선순위 | O | 셀렉트 변경 |
| plannedStartDate | 시작예정일 | O | 날짜 선택 |
| dueDate | 종료예정일 | O | 날짜 선택 |
| status | 상태 | X (읽기 전용) | DnD로만 변경 |
| startedAt | 시작일 | X (읽기 전용) | 시스템 자동 (TODO 이동 시) |
| completedAt | 종료일 | X (읽기 전용) | 시스템 자동 (Done 이동 시) |
| createdAt | 생성일 | X (읽기 전용) | 시스템 자동 |

> startedAt, completedAt, status는 시스템이 관리하는 필드로, 모달에서 읽기 전용으로 표시한다.
> 값이 없으면 "-" 또는 빈 상태로 표시한다.

**동작**:
1. 모달 열림 시 바깥 영역 클릭 또는 ESC로 닫기
2. 인라인 편집: 필드 클릭 시 편집 모드 전환
3. 삭제 버튼 클릭 시 ConfirmDialog 표시
4. 수정 완료 시 onUpdate 호출 (PATCH /api/tickets/:id)
5. body 스크롤 잠금

---

### 2.8 TicketForm

**역할**: 티켓 생성/수정 폼

**Props**:
| Prop | 타입 | 설명 |
|------|------|------|
| mode | 'create' \| 'edit' | 폼 모드 |
| initialData | Partial\<Ticket\> | 수정 시 기존 데이터 |
| onSubmit | (data: CreateTicketInput \| UpdateTicketInput) => void | 제출 핸들러 |
| onCancel | () => void | 취소 핸들러 |
| isLoading | boolean | 제출 중 로딩 상태 |

**폼 필드**:
| 필드 | 컴포넌트 | 필수 | 검증 |
|------|----------|------|------|
| title | text input | O (생성 시) | 1~200자, 공백만 불가 |
| description | textarea | X | 최대 1000자 |
| priority | select (3옵션) | X | LOW, MEDIUM, HIGH (기본: MEDIUM) |
| plannedStartDate | date input | X | YYYY-MM-DD |
| dueDate | date input | X | 오늘 이후 날짜 |

**동작**:
1. 클라이언트 사이드 Zod 검증 → 에러 메시지 인라인 표시
2. Enter 키 또는 제출 버튼으로 폼 제출
3. 제출 중 버튼 비활성화 + 로딩 스피너
4. 성공 시 폼 초기화 (생성 모드) 또는 모달 닫기 (수정 모드)

**검증 에러 메시지** (REQUIREMENTS.md 기준):
| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| title | 빈 값 / 공백만 | "제목을 입력해주세요" |
| title | 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| description | 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| priority | 잘못된 값 | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| dueDate | 과거 날짜 | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

> 검증 스키마는 `src/shared/validations/ticket.ts`의 Zod 스키마를 공유한다.

---

## 3. 공통 UI 컴포넌트

### Modal
- 오버레이 + 중앙 정렬 컨테이너
- ESC 키 닫기, 바깥 클릭 닫기
- 열림/닫힘 애니메이션
- body 스크롤 잠금

### Badge
- 우선순위 표시: LOW(회색), MEDIUM(파란색), HIGH(빨간색)
- 크기: 작은 텍스트 + 둥근 패딩

### ConfirmDialog
- "정말 삭제하시겠습니까?" 확인 다이얼로그
- 확인/취소 버튼
- 위험 동작(삭제)은 빨간색 확인 버튼

### Button
- variant: primary, secondary, danger, ghost
- size: sm, md, lg
- 로딩 상태 지원

---

## 4. useTickets Hook

**역할**: 티켓 CRUD 및 DnD 상태를 관리하는 커스텀 Hook. 모든 API 호출은 이 Hook을 통해 수행한다.

**파일**: `src/client/hooks/useTickets.ts`

### 인터페이스

```typescript
interface UseTicketsReturn {
  // 상태
  board: BoardData;
  isLoading: boolean;
  error: string | null;

  // 액션
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: ReorderableStatus, position: number) => Promise<void>;
  complete: (id: number) => Promise<void>;
}

function useTickets(initialData: BoardData): UseTicketsReturn;
```

### 액션별 동작

| 액션 | API | 설명 |
|------|-----|------|
| create | `POST /api/tickets` | 티켓 생성 → Backlog 맨 위에 추가 |
| update | `PATCH /api/tickets/:id` | 제목, 설명, 우선순위, 시작예정일, 종료예정일 수정 |
| remove | `DELETE /api/tickets/:id` | 티켓 영구 삭제 |
| reorder | `PATCH /api/tickets/reorder` | 칼럼 이동 / 순서 변경 (Done 제외) |
| complete | `PATCH /api/tickets/:id/complete` | Done으로 이동, completedAt 자동 설정 |

### 낙관적 업데이트 패턴

```
1. 현재 board 상태 백업
2. UI 즉시 반영 (board 상태 변경)
3. API 호출
4. 성공: board를 서버 응답으로 확정
5. 실패: 백업한 상태로 롤백 + 에러 표시
```

### API 호출 함수

모든 API 호출은 `src/client/api/ticketApi.ts`를 통해 수행한다. 컴포넌트에서 직접 fetch 호출 금지.

---

## 5. 이벤트 흐름

### 5.1 드래그앤드롭 흐름

```
사용자 드래그 시작
  → onDragStart: activeTicket 설정, 드래그 오버레이 표시

사용자 드래그 중 (칼럼 위)
  → onDragOver: 대상 칼럼 하이라이트

사용자 드롭
  → onDragEnd:
    1. 대상 칼럼 판별
    2-a. [대상 = Done]
        → 낙관적 업데이트 (board 상태 즉시 반영)
        → useTickets.complete(ticketId)
        → PATCH /api/tickets/:id/complete
        → completedAt 자동 설정
    2-b. [대상 = BACKLOG / TODO / IN_PROGRESS]
        → 낙관적 업데이트 (board 상태 즉시 반영)
        → useTickets.reorder(ticketId, status, position)
        → PATCH /api/tickets/reorder
        → startedAt 규칙 적용 (TODO 이동 시 설정, BACKLOG 복귀 시 초기화)
        → completedAt 규칙 적용 (Done에서 나올 때 초기화)
    3. 성공: 확정
    4. 실패: 롤백 (이전 board 상태로 복원) + 에러 토스트
```

### 5.2 티켓 생성 흐름

```
BoardHeader("새 업무" 클릭)
  → TicketForm (생성 모달 열림)
  → 폼 입력 (제목, 설명, 우선순위, 시작예정일, 종료예정일)
  → 클라이언트 Zod 검증
  → useTickets.create(data)
  → POST /api/tickets
  → 성공: Backlog 맨 위에 카드 추가 → 모달 닫기
```

### 5.3 티켓 수정 흐름

```
TicketCard(클릭)
  → TicketModal (상세 보기)
  → 필드 인라인 편집 (제목, 설명, 우선순위, 시작예정일, 종료예정일)
  → 클라이언트 Zod 검증
  → useTickets.update(id, data)
  → PATCH /api/tickets/:id
  → 성공: board 카드 업데이트
```

### 5.4 티켓 완료 흐름 (Done 이동)

```
Done 칼럼으로 드래그
  → useTickets.complete(ticketId)
  → PATCH /api/tickets/:id/complete
  → completedAt 자동 설정
  → Done 칼럼에 표시
  → 24시간 경과 후 보드에서 숨김 (서버 필터링)
```

### 5.5 티켓 삭제 흐름

```
TicketModal(삭제 버튼 클릭)
  → ConfirmDialog ("정말 삭제하시겠습니까?")
  → 확인
  → useTickets.remove(ticketId)
  → DELETE /api/tickets/:id
  → 성공: board에서 카드 제거 → 모달 닫기
```

---

## 6. UseCase — 컴포넌트 — Hook 매핑

| 사용자 스토리 | 주요 컴포넌트 | 사용하는 Hook 액션 |
|-------------|-------------|-------------------|
| US-001: 새 할 일 등록 | BoardHeader, TicketForm | useTickets.create |
| US-002: 상세 정보 설정 | TicketForm | useTickets.create |
| US-003: 칸반 보드 현황 파악 | Board, Column, TicketCard | useTickets (조회) |
| US-004: 마감 초과 인지 | TicketCard, FilterBar | useTickets (조회), isOverdue |
| US-005: 드래그앤드롭 상태 변경 | Board, Column | useTickets.reorder |
| US-006: 할 일 완료 처리 | Board (Done 칼럼 드롭) | useTickets.complete |
| US-007: 할 일 수정 | TicketModal, TicketForm | useTickets.update |
| US-008: 할 일 삭제 | TicketModal, ConfirmDialog | useTickets.remove |

---

## 7. 구현 순서

컴포넌트 구현 순서와 TDD 체크리스트는 [FRONTEND_TASKS.md](./FRONTEND_TASKS.md) 참조.
