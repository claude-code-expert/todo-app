# Tika Development Changelog

> 이 문서는 Tika 프로젝트의 개발 히스토리를 기록합니다.
> 각 엔트리는 프롬프트, 변경사항, 영향받은 파일을 포함합니다.

**변경 기록 형식:**
- 🎯 Prompt: 사용자 요청 또는 작업 설명
- ✅ Changes: 추가/수정/삭제된 내용
- 📊 Test Results: 테스트 실행 결과 (선택)
- 📁 Files Modified: 변경된 파일 목록 및 라인 수
- 🌿 Branches: 여러 브랜치에 적용된 경우 (선택)

---

## [main] - 2026-02-19 — 코드베이스 분석 및 엔터프라이즈 운영 가이드 작성

### 🎯 Prompts
1. "chapter7_monitoring_deployment.md 전체적으로 점검하고 현재 앱이 팀/회사용/SaaS 혹은 온프레미스 환경의 엔터프라이즈로 발전할 때 모니터링, 알림, 엔터프라이즈 환경 배포 등으로 발전해나갈때 적용할 내용으로 문서 다시 만들어 다 되면 docs 밑에 enterprise 폴더에 옮겨"
2. "코드베이스와 문서들을 분석해서 앞으로 확장해야 할 기능 리스트와 구체적인 구현 계획들을 리서치해서 정리해"

### ✅ Changes

**엔터프라이즈 운영 가이드 작성**
- **Added**: `docs/enterprise/operations-guide.md` — MVP→팀→SaaS→엔터프라이즈 운영 가이드 (10개 섹션)
  - 성장 단계별 운영 전략 개요 및 로드맵 테이블
  - Observability 3기둥 (Logs/Metrics/Traces) + Pino 구조화 로깅 + Prometheus 메트릭
  - SLI/SLO/SLA 프레임워크 + 에러 버짓 계산
  - 알림 설계 원칙 (P0~P3) + 온콜/인시던트 대응 + 런북 예시
  - CI/CD 성숙도 모델 (L0~L4) + GitHub Actions 고급 패턴 + DevSecOps
  - 배포 전략 (Rolling/Blue-Green/Canary) + Feature Flags + Forward-only 마이그레이션
  - Docker 프로덕션 최적화 + Kubernetes 매니페스트 + HPA/PDB
  - Terraform IaC (Vercel+Neon Provider) + GitOps (ArgoCD/Flux)
  - SaaS 멀티테넌트 (Row-level/Schema/DB-per-tenant) + Drizzle ORM 격리 패턴
  - 온프레미스 (Docker Compose 번들, Helm 차트, 에어갭) + RBAC/감사 로그 + SOC2/GDPR
  - 비용 최적화 + Serverless vs 상시 운영 비교
- **Removed**: `reference/docs/chapter7_monitoring_deployment.md` — 내용이 새 문서에 완전 흡수

**코드베이스 분석 — 확장 기능 리서치 결과**

> 아래는 PRD/TRD/REQUIREMENTS/API_SPEC/COMPONENT_SPEC/TEST_CASES/DATA_MODEL 문서와
> 실제 코드를 대조 분석한 결과다.

**[A] 현재 버그/스펙 불일치 (Critical)**

| # | 문제 | 파일 | 설명 |
|---|------|------|------|
| 1 | DONE→BACKLOG 이동 시 `startedAt` 미초기화 | `ticketService.ts` | API_SPEC 비즈니스 규칙 §7 위반 |
| 2 | `update()`/`complete()` 응답에 `isOverdue` 누락 | `ticketService.ts` | `toTicket()` 반환 → `toTicketWithMeta()` 필요 |
| 3 | 편집 폼에서 `createTicketSchema` 사용 | `TicketForm.tsx` | description/날짜 필드 null 클리어 불가 |

**[B] Phase 2 확장 기능 (PRD 2차 범위)**

| # | 기능 | 난이도 | 의존성 |
|---|------|--------|--------|
| 1 | Google OAuth 로그인 | 높음 | NextAuth + users 테이블 |
| 2 | 멀티 유저 / 팀 기능 | 높음 | OAuth 완료 후 |
| 3 | 라벨(태그) 시스템 | 중간 | labels 테이블 + M:N 관계 |
| 4 | 티켓 댓글 | 중간 | comments 테이블 + OAuth |
| 5 | 파일 첨부 | 중간 | S3/Vercel Blob + attachments 테이블 |
| 6 | 알림/리마인더 | 중간 | 크론잡 또는 Vercel Cron |
| 7 | 고급 검색/필터링 | 낮음 | API 쿼리 파라미터 확장 |
| 8 | 다크 모드 | 낮음 | CSS 변수 + Tailwind dark: |
| 9 | 칼럼 추가/삭제 (어드민) | 중간 | statuses 테이블 동적 관리 |

**[C] 스펙 대비 미구현/미완성**

| # | 항목 | 스펙 문서 | 현재 상태 |
|---|------|----------|----------|
| 1 | 반응형 레이아웃 (태블릿 2칼럼, 모바일 탭 전환) | COMPONENT_SPEC NFR-002 | 미구현 |
| 2 | 키보드 접근성 + 스크린리더 (aria-label, role) | COMPONENT_SPEC NFR-003 | 부분 구현 |
| 3 | Modal body scroll lock | COMPONENT_SPEC | 미구현 |
| 4 | Modal open/close 애니메이션 | COMPONENT_SPEC | 미구현 |
| 5 | DragOverlay `rotate(3deg)` + `opacity: 0.5` | DESIGN_SYSTEM | 미구현 |
| 6 | `COLUMN_ORDER`/`COLUMN_LABELS` shared 타입 export | 타입 일관성 | 컴포넌트에서 로컬 중복 |
| 7 | `plannedStartDate` Zod regex 검증 | API_SPEC | 누락 |
| 8 | `ReorderableStatus` 타입 export | 타입 일관성 | 미export |

**[D] 테스트 커버리지 갭**

| # | 항목 | 테스트 문서 ID | 현재 상태 |
|---|------|-------------|----------|
| 1 | TC-API-003 (003-1, 003-4): 단일 티켓 GET 성공 + isOverdue | TC-API-003 | 미작성 |
| 2 | TC-COMP-003: 반응형 레이아웃 테스트 | TC-COMP-003 | 미작성 |
| 3 | TC-INT-001~002: 통합 테스트 7개 (DnD 플로우, complete→delete) | TC-INT | 전체 미작성 |

