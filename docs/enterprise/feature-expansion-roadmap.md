# Tika 확장 기능 로드맵

> MVP에서 팀 프로덕트로 — 기능 확장 분석과 구현 계획
>
> **분석일**: 2026-02-19
> **현재 상태**: MVP 완성 (Phase 1 — FR-001~FR-008 전체 구현 완료)
> **브랜치**: `chapter6-frontend`

---

## 1. 현재 구현 상태 요약

### 완료된 핵심 기능 (Phase 1)

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| FR-001 | 티켓 생성 | ✅ 완료 | BACKLOG 자동 배치, position 계산 |
| FR-002 | 보드 조회 | ✅ 완료 | 4컬럼 칸반, DONE 24h 필터 |
| FR-003 | 티켓 상세 | ✅ 완료 | 모달 기반 상세 뷰, isOverdue 계산 |
| FR-004 | 티켓 수정 | ✅ 완료 | 부분 업데이트 (PATCH) |
| FR-005 | 티켓 완료 | ✅ 완료 | DONE 이동 + completedAt 자동 설정 |
| FR-006 | 티켓 삭제 | ✅ 완료 | 확인 다이얼로그 + 하드 삭제 |
| FR-007 | 드래그 앤 드롭 | ✅ 완료 | @dnd-kit, 상태 전환 비즈니스 로직 |
| FR-008 | 우선순위 필터 | ✅ 완료 | 상단 필터바, 3단계 우선순위 |

### 아키텍처

```
app/api/tickets/         → Route Handlers (진입점)
src/server/services/     → ticketService (비즈니스 로직)
src/server/db/           → Drizzle ORM + PostgreSQL
src/client/components/   → React 19 컴포넌트
src/client/hooks/        → useTickets, useTicketMutations 등
src/client/api/          → ticketApi (fetch 래퍼)
src/shared/              → 타입, Zod 스키마, 에러, 상수
```

### 테스트 커버리지

- API 테스트: `__tests__/api/` — 생성, 수정, 삭제, 완료, 리오더
- 서비스 테스트: `__tests__/services/` — ticketService 전체
- 컴포넌트 테스트: `__tests__/components/` — TicketCard, TicketForm, Modal 등
- 훅 테스트: `__tests__/hooks/` — useTickets, useTicketMutations
- 통합 테스트: 일부 미구현 (TC-INT-001, TC-INT-002)

---

## 2. Phase 2 확장 기능

PRD §7에 명시된 Phase 2 기능과 분석을 통해 도출한 추가 기능이다.

### 2.1 Google OAuth 로그인

**난이도**: HIGH | **예상 소요**: 4~5일 | **의존성**: 없음

모든 멀티유저 기능의 기반. NextAuth.js v5를 사용해 Google OAuth를 구현한다.

**구현 범위**:
- `users` 테이블 추가 (id, email, name, avatar_url, createdAt)
- tickets 테이블에 `user_id` FK 추가
- NextAuth.js + Google Provider 설정
- 세션 기반 티켓 필터링 (자기 티켓만 조회)
- 로그인/로그아웃 UI

