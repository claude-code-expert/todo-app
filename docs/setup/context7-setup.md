# Context7 MCP 설정 가이드

> **목적**: Documentation First 원칙을 자동화하는 MCP 서버 설정

---

## 📖 Context7이란?

Context7은 **최신 공식 문서를 실시간으로 Claude Code에 주입**하는 MCP(Model Context Protocol) 서버입니다.

### 주요 기능

- **실시간 문서 Fetch**: 공식 소스에서 최신 문서를 직접 가져옴
- **할루시네이션 방지**: 훈련 데이터가 아닌 실제 공식 문서 참조
- **버전별 정확성**: Drizzle 0.38.x, React 19 등 정확한 버전 API 제공
- **자동 갱신**: 공식 문서 업데이트 시 자동 반영

---

## 🎯 왜 필요한가?

### 해결하는 문제

| Before (Context7 없음) | After (Context7 사용) |
|------------------------|----------------------|
| ❌ 추측으로 구현 → 실패 → 재작업 | ✅ 공식 문서 자동 참조 → 첫 시도 성공 |
| ❌ "아마도 이렇게 하면..."  | ✅ "공식 문서에 따르면..." |
| ❌ 오래된 API 사용 | ✅ 최신 버전 API 자동 제공 |
| ❌ 잘못된 정보 문서화 | ✅ 검증된 정보만 사용 |

### Tika 프로젝트 적용 사례

```bash
# Case 1: Drizzle ORM 마이그레이션
Before: "Drizzle에서 마이그레이션 어떻게 하지?" (추측)
After:  "use context7 to show Drizzle 0.38.x migration syntax" (정확)

# Case 2: Zod 검증
Before: "Zod에서 이렇게 하면 되겠지?" (할루시네이션 위험)
After:  "use context7 to validate nested objects with Zod" (공식 예제)

# Case 3: Next.js 15 App Router
Before: "App Router에서 캐싱은 이렇게..." (틀릴 수 있음)
After:  "use context7 with @vercel/next for caching strategies" (최신 문서)
```

---

## 🚀 설정 방법

### Step 1: API 키 발급 (5분)

1. https://context7.com 방문
2. 무료 회원가입
3. API 키 발급 (무료: 월 1,000 요청)
4. API 키 복사

### Step 2: MCP 설정 (2분)

프로젝트 루트에 `.mcp.json` 파일을 생성합니다.

#### 방법 A: 로컬 실행 (API 키 불필요, 무제한)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

#### 방법 B: 호스팅 서버 (API 키 필요)

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-your-api-key-here"
      }
    }
  }
}
```

> **주의**: `.mcp.json`에 API 키를 직접 입력하는 경우, 반드시 `.gitignore`에 `.mcp.json`을 추가하세요.
>
> `${CONTEXT7_API_KEY}` 같은 환경 변수 참조 문법은 **시스템 환경 변수**(`~/.zshrc`의 `export`)만 읽습니다. `.env.local`은 Next.js 전용 파일이므로 `.mcp.json`에서 참조할 수 없습니다. 이 프로젝트에서 실제로 이 문제를 겪었고, API 키 직접 입력 + `.gitignore` 추가로 해결했습니다.

### Step 3: .gitignore 확인

`.mcp.json`이 `.gitignore`에 포함되어 있는지 확인:

```bash
# .gitignore에 다음이 포함되어야 함
.mcp.json
```

### Step 4: Claude Code 재시작 (1분)

```bash
# VSCode에서
1. Command Palette 열기 (Cmd+Shift+P)
2. "Reload Window" 검색 후 실행

# 또는
VSCode 완전히 종료 후 재시작
```

### Step 5: 확인 (1분)

Claude Code에서 다음 명령어 실행:

```bash
/mcp
```

**예상 출력**:
```
✅ context7: connected
   - Description: 실시간 최신 라이브러리 문서 참조
   - Status: active
```

---

## 💡 사용 방법

### 기본 사용법

```bash
# 방법 1: 명시적으로 Context7 사용
> use context7 to show me how to create a Drizzle migration

# 방법 2: 특정 라이브러리 지정
> use context7 with @vercel/next to explain App Router

# 방법 3: 일반 질문 (자동 참조)
> How do I validate with Zod?
```

### Tika 프로젝트 권장 패턴

#### 1. API 구현 전

```bash
# Before implementation
> use context7 to show Drizzle ORM 0.38.x insert syntax with TypeScript

# Then implement with accurate API
```

#### 2. 검증 스키마 작성

```bash
# For src/shared/validations/
> use context7 to create Zod schema for nested objects with TypeScript strict mode

# Get latest Zod API
```

#### 3. 테스트 작성

```bash
# For __tests__/
> use context7 with jest and @testing-library/react for async testing patterns

