# 프런트엔드 구현 태스크

> 컴포넌트 명세는 [COMPONENT_SPEC.md](./COMPONENT_SPEC.md), 테스트 케이스는 [TEST_CASES.md](./TEST_CASES.md) 참조

---

## 구현 원칙

- **Bottom-up**: 말단 컴포넌트(Leaf)부터 구현하여 컨테이너로 조립
- **TDD**: Red(실패 테스트) → Green(최소 구현) → Refactor(개선)
- **의존성 순서**: 각 컴포넌트는 자신의 의존성이 먼저 구현된 상태에서 작업

---

## 의존성 그래프

```
Button ────────────────────────────────────┐
Badge ─────────────────────────────────────┤
Modal ──────┬──────────────────────────────┤
            ├── ConfirmDialog ─────────────┤
            │                              │
TicketCard ─┤                              │
ColumnHeader┼── Column ── Board ───────────┤
            │                              │
TicketDetailView                           │
TicketForm ─┼── TicketModal ───────────────┤
            │                              │
ticketApi ── useTickets ───────────────────┤
                                           │
BoardHeader ┤                              │
FilterBar ──┼── BoardContainer ──── page.tsx
```

---

## 구현 순서

### Phase 1: UI 기본 컴포넌트 (의존성 없음)

| 순서 | 컴포넌트 | 파일 경로 | 명세 | 테스트 | 상태 |
|------|----------|-----------|------|--------|------|
| 1-1 | Button | `src/client/components/ui/Button.tsx` | COMPONENT_SPEC §3 | 12 tests | ✅ |
| 1-2 | Badge | `src/client/components/ui/Badge.tsx` | COMPONENT_SPEC §3 | TC-COMP-001 C001-7에서 검증 | ✅ |
| 1-3 | Modal | `src/client/components/ui/Modal.tsx` | COMPONENT_SPEC §3 | 5 tests | ✅ |
| 1-4 | ConfirmDialog | `src/client/components/ui/ConfirmDialog.tsx` | COMPONENT_SPEC §3 | TC-COMP-006 5 tests | ✅ |

**의존성**: 없음

---

### Phase 2: Board 컴포넌트 (Phase 1 UI에 의존)

| 순서 | 컴포넌트 | 파일 경로 | 명세 | 테스트 | 상태 |
|------|----------|-----------|------|--------|------|
| 2-1 | TicketCard | `src/client/components/ticket/TicketCard.tsx` | COMPONENT_SPEC §2.6 | TC-COMP-001 | ✅ |
| 2-2 | ColumnHeader | `src/client/components/board/ColumnHeader.tsx` | COMPONENT_SPEC §2.5 | 4 tests | ✅ |
| 2-3 | Column | `src/client/components/board/Column.tsx` | COMPONENT_SPEC §2.5 | TC-COMP-002 8 tests | ✅ |
| 2-4 | Board | `src/client/components/board/Board.tsx` | COMPONENT_SPEC §2.4 | TC-COMP-003 4 tests | ✅ |

**의존성**: Badge, Button (Phase 1)

---

### Phase 3: Ticket 컴포넌트 (Phase 1 UI + Zod에 의존)

| 순서 | 컴포넌트 | 파일 경로 | 명세 | 테스트 | 상태 |
|------|----------|-----------|------|--------|------|
| 3-1 | TicketDetailView | `src/client/components/ticket/TicketDetailView.tsx` | COMPONENT_SPEC §2.7 | 3 tests | ⬜ |
| 3-2 | TicketForm | `src/client/components/ticket/TicketForm.tsx` | COMPONENT_SPEC §2.8 | TC-COMP-004 7 tests | ⬜ |
| 3-3 | TicketModal | `src/client/components/ticket/TicketModal.tsx` | COMPONENT_SPEC §2.7 | TC-COMP-005 7 tests | ⬜ |

**의존성**: Modal, Button, ConfirmDialog (Phase 1)

---

### Phase 4: 데이터 레이어