**스키마 변경**:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tickets ADD COLUMN user_id TEXT REFERENCES users(id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
```

**구현 순서**:
1. `src/server/db/schema.ts` — users 테이블 정의
2. DB 마이그레이션 생성 및 실행
3. `app/api/auth/[...nextauth]/route.ts` — NextAuth 설정
4. `src/server/middleware/auth.ts` — 세션 검증 미들웨어
5. 전체 API 라우트에 사용자 필터 적용
6. `src/client/components/auth/LoginButton.tsx`

**필요 패키지**:
```json
{
  "next-auth": "^5.x"
}
```

**테스트 케이스**: TC-AUTH-001 ~ TC-AUTH-005

---

### 2.2 팀 / 멀티유저

**난이도**: HIGH | **예상 소요**: 5~6일 | **의존성**: 2.1 OAuth

팀 단위 보드 관리와 역할 기반 접근 제어(RBAC)를 구현한다.

**구현 범위**:
- `teams` 테이블 (id, name, owner_id, created_at)
- `team_members` 조인 테이블 (team_id, user_id, role: OWNER|MEMBER|VIEWER)
- tickets 테이블에 `team_id` 추가
- 팀 선택 UI, 멤버 초대/관리
- RBAC 미들웨어

**스키마 변경**:
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id INT REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER',
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE tickets ADD COLUMN team_id INT REFERENCES teams(id);
CREATE INDEX idx_tickets_team_id ON tickets(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

**구현 순서**:
1. DB 스키마 — teams, team_members
2. `src/server/services/teamService.ts` — 팀 CRUD
3. `src/server/services/permissionService.ts` — RBAC 검증
4. API: `/api/teams`, `/api/teams/:id/members`
5. 미들웨어: `checkTeamPermission()`
6. UI: TeamSelector, TeamMemberList, InviteModal

**테스트 케이스**: TC-TEAM-001 ~ TC-TEAM-010

---

### 2.3 라벨 / 태그

**난이도**: MEDIUM | **예상 소요**: 2~3일 | **의존성**: 2.1 OAuth

티켓에 색상 라벨을 붙여 분류할 수 있다.

**구현 범위**:
- `labels` 테이블 (id, name, color, team_id, created_at)
- `ticket_labels` M:N 조인 테이블 (ticket_id, label_id)
- Ticket 타입에 `labels: Label[]` 추가
- 라벨 필터링, 라벨 관리 UI

**스키마 변경**:
```sql
CREATE TABLE labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  team_id INT REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_labels (
  ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
  label_id INT REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, label_id)
);
```

**구현 순서**:
1. DB 스키마 — labels, ticket_labels
2. `src/server/services/labelService.ts`
3. API: `/api/labels`, `/api/tickets/:id/labels`
4. Ticket 타입 확장
5. UI: LabelSelector (멀티셀렉트), LabelBadge 컴포넌트
6. TicketCard에 라벨 뱃지 표시

**테스트 케이스**: TC-LABEL-001 ~ TC-LABEL-008

---

### 2.4 댓글

**난이도**: MEDIUM | **예상 소요**: 2~3일 | **의존성**: 2.1 OAuth

티켓에 텍스트 댓글을 작성하고 대화할 수 있다.

**구현 범위**:
- `comments` 테이블 (id, ticket_id, user_id, text, created_at, updated_at)
- REST API: POST/GET/DELETE `/api/tickets/:id/comments`
- TicketModal에 댓글 섹션 추가

**스키마 변경**:
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
```

**구현 순서**:
1. DB 스키마 — comments
2. `src/server/services/commentService.ts`
3. API: POST/GET/DELETE `/api/tickets/:id/comments`
4. UI: CommentsList, CommentForm
5. TicketModal에 "댓글" 탭 통합

**테스트 케이스**: TC-COMMENT-001 ~ TC-COMMENT-006

---

### 2.5 파일 첨부

**난이도**: MEDIUM | **예상 소요**: 2~3일 | **의존성**: 2.1 OAuth + 스토리지

티켓에 파일을 첨부하고 다운로드할 수 있다.

**구현 범위**:
- Vercel Blob (또는 AWS S3) 연동
- `attachments` 테이블 (id, ticket_id, url, name, size, created_by, created_at)
- 멀티파트 업로드 API
- 파일 미리보기/다운로드 UI

**구현 순서**:
1. Vercel Blob 설정 (.env에 API 키)
2. DB 스키마 — attachments
3. API: `POST /api/tickets/:id/attachments` (multipart/form-data)
4. `src/server/services/attachmentService.ts`
5. UI: AttachmentUploader, AttachmentList

**필요 패키지**:
```json
{
  "@vercel/blob": "^0.x"
}
```

**테스트 케이스**: TC-ATTACH-001 ~ TC-ATTACH-005