### 📁 Files Modified
- `docs/enterprise/operations-guide.md` (+850 lines, 새 파일)
- `reference/docs/chapter7_monitoring_deployment.md` (삭제, -563 lines)

---

## [chapter7-deploy] - 2026-02-18 21:48

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `src/server/db/index.ts`

### 📁 Files Modified

- `src/server/db/index.ts` (+1, -1 lines)

---


## [chapter7-deploy] - 2026-02-18 21:40

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `tsconfig.json`

### 📁 Files Modified

- `tsconfig.json` (+35, -9 lines)

---


## [chapter7-deploy] - 2026-02-18 21:40

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `package-lock.json`
- **Modified**: `package.json`

### 📁 Files Modified

- `package-lock.json` (+40, -41 lines)
- `package.json` (+1, -1 lines)

---


## [chapter7-deploy] - 2026-02-18 21:29

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `.env.local.back`
- **Modified**: `src/server/db/index.ts`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `.env.local.back` (+3, -0 lines)
- `src/server/db/index.ts` (+17, -5 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter7-deploy] - 2026-02-18 21:19

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `app/page.tsx`

### 📁 Files Modified

- `app/page.tsx` (+2, -0 lines)

---


## [chapter6-frontend] - 2026-02-18 12:35

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `.DS_Store`
- **Modified**: `CLAUDE.md`
- **Modified**: `__tests__/api/tickets.test.ts`
- **Modified**: `app/globals.css`
- **Added**: `docs/DESIGN_SYSTEM.md`
- **Modified**: `package.json`
- **Modified**: `src/client/components/board/Board.tsx`
- **Modified**: `src/client/components/board/BoardContainer.tsx`
- **Modified**: `src/client/components/board/Column.tsx`
- **Added**: `src/shared/design/colors.json`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `.DS_Store` (+-, -- lines)
- `CLAUDE.md` (+9, -12 lines)
- `__tests__/api/tickets.test.ts` (+8, -2 lines)
- `app/globals.css` (+102, -42 lines)
- `docs/DESIGN_SYSTEM.md` (+63, -0 lines)
- `package.json` (+1, -1 lines)
- `src/client/components/board/Board.tsx` (+4, -1 lines)
- `src/client/components/board/BoardContainer.tsx` (+14, -14 lines)
- `src/client/components/board/Column.tsx` (+1, -1 lines)
- `src/shared/design/colors.json` (+36, -0 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase5] - 2026-02-17 20:42

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `__tests__/components/BoardContainer.test.tsx`
- **Added**: `__tests__/components/BoardHeader.test.tsx`
- **Added**: `__tests__/components/FilterBar.test.tsx`
- **Modified**: `app/page.tsx`
- **Deleted**: `app/preview/page.tsx`
- **Modified**: `docs/FRONTEND_TASKS.md`
- **Modified**: `src/client/components/board/Board.tsx`
- **Added**: `src/client/components/board/BoardContainer.tsx`
- **Added**: `src/client/components/board/BoardHeader.tsx`
- **Added**: `src/client/components/board/FilterBar.tsx`
- **Modified**: `src/client/components/ticket/TicketDetailView.tsx`
- **Modified**: `src/client/hooks/useTickets.ts`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `__tests__/components/BoardContainer.test.tsx` (+163, -0 lines)
- `__tests__/components/BoardHeader.test.tsx` (+44, -0 lines)
- `__tests__/components/FilterBar.test.tsx` (+68, -0 lines)
- `app/page.tsx` (+9, -9 lines)
- `app/preview/page.tsx` (+0, -169 lines)
- `docs/FRONTEND_TASKS.md` (+20, -20 lines)
- `src/client/components/board/Board.tsx` (+16, -3 lines)
- `src/client/components/board/BoardContainer.tsx` (+216, -0 lines)
- `src/client/components/board/BoardHeader.tsx` (+24, -0 lines)
- `src/client/components/board/FilterBar.tsx` (+36, -0 lines)
- `src/client/components/ticket/TicketDetailView.tsx` (+2, -2 lines)
- `src/client/hooks/useTickets.ts` (+58, -8 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase4] - 2026-02-17 19:54

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `__tests__/api/ticketApi.test.ts`
- **Added**: `__tests__/hooks/useTickets.test.ts`
- **Modified**: `docs/FRONTEND_TASKS.md`
- **Added**: `src/client/api/ticketApi.ts`
- **Added**: `src/client/hooks/useTickets.ts`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `__tests__/api/ticketApi.test.ts` (+206, -0 lines)
- `__tests__/hooks/useTickets.test.ts` (+221, -0 lines)
- `docs/FRONTEND_TASKS.md` (+17, -17 lines)
- `src/client/api/ticketApi.ts` (+66, -0 lines)
- `src/client/hooks/useTickets.ts` (+98, -0 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase3] - 2026-02-17 18:54

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `__tests__/components/Board.test.tsx`
- **Added**: `__tests__/components/TicketDetailView.test.tsx`
- **Added**: `__tests__/components/TicketForm.test.tsx`
- **Added**: `__tests__/components/TicketModal.test.tsx`
- **Modified**: `app/preview/page.tsx`
- **Modified**: `docs/FRONTEND_TASKS.md`
- **Modified**: `src/client/components/board/Board.tsx`
- **Added**: `src/client/components/ticket/TicketDetailView.tsx`
- **Added**: `src/client/components/ticket/TicketForm.tsx`
- **Added**: `src/client/components/ticket/TicketModal.tsx`
- **Modified**: `src/client/components/ui/Button.tsx`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `__tests__/components/Board.test.tsx` (+4, -0 lines)
- `__tests__/components/TicketDetailView.test.tsx` (+54, -0 lines)
- `__tests__/components/TicketForm.test.tsx` (+167, -0 lines)
- `__tests__/components/TicketModal.test.tsx` (+159, -0 lines)
- `app/preview/page.tsx` (+38, -2 lines)
- `docs/FRONTEND_TASKS.md` (+19, -19 lines)
- `src/client/components/board/Board.tsx` (+15, -2 lines)
- `src/client/components/ticket/TicketDetailView.tsx` (+42, -0 lines)
- `src/client/components/ticket/TicketForm.tsx` (+130, -0 lines)
- `src/client/components/ticket/TicketModal.tsx` (+64, -0 lines)
- `src/client/components/ui/Button.tsx` (+3, -0 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase2] - 2026-02-17 18:19

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `__tests__/components/Board.test.tsx`
- **Added**: `__tests__/components/Column.test.tsx`
- **Added**: `__tests__/components/ColumnHeader.test.tsx`
- **Added**: `__tests__/components/TicketCard.test.tsx`
- **Modified**: `app/preview/page.tsx`
- **Modified**: `docs/FRONTEND_TASKS.md`
- **Added**: `src/client/components/board/Board.tsx`
- **Added**: `src/client/components/board/Column.tsx`
- **Added**: `src/client/components/board/ColumnHeader.tsx`
- **Added**: `src/client/components/ticket/TicketCard.tsx`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `__tests__/components/Board.test.tsx` (+84, -0 lines)
- `__tests__/components/Column.test.tsx` (+127, -0 lines)
- `__tests__/components/ColumnHeader.test.tsx` (+29, -0 lines)
- `__tests__/components/TicketCard.test.tsx` (+106, -0 lines)
- `app/preview/page.tsx` (+29, -1 lines)
- `docs/FRONTEND_TASKS.md` (+44, -44 lines)
- `src/client/components/board/Board.tsx` (+46, -0 lines)
- `src/client/components/board/Column.tsx` (+39, -0 lines)
- `src/client/components/board/ColumnHeader.tsx` (+22, -0 lines)
- `src/client/components/ticket/TicketCard.tsx` (+73, -0 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase1] - 2026-02-17 17:51

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `__tests__/components/Button.test.tsx`
- **Added**: `__tests__/components/ConfirmDialog.test.tsx`
- **Added**: `__tests__/components/Modal.test.tsx`
- **Modified**: `app/globals.css`
- **Added**: `app/preview/page.tsx`
- **Modified**: `docs/FRONTEND_TASKS.md`
- **Modified**: `package-lock.json`
- **Modified**: `package.json`
- **Added**: `postcss.config.mjs`
- **Added**: `src/client/components/ui/Badge.tsx`
- **Added**: `src/client/components/ui/Button.tsx`
- **Added**: `src/client/components/ui/ConfirmDialog.tsx`
- **Added**: `src/client/components/ui/Modal.tsx`
- **Deleted**: `tailwind.config.ts`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `__tests__/components/Button.test.tsx` (+61, -0 lines)
- `__tests__/components/ConfirmDialog.test.tsx` (+71, -0 lines)
- `__tests__/components/Modal.test.tsx` (+60, -0 lines)
- `app/globals.css` (+1, -1 lines)
- `app/preview/page.tsx` (+105, -0 lines)
- `docs/FRONTEND_TASKS.md` (+144, -110 lines)
- `package-lock.json` (+624, -1 lines)
- `package.json` (+1, -0 lines)
- `postcss.config.mjs` (+8, -0 lines)
- `src/client/components/ui/Badge.tsx` (+37, -0 lines)
- `src/client/components/ui/Button.tsx` (+27, -0 lines)
- `src/client/components/ui/ConfirmDialog.tsx` (+34, -0 lines)
- `src/client/components/ui/Modal.tsx` (+32, -0 lines)
- `tailwind.config.ts` (+0, -14 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend-phase1] - 2026-02-17 17:51

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Deleted**: `.mcp.json`