| 순서 | 모듈 | 파일 경로 | 명세 | 테스트 | 상태 |
|------|------|-----------|------|--------|------|
| 4-1 | ticketApi | `src/client/api/ticketApi.ts` | COMPONENT_SPEC §4 | 11 tests | ⬜ |
| 4-2 | useTickets | `src/client/hooks/useTickets.ts` | COMPONENT_SPEC §4 | 10 tests | ⬜ |

**의존성**: 없음 (fetch 래퍼 + React Hook)
**useTickets** → ticketApi

---

### Phase 5: 컨테이너 (전체 조립)

| 순서 | 컴포넌트 | 파일 경로 | 명세 | 테스트 | 상태 |
|------|----------|-----------|------|--------|------|
| 5-1 | BoardHeader | `src/client/components/board/BoardHeader.tsx` | COMPONENT_SPEC §2.2 | 4 tests | ⬜ |
| 5-2 | FilterBar | `src/client/components/board/FilterBar.tsx` | COMPONENT_SPEC §2.3 | 6 tests | ⬜ |
| 5-3 | BoardContainer | `src/client/components/board/BoardContainer.tsx` | COMPONENT_SPEC §2.1 | 6 tests | ⬜ |
| 5-4 | page.tsx | `app/page.tsx` | — | — | ⬜ |

**의존성**: 모든 Phase 완료 후
**BoardContainer** → useTickets + Board + BoardHeader + FilterBar + TicketModal
**page.tsx** → 서버 컴포넌트에서 ticketService.getBoard() → BoardContainer

---

## 컴포넌트별 상세

### Button (Phase 1-1)

```
파일: src/client/components/ui/Button.tsx
Props: variant (primary|secondary|danger|ghost), size (sm|md|lg), isLoading, children, onClick
CSS:  globals.css의 .btn, .btn-primary, .btn-secondary, .btn-danger, .btn-ghost
```

TDD 체크리스트:
- [x] variant별 CSS 클래스 적용 (4종)
- [x] size별 CSS 클래스 적용 (3종)
- [x] 기본값 variant=primary, size=md
- [x] onClick 핸들러 호출
- [x] isLoading=true → 버튼 비활성화 + "처리중..." 표시
- [x] isLoading=true일 때 클릭 무시
- [x] children 렌더링

---

### Badge (Phase 1-2)

```
파일: src/client/components/ui/Badge.tsx
PriorityBadge: priority prop → data-priority 속성 + 라벨 텍스트 (낮음/보통/높음)
DueDateBadge: dueDate, isOverdue props → 날짜 텍스트 + data-overdue 속성
CSS: globals.css의 .badge-priority-low, .badge-priority-medium, .badge-priority-high, .badge-due-date
```

TDD 체크리스트:
- [x] PriorityBadge: LOW → 회색, MEDIUM → 파란색, HIGH → 빨간색 (TC-COMP-001 C001-7에서 검증)
- [x] DueDateBadge: 날짜 표시 + overdue 상태 반영

---

### Modal (Phase 1-3)

```
파일: src/client/components/ui/Modal.tsx
Props: isOpen, onClose, children
CSS:  globals.css의 .modal-overlay, .modal-content
```

TDD 체크리스트:
- [x] isOpen=false → 렌더링 안 됨
- [x] isOpen=true → 오버레이 + 컨텐츠 표시
- [x] ESC 키 → onClose 호출
- [x] 오버레이 클릭 → onClose 호출
- [x] 컨텐츠 영역 클릭 → onClose 호출 안 됨

---

### ConfirmDialog (Phase 1-4)

```
파일: src/client/components/ui/ConfirmDialog.tsx
Props: isOpen, message, onConfirm, onCancel
의존: Modal, Button
테스트: TC-COMP-006 (C006-1, C006-2)
```

TDD 체크리스트:
- [x] isOpen=false → 렌더링 안 됨
- [x] message 텍스트 표시
- [x] C006-1: 확인 클릭 → onConfirm 호출
- [x] C006-2: 취소 클릭 → onCancel 호출
- [x] 확인 버튼에 btn-danger 클래스

