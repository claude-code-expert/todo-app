# Tika - 요구사항 명세 (REQUIREMENTS.md)

> Claude Code 참조용 상세 요구사항.
> PRD, TRD와 함께 CLAUDE.md에서 참조한다.

---

## 1. 기능 요구사항 (Functional Requirements)

### FR-001: 티켓 생성

**설명**: 사용자가 새로운 티켓을 생성하여 Backlog에 추가한다.

**API 매핑**: `POST /api/tickets`

**입력 필드**:
| 필드 | 타입 | 필수 | 제약조건 | 기본값 |
|------|------|------|----------|--------|
| title | string | O | 1~200자, 공백만 불가 | - |
| description | string | X | 최대 1000자 | null |
| priority | enum | X | LOW, MEDIUM, HIGH | MEDIUM |
| plannedStartDate | date | X | - | null |
| dueDate | date | X | 오늘 이후 날짜 | null |

**처리 규칙**:
- 생성 시 status는 항상 BACKLOG
- 생성 시 position은 해당 칼럼의 최솟값 - 1024 (맨 위 배치)
- 칼럼에 티켓이 없을 경우 position = 0
- createdAt, updatedAt 자동 설정

**검증 에러 메시지**:
| 조건 | 메시지 |
|------|--------|
| 제목 누락 | "제목을 입력해주세요" |
| 제목 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| 제목 공백만 입력 | "제목을 입력해주세요" |
| 설명 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| 잘못된 우선순위 값 | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| 과거 종료예정일 | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

**성공 응답**: 201 Created + 생성된 티켓 전체 데이터
**실패 응답**: 400 Bad Request + 검증 에러 상세

---

### FR-002: 티켓 목록 조회 (보드)

**설명**: 칸반 보드에 표시할 전체 티켓을 칼럼별로 그룹화하여 조회한다.

**API 매핑**: `GET /api/tickets`

**응답 데이터**: 4개 칼럼별로 그룹화된 티켓 배열
- 각 칼럼 내 정렬: position 오름차순
- 각 티켓에 isOverdue 파생 필드 포함

**성공 응답**: 200 OK

---

### FR-003: 티켓 상세 조회

**설명**: 특정 티켓의 전체 정보를 조회한다.

**API 매핑**: `GET /api/tickets/:id`

**입력**: 티켓 ID (path parameter)
**성공 응답**: 200 OK + 티켓 전체 데이터
**실패 응답**: 404 Not Found (존재하지 않는 ID)

---

### FR-004: 티켓 수정

**설명**: 티켓의 제목, 설명, 우선순위, 시작예정일, 종료예정일을 수정한다.

**API 매핑**: `PATCH /api/tickets/:id`

**수정 가능 필드**:
| 필드 | 타입 | 제약조건 |
|------|------|----------|
| title | string | 1~200자 |
| description | string \| null | 최대 1000자. null 전송 시 삭제 |
| priority | enum | LOW, MEDIUM, HIGH |
| plannedStartDate | date \| null | null 전송 시 삭제 |
| dueDate | date \| null | 오늘 이후. null 전송 시 삭제 |

**처리 규칙**:
- 부분 수정(PATCH) 지원: 전송된 필드만 업데이트
- updatedAt 자동 갱신

**검증 에러 메시지**:
| 조건 | 메시지 |
|------|--------|
| 제목 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| 설명 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| 잘못된 우선순위 값 | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| 과거 종료예정일 | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

**성공 응답**: 200 OK + 수정된 티켓 전체 데이터
**실패 응답**: 400 (검증 실패), 404 (미존재)

---

### FR-005: 티켓 완료 (완료일 업데이트)

**설명**: 티켓을 Done 칼럼으로 이동하여 완료 처리하고, 종료일을 자동 설정한다.

**API 매핑**: `PATCH /api/tickets/:id/complete`

**처리 규칙**:
- DONE으로 이동 시: completedAt = 현재 시각, status = DONE
- DONE에서 다른 칼럼으로 이동 시: completedAt = null
- Done 칼럼에는 completedAt 기준 24시간 이내 티켓만 표시

**성공 응답**: 200 OK + 업데이트된 티켓 데이터
**실패 응답**: 404 Not Found

---

### FR-006: 티켓 삭제

**설명**: 티켓을 영구 삭제한다.

**API 매핑**: `DELETE /api/tickets/:id`

**입력**: 티켓 ID (path parameter)
**처리 규칙**: 하드 삭제 (soft delete 아님, MVP 기준)
**성공 응답**: 204 No Content
**실패 응답**: 404 Not Found

---

### FR-007: 상태/순서 변경 (드래그앤드롭)