### 📁 Files Modified

- `.mcp.json` (+0, -12 lines)

---


## [chapter6-frontend-phase1] - 2026-02-17 16:06

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `.gitignore`
- **Deleted**: `__tests__/api/ticketApi.test.ts`
- **Deleted**: `__tests__/components/Board.test.tsx`
- **Deleted**: `__tests__/components/BoardContainer.test.tsx`
- **Deleted**: `__tests__/components/BoardHeader.test.tsx`
- **Deleted**: `__tests__/components/Button.test.tsx`
- **Deleted**: `__tests__/components/Column.test.tsx`
- **Deleted**: `__tests__/components/ColumnHeader.test.tsx`
- **Deleted**: `__tests__/components/ConfirmDialog.test.tsx`
- **Deleted**: `__tests__/components/FilterBar.test.tsx`
- **Deleted**: `__tests__/components/Modal.test.tsx`
- **Deleted**: `__tests__/components/TicketCard.test.tsx`
- **Deleted**: `__tests__/components/TicketDetailView.test.tsx`
- **Deleted**: `__tests__/components/TicketForm.test.tsx`
- **Deleted**: `__tests__/components/TicketModal.test.tsx`
- **Deleted**: `__tests__/hooks/useTickets.test.ts`
- **Modified**: `app/page.tsx`
- **Deleted**: `src/client/api/ticketApi.ts`
- **Renamed**: `src/shared/types/.gitkeep	src/client/components/board/.gitkeep`
- **Deleted**: `src/client/components/board/Board.tsx`
- **Deleted**: `src/client/components/board/BoardContainer.tsx`
- **Deleted**: `src/client/components/board/BoardHeader.tsx`
- **Deleted**: `src/client/components/board/Column.tsx`
- **Deleted**: `src/client/components/board/ColumnHeader.tsx`
- **Deleted**: `src/client/components/board/FilterBar.tsx`
- **Renamed**: `src/shared/validations/.gitkeep	src/client/components/ticket/.gitkeep`
- **Deleted**: `src/client/components/ticket/TicketCard.tsx`
- **Deleted**: `src/client/components/ticket/TicketDetailView.tsx`
- **Deleted**: `src/client/components/ticket/TicketForm.tsx`
- **Deleted**: `src/client/components/ticket/TicketModal.tsx`
- **Added**: `src/client/components/ui/.gitkeep`
- **Deleted**: `src/client/components/ui/Badge.tsx`
- **Deleted**: `src/client/components/ui/Button.tsx`
- **Deleted**: `src/client/components/ui/ConfirmDialog.tsx`
- **Deleted**: `src/client/components/ui/Modal.tsx`
- **Deleted**: `src/client/hooks/useTickets.ts`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `.gitignore` (+3, -0 lines)
- `__tests__/api/ticketApi.test.ts` (+0, -182 lines)
- `__tests__/components/Board.test.tsx` (+0, -134 lines)
- `__tests__/components/BoardContainer.test.tsx` (+0, -158 lines)
- `__tests__/components/BoardHeader.test.tsx` (+0, -33 lines)
- `__tests__/components/Button.test.tsx` (+0, -86 lines)
- `__tests__/components/Column.test.tsx` (+0, -131 lines)
- `__tests__/components/ColumnHeader.test.tsx` (+0, -34 lines)
- `__tests__/components/ConfirmDialog.test.tsx` (+0, -65 lines)
- `__tests__/components/FilterBar.test.tsx` (+0, -60 lines)
- `__tests__/components/Modal.test.tsx` (+0, -81 lines)
- `__tests__/components/TicketCard.test.tsx` (+0, -180 lines)
- `__tests__/components/TicketDetailView.test.tsx` (+0, -71 lines)
- `__tests__/components/TicketForm.test.tsx` (+0, -117 lines)
- `__tests__/components/TicketModal.test.tsx` (+0, -118 lines)
- `__tests__/hooks/useTickets.test.ts` (+0, -251 lines)
- `app/page.tsx` (+8, -8 lines)
- `src/client/api/ticketApi.ts` (+0, -69 lines)
- `src/{shared/types` (+0, -0 lines)
- `src/client/components/board/Board.tsx` (+0, -42 lines)
- `src/client/components/board/BoardContainer.tsx` (+0, -145 lines)
- `src/client/components/board/BoardHeader.tsx` (+0, -24 lines)
- `src/client/components/board/Column.tsx` (+0, -46 lines)
- `src/client/components/board/ColumnHeader.tsx` (+0, -15 lines)
- `src/client/components/board/FilterBar.tsx` (+0, -32 lines)
- `src/{shared/validations` (+0, -0 lines)
- `src/client/components/ticket/TicketCard.tsx` (+0, -47 lines)
- `src/client/components/ticket/TicketDetailView.tsx` (+0, -35 lines)
- `src/client/components/ticket/TicketForm.tsx` (+0, -124 lines)
- `src/client/components/ticket/TicketModal.tsx` (+0, -55 lines)
- `src/client/components/ui/.gitkeep` (+0, -0 lines)
- `src/client/components/ui/Badge.tsx` (+0, -12 lines)
- `src/client/components/ui/Button.tsx` (+0, -29 lines)
- `src/client/components/ui/ConfirmDialog.tsx` (+0, -25 lines)
- `src/client/components/ui/Modal.tsx` (+0, -36 lines)
- `src/client/hooks/useTickets.ts` (+0, -100 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend] - 2026-02-16 18:35

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Renamed**: `docs/incidents/2026-02-13-changelog-skill-structure.md	docs/incidents/changelog-skill-structure-fix-report.md`
- **Modified**: `tsconfig.tsbuildinfo`