---

### TicketCard (Phase 2-1)

```
파일: src/client/components/ticket/TicketCard.tsx
Props: ticket (TicketWithMeta), onClick
의존: PriorityBadge, DueDateBadge, @dnd-kit/sortable
테스트: TC-COMP-001 (C001-1 ~ C001-7)
```

TDD 체크리스트:
- [x] C001-1: 제목, 우선순위 뱃지, 종료예정일 표시
- [x] C001-2: isOverdue=true → data-overdue 속성 + 빨간 테두리
- [x] C001-3: status=DONE → 완료 스타일
- [x] C001-4: dueDate=null → 종료예정일 미표시
- [x] C001-5: 클릭 → onClick 호출
- [x] C001-6: 긴 제목 말줄임 처리
- [x] C001-7: 우선순위별 뱃지 색상 (LOW/MEDIUM/HIGH)

---

### ColumnHeader (Phase 2-2)

```
파일: src/client/components/board/ColumnHeader.tsx
Props: title (string), count (number)
테스트: TC-COMP-002 C002-3
```

TDD 체크리스트:
- [x] C002-3: 칼럼명 표시
- [x] C002-3: 티켓 수 뱃지 표시
- [x] 칼럼명 한글 매핑 (BACKLOG→백로그, TODO→할 일, IN_PROGRESS→진행 중, DONE→완료)

---

### Column (Phase 2-3)

```
파일: src/client/components/board/Column.tsx
Props: status (TicketStatus), tickets (TicketWithMeta[]), onTicketClick
의존: ColumnHeader, TicketCard, @dnd-kit/sortable
테스트: TC-COMP-002 (C002-1, C002-2, C002-3)
```

TDD 체크리스트:
- [x] C002-1: 티켓 있는 칼럼 → 카드 목록 + 개수 뱃지
- [x] C002-2: 빈 칼럼 → "이 칼럼에 티켓이 없습니다" 안내
- [x] C002-3: 칼럼 헤더에 칼럼명 + 티켓 수
- [x] SortableContext + useDroppable 연동

---

### Board (Phase 2-4)

```
파일: src/client/components/board/Board.tsx
Props: board (BoardData), onTicketClick
의존: Column, @dnd-kit/core
테스트: TC-COMP-003 (C003-1, C003-2)
```

TDD 체크리스트:
- [x] C003-1: 4칼럼 렌더링 (BACKLOG, TODO, IN_PROGRESS, DONE)
- [x] C003-2: Backlog가 좌측 사이드바로 배치
- [x] board-sidebar + board-main 레이아웃

---

### TicketDetailView (Phase 3-1)

```
파일: src/client/components/ticket/TicketDetailView.tsx
Props: ticket (TicketWithMeta)
테스트: TC-COMP-005 C005-2
```

TDD 체크리스트:
- [ ] C005-2: status, startedAt, completedAt, createdAt 읽기 전용 표시
- [ ] 값 없으면 "-" 표시
- [ ] form-readonly 클래스 적용

---

### TicketForm (Phase 3-2)

```
파일: src/client/components/ticket/TicketForm.tsx
Props: mode (create|edit), initialData, onSubmit, onCancel, isLoading
의존: Button, src/shared/validations/ticket.ts (Zod)
테스트: TC-COMP-004 (C004-1 ~ C004-7)
```

TDD 체크리스트:
- [ ] C004-1: 생성 모드 → 빈 필드, 우선순위 MEDIUM 기본값
- [ ] C004-2: 수정 모드 → initialData 반영
- [ ] C004-3: 빈 제목 → "제목을 입력해주세요"
- [ ] C004-4: 과거 종료예정일 → "종료예정일은 오늘 이후 날짜를 선택해주세요"
- [ ] C004-5: plannedStartDate date input 렌더링
- [ ] C004-6: 정상 제출 → onSubmit 호출 + 데이터 확인
- [ ] C004-7: isLoading=true → 버튼 비활성화 + 스피너

---

### TicketModal (Phase 3-3)