**설명**: 티켓을 다른 칼럼으로 이동하거나 같은 칼럼 내에서 순서를 변경한다.

**API 매핑**: `PATCH /api/tickets/reorder`

**입력**:
| 필드 | 타입 | 설명 |
|------|------|------|
| ticketId | number | 이동할 티켓 ID |
| status | enum | 이동 대상 칼럼 (BACKLOG, TODO, IN_PROGRESS) |
| position | number | 칼럼 내 새 위치 |

> DONE은 허용하지 않는다. Done으로의 이동은 `PATCH /api/tickets/:id/complete` (FR-005)를 사용한다.

**처리 규칙**:
- 상태(status)와 순서(position) 동시 업데이트
- 트랜잭션으로 원자성 보장

**position 재계산 로직**:
- 두 카드 사이에 삽입할 때: `(prev + next) / 2`로 계산
- 간격이 1 미만이면: 해당 칼럼 전체를 1024 간격으로 재정렬
- 맨 앞 삽입: 첫 번째 카드의 position - 1024
- 맨 뒤 삽입: 마지막 카드의 position + 1024

**비즈니스 로직**:
- TODO로 이동 시: startedAt = 현재 시각
- TODO에서 BACKLOG로 이동 시: startedAt = null

**검증 에러 메시지**:
| 조건 | 메시지 |
|------|--------|
| 잘못된 status | "상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요" |
| 존재하지 않는 티켓 | "티켓을 찾을 수 없습니다" |

**성공 응답**: 200 OK + 업데이트된 티켓 목록
**실패 응답**: 400 (잘못된 status), 404 (미존재 ticketId)

---

### FR-008: 오버듀 판정

**설명**: 종료예정일이 지난 미완료 티켓에 오버듀 표시.

**API 매핑**: 없음 (파생 필드, 조회 시 계산)

**판정 규칙**: `dueDate < 오늘 AND status ≠ DONE`
- 이 값은 DB에 저장하지 않고 조회 시 계산 (파생 필드)
- 프론트엔드에서도 클라이언트 사이드로 계산 가능

---

## 2. 비기능 요구사항 (Non-Functional Requirements)

### NFR-001: 성능
- API 응답: 300ms 이내 (p95)
- 보드 초기 로드: 2초 이내

### NFR-002: 반응형
- 모바일 (360px~): 단일 칼럼 스크롤 뷰, 터치 드래그 지원
- 태블릿 (768px~): 2칼럼 그리드
- 데스크톱 (1024px~): 4칼럼 가로 배치

### NFR-003: 접근성
- 키보드로 카드 선택 및 이동 가능
- 스크린 리더 지원 (aria-label, role 속성)
- 충분한 색상 대비

### NFR-004: 데이터 무결성
- 드래그앤드롭 낙관적 업데이트: UI 즉시 반영 → API 성공 시 확정, 실패 시 롤백
- position 값은 정수로 관리, 충돌 시 재정렬
- 프론트엔드(Zod) + 백엔드(Zod) 이중 검증

### NFR-005: 브라우저 호환성
- Chrome, Safari, Firefox, Edge 최신 2개 버전 지원
- IE 미지원

### NFR-006: 배포 환경
- Vercel (Next.js 네이티브 배포, git push 자동 배포)
- Vercel Postgres (Neon) — 서버리스 최적화
- HTTPS 기본 제공
- PR별 프리뷰 배포 자동 생성

---

## 3. 사용자 스토리 (User Stories)

### US-001: 새 할 일 등록

> 사용자로서, 떠오른 할 일을 빠르게 등록할 수 있다.
> 그래서 아이디어가 떠오르는 즉시 기록하여 잊어버리지 않는다.

**인수 조건 (Acceptance Criteria)**:
- [ ] "새 티켓" 버튼 클릭 시 생성 폼이 열린다
- [ ] 제목만 입력하고 생성하면 Backlog 칼럼 맨 위에 카드가 추가된다
- [ ] 우선순위 미선택 시 MEDIUM이 기본 적용된다
- [ ] 생성 완료 후 폼이 닫힌다

**관련 FR**: FR-001

---

### US-002: 상세 정보 설정

> 사용자로서, 할 일에 설명, 우선순위, 시작예정일, 종료예정일을 설정할 수 있다.
> 그래서 할 일의 중요도와 기한을 명확히 관리할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 생성 시 설명, 우선순위, 시작예정일, 종료예정일을 선택적으로 입력할 수 있다
- [ ] 종료예정일은 오늘 이후 날짜만 선택 가능하다
- [ ] 우선순위에 따라 뱃지 색상이 달라진다

**관련 FR**: FR-001

---

### US-003: 칸반 보드 현황 파악