---

### 2.6 알림 / 리마인더

**난이도**: MEDIUM | **예상 소요**: 3~4일 | **의존성**: 2.1 OAuth

마감 초과, 댓글, 멘션 등의 이벤트를 알린다.

**구현 범위**:
- `notifications` 테이블 (id, user_id, type, text, ticket_id, read_at, created_at)
- Vercel Cron으로 매일 마감 초과 체크
- 이메일 알림 (Resend/SendGrid)
- 인앱 알림 벨 + 드롭다운

**구현 순서**:
1. DB 스키마 — notifications
2. `src/server/services/notificationService.ts`
3. `src/server/services/emailService.ts`
4. Vercel Cron: `src/server/jobs/overdueChecker.ts`
5. API: GET `/api/notifications`, PATCH `/api/notifications/:id/read`
6. UI: NotificationBell, NotificationDropdown

**필요 패키지**:
```json
{
  "resend": "^3.x"
}
```

**테스트 케이스**: TC-NOTIF-001 ~ TC-NOTIF-008

---

### 2.7 고급 검색 / 필터링

**난이도**: LOW | **예상 소요**: 1~2일 | **의존성**: 없음

현재 우선순위 필터(FR-008)를 확장해 다중 조건 검색을 지원한다.

**구현 범위**:
- `/api/tickets` 쿼리 파라미터 확장: `?search=`, `?priority=`, `?status=`, `?dueDate[gte]=`, `?label=`
- PostgreSQL `ILIKE`로 제목+설명 전문 검색
- 접이식 필터 패널 UI

**구현 순서**:
1. `src/shared/validations/ticket.ts` — ticketSearchSchema 추가
2. `ticketService.search()` — 동적 WHERE 조건
3. API: `GET /api/tickets` 쿼리 파라미터 처리
4. UI: FilterPanel 컴포넌트 (체크박스, 날짜 범위, 우선순위)
5. BoardContainer에 필터 상태 연동

**테스트 케이스**: TC-SEARCH-001 ~ TC-SEARCH-006

---

### 2.8 다크 모드

**난이도**: LOW | **예상 소요**: 1일 | **의존성**: 없음

시스템 설정 감지 및 수동 토글로 다크 테마를 지원한다.

**구현 범위**:
- `globals.css`에 `:root.dark` CSS 변수 추가
- `prefers-color-scheme` 미디어 쿼리 감지
- localStorage 기반 테마 저장
- 헤더에 토글 버튼

**구현 순서**:
1. `app/globals.css` — dark 테마 변수 정의
2. `src/client/components/ui/DarkModeToggle.tsx`
3. `src/client/contexts/ThemeProvider.tsx` + `useTheme()` 훅
4. `app/layout.tsx` — 초기 테마 로딩
5. `src/shared/design/colors.json` — dark 팔레트 추가

**테스트 케이스**: TC-THEME-001, TC-THEME-002

---

### 2.9 동적 컬럼 관리 (관리자)

**난이도**: MEDIUM | **예상 소요**: 2~3일 | **의존성**: 2.2 팀/RBAC

하드코딩된 4컬럼(BACKLOG/TODO/IN_PROGRESS/DONE)을 동적으로 관리한다.

**구현 범위**:
- `columns` 테이블 (id, team_id, name, position, created_at)
- TICKET_STATUS를 DB 기반으로 전환
- 관리자 페이지에서 컬럼 CRUD
- 드래그로 컬럼 순서 변경

**구현 순서**:
1. DB 스키마 — columns
2. `src/server/services/columnService.ts`
3. API: `/api/columns`, `/api/columns/:id`
4. ticketService 수정 — DB에서 컬럼 조회
5. UI: ColumnManager (관리자 전용, 드래그 리오더)

**테스트 케이스**: TC-ADMIN-001 ~ TC-ADMIN-006

---

## 3. UI/UX 개선 사항

현재 COMPONENT_SPEC과 DESIGN_SYSTEM에 정의되었으나 미구현된 항목이다.