```
파일: src/client/components/ticket/TicketModal.tsx
Props: ticket, isOpen, onClose, onUpdate, onDelete
의존: Modal, TicketDetailView, TicketForm, ConfirmDialog
테스트: TC-COMP-005 (C005-1 ~ C005-6)
```

TDD 체크리스트:
- [ ] C005-1: isOpen에 따라 표시/숨김
- [ ] C005-2: 읽기 전용 필드 표시
- [ ] C005-3: 편집 가능 필드
- [ ] C005-4: ESC → onClose
- [ ] C005-5: 바깥 클릭 → onClose
- [ ] C005-6: 삭제 → ConfirmDialog → 확인 → onDelete

---

### ticketApi (Phase 4-1)

```
파일: src/client/api/ticketApi.ts
함수: getBoard, create, update, remove, reorder, complete
의존: 없음 (fetch 래퍼)
```

TDD 체크리스트:
- [ ] getBoard: GET /api/tickets 호출 + 응답 반환
- [ ] create: POST /api/tickets 호출 + Ticket 반환
- [ ] update: PATCH /api/tickets/:id 호출 + Ticket 반환
- [ ] remove: DELETE /api/tickets/:id 호출
- [ ] reorder: PATCH /api/tickets/reorder 호출 + 결과 반환
- [ ] complete: PATCH /api/tickets/:id/complete 호출 + Ticket 반환
- [ ] 에러 응답 시 error.message throw

---

### useTickets (Phase 4-2)

```
파일: src/client/hooks/useTickets.ts
반환: { board, isLoading, error, create, update, remove, reorder, complete }
의존: ticketApi
패턴: API 호출 → refreshBoard
```

TDD 체크리스트:
- [ ] initialData로 board 상태 초기화
- [ ] create 호출 → ticketApi.create + getBoard
- [ ] update 호출 → ticketApi.update + getBoard
- [ ] remove 호출 → ticketApi.remove + getBoard
- [ ] reorder 호출 → ticketApi.reorder + getBoard
- [ ] complete 호출 → ticketApi.complete + getBoard
- [ ] 실패 시 error 상태 설정
- [ ] API 호출 중 isLoading=true

---

### BoardHeader (Phase 5-1)

```
파일: src/client/components/board/BoardHeader.tsx
Props: onCreateClick
의존: Button
```

TDD 체크리스트:
- [ ] "Tika" 타이틀 표시
- [ ] "새 업무" 버튼 표시 + onCreateClick 호출
- [ ] 검색 placeholder (MVP — 비활성)

---

### FilterBar (Phase 5-2)

```
파일: src/client/components/board/FilterBar.tsx
Props: activeFilter, onFilterChange, counts
CSS: globals.css의 .filter-btn
```

TDD 체크리스트:
- [ ] "이번주 업무" 버튼 + 카운트 표시
- [ ] "일정 초과" 버튼 + 카운트 표시
- [ ] 클릭 시 해당 필터 전달
- [ ] 이미 활성화된 필터 클릭 → 'all' 토글
- [ ] 활성 필터 버튼에 active 클래스

---

### BoardContainer (Phase 5-3)

```
파일: src/client/components/board/BoardContainer.tsx
Props: initialData (BoardData)
의존: Board, BoardHeader, FilterBar, TicketModal, useTickets
역할: 필터 상태, 모달 제어, CRUD 핸들링
```

TDD 체크리스트:
- [ ] BoardHeader 렌더링
- [ ] FilterBar 렌더링
- [ ] Board 4칼럼 렌더링
- [ ] "새 업무" → 생성 모달
- [ ] 티켓 카드 클릭 → 상세 모달
- [ ] overdue 필터 연동

---

### page.tsx (Phase 5-4)

```
파일: app/page.tsx
역할: 서버 컴포넌트에서 ticketService.getBoard() 호출 → BoardContainer에 전달
```

- [ ] async 서버 컴포넌트로 전환
- [ ] ticketService.getBoard() → BoardContainer initialData prop 전달