# Get official testing best practices
```

#### 4. 문서 작성

```bash
# For API_SPEC.md, DATA_MODEL.md
> use context7 to verify Next.js 15 API route response types

# Ensure specs match official docs
```

---

## 🔍 검증 방법

### Context7 작동 확인

```bash
# 1. MCP 상태 확인
/mcp

# 2. 간단한 테스트
> use context7 to show React 19 useEffect syntax

# 3. 응답에 공식 문서 링크가 포함되는지 확인
```

### 문제 해결

#### Error: "context7 not connected"

```bash
# 1. .mcp.json에 API 키가 직접 입력되어 있는지 확인
cat .mcp.json

# 2. .mcp.json이 올바른 JSON 형식인지 확인
python3 -c "import json; json.load(open('.mcp.json'))"

# 3. Claude Code 재시작
```

#### Error: "${CONTEXT7_API_KEY}" 참조가 동작하지 않음

```bash
# .mcp.json의 ${VAR} 문법은 시스템 환경 변수만 읽음
# .env.local은 Next.js 전용 → .mcp.json에서 참조 불가

# 해결 방법 1: .mcp.json에 키를 직접 입력 (권장)
# 해결 방법 2: ~/.zshrc에 export CONTEXT7_API_KEY=... 추가
```

#### Error: "API key invalid"

```bash
# https://context7.com에서 API 키 재발급
# .mcp.json 업데이트
# Claude Code 재시작
```

#### Context7이 자동으로 호출되지 않음

```bash
# 명시적으로 호출
> use context7 to ...

# 또는 플러그인 설치 고려
/plugin marketplace add upstash/context7
```

---

## 📊 사용량 모니터링

### 무료 플랜 (월 1,000 요청)

**예상 사용량**:
- 일일 구현 작업: 20-30 요청
- 한 달 작업일 (20일): 400-600 요청
- **충분합니다!**

### 사용량 확인

```bash
# https://context7.com/dashboard
# - 현재 사용량
# - 남은 요청 수
# - 리셋 날짜
```

### 무제한 사용 (선택사항)

로컬 실행 방식은 API 키 없이 무제한 사용 가능:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

> npx로 로컬에서 실행하므로 호스팅 서버를 거치지 않습니다. 초기 실행 시 패키지 다운로드가 필요합니다.

---

## 🎓 Best Practices

### 1. 구현 전 항상 Context7 확인

```bash
# ❌ Bad: 추측으로 시작
> Drizzle로 티켓 생성 API 구현해줘

# ✅ Good: Context7로 확인 후 구현
> use context7 to show Drizzle 0.38.x insert syntax
> [확인 후] 이제 티켓 생성 API 구현해줘
```

### 2. 버전 명시

```bash
# ❌ Bad: 버전 불명확
> use context7 for React hooks

# ✅ Good: 정확한 버전
> use context7 to show React 19 hooks best practices
```

### 3. 명세 문서 작성 시 활용

```bash
# API_SPEC.md 작성 시
> use context7 to verify Next.js 15 API route response format

# DATA_MODEL.md 작성 시
> use context7 to show Drizzle ORM schema definition syntax
```

### 4. 팀원과 공유

```markdown
# PR 코멘트에
"Context7로 확인한 공식 문서: [링크]"
```

---

## 🔄 워크플로우 통합

### Before Context7

```
요구사항 → 추측 구현 → 실패 → 문서 찾기 → 수정 → 성공
         (30분)     (10분)   (20분)    (10분)  (10분)
         총 시간: 1시간 20분
```

### After Context7

```
요구사항 → Context7 확인 → 올바른 구현 → 성공
         (5분)          (15분)        (즉시)
         총 시간: 20분
```

**시간 절약: 60분 (75% 감소)**

---

## 📚 관련 문서

- [Constitution.md](../../.specify/memory/constitution.md) - Core Principle VII: Documentation First
- [CLAUDE.md](../../CLAUDE.md) - MCP Servers 섹션
- [Implementation Checklist](../guidelines/implementation-checklist.md) - Phase 2: 문서 확인
- [Guardrails](../guidelines/guardrails.md) - Level 2: Pre-Implementation Gates

---

## 🎯 기대 효과

### 정량적 목표

- ✅ 첫 시도 성공률: 50% → **90%**
- ✅ 평균 구현 시간: 1시간 → **20분**
- ✅ 추측 구현 빈도: 30% → **0%**
- ✅ 문서 참조 빈도: 20% → **100%**

### 정성적 목표

- ✅ Documentation First 원칙 자동화
- ✅ 팀원 간 일관된 코드 품질
- ✅ 할루시네이션 감소
- ✅ 사용자 신뢰 향상

---

**Version**: 1.0
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: Active