### 3.1 반응형 레이아웃

**명세**: COMPONENT_SPEC §2.4, NFR-002

| 화면 | 너비 | 현재 상태 | 구현 내용 |
|------|------|----------|----------|
| 데스크톱 | 1024px+ | ✅ 구현됨 | 4컬럼 레이아웃 |
| 태블릿 | 768px | ❌ 미검증 | 2컬럼 그리드, BACKLOG 접기 |
| 모바일 | 360px | ❌ 미구현 | 단일 컬럼 + 탭 전환 |

**구현 방법**:
1. Tailwind 반응형 유틸리티 (sm:, md:, lg:) 적용
2. 모바일용 TabBar 컴포넌트 생성 (컬럼 전환)
3. 태블릿용 Board 레이아웃 미디어 쿼리 추가

**예상 소요**: 1~2일

---

### 3.2 접근성 (a11y)

**명세**: COMPONENT_SPEC §2.6, NFR-003

| 항목 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| 키보드 네비게이션 | ✅ 부분 | Skip-to-content 링크 추가 |
| 스크린 리더 | ✅ 부분 | `aria-live` 영역 추가 (상태 변경 시) |
| 색상 대비 | ⚠️ 미검증 | WCAG AA 기준 검증 필요 |
| @dnd-kit 키보드 | ✅ 구현됨 | — |

**구현 방법**:
1. 보드에 `aria-live="polite"` 추가 (티켓 이동 시 알림)
2. Skip-to-content 링크
3. axe DevTools로 자동 검증
4. 색상 토큰 대비율 검증 및 조정

**예상 소요**: 1~2일

---

### 3.3 모달 애니메이션 & 스크롤 잠금

**명세**: COMPONENT_SPEC §3, DESIGN_SYSTEM §6

| 항목 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| 모달 열기 애니메이션 | ❌ 없음 | fade-in + scale (300ms) |
| 모달 닫기 애니메이션 | ❌ 없음 | fade-out + scale-down (200ms) |
| 본문 스크롤 잠금 | ❌ 없음 | `overflow: hidden` 토글 |

**구현 방법**:
1. `Modal.tsx`에 `document.body.style.overflow` 토글
2. CSS @keyframes 또는 Tailwind `transition` 유틸리티
3. `useEffect`로 마운트/언마운트 시 정리

**예상 소요**: 0.5일

---

### 3.4 드래그 오버레이 시각 효과

**명세**: DESIGN_SYSTEM §6

드래그 중인 카드에 `rotate(3deg)` + `opacity: 0.5` + 강한 그림자를 적용한다.

**구현 방법**:
1. DragOverlay 내부 TicketCard에 `isDragging` 스타일 적용
2. CSS transform/opacity/box-shadow 추가

**예상 소요**: 0.5일

---

### 3.5 타입 내보내기 정리

**파일**: `src/shared/types/index.ts`

현재 `COLUMN_ORDER`, `COLUMN_LABELS`가 내보내지지 않아 컴포넌트에서 중복 정의하고 있다.

**수정**: shared/types에서 export, 컴포넌트에서 import로 통일

**예상 소요**: 0.5일

---

### 3.6 Validation 보강

**파일**: `src/shared/validations/ticket.ts`

`createTicketSchema`의 `plannedStartDate`에 날짜 형식 검증(regex)이 누락되어 있다. `dueDate`에는 있지만 `plannedStartDate`에는 없다.

```typescript
// 현재
plannedStartDate: z.string().optional(),

// 수정
plannedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
```

**예상 소요**: 0.5일

---

## 4. 테스트 커버리지 갭

### 4.1 누락된 API 테스트

**TC-API-003**: `GET /api/tickets/:id` 전용 테스트 파일 없음
- 단일 티켓 조회 성공
- isOverdue 필드 포함 검증
- 존재하지 않는 ID → 404

### 4.2 누락된 통합 테스트

