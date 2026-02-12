# Tika - 테스트 케이스 정의 (TEST_CASES.md)

> TDD 사이클에 따라 테스트를 먼저 작성하고 구현한다.
> 테스트 프레임워크: Jest + React Testing Library
> 관련 문서: REQUIREMENTS.md, API_SPEC.md, DATA_MODEL.md, COMPONENT_SPEC.md

---

## 추적 매트릭스 (TC ↔ FR ↔ US)

| TC ID | 관련 FR | 관련 US | 테스트 대상 |
|-------|---------|---------|-----------|
| TC-API-001 | FR-001 | US-001, US-002 | 티켓 생성 API |
| TC-API-002 | FR-002 | US-003 | 보드 조회 API |
| TC-API-003 | FR-003 | US-007 | 티켓 상세 조회 API |
| TC-API-004 | FR-004 | US-007 | 티켓 수정 API |
| TC-API-005 | FR-005 | US-006 | 티켓 완료 API |
| TC-API-006 | FR-006 | US-008 | 티켓 삭제 API |
| TC-API-007 | FR-007 | US-005 | 상태/순서 변경 (reorder) API |
| TC-API-008 | FR-008 | US-003, US-004 | isOverdue 필드 계산 |
| TC-COMP-001 | — | US-003, US-004 | TicketCard 컴포넌트 |
| TC-COMP-002 | — | US-003 | Column 컴포넌트 |
| TC-COMP-003 | — | US-003 | Board 컴포넌트 |
| TC-COMP-004 | — | US-001, US-002 | TicketForm 컴포넌트 |
| TC-COMP-005 | — | US-007 | TicketModal 컴포넌트 |
| TC-COMP-006 | — | US-008 | ConfirmDialog 컴포넌트 |
| TC-INT-001 | FR-005, FR-007 | US-005, US-006 | 드래그앤드롭 통합 |
| TC-INT-002 | FR-002, FR-005, FR-006 | US-006, US-008 | completed_at+24시간 이후인 건 Done 영역에 노출안됨  |

---

## 1. API 테스트 (백엔드)

### TC-API-001: POST /api/tickets — 티켓 생성

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 001-1 | 필수 필드만으로 생성 | `{ title: "테스트 할일" }` | 201, status=BACKLOG, priority=MEDIUM |
| 001-2 | 전체 필드로 생성 | `{ title, description, priority: "HIGH", plannedStartDate, dueDate }` | 201, 모든 필드 반영 |
| 001-3 | 제목 누락 | `{ }` | 400, "제목을 입력해주세요" |
| 001-4 | 빈 제목 | `{ title: "" }` | 400, "제목을 입력해주세요" |
| 001-5 | 공백만 제목 | `{ title: "   " }` | 400, "제목을 입력해주세요" |
| 001-6 | 제목 200자 초과 | `{ title: "a".repeat(201) }` | 400, "제목은 200자 이내로 입력해주세요" |
| 001-7 | 설명 1000자 초과 | `{ title: "ok", description: "a".repeat(1001) }` | 400, "설명은 1000자 이내로 입력해주세요" |
| 001-8 | 잘못된 우선순위 | `{ title: "ok", priority: "URGENT" }` | 400, "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| 001-9 | 과거 종료예정일 | `{ title: "ok", dueDate: "2020-01-01" }` | 400, "종료예정일은 오늘 이후 날짜를 선택해주세요" |
| 001-10 | position 자동 할당 | 연속 2개 생성 | 나중 생성 티켓의 position이 더 작음 (맨 위 배치) |
| 001-11 | startedAt/completedAt 초기값 | 정상 생성 | startedAt=null, completedAt=null |

---

### TC-API-002: GET /api/tickets — 보드 조회