### 📁 Files Modified

- `docs/incidents/{2026-02-13-changelog-skill-structure.md` (+0, -0 lines)
- `tsconfig.tsbuildinfo` (+1, -1 lines)

---


## [chapter6-frontend] - 2026-02-14 (Phase 4-5 + 테스트 인프라 수정)

### 🎯 Prompts
1. "같은 방식으로 Phase 4 완료 후 → BoardHeader, FilterBar, BoardContainer, page.tsx (전체 조립)"
2. "이후 컴포넌트 작업이 남은게 있는지 검증해"
3. "타입에러 잡아"
4. "컴포넌트 계층 구조를 현재 구현한 버전으로 업데이트 해줘"
5. "npm test 시 에러가 나는데? — 서비스 테스트 실패 해결"
6. "현재 수정 사항과 테스트 실패케이스 픽스한거 문서에 업데이트 해주고 README.md도 현재 버전으로 업데이트 해"

### ✅ Changes

**Phase 4: 데이터 레이어 TDD**
- **Added**: `src/client/api/ticketApi.ts` — fetch 래퍼 (6개 API 함수 + handleResponse 에러 처리)
- **Added**: `src/client/hooks/useTickets.ts` — React Hook (board/isLoading/error 상태 + CRUD 액션)
- **Added**: `__tests__/api/ticketApi.test.ts` — 11 tests
- **Added**: `__tests__/hooks/useTickets.test.ts` — 10 tests

**Phase 5: 컨테이너 조립 TDD**
- **Added**: `src/client/components/board/BoardHeader.tsx` — 타이틀 + 새 업무 버튼
- **Added**: `src/client/components/board/FilterBar.tsx` — 이번주 업무/일정 초과 필터 토글
- **Added**: `src/client/components/board/BoardContainer.tsx` — 전체 보드 컨테이너 (필터, 모달, CRUD)
- **Modified**: `app/page.tsx` — async 서버 컴포넌트로 전환 (ticketService.getBoard → BoardContainer)
- **Added**: `__tests__/components/BoardHeader.test.tsx` — 4 tests
- **Added**: `__tests__/components/FilterBar.test.tsx` — 6 tests
- **Added**: `__tests__/components/BoardContainer.test.tsx` — 6 tests

**테스트 인프라 수정**
- **Fixed**: 서비스 테스트 8개 파일에 `@jest-environment node` 추가 (jsdom → node)
- **Fixed**: `package.json` — `--runInBand` 추가 (공유 DB 병렬 실행 race condition 해결)
- **Fixed**: `__tests__/components/TicketCard.test.tsx` — URGENT 타입 에러 제거

**문서 업데이트**
- **Modified**: `docs/COMPONENT_SPEC.md` §1 — 컴포넌트 계층 구조를 실제 구현 반영
- **Modified**: `docs/FRONTEND_TASKS.md` — Phase 4-5 완료 상태 업데이트
- **Modified**: `CLAUDE.md` — 테스트 환경 설정 가이드, Recent Changes 업데이트
- **Modified**: `README.md` — 현재 구현 현황 반영

### 📊 Test Results
- Total: **26 suites, 169/169 passed (100%)**
- 컴포넌트: 13 suites, 80 tests (Phase 1~5)
- 데이터 레이어: 2 suites, 21 tests (ticketApi + useTickets)
- 서비스/API: 11 suites, 68 tests
- `npx tsc --noEmit` 통과
- `npm run build` 성공

### 📁 Files Modified
- `src/client/api/ticketApi.ts` (+50 lines)
- `src/client/hooks/useTickets.ts` (+65 lines)
- `src/client/components/board/BoardHeader.tsx` (+20 lines)
- `src/client/components/board/FilterBar.tsx` (+32 lines)
- `src/client/components/board/BoardContainer.tsx` (+145 lines)
- `app/page.tsx` (+9, -3 lines)
- `__tests__/api/ticketApi.test.ts` (+120 lines)
- `__tests__/hooks/useTickets.test.ts` (+130 lines)
- `__tests__/components/BoardHeader.test.tsx` (+30 lines)
- `__tests__/components/FilterBar.test.tsx` (+60 lines)
- `__tests__/components/BoardContainer.test.tsx` (+158 lines)
- `__tests__/components/TicketCard.test.tsx` (-1 line)
- `__tests__/services/*.test.ts` (8 files, +2 lines each)
- `package.json` (+1, -1 lines)
- `docs/COMPONENT_SPEC.md` (+40, -28 lines)
- `docs/FRONTEND_TASKS.md` (+120, -60 lines)
- `CLAUDE.md` (+20 lines)