**TC-INT-001**: 드래그 앤 드롭 E2E
- BACKLOG → TODO: startedAt 설정 검증
- IN_PROGRESS → DONE: complete API 사용 검증
- 같은 컬럼 내 리오더: position 계산 검증
- API 실패 시 UI 롤백 검증

**TC-INT-002**: 완료 → 삭제 플로우
- DONE 24시간 후 비가시성
- DONE 상태에서 삭제
- 보드 리페치 검증

### 4.3 반응형 컴포넌트 테스트

**TC-COMP-003 C003-3**: 뷰포트별 레이아웃
- 768px 태블릿 레이아웃
- 360px 모바일 탭 레이아웃
- `matchMedia()` 모킹 필요

---

## 5. 구현 우선순위 로드맵

### Phase 2A: 기반 다지기 (2주)

| 주차 | 작업 | 난이도 | 소요 |
|------|------|--------|------|
| 1주 | 테스트 커버리지 보강 (TC-API-003, TC-INT-*) | LOW | 2일 |
| 1주 | UI 개선 — 애니메이션, 스크롤 잠금, 드래그 효과 | LOW | 1일 |
| 1주 | 타입 내보내기 정리, Validation 보강 | LOW | 0.5일 |
| 2주 | 반응형 레이아웃 (모바일 + 태블릿) | MEDIUM | 2일 |
| 2주 | 접근성 개선 | LOW | 1.5일 |

### Phase 2B: 사용자 인증 (2주)

| 주차 | 작업 | 난이도 | 소요 |
|------|------|--------|------|
| 3주 | Google OAuth (Feature 2.1) | HIGH | 4~5일 |
| 4주 | 팀 / 멀티유저 (Feature 2.2) | HIGH | 5~6일 |

### Phase 2C: 협업 기능 (2주)

| 주차 | 작업 | 난이도 | 소요 |
|------|------|--------|------|
| 5주 | 라벨/태그 (Feature 2.3) | MEDIUM | 2~3일 |
| 5주 | 댓글 (Feature 2.4) | MEDIUM | 2~3일 |
| 6주 | 반응형 레이아웃 미세 조정 | LOW | 1일 |
| 6주 | 다크 모드 (Feature 2.8) | LOW | 1일 |

### Phase 2D: 고급 기능 (2주)

| 주차 | 작업 | 난이도 | 소요 |
|------|------|--------|------|
| 7주 | 파일 첨부 (Feature 2.5) | MEDIUM | 2~3일 |
| 7주 | 고급 검색/필터 (Feature 2.7) | LOW | 1~2일 |
| 8주 | 알림/리마인더 (Feature 2.6) | MEDIUM | 3~4일 |

### Phase 2E: 관리자 (1주)

| 주차 | 작업 | 난이도 | 소요 |
|------|------|--------|------|
| 9주 | 동적 컬럼 관리 (Feature 2.9) | MEDIUM | 2~3일 |
| 9주 | 성능 최적화 + 최종 문서화 | LOW | 2일 |

---

## 6. 외부 서비스 및 패키지

### 필요 외부 서비스

| 기능 | 서비스 | 비용 | 설정 소요 |
|------|--------|------|----------|
| OAuth | Google Cloud Console | 무료 | 0.5일 |
| 파일 저장 | Vercel Blob / AWS S3 | $0~5/월 | 0.5일 |
| 이메일 | Resend / SendGrid | $0~50/월 | 1일 |
| 실시간 (선택) | Socket.io / Pusher | $0~100/월 | 2~3일 |

### 추가 npm 패키지

```json
{
  "next-auth": "^5.x",         // OAuth 인증
  "resend": "^3.x",            // 이메일 발송
  "@vercel/blob": "^0.x"       // 파일 업로드 (선택)
}
```

기존 의존성과 호환 — 브레이킹 체인지 없음.

---

## 7. 위험 요소 및 대응