| ID | 시나리오 | 조건 | 기대 결과 |
|----|----------|------|-----------|
| 002-1 | 빈 보드 조회 | 티켓 없음 | 200, 4개 빈 배열 (BACKLOG, TODO, IN_PROGRESS, DONE) |
| 002-2 | 데이터 있는 보드 | 여러 상태의 티켓 존재 | 200, 상태별 그룹화 |
| 002-3 | 칼럼 내 정렬 | 같은 칼럼에 여러 티켓 | position 오름차순 정렬 |
| 002-4 | total 필드 | 여러 티켓 존재 | total = 표시되는 전체 티켓 수 |
| 002-5 | Done 24시간 필터 | completedAt이 24시간 이내인 DONE 티켓 | Done 칼럼에 포함 |
| 002-6 | Done 24시간 초과 | completedAt이 24시간 이전인 DONE 티켓 | Done 칼럼에서 제외 |
| 002-7 | isOverdue 파생 필드 | 각 티켓에 isOverdue 포함 | boolean 값 확인 |
| 002-8 | 모든 날짜 필드 포함 | 정상 조회 | plannedStartDate, dueDate, startedAt, completedAt 포함 |

---

### TC-API-003: GET /api/tickets/:id — 티켓 상세 조회

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 003-1 | 존재하는 티켓 | 유효한 id | 200, 티켓 전체 데이터 (모든 필드 포함) |
| 003-2 | 없는 티켓 | 존재하지 않는 id | 404, "티켓을 찾을 수 없습니다" |
| 003-3 | 잘못된 id 형식 | `"abc"` | 400, VALIDATION_ERROR |
| 003-4 | isOverdue 포함 | 정상 조회 | isOverdue 파생 필드 포함 |

---

### TC-API-004: PATCH /api/tickets/:id — 티켓 수정

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 004-1 | 제목만 수정 | `{ title: "새 제목" }` | 200, 제목 변경, 나머지 유지 |
| 004-2 | 우선순위 변경 | `{ priority: "LOW" }` | 200, priority 변경 |
| 004-3 | 설명 삭제 | `{ description: null }` | 200, description=null |
| 004-4 | 종료예정일 삭제 | `{ dueDate: null }` | 200, dueDate=null |
| 004-5 | 시작예정일 수정 | `{ plannedStartDate: "2026-03-01" }` | 200, plannedStartDate 변경 |
| 004-6 | 시작예정일 삭제 | `{ plannedStartDate: null }` | 200, plannedStartDate=null |
| 004-7 | 없는 티켓 수정 | 존재하지 않는 id | 404, "티켓을 찾을 수 없습니다" |
| 004-8 | updatedAt 갱신 | 아무 필드 수정 | updatedAt 변경 확인 |
| 004-9 | status 수정 불가 | `{ status: "DONE" }` | status 변경되지 않음 (무시 또는 400) |

---

### TC-API-005: PATCH /api/tickets/:id/complete — 티켓 완료

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 005-1 | 정상 완료 처리 | 유효한 id | 200, status=DONE, completedAt 설정 |
| 005-2 | completedAt 자동 설정 | 정상 완료 | completedAt ≈ 현재 시각 |
| 005-3 | position 할당 | 정상 완료 | Done 칼럼 맨 위 position 할당 |
| 005-4 | 없는 티켓 완료 | 존재하지 않는 id | 404, "티켓을 찾을 수 없습니다" |
| 005-5 | updatedAt 갱신 | 정상 완료 | updatedAt 변경 확인 |

---

### TC-API-006: DELETE /api/tickets/:id — 티켓 삭제

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 006-1 | 정상 삭제 | 유효한 id | 204, 재조회 시 404 |
| 006-2 | 없는 티켓 삭제 | 존재하지 않는 id | 404, "티켓을 찾을 수 없습니다" |

---

### TC-API-007: PATCH /api/tickets/reorder — 상태/순서 변경