> 사용자로서, 보드를 열면 모든 할 일이 상태별로 분류되어 보인다.
> 그래서 전체 업무 현황을 한눈에 파악할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 4개 칼럼(Backlog, TODO, In Progress, Done)에 티켓이 분류되어 표시된다
- [ ] 각 칼럼 상단에 카드 수가 표시된다
- [ ] 칼럼 내 카드는 position 순서대로 정렬된다

**관련 FR**: FR-002

---

### US-004: 마감 초과 인지

> 사용자로서, 종료예정일이 지난 할 일을 시각적으로 즉시 알아볼 수 있다.
> 그래서 지연된 업무를 우선 처리할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 종료예정일이 지났고 Done이 아닌 카드에 오버듀 경고 표시가 나타난다
- [ ] 오버듀 표시는 다른 카드와 시각적으로 명확히 구분된다

**관련 FR**: FR-008

---

### US-005: 드래그앤드롭 상태 변경

> 사용자로서, 카드를 드래그하여 다른 칼럼으로 옮길 수 있다.
> 그래서 직관적으로 할 일의 상태를 변경할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 카드를 드래그하여 다른 칼럼에 드롭하면 상태가 즉시 변경된다
- [ ] 같은 칼럼 내에서 드래그하여 순서를 변경할 수 있다
- [ ] 어떤 칼럼에서든 어떤 칼럼으로든 이동 가능하다 (역방향 포함)
- [ ] API 실패 시 원래 위치로 롤백된다

**관련 FR**: FR-007

---

### US-006: 할 일 완료 처리

> 사용자로서, 할 일을 Done으로 옮기면 완료 처리된다.
> 그래서 완료된 업무를 별도로 확인할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] TODO 칼럼으로 이동 시 시작일(startedAt)이 기록된다
- [ ] TODO에서 BACKLOG로 되돌리면 startedAt이 초기화된다
- [ ] Done 칼럼으로 이동 시 종료일(completedAt)이 기록된다
- [ ] Done에서 다른 칼럼으로 되돌리면 completedAt이 초기화된다

**관련 FR**: FR-005

---

### US-007: 할 일 수정

> 사용자로서, 기존 할 일의 내용을 수정할 수 있다.
> 그래서 변경된 요구사항을 반영할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 카드 클릭 시 상세 모달이 열린다
- [ ] 모달에서 제목, 설명, 우선순위, 시작예정일, 종료예정일을 수정할 수 있다
- [ ] 수정 후 보드에 변경 사항이 즉시 반영된다

**관련 FR**: FR-003, FR-004

---

### US-008: 할 일 삭제

> 사용자로서, 불필요한 할 일을 삭제할 수 있다.
> 그래서 보드를 깔끔하게 유지할 수 있다.

**인수 조건 (Acceptance Criteria)**:
- [ ] 상세 모달에서 삭제 버튼이 있다
- [ ] 삭제 버튼 클릭 시 확인 다이얼로그가 표시된다
- [ ] 확인 후 티켓이 영구 삭제되고 보드에서 사라진다

**관련 FR**: FR-006

---

## 4. 추적 매트릭스 (US ↔ FR ↔ TC 매핑)

| 사용자 스토리 | 관련 FR | 관련 테스트 케이스 |
|--------------|---------|-------------------|
| US-001: 새 할 일 등록 | FR-001 | TC-API-001, TC-COMP-004 |
| US-002: 상세 정보 설정 | FR-001 | TC-API-001 |
| US-003: 칸반 보드 현황 파악 | FR-002, FR-008 | TC-API-002, TC-API-008, TC-COMP-002, TC-COMP-003 |
| US-004: 마감 초과 인지 | FR-008 | TC-API-008, TC-COMP-001 |
| US-005: 드래그앤드롭 상태 변경 | FR-007 | TC-API-007, TC-INT-001 |
| US-006: 할 일 완료 처리 | FR-005 | TC-API-005, TC-INT-001, TC-INT-002 |
| US-007: 할 일 수정 | FR-003, FR-004 | TC-API-003, TC-API-004, TC-COMP-005 |
| US-008: 할 일 삭제 | FR-006 | TC-API-006, TC-COMP-006, TC-INT-002 |

---

## 5. 칼럼(상태) 정의

```typescript
const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];
```

**칼럼 순서**: BACKLOG → TODO → IN_PROGRESS → DONE (고정)
**이동 제약**: 없음 (어떤 칼럼에서든 어떤 칼럼으로든 이동 가능)

---

## 6. 우선순위 정의

```typescript
const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

type TicketPriority = typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];
```

**시각적 표현**:
- LOW: 회색 뱃지
- MEDIUM: 파란색 뱃지
- HIGH: 빨간색 뱃지