| 위험 | 영향 | 대응 방안 |
|------|------|----------|
| OAuth 세션 관리 복잡도 | 보안 취약점 | NextAuth.js v5 사용 (검증된 라이브러리) |
| 멀티테넌트 데이터 격리 | 데이터 유출 | 미들웨어 검증 + 정책 테스트 추가 |
| 기능 증가에 따른 성능 저하 | 응답 지연 | DB 인덱스 추가, 캐싱 레이어 도입 |
| 파일 업로드 용량 | 스토리지 비용 | 파일 크기 제한 (10MB), 이미지 리사이즈 |
| 스키마 마이그레이션 | 배포 장애 | forward-only 마이그레이션, 스테이징 검증 |

---

## 8. 성공 지표

Phase 2 완료 후 목표:

| 지표 | 현재 (MVP) | 목표 (Phase 2) |
|------|-----------|---------------|
| API p95 응답시간 | < 100ms | < 200ms |
| 테스트 커버리지 | ~85% | > 90% |
| 접근성 | 부분 준수 | WCAG AA |
| 모바일 Lighthouse | 미측정 | 90%+ |
| 지원 사용자 수 | 1명 | 팀 단위 (5~20명) |

---

## 부록 A: 전체 스키마 확장 (SQL)

```sql
-- ============================================
-- Phase 2B: 사용자 & 팀
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id INT REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'MEMBER',
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE tickets ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE tickets ADD COLUMN team_id INT REFERENCES teams(id);

-- ============================================
-- Phase 2C: 라벨 & 댓글
-- ============================================

CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  team_id INT REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_labels (
  ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
  label_id INT REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, label_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Phase 2D: 첨부 파일 & 알림
-- ============================================

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  size INT NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  ticket_id INT REFERENCES tickets(id) ON DELETE SET NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Phase 2E: 동적 컬럼
-- ============================================

CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  team_id INT REFERENCES teams(id),
  name VARCHAR(255) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_team_id ON tickets(team_id);
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_attachments_ticket ON attachments(ticket_id);
```

---

## 부록 B: 새로 생성할 컴포넌트 목록

```
Feature 2.1 (OAuth)
├── src/client/components/auth/LoginButton.tsx
└── src/client/components/auth/LogoutButton.tsx

Feature 2.2 (팀)
├── src/client/components/team/TeamSelector.tsx
├── src/client/components/team/TeamMemberList.tsx
├── src/client/components/team/InviteModal.tsx
└── src/client/components/team/RoleSelector.tsx

Feature 2.3 (라벨)
├── src/client/components/label/LabelSelector.tsx
├── src/client/components/label/LabelBadge.tsx
└── src/client/components/label/LabelManager.tsx

Feature 2.4 (댓글)
├── src/client/components/comment/CommentsList.tsx
└── src/client/components/comment/CommentForm.tsx

Feature 2.5 (첨부)
├── src/client/components/attachment/AttachmentUploader.tsx
└── src/client/components/attachment/AttachmentList.tsx

Feature 2.6 (알림)
├── src/client/components/notification/NotificationBell.tsx
└── src/client/components/notification/NotificationDropdown.tsx

UI 개선
├── src/client/components/ui/TabBar.tsx       (모바일 컬럼 전환)
├── src/client/components/ui/DarkModeToggle.tsx
├── src/client/components/ui/FilterPanel.tsx  (고급 검색)
└── src/client/components/admin/ColumnManager.tsx
```

---

## 부록 C: 새로 생성할 서비스 목록

```
src/server/services/
├── teamService.ts          (팀 CRUD)
├── permissionService.ts    (RBAC 검증)
├── labelService.ts         (라벨 CRUD)
├── commentService.ts       (댓글 CRUD)
├── attachmentService.ts    (파일 업로드/삭제)
├── notificationService.ts  (알림 생성/읽음)
├── emailService.ts         (이메일 발송)
├── columnService.ts        (동적 컬럼 관리)
└── jobs/
    └── overdueChecker.ts   (Vercel Cron)
```
