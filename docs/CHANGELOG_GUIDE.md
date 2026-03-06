# Changelog 자동화 시스템 가이드

이 문서는 Claude Code Skills 기반 changelog 자동화 시스템의 설정, 사용법, 특징, 새 프로젝트 적용 방법을 다룬다.

## 개요

Tika 프로젝트의 changelog 시스템은 **3개 컴포넌트**로 구성된다:

| 컴포넌트 | 경로 | 역할 |
|----------|------|------|
| **Skill** | `.claude/skills/changelog/SKILL.md` | `/changelog` 슬래시 명령어 (수동 기록) |
| **Pre-commit Hook** | `.specify/hooks/pre-commit` | 커밋 시 자동 기록 |
| **Helper Script** | `.specify/scripts/bash/generate-changelog.sh` | git diff 파싱 유틸리티 |

기록 대상 파일은 프로젝트 루트의 `CHANGELOG.md`이며, 최신 엔트리가 상단에 위치하는 역순 정렬을 따른다.

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│  사용자                                          │
│                                                  │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │ /changelog   │       │ git commit       │    │
│  │ (수동 실행)   │       │ (자동 트리거)     │    │
│  └──────┬───────┘       └────────┬─────────┘    │
│         │                        │               │
│         ▼                        ▼               │
│  ┌──────────────┐       ┌──────────────────┐    │
│  │ SKILL.md     │       │ pre-commit hook  │    │
│  │ (Claude AI)  │       │ (bash script)    │    │
│  └──────┬───────┘       └────────┬─────────┘    │
│         │                        │               │
│         │  ┌──────────────────┐  │               │
│         └─►│  CHANGELOG.md   │◄─┘               │
│            └──────────────────┘                  │
└─────────────────────────────────────────────────┘
```

**두 경로의 차이:**

| | `/changelog` (Skill) | Pre-commit Hook |
|---|---|---|
| 트리거 | 사용자가 수동 실행 | `git commit` 시 자동 |
| 프롬프트 기록 | 세션의 전체 사용자 프롬프트 수집 | `> See commit message` (커밋 메시지 참조) |
| 변경 내용 | AI가 맥락을 파악해 서술형으로 작성 | git diff 기반 기계적 목록 |
| 테스트 결과 | 포함 가능 | 미포함 |
| 중복 방지 | CHANGELOG.md가 이미 staged면 hook 스킵 | CHANGELOG.md가 이미 staged면 자체 스킵 |

## 설정 방법

### 1. Skill 등록

`.claude/skills/changelog/SKILL.md` 파일이 존재하면 Claude Code가 자동으로 `/changelog`를 슬래시 명령어로 등록한다.

핵심은 YAML frontmatter의 `user-invocable: true` 속성이다:

```yaml
---
name: changelog
description: Record current session changes to CHANGELOG.md
user-invocable: true
---
```

> **Skills vs Commands**: `.claude/commands/*.md`(레거시)와 `.claude/skills/*/SKILL.md`(권장) 모두 슬래시 명령어를 등록할 수 있다. Skills는 디렉토리 구조, handoffs, description 등 추가 메타데이터를 지원한다.

### 2. Pre-commit Hook 설치

```bash
bash .specify/scripts/bash/install-hooks.sh
```

이 스크립트는 `.specify/hooks/pre-commit`을 `.git/hooks/pre-commit`으로 심볼릭 링크한다.

**제거:**
```bash
rm .git/hooks/pre-commit
```

### 3. CHANGELOG.md 초기화

파일이 없으면 첫 커밋 또는 `/changelog` 실행 시 자동 생성된다. 수동으로 만들려면:

```markdown
# 프로젝트명 Development Changelog

> 이 문서는 프로젝트의 개발 히스토리를 기록합니다.
> 각 엔트리는 프롬프트, 변경사항, 영향받은 파일을 포함합니다.