---

## [chapter6-frontend] - 2026-02-14

### 🎯 Prompts
1. "프런트엔드 컴포넌트 테스트를 위한 Jest 설정을 업데이트해줘"
2. "PRD.md와 COMPONENT_SPEC.md를 기반으로 프런트 개발에 필요한 컴포넌트와 파일들을 생성해줘"
3. "TEST_CASES.md의 TC-COMP-001 테스트 케이스를 React Testing Library 테스트 코드로 변환해줘 (C001-1~C001-3)"
4. "TicketCard 컴포넌트를 구현해줘 — 최소한의 구현으로 테스트만 통과하면 돼"
5. "TicketCard 컴포넌트를 리팩토링해줘 — 스타일 클래스 분리, 접근성, 키보드 네비게이션"
6. "추가 테스트 케이스 작성하고 구현해줘 (C001-4~C001-7) Red → Green → Refactor"
7. "컴포넌트 계층 구조 화면 구성 가능한지 검토해봐"
8. "구현 순서를 문서로 기록해서 순서대로 구현할 수 있도록 해"

### ✅ Changes
- **Added**: Jest 프런트엔드 테스트 인프라 (`jest.setup.ts`, `jest.config.ts`, `__mocks__/`)
- **Added**: TicketCard 컴포넌트 TDD 구현 (`src/client/components/ticket/TicketCard.tsx`)
- **Added**: Badge 컴포넌트 (PriorityBadge, DueDateBadge) (`src/client/components/ui/Badge.tsx`)
- **Added**: TicketCard 테스트 10개 — C001-1~C001-7 (`__tests__/components/TicketCard.test.tsx`)
- **Added**: 디자인 시스템 CSS — 토큰, 레이아웃, 컴포넌트 스타일 (`app/globals.css`)
- **Added**: 프런트엔드 구현 태스크 문서 (`docs/FRONTEND_TASKS.md`)
- **Modified**: COMPONENT_SPEC.md — FRONTEND_TASKS.md 참조 추가 (`docs/COMPONENT_SPEC.md`)

### 📊 Test Results
- TicketCard: 10/10 passed (100%) — TC-COMP-001 완료
- 기존 API/Service 테스트: 68/68 passed (영향 없음)

### 📁 Files Modified
- `__tests__/components/TicketCard.test.tsx` (+181 lines)
- `app/globals.css` (+603 lines)
- `docs/FRONTEND_TASKS.md` (+316 lines)
- `src/client/components/ticket/TicketCard.tsx` (+47 lines)
- `src/client/components/ui/Badge.tsx` (+12 lines)
- `jest.setup.ts` (+52, -6 lines)
- `jest.config.ts` (+4 lines)
- `__mocks__/styleMock.ts` (+1 line)
- `__mocks__/fileMock.ts` (+1 line)
- `docs/COMPONENT_SPEC.md` (+5, -1 lines)
- `package.json` (+5, -2 lines)

---

## [001-create-ticket-api] - 2026-02-14 19:37

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `.claude/skills/changelog/SKILL.md`

### 📁 Files Modified

- `.claude/skills/changelog/SKILL.md` (+18, -12 lines)

---


## [001-create-ticket-api] - 2026-02-14 17:23

### 🎯 Prompt
> "6개 API 엔드포인트 구현 및 TC-API-002~008 테스트 68개 통과"

### ✅ Changes

**Types & Validations (SDD Step 1-2)**
- **Added**: `TicketWithMeta`, `UpdateTicketInput`, `ReorderTicketInput`, `BoardData` 타입 (`src/shared/types/index.ts`)
- **Added**: `updateTicketSchema` — 부분 수정용 Zod 스키마 (모든 필드 optional)
- **Added**: `reorderTicketSchema` — 상태/순서 변경 Zod 스키마

**Services (SDD Step 3)**
- **Added**: `ticketService.getBoard()` — 전체 보드 조회 (Done 24h 필터, 4칼럼 그룹화, isOverdue 계산)
- **Added**: `ticketService.getById()` — 단일 티켓 조회 + isOverdue
- **Added**: `ticketService.update()` — 부분 수정 (title, description, priority, dates)
- **Added**: `ticketService.complete()` — 티켓 완료 처리 (status→DONE, completedAt, position 재계산)
- **Added**: `ticketService.remove()` — 하드 삭제
- **Added**: `ticketService.reorder()` — 트랜잭션 기반 상태/순서 변경 (startedAt/completedAt 비즈니스 규칙)
- **Added**: `toTicketWithMeta()` — isOverdue 계산 헬퍼

**Route Handlers (SDD Step 4)**
- **Added**: `GET /api/tickets` — 보드 조회 (`app/api/tickets/route.ts`)
- **Added**: `GET /api/tickets/:id` — 상세 조회 (`app/api/tickets/[id]/route.ts`)
- **Added**: `PATCH /api/tickets/:id` — 수정 (`app/api/tickets/[id]/route.ts`)
- **Added**: `DELETE /api/tickets/:id` — 삭제 (`app/api/tickets/[id]/route.ts`)
- **Added**: `PATCH /api/tickets/:id/complete` — 완료 (`app/api/tickets/[id]/complete/route.ts`)
- **Added**: `PATCH /api/tickets/reorder` — 순서 변경 (`app/api/tickets/reorder/route.ts`)

**Tests (TC-API-002 ~ TC-API-008)**
- **Added**: TC-API-002 보드 조회 테스트 8개 (`__tests__/services/ticketService.board.test.ts`)
- **Added**: TC-API-003 상세 조회 테스트 3개 (`__tests__/services/ticketService.getById.test.ts`)
- **Added**: TC-API-004 수정 테스트 8개 (`__tests__/services/ticketService.update.test.ts`)
- **Added**: TC-API-005 완료 테스트 5개 (`__tests__/services/ticketService.complete.test.ts`)
- **Added**: TC-API-006 삭제 테스트 2개 (`__tests__/services/ticketService.delete.test.ts`)
- **Added**: TC-API-007 순서 변경 테스트 10개 (`__tests__/services/ticketService.reorder.test.ts`)
- **Added**: TC-API-008 오버듀 테스트 7개 (`__tests__/services/ticketService.overdue.test.ts`)
- **Added**: Route Handler 검증 테스트 5개 (`__tests__/api/tickets-detail.test.ts`)
- **Added**: Reorder Route 검증 테스트 3개 (`__tests__/api/tickets-reorder.test.ts`)

