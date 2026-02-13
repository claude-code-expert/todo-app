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