---
```

## 사용법

### 수동 기록: `/changelog`

Claude Code 세션에서 작업 후 슬래시 명령어로 실행한다:

```bash
/changelog "변경 내용 요약"
```

**예시:**
```bash
/changelog "TC-API-001 테스트 5개 추가"
/changelog "DB 설정 파일 업데이트"
/changelog "티켓 생성 API 구현 완료"
```

**실행 흐름:**
1. 인자 파싱 (요약 텍스트)
2. `git diff`, `git branch` 등으로 현재 상태 분석
3. 세션의 사용자 프롬프트를 대화 컨텍스트에서 추출
4. 마크다운 엔트리 생성
5. CHANGELOG.md 최상단에 삽입
6. 사용자에게 결과 보여주고 staging 여부 확인

### 자동 기록: Pre-commit Hook

별도 조작 없이 `git commit` 실행 시 자동으로 동작한다:

```bash
git add src/server/services/ticketService.ts
git commit -m "feat: 티켓 완료 처리 로직 추가"
# → CHANGELOG.md가 자동 업데이트되어 함께 커밋됨
```

**Hook 동작 흐름:**
1. CHANGELOG.md가 이미 staged인지 확인 → staged면 스킵 (중복 방지)
2. staged 파일이 없으면 스킵
3. 브랜치명, 날짜/시간 수집
4. `git diff --cached`로 변경 파일과 라인 수 수집
5. 엔트리를 CHANGELOG.md 첫 번째 `---` 구분선 뒤에 삽입
6. CHANGELOG.md를 `git add`로 staging에 추가

### Helper Script 직접 사용

```bash
# 기본 출력 (마크다운)
bash .specify/scripts/bash/generate-changelog.sh "변경 요약"

# JSON 출력
bash .specify/scripts/bash/generate-changelog.sh "변경 요약" --json
```

## 엔트리 형식

### `/changelog` 실행 시 (상세)

```markdown
## [브랜치명] - YYYY-MM-DD HH:MM

### 🎯 Prompts
1. "첫 번째 사용자 프롬프트 원문"
2. "두 번째 사용자 프롬프트 원문"

### ✅ Changes
- **Added**: 새 기능 설명 (`파일경로`)
- **Modified**: 수정 내용 (`파일경로`)
- **Fixed**: 버그 수정 내용 (`파일경로`)

### 📊 Test Results (선택)
- Total: X/Y passed (Z%)

### 📁 Files Modified
- `경로/파일1.ts` (+10, -2 lines)
- `경로/파일2.ts` (+5, -1 lines)

### 🌿 Branches (멀티 브랜치 작업 시)
- `브랜치1` (commit: abc1234)

---
```

### Pre-commit Hook 실행 시 (간략)

```markdown
## [브랜치명] - YYYY-MM-DD HH:MM

### 🎯 Prompt
> See commit message

### ✅ Changes
- **Added**: `src/new-file.ts`
- **Modified**: `src/existing-file.ts`

### 📁 Files Modified
- `src/new-file.ts` (+50, -0 lines)
- `src/existing-file.ts` (+3, -1 lines)

---
```

## 특징

### 중복 방지 메커니즘

`/changelog`를 먼저 실행하고 커밋하면 CHANGELOG.md가 이미 staged 상태이므로, pre-commit hook이 자동으로 스킵된다. 두 경로가 충돌하지 않는다.

### 프롬프트 수집 규칙 (`/changelog` 전용)

- 모든 사용자 프롬프트를 시간순으로 수집
- `/changelog` 자체 등 슬래시 커맨드는 제외
- 짧은 확인 응답("ㅇㅇ", "ㄱㄱ", "yes" 등)은 제외
- IDE 선택 컨텍스트(@파일명)는 포함

### 에러 핸들링

| 상황 | 동작 |
|------|------|
| git 저장소가 아님 | 에러 메시지 출력 |
| 변경사항 없음 | 경고 표시, 스킵 |
| 요약 200자 초과 | 경고 |
| Merge conflict | 수동 해결 요청 |
| Detached HEAD | 경고 표시 (브랜치명 대신 "detached") |

### Handoffs (`/changelog` 전용)

Skill 실행 후 다음 작업을 제안한다:
- 테스트 실행 (`npm run test`)
- 커밋 생성 (`git commit`)
- 전체 커밋 (코드 + changelog 함께)

## 새 프로젝트에 적용하기

### 최소 구성 (Skill만)

Claude Code가 설치된 프로젝트에서 Skill 파일 하나만 만들면 된다:

```
your-project/
└── .claude/
    └── skills/
        └── changelog/
            └── SKILL.md