**Seed Data**
- **Added**: `src/server/db/seed.ts` — 시드 데이터 (dotenv + dynamic import로 ESM 호이스팅 해결)

### 📊 Test Results
- Total: **68/68 passed (100%)** — 11 test suites
- Coverage: TC-API-001 ~ TC-API-008 전체 완료
- API 구현 현황: 7/7 엔드포인트 완료 (100%)

### 📁 Files Modified (17 files, +1,316 / -2 lines)
- `src/shared/types/index.ts` (+23, -0 lines)
- `src/shared/validations/ticket.ts` (+46, -1 lines)
- `src/server/services/ticketService.ts` (+224, -1 lines)
- `app/api/tickets/route.ts` (+18, -0 lines)
- `app/api/tickets/[id]/route.ts` (+120, -0 lines)
- `app/api/tickets/[id]/complete/route.ts` (+38, -0 lines)
- `app/api/tickets/reorder/route.ts` (+39, -0 lines)
- `src/server/db/seed.ts` (+22, -0 lines)
- `__tests__/api/tickets-detail.test.ts` (+81, -0 lines)
- `__tests__/api/tickets-reorder.test.ts` (+62, -0 lines)
- `__tests__/services/ticketService.board.test.ts` (+120, -0 lines)
- `__tests__/services/ticketService.complete.test.ts` (+62, -0 lines)
- `__tests__/services/ticketService.delete.test.ts` (+30, -0 lines)
- `__tests__/services/ticketService.getById.test.ts` (+55, -0 lines)
- `__tests__/services/ticketService.overdue.test.ts` (+115, -0 lines)
- `__tests__/services/ticketService.reorder.test.ts` (+163, -0 lines)
- `__tests__/services/ticketService.update.test.ts` (+98, -0 lines)

### 🔗 Commit
- `f826248` feat: 6개 API 엔드포인트 구현 및 테스트 (68 tests passed)

---


## [001-create-ticket-api] - 2026-02-14 13:15

### 🎯 Prompt
> "DB 스키마 구현 및 마이그레이션 실행, .env.local git 추적 해제, Context7 MCP 설정 문서 업데이트, Jest verbose 설정"

### ✅ Changes
- **Modified**: `drizzle.config.ts` - dotenv 추가로 `.env.local`에서 DATABASE_URL 로드
- **Modified**: `package.json` - `test` 스크립트에 `--verbose` 추가
- **Modified**: `docs/setup/context7-setup.md` - 로컬/호스팅 두 가지 설정 방법, `.env.local` 참조 불가 경고 추가
- **Removed**: `.env.local` git 추적 해제 (`git rm --cached`)
- **Applied**: `npm run db:migrate` - tickets 테이블 생성 완료 (12 columns, 3 indexes)

### 📁 Files Modified
- `drizzle.config.ts` (+3, -0 lines)
- `package.json` (+1, -1 lines)
- `docs/setup/context7-setup.md` (+47, -27 lines)
- `.env.local` (git 추적 해제)

---

## [001-create-ticket-api] - 2026-02-14 12:30

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `.env.local`

### 📁 Files Modified

- `.env.local` (+2, -2 lines)

---


## [001-create-ticket-api] - 2026-02-14 12:27

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Modified**: `.env.local`
- **Modified**: `docs/setup/context7-setup.md`

### 📁 Files Modified

- `.env.local` (+3, -0 lines)
- `docs/setup/context7-setup.md` (+47, -27 lines)

---


## [001-create-ticket-api] - 2026-02-14 02:13

### 🎯 Prompt
> See commit message

### ✅ Changes

- **Added**: `.specify/hooks/pre-commit`
- **Added**: `.specify/scripts/bash/install-hooks.sh`
- **Modified**: `CLAUDE.md`

### 📁 Files Modified

- `.specify/hooks/pre-commit` (+96, -0 lines)
- `.specify/scripts/bash/install-hooks.sh` (+47, -0 lines)
- `CLAUDE.md` (+10, -1 lines)

---


## [001-create-ticket-api] - 2026-02-14 01:49

### 🎯 Prompt
> "Changelog 스킬 인식 문제 해결, Documentation First 원칙 수립, 재발 방지 시스템 구축, Context7 MCP 통합"

### ✅ Changes
- **Fixed**: Changelog 스킬을 올바른 구조로 이동 (`.claude/skills/changelog/SKILL.md`)
- **Fixed**: Context7 MCP 인식 문제 해결 (`.env.local` vs 시스템 환경변수 차이)
- **Added**: Documentation First 원칙 (constitution.md Core Principle VII)
- **Added**: Incident Report (`docs/incidents/2026-02-13-changelog-skill-structure.md`)
- **Added**: 재발 방지 가이드라인 (`docs/guidelines/implementation-checklist.md`)
- **Added**: 가드레일 시스템 (`docs/guidelines/guardrails.md`)
- **Added**: Context7 MCP 설정 (`docs/setup/context7-setup.md`, `.mcp.json`)
- **Updated**: CLAUDE.md - `.claude/` 디렉토리 구조, MCP Servers 섹션, 금지사항 강화

### 📁 Files Modified (9 files, +1,818 / -2 lines)
- `.claude/skills/changelog/SKILL.md` (renamed from commands/, +3 -1)
- `.gitignore` (+1, .mcp.json 추가)
- `.specify/memory/constitution.md` (+10, Documentation First 원칙)
- `CHANGELOG.md` (+96, 정정 엔트리 및 참조 링크)
- `CLAUDE.md` (+65, .claude/ 구조 + MCP + 금지사항)
- `docs/guidelines/guardrails.md` (+537, 5단계 가드레일)
- `docs/guidelines/implementation-checklist.md` (+336, 6단계 체크리스트)
- `docs/incidents/2026-02-13-changelog-skill-structure.md` (+416, Incident Report)
- `docs/setup/context7-setup.md` (+356, Context7 설정 가이드)