| ID | 시나리오 | 입력 | 기대 결과 |
|----|----------|------|-----------|
| 007-1 | 칼럼 간 이동 (BACKLOG→TODO) | `{ ticketId, status: "TODO", position }` | status=TODO, position 갱신 |
| 007-2 | 같은 칼럼 내 순서 변경 | position만 변경 | status 유지, position 변경 |
| 007-3 | TODO 이동 시 startedAt 설정 | BACKLOG → TODO | startedAt ≈ 현재 시각 |
| 007-4 | BACKLOG 복귀 시 startedAt 초기화 | TODO → BACKLOG | startedAt = null |
| 007-5 | Done에서 나가기 | DONE → TODO | completedAt = null, startedAt 설정 |
| 007-6 | Done에서 BACKLOG로 | DONE → BACKLOG | completedAt = null, startedAt = null |
| 007-7 | IN_PROGRESS 간 이동 시 startedAt 유지 | TODO → IN_PROGRESS | startedAt 변경 없음 |
| 007-8 | 다른 티켓 position 영향 | 중간에 삽입 | affected 배열에 영향받는 티켓 포함 |
| 007-9 | DONE을 status로 전송 | `{ status: "DONE" }` | 400, VALIDATION_ERROR |
| 007-10 | 잘못된 status | `{ status: "INVALID" }` | 400, "상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요" |
| 007-11 | 없는 티켓 이동 | 존재하지 않는 ticketId | 404, "티켓을 찾을 수 없습니다" |
| 007-12 | updatedAt 갱신 | 정상 이동 | updatedAt 변경 확인 |

---

### TC-API-008: isOverdue 필드 계산

| ID | 시나리오 | 조건 | 기대 결과 |
|----|----------|------|-----------|
| 008-1 | 오버듀 판정 | dueDate < 오늘, status=TODO | isOverdue = true |
| 008-2 | DONE은 오버듀 아님 | dueDate < 오늘, status=DONE | isOverdue = false |
| 008-3 | 종료예정일 없음 | dueDate = null | isOverdue = false |
| 008-4 | 미래 종료예정일 | dueDate > 오늘 | isOverdue = false |
| 008-5 | 오늘이 종료예정일 | dueDate = 오늘 | isOverdue = false (오늘은 아직 초과 아님) |
| 008-6 | BACKLOG 오버듀 | dueDate < 오늘, status=BACKLOG | isOverdue = true |
| 008-7 | IN_PROGRESS 오버듀 | dueDate < 오늘, status=IN_PROGRESS | isOverdue = true |

---

## 2. 컴포넌트 테스트 (프론트엔드)

### TC-COMP-001: TicketCard

| ID | 시나리오 | 조건 | 기대 결과 |
|----|----------|------|-----------|
| C001-1 | 기본 렌더링 | 티켓 데이터 전달 | 제목, 우선순위 뱃지, 종료예정일 표시 |
| C001-2 | 오버듀 표시 | isOverdue = true | 빨간 테두리 또는 경고 아이콘 표시 |
| C001-3 | 완료 상태 | status = DONE | 완료 스타일 적용 |
| C001-4 | 종료예정일 없는 티켓 | dueDate = null | 종료예정일 영역 미표시 |
| C001-5 | 클릭 이벤트 | 카드 영역 클릭 | onClick 핸들러 호출 |
| C001-6 | 긴 제목 | 200자 제목 | 말줄임(...) 처리 |
| C001-7 | 우선순위 뱃지 색상 | LOW/MEDIUM/HIGH | 각각 회색/파란색/빨간색 |

---

### TC-COMP-002: Column

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| C002-1 | 티켓 있는 칼럼 | 카드 목록 표시 + 개수 뱃지 |
| C002-2 | 빈 칼럼 | "이 칼럼에 티켓이 없습니다" 안내 |
| C002-3 | 칼럼 헤더 | 칼럼명 + 티켓 수 표시 |

---

### TC-COMP-003: Board

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| C003-1 | 4칼럼 렌더링 | BACKLOG, TODO, IN_PROGRESS, DONE 순서 |
| C003-2 | Backlog 사이드바 | Backlog가 좌측 사이드바로 배치 |
| C003-3 | 반응형 레이아웃 | 뷰포트에 따라 레이아웃 변경 |

---