```

**SKILL.md 템플릿:**

```yaml
---
name: changelog
description: Record current session changes to CHANGELOG.md
user-invocable: true
---

# Changelog Recording Skill

## Purpose
현재 세션의 변경사항을 CHANGELOG.md에 기록한다.

## Usage
/changelog "변경 내용 요약"

## Workflow

### 1. Parse Arguments
사용자가 제공한 변경 요약을 파싱한다.

### 2. Analyze Current Session
git diff, git branch 등으로 현재 상태를 분석한다.

### 3. Generate Entry
다음 형식으로 엔트리를 생성한다:

## [브랜치명] - YYYY-MM-DD HH:MM

### Changes
- **Added/Modified/Fixed/Removed**: 변경 내용 (`파일경로`)

### Files Modified
- `파일경로` (+N, -M lines)

---

### 4. Update CHANGELOG.md
새 엔트리를 최상단에 추가한다.
```

이것만으로 `/changelog` 슬래시 명령어가 동작한다.

### 전체 구성 (Skill + Hook + Script)

자동 기록까지 원하면 3개 파일을 추가한다:

```
your-project/
├── .claude/
│   └── skills/
│       └── changelog/
│           └── SKILL.md          # 슬래시 명령어
├── .specify/                      # (디렉토리명은 자유)
│   ├── hooks/
│   │   └── pre-commit            # 커밋 시 자동 기록
│   └── scripts/
│       └── bash/
│           ├── generate-changelog.sh   # git diff 파싱 유틸
│           └── install-hooks.sh        # hook 설치 스크립트
└── CHANGELOG.md                   # 기록 파일
```

**적용 순서:**

1. 위 3개 파일을 프로젝트에 복사
2. `pre-commit` 스크립트의 CHANGELOG 헤더 텍스트를 프로젝트에 맞게 수정
3. Hook 설치: `bash .specify/scripts/bash/install-hooks.sh`
4. CLAUDE.md에 관련 섹션 추가 (선택)

### 커스터마이징 포인트

| 항목 | 파일 | 수정 위치 |
|------|------|----------|
| 엔트리 형식 | `SKILL.md` | Workflow > Generate Entry 섹션 |
| 자동 기록 형식 | `pre-commit` | 엔트리 생성 부분 (62~76행) |
| 헤더 텍스트 | `pre-commit` | CHANGELOG 초기화 부분 (49~59행) |
| 변경 타입 분류 | `generate-changelog.sh` | `determine_change_type()` 함수 |
| JSON 출력 형식 | `generate-changelog.sh` | `format_json_output()` 함수 |

### 주의사항

- **Skills 디렉토리 구조**: 반드시 `.claude/skills/<name>/SKILL.md` 형태여야 한다. `.claude/skills/changelog.md`처럼 단일 파일로 두면 인식되지 않는다.
- **YAML frontmatter 필수**: `name`, `description`, `user-invocable: true`가 없으면 슬래시 명령어로 등록되지 않는다.
- **Hook 실행 권한**: `pre-commit` 파일에 실행 권한이 필요하다 (`chmod +x`). `install-hooks.sh`가 심볼릭 링크를 사용하므로 원본 파일에 권한이 있으면 된다.
- **CHANGELOG.md 충돌**: 여러 브랜치에서 작업 후 머지할 때 CHANGELOG.md 충돌이 발생할 수 있다. 최상단 삽입 방식이므로 대부분 자동 해결되지만, 동일 위치에 삽입된 경우 수동 해결이 필요하다.