### 🎓 Key Learnings
- **Skills 구조**: `.claude/skills/<name>/SKILL.md` (디렉토리 + SKILL.md) — 공식 문서 확인 필수
- **Commands vs Skills**: Commands는 레거시, Skills가 권장 (출처: https://code.claude.com/docs/skills.md)
- **MCP 환경변수**: `.env.local`은 Next.js 전용, MCP는 시스템 환경변수 또는 직접 입력 필요
- **Documentation First**: 추측 금지, 공식 문서 우선 원칙 수립

### 📚 References
- [Incident Report](docs/incidents/2026-02-13-changelog-skill-structure.md)
- Claude Code Skills: https://code.claude.com/docs/skills.md
- Context7 MCP: https://context7.com/docs/clients/claude-code

### 🔗 Commits (6)
- `14f9651` fix: Changelog 스킬 인식 문제 해결
- `4ab6ced` fix: Changelog를 올바른 skills 구조로 수정 + Documentation First 원칙 추가
- `6558655` docs: Changelog 스킬 구조 오해 Incident Report 추가
- `1a05404` docs: 재발 방지 가이드라인 및 가드레일 시스템 추가
- `75d3cbe` feat: Context7 MCP 추가 - Documentation First 원칙 자동화
- `c636638` chore: .mcp.json을 .gitignore에 추가 (API 키 보호)

---

## [001-create-ticket-api] - 2026-02-14 01:18

### 🎯 Prompt
> "changelog 스킬을 올바른 skills 구조로 수정 + 공식 문서 우선 참조 원칙 추가"

### ✅ Changes
- **Fixed**: Changelog를 올바른 skills 구조로 이동 (`.claude/skills/changelog/SKILL.md`)
- **Fixed**: YAML frontmatter 개선 (name, user-invocable 추가, invoke_pattern 제거)
- **Added**: constitution.md에 "Documentation First" 원칙 추가 (Core Principle VII)
- **Updated**: CLAUDE.md에 문서 참조 원칙 및 `.claude/` 디렉토리 구조 가이드 추가
- **Corrected**: 이전 두 엔트리(23:44, 23:19)의 잘못된 정보 정정

### 📁 Files Modified
- `.claude/skills/changelog/SKILL.md` (새 위치, frontmatter 개선)
- `.claude/commands/changelog.md` (삭제 예정)
- `.specify/memory/constitution.md` (+9 lines, Documentation First 원칙)
- `CLAUDE.md` (+30 lines, 금지사항 및 .claude/ 구조 문서화)
- `CHANGELOG.md` (this entry)

### 🎓 Key Learnings (CORRECTED)
- **⚠️ 이전 이해 정정**: `.claude/skills/`는 **공식적으로 지원됨** (이전 엔트리의 "미지원"은 오류)
- **올바른 Skills 구조**: `.claude/skills/<name>/SKILL.md` (디렉토리 + SKILL.md)
- **잘못된 구조**: `.claude/skills/changelog.md` (단일 파일, 인식 안 됨)
- **공식 문서 우선**: 추측하지 말고 https://code.claude.com/docs 필수 참조
- **Commands vs Skills**:
  - Commands (`.claude/commands/*.md`): 레거시 형식, 단순 파일, 여전히 작동
  - Skills (`.claude/skills/*/SKILL.md`): 권장 형식, 디렉토리 + 지원 파일 + 고급 기능

### 📚 References
- Claude Code Skills Documentation: https://code.claude.com/docs/skills.md
- Claude Code Plugins Reference: https://code.claude.com/docs/plugins-reference.md
- **Incident Report**: [docs/incidents/2026-02-13-changelog-skill-structure.md](docs/incidents/2026-02-13-changelog-skill-structure.md)

---

## [001-create-ticket-api] - 2026-02-13 23:44

### ⚠️ CORRECTION
> 이 엔트리의 "Key Learnings"는 **잘못된 정보**입니다.
> 올바른 정보는 2026-02-14 01:18 엔트리 참조.

### 🎯 Prompt
> "changelog 스킬 인식 문제 해결 - .claude/commands/로 재이동"

### ✅ Changes
- **Moved**: `changelog.md`를 `.claude/skills/`에서 `.claude/commands/`로 재이동
- **Removed**: `.claude/skills/` 디렉토리 삭제

### 📁 Files Modified
- `.claude/commands/changelog.md` (moved back from skills/)
- `.claude/skills/` (directory removed)

### ~~🎓 Key Learnings~~ (❌ 잘못된 정보)
- ~~Claude Code는 `.claude/commands/` 디렉토리만 스킬로 인식~~
- ~~`.claude/skills/` 디렉토리는 아직 공식적으로 지원되지 않음~~
- ~~모든 스킬/커맨드는 `.claude/commands/`에 위치해야 함~~

---

## [001-create-ticket-api] - 2026-02-13 23:19

### ⚠️ CORRECTION
> 이 엔트리의 접근 방식은 올바랐으나 구조가 잘못되었습니다.
> `.claude/skills/changelog.md` (X) → `.claude/skills/changelog/SKILL.md` (O)

### 🎯 Prompt
> "Changelog skill을 .claude/skills/로 분리"

### ✅ Changes
- **Added**: `.claude/skills/` 디렉토리 생성
- **Moved**: `changelog.md`를 `.claude/commands/`에서 `.claude/skills/`로 이동 (잘못된 구조)
- **Kept**: `speckit.*` 파일들은 `.claude/commands/`에 유지

---

## [001-create-ticket-api] - 2026-02-13 23:44

### 🎯 Prompt
> "changelog 스킬 인식 문제 해결 - .claude/commands/로 재이동"

### ✅ Changes
- **Fixed**: Changelog 스킬 인식 문제 해결
- **Moved**: `changelog.md`를 `.claude/skills/`에서 `.claude/commands/`로 재이동
- **Removed**: `.claude/skills/` 디렉토리 삭제 (Claude Code가 인식하지 못함)

### 📁 Files Modified
- `.claude/commands/changelog.md` (moved back from skills/)
- `.claude/skills/` (directory removed)

### 🎓 Key Learnings
- Claude Code는 `.claude/commands/` 디렉토리만 스킬로 인식
- `.claude/skills/` 디렉토리는 아직 공식적으로 지원되지 않음
- 모든 스킬/커맨드는 `.claude/commands/`에 위치해야 함

---

## [001-create-ticket-api] - 2026-02-13 23:19

### 🎯 Prompt
> "Changelog skill을 .claude/skills/로 분리"

### ✅ Changes
- **Added**: `.claude/skills/` 디렉토리 생성
- **Moved**: `changelog.md`를 `.claude/commands/`에서 `.claude/skills/`로 이동
- **Kept**: `speckit.*` 파일들은 `.claude/commands/`에 유지

### 📁 Files Modified
- `.claude/skills/changelog.md` (moved from commands/)
- `.claude/commands/speckit.*.md` (10개 파일, 위치 유지)

### 🎓 Key Learnings
- `.claude/skills/` - Custom skills (changelog 등)
- `.claude/commands/` - Speckit commands (speckit.* 등)
- 역할에 따른 명확한 디렉토리 분리

---

## [001-create-ticket-api] - 2026-02-13 22:53

### 🎯 Prompt
> "Speckit 워크플로우 통합 및 에러 처리 시스템 구축"

### ✅ Changes
- **Added**: Speckit 워크플로우 문서 세트 (`specs/001-create-ticket-api/`)
  - `spec.md` - 기능 명세
  - `plan.md` - 구현 계획
  - `tasks.md` - 작업 목록
  - `data-model.md` - 데이터 모델
  - `research.md` - 사전 조사
  - `quickstart.md` - 빠른 시작 가이드
  - `checklists/`, `contracts/` - 체크리스트 및 계약
- **Added**: 공유 에러 시스템 (`src/shared/errors/`)
  - `TicketNotFoundError` - 티켓 미존재 에러
  - `ValidationError` - 검증 에러
- **Added**: 서비스 레이어 타입 정의 (`src/server/db/types.ts`)
- **Added**: 서비스 export 정리 (`src/server/services/index.ts`)
- **Added**: 서비스 단위 테스트 (`__tests__/services/ticketService.test.ts`)
- **Modified**: `ticketService.ts` - 에러 처리 개선 및 비즈니스 로직 강화
- **Modified**: `app/api/tickets/route.ts` - 통일된 에러 응답 형식 적용
- **Modified**: `__tests__/api/tickets.test.ts` - 추가 통합 테스트 케이스
- **Modified**: `.specify/memory/constitution.md` - Speckit 워크플로우 가이드 추가
- **Modified**: Environment files (`.env.example`, `.env.local`, `.env.test`) - DB 설정 업데이트
- **Modified**: `jest.setup.ts` - 통합 테스트를 위한 mock 제거

### 📊 Architecture
- **Layer Separation**: API Route → Service → DB 계층 분리 완료
- **Error Handling**: 중앙화된 에러 시스템 도입
- **Type Safety**: 서버 전용 타입과 공유 타입 분리
- **Documentation**: Speckit 기반 체계적 명세 관리

### 📁 Files Modified
- `specs/001-create-ticket-api/` (새 디렉토리, ~90KB 문서)
- `src/shared/errors/index.ts` (+13, -0 lines)
- `src/server/db/types.ts` (+20, -0 lines) [new]
- `src/server/services/index.ts` (+5, -0 lines) [new]
- `src/server/services/ticketService.ts` (+71, -42 lines)
- `app/api/tickets/route.ts` (+43, -? lines)
- `__tests__/api/tickets.test.ts` (+89, -0 lines)
- `__tests__/services/ticketService.test.ts` (+150, -0 lines) [new]
- `.specify/memory/constitution.md` (+3, -0 lines)
- `.env.example` (+5, -1 lines)
- `.env.local` (+2, -1 lines)
- `.env.test` (+2, -1 lines)
- `jest.setup.ts` (+3, -1 lines)

### 🎓 Key Learnings
- Speckit 워크플로우는 구현 전 명세를 체계화하는 데 효과적
- 에러 처리를 중앙화하면 일관된 API 응답 제공 가능
- 서비스 레이어 분리로 테스트 가능성 향상
- 타입 분리(shared vs server)로 프런트엔드 의존성 최소화

---

## [chapter5.1-init] - 2026-02-13 17:00

### 🎯 Prompt
> "Changelog 시스템 구현 - 변경사항 추적 자동화"

### ✅ Changes
- **Added**: Changelog skill definition (`.claude/commands/changelog.md`)
- **Added**: Helper script for changelog generation (`.specify/scripts/bash/generate-changelog.sh`)
- **Added**: CHANGELOG.md template at project root
- **Modified**: CLAUDE.md - Added "Recent Changes" section

### 📁 Files Modified
- `.claude/commands/changelog.md` (+450, -0 lines)
- `.specify/scripts/bash/generate-changelog.sh` (+250, -0 lines)
- `CHANGELOG.md` (+30, -0 lines)
- `CLAUDE.md` (+20, -0 lines)

---

## [chapter5.1-init] - 2026-02-13 16:45

### 🎯 Prompt
> "TC-API-001의 누락된 5개 테스트를 추가해줘"

### ✅ Changes
- **Added**: 빈 제목 검증 테스트 (`__tests__/api/tickets.test.ts:95`)
- **Added**: 공백만 제목 검증 테스트 (`__tests__/api/tickets.test.ts:113`)
- **Added**: 설명 1000자 초과 검증 테스트 (`__tests__/api/tickets.test.ts:149`)
- **Added**: position 자동 할당 검증 테스트 (`__tests__/api/tickets.test.ts:208`)
- **Added**: startedAt/completedAt 초기값 검증 테스트 (`__tests__/api/tickets.test.ts:224`)

### 📊 Test Results
- Total: 11/11 passed (100%)
- Coverage: TC-API-001 완료

### 📁 Files Modified
- `__tests__/api/tickets.test.ts` (+85, -0 lines)

---

## [chapter5.1-init] - 2026-02-13 10:15

### 🎯 Prompt
> ".env 파일들을 3개 브랜치(chapter4.4.5, chapter5.1-SDD, chapter5.1-init)에 푸시"

### ✅ Changes
- **Modified**: `.env.local` - DB 인증 정보 추가
- **Modified**: `.env.test` - DB 인증 정보 추가
- **Added**: `.env.example` - 템플릿 생성
- **Modified**: `jest.setup.ts` - ticketService mock 제거 (chapter5.1-init만)

### 🌿 Branches Updated
- `chapter4.4.5` (commit: a825f9c)
- `chapter5.1-SDD` (commit: 2988021)
- `chapter5.1-init` (commit: f6e7609, c512b3c)

### 📁 Files Modified
- `.env.local` (+1, -1 lines)
- `.env.test` (+1, -1 lines)
- `.env.example` (+4, -0 lines)
- `jest.setup.ts` (+3, -1 lines)

---

<!-- 이전 엔트리들은 여기에 계속 추가됩니다 -->