### TC-COMP-004: TicketForm

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| C004-1 | 빈 폼 렌더링 (생성 모드) | 빈 필드들, 우선순위 MEDIUM 기본 선택 |
| C004-2 | 기존 데이터 표시 (수정 모드) | initialData가 각 필드에 반영 |
| C004-3 | 빈 제목 제출 | 에러 메시지 "제목을 입력해주세요" |
| C004-4 | 과거 종료예정일 | 에러 메시지 "종료예정일은 오늘 이후 날짜를 선택해주세요" |
| C004-5 | 시작예정일 필드 존재 | 생성/수정 폼 | plannedStartDate date input 렌더링 |
| C004-6 | 정상 제출 | 모든 필드 입력 | onSubmit 호출 + 전달된 데이터 확인 |
| C004-7 | 로딩 상태 | isLoading=true | 버튼 비활성화 + 스피너 |

---

### TC-COMP-005: TicketModal

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| C005-1 | 열기/닫기 | isOpen에 따라 표시/숨김 |
| C005-2 | 읽기 전용 필드 표시 | 시작일, 종료일, 상태, 생성일 읽기 전용 표시 |
| C005-3 | 편집 가능 필드 | 제목, 설명, 우선순위, 시작예정일, 종료예정일 편집 가능 |
| C005-4 | ESC 닫기 | ESC 키 누르면 onClose 호출 |
| C005-5 | 바깥 클릭 닫기 | 오버레이 클릭 시 onClose |
| C005-6 | 삭제 확인 | 삭제 → ConfirmDialog → 확인 → onDelete |

---

### TC-COMP-006: ConfirmDialog

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| C006-1 | 확인 클릭 | onConfirm 호출 |
| C006-2 | 취소 클릭 | onCancel 호출, 다이얼로그 닫힘 |

---

## 3. 통합 테스트

### TC-INT-001: 드래그앤드롭 + API 연동

| ID | 시나리오 | 동작 | 기대 결과 |
|----|----------|------|-----------|
| I001-1 | 칼럼 간 이동 (→TODO) | BACKLOG → TODO 드래그 | reorder API 호출, UI 즉시 반영, startedAt 자동 설정 |
| I001-2 | 칼럼 간 이동 (→Done) | IN_PROGRESS → Done 드래그 | **complete API** 호출 (reorder 아님), completedAt 자동 설정 |
| I001-3 | 칼럼 내 순서 변경 | 같은 칼럼에서 위치 변경 | reorder API 호출, position 재계산 |
| I001-4 | API 실패 시 롤백 | 드래그 후 API 에러 | 원래 위치로 복원, 에러 표시 |

---

### TC-INT-002: 완료 → 삭제 흐름

| ID | 시나리오 | 동작 | 기대 결과 |
|----|----------|------|-----------|
| I002-1 | Done 이동 후 표시 | 티켓을 Done으로 드래그 | Done 칼럼에 표시, completedAt 설정 |
| I002-2 | Done에서 수동 삭제 | Done 티켓 클릭 → 삭제 버튼 | 확인 다이얼로그 → DELETE API → 보드에서 제거 |
| I002-3 | 24시간 경과 후 숨김 | Done 상태 24시간 유지 | 보드 재조회 시 Done 칼럼에서 제외 |

---

## 4. 테스트 우선순위

**Phase 1 (핵심 — 백엔드 API)**:
- TC-API-001 (생성), TC-API-002 (조회), TC-API-007 (reorder), TC-API-005 (완료)
- 이유: 보드의 기본 동작인 생성, 조회, 상태 이동이 우선

**Phase 2 (보완 — 백엔드 API + 컴포넌트)**:
- TC-API-003 (상세), TC-API-004 (수정), TC-API-006 (삭제), TC-API-008 (오버듀)
- TC-COMP-001 (TicketCard), TC-COMP-002 (Column), TC-COMP-003 (Board)
- 이유: CRUD 완성 + 핵심 UI 렌더링

**Phase 3 (폼 + 모달)**:
- TC-COMP-004 (TicketForm), TC-COMP-005 (TicketModal), TC-COMP-006 (ConfirmDialog)
- 이유: 사용자 입력 UI

**Phase 4 (통합)**:
- TC-INT-001 (드래그앤드롭), TC-INT-002 (완료→삭제 흐름)
- 이유: 전체 기능이 구현된 후 end-to-end 검증
