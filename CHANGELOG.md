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
- 타입 분리(shared vs server)로 프론트엔드 의존성 최소화

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
