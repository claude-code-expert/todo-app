# CLAUDE.md - Tika Development Guide

> **핵심 원칙은 `.specify/memory/constitution.md` 참조**
> 이 문서는 구체적인 구현 방법과 실무 가이드를 다룬다.

## 프로젝트 개요
Tika는 티켓 기반 칸반 보드 TODO 앱이다.
Next.js App Router 기반으로, 프론트엔드와 백엔드를 디렉토리 수준에서 분리한다.
src/shared/에서 타입과 검증 스키마를 공유한다.

## 프로젝트 구조
```
tika/
├── .claude/
│   ├── skills/       # Custom skills (디렉토리 + SKILL.md 형식)
│   │   └── changelog/SKILL.md
│   ├── commands/     # Legacy 커맨드 (단일 .md 파일, 여전히 작동)
│   │   └── speckit.*.md
│   └── settings.local.json
├── app/api/          # 백엔드 진입점 (Route Handlers)
├── src/
│   ├── server/       # 백엔드 로직 (services, db, middleware)
│   ├── client/       # 프론트엔드 로직 (components, hooks, api)
│   └── shared/       # 공유 타입, Zod 스키마, 상수
└── docs/             # 프로젝트 명세 문서
```

### .claude/ 디렉토리 구조 (Claude Code 전용)
- **`.claude/skills/`**: 권장 형식, 디렉토리 + `SKILL.md` + 지원 파일
  - 예: `.claude/skills/changelog/SKILL.md`
  - YAML frontmatter 필수 (name, description, user-invocable 등)
- **`.claude/commands/`**: 레거시 형식, 단일 `.md` 파일 (여전히 작동)
  - 예: `.claude/commands/speckit.plan.md`
  - Skills보다 기능이 제한적이지만 간단한 용도로 사용 가능
- **공식 문서**: https://code.claude.com/docs/skills.md

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Frontend**: React 19
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **ORM**: Drizzle ORM 0.38.x
- **DB**: PostgreSQL (로컬: node-postgres, 배포: Vercel Postgres)
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## MCP Servers (Model Context Protocol)

### Context7 - 공식 문서 자동 참조 🎯

**목적**: 추측 금지, 공식 문서 우선 원칙을 자동화

**기능**:
- 최신 라이브러리 문서를 실시간으로 fetch (Drizzle 0.38.x, React 19, Next.js 15 등)
- 할루시네이션 방지 (훈련 데이터가 아닌 공식 소스에서 직접)
- 버전별 정확한 API 참조
- 코드 예제, 스키마 정보, 마이그레이션 가이드 제공

**설정**:
```bash
# 1. API 키 발급: https://context7.com
# 2. .env.local에 추가
CONTEXT7_API_KEY=your-api-key-here

# 3. .mcp.json 확인 (이미 설정됨)
```

**사용법**:
```bash
# 명시적 사용
> use context7 to show me Drizzle ORM 0.38.x migration syntax

# 특정 라이브러리
> use context7 with @vercel/next to explain App Router caching

# 일반 질문 (자동 참조)
> How to validate with Zod in TypeScript strict mode?
```

**Documentation First 원칙 적용**:
- ✅ 구현 전: "use context7"로 최신 공식 문서 확인
- ✅ 불확실 시: Context7이 자동으로 올바른 방법 제시
- ✅ 검증: 공식 소스에서 가져온 정보이므로 신뢰 가능

**비용**: 무료 1,000 요청/월 (로컬 서버 사용 시 무제한)

**공식 문서**: https://context7.com/docs/clients/claude-code

## 환경 설정

### 환경 변수
```bash
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/tika
```

### 경로 별칭
- `@/` → `src/`
- `@/app/` → `app/`
- `@/shared/` → `src/shared/`
- `@/server/` → `src/server/`
- `@/client/` → `src/client/`

## 명세 문서 (구현 전 필수 확인)
| 문서 | 용도 |
|------|------|
| docs/PRD.md | 제품 요구사항 |
| docs/TRD.md | 기술 요구사항 |
| docs/REQUIREMENTS.md | 상세 요구사항 (FR + NFR + US) |
| docs/API_SPEC.md | API 엔드포인트 명세 |
| docs/DATA_MODEL.md | DB 스키마, ERD, 비즈니스 규칙 |
| docs/COMPONENT_SPEC.md | 컴포넌트 계층, Props, 이벤트 |
| docs/TEST_CASES.md | TDD용 테스트 케이스 정의 |

## 코딩 컨벤션

### TypeScript
```typescript
// ✅ Good
interface Ticket {
  id: number;
  title: string;
}

export const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
} as const;

type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

// ❌ Bad
interface ITicket { ... }           // I 접두사 사용 금지
enum TicketStatus { ... }           // enum 대신 const 객체 사용
let data: any;                      // any 사용 금지
```

### 백엔드 (app/api/ + src/server/)

#### Route Handler 패턴
```typescript
// app/api/tickets/route.ts
import { createTicketSchema } from '@/shared/validations/ticket';
import { ticketService } from '@/server/services/ticketService';

export async function POST(request: Request) {
  // 1. 요청 파싱
  const body = await request.json();

  // 2. Zod 검증
  const result = createTicketSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: result.error.message } },
      { status: 400 }
    );
  }

  // 3. 서비스 호출
  const ticket = await ticketService.create(result.data);

  // 4. 응답 반환
  return Response.json(ticket, { status: 201 });
}
```

#### 서비스 레이어 패턴
```typescript
// src/server/services/ticketService.ts
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import type { CreateTicketInput, Ticket } from '@/shared/types';

export const ticketService = {
  async create(input: CreateTicketInput): Promise<Ticket> {
    // 비즈니스 로직
    const position = await this.calculatePosition(input.status);

    // DB 쿼리
    const [ticket] = await db
      .insert(tickets)
      .values({ ...input, position })
      .returning();

    return ticket;
  },

  async calculatePosition(status: string): Promise<number> {
    // 복잡한 로직은 별도 메서드로 분리
    const lastTicket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.status, status))
      .orderBy(desc(tickets.position))
      .limit(1);

    return lastTicket[0]?.position ?? 0 - 1024;
  },
};
```

#### 에러 응답 형식
```typescript
// ✅ 올바른 에러 응답
return Response.json(
  {
    error: {
      code: 'TICKET_NOT_FOUND',
      message: '티켓을 찾을 수 없습니다'
    }
  },
  { status: 404 }
);

// ❌ 잘못된 에러 응답
return Response.json({ message: 'Not found' }, { status: 404 });
return Response.json({ error: 'Not found' }, { status: 404 });
```

### 프론트엔드 (src/client/)

#### 컴포넌트 패턴
```typescript
// src/client/components/ticket/TicketCard.tsx
import type { TicketWithMeta } from '@/shared/types';

interface TicketCardProps {
  ticket: TicketWithMeta;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const TicketCard = ({ ticket, onEdit, onDelete }: TicketCardProps) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3>{ticket.title}</h3>
      {ticket.description && <p>{ticket.description}</p>}
    </div>
  );
};
```

#### API 호출 패턴
```typescript
// src/client/api/ticketApi.ts
import type { CreateTicketInput, Ticket } from '@/shared/types';

export const ticketApi = {
  async create(input: CreateTicketInput): Promise<Ticket> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message ?? 'Unknown error');
    }

    return res.json();
  },
};

// 컴포넌트에서 사용
import { ticketApi } from '@/client/api/ticketApi';

const handleCreate = async (data: CreateTicketInput) => {
  try {
    const ticket = await ticketApi.create(data);
    // ...
  } catch (error) {
    console.error(error);
  }
};
```

## SDD 워크플로우

### 1. 구현 전 명세 확인
```
API 구현 → API_SPEC.md 확인
컴포넌트 → COMPONENT_SPEC.md 확인
DB 작업 → DATA_MODEL.md 확인
타입 정의 → src/shared/types 확인
```

### 2. TDD 사이클
```
1. TEST_CASES.md에서 테스트 케이스 확인
2. 테스트 코드 작성 (Red) - 실패하는 테스트
3. 최소 구현 (Green) - 테스트 통과
4. 리팩토링 (Refactor) - 코드 개선
5. 명세 일치 확인
```

### 3. 구현 순서
```
1. src/shared/types - 타입 정의
2. src/shared/validations - Zod 스키마
3. __tests__/ - 테스트 코드
4. src/server/services/ - 비즈니스 로직
5. app/api/ - Route Handler
6. src/client/api/ - API 호출 함수
7. src/client/components/ - UI 컴포넌트
```

## 개발 명령어

### 일반 개발
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

### 테스트
```bash
npm run test         # 테스트 실행
npm run test:watch   # watch 모드
npx tsc --noEmit     # 타입 체크
```

### 데이터베이스
```bash
npm run db:generate  # 마이그레이션 생성
npm run db:migrate   # 마이그레이션 실행
npm run db:studio    # Drizzle Studio 실행
npm run db:seed      # 시드 데이터 생성
```

## 검증 체크리스트

### 커밋 전
- [ ] `npx tsc --noEmit` 타입 체크 통과
- [ ] `npm run test` 모든 테스트 통과
- [ ] `npm run build` 빌드 성공
- [ ] console.log 제거 확인
- [ ] .env 파일 미포함 확인

### PR 전
- [ ] 명세 문서와 일치 확인
- [ ] 테스트 커버리지 충분
- [ ] 레이어 분리 준수 (Route Handler vs Service)
- [ ] Zod 검증 누락 없음
- [ ] 에러 응답 형식 일치

## 금지 사항

### 절대 하지 말 것
- ❌ any 타입 사용
- ❌ 명세 없는 기능 추가
- ❌ 테스트 삭제 또는 `.skip()`
- ❌ console.log 커밋
- ❌ .env 파일 커밋
- ❌ src/client/에서 DB 직접 접근
- ❌ Route Handler에 비즈니스 로직 작성
- ❌ **공식 문서 확인 없이 추측으로 구현** (특히 Claude Code 기능/구조)

### 확인 필요
- ⚠️ DB 스키마 변경 → 마이그레이션 생성
- ⚠️ shared 타입 변경 → 영향 범위 확인
- ⚠️ API 응답 형식 변경 → API_SPEC.md 먼저 수정
- ⚠️ 패키지 추가/업그레이드 → 호환성 확인
- ⚠️ Claude Code 기능 사용 → https://code.claude.com/docs 먼저 확인
- ⚠️ 프레임워크/라이브러리 기능 → 최신 공식 문서 확인

## 문제 해결

### 타입 에러
```bash
# 타입 체크
npx tsc --noEmit

# 캐시 삭제 후 재시도
rm -rf .next
npm run build
```

### 테스트 실패
```bash
# 단일 테스트 실행
npm run test -- path/to/test.test.ts

# 상세 로그
npm run test -- --verbose
```

### DB 연결 오류
```bash
# 환경 변수 확인
echo $DATABASE_URL

# DB 상태 확인
psql $DATABASE_URL -c "SELECT 1"
```

## Git 워크플로우

### 커밋 메시지
```bash
feat: 티켓 생성 API 구현
fix: 티켓 삭제 시 404 에러 수정
refactor: ticketService 로직 분리
test: 티켓 목록 조회 테스트 추가
docs: API_SPEC.md 에러 코드 추가
```

### 브랜치 전략
- `main`: 프로덕션
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정

## Recent Changes

> 최근 7-14일간의 주요 변경사항을 추적합니다.
> 전체 히스토리는 [CHANGELOG.md](./CHANGELOG.md) 참조

### 2026-02-14
- **[001-create-ticket-api]** ✅ Changelog를 올바른 skills 구조로 수정 (.claude/skills/changelog/SKILL.md) + Documentation First 원칙 추가

### 2026-02-13
- **[001-create-ticket-api]** ⚠️ Changelog 스킬 구조 시행착오 (잘못된 구조 사용, 공식 문서 미확인)
- **[001-create-ticket-api]** Speckit 워크플로우 통합 및 에러 처리 시스템 구축 (specs/, src/shared/errors/, 서비스 레이어 개선)
- **[chapter5.1-init]** Changelog 시스템 구현 완료 (/changelog 스킬, helper script, 문서 템플릿)
- **[chapter5.1-init]** TC-API-001 테스트 완료 (11/11 passed, 100% coverage)
- **[Multi-branch]** DB 설정 파일 3개 브랜치에 추가 (chapter4.4.5, chapter5.1-SDD, chapter5.1-init)
- **[chapter5.1-init]** Jest 통합 테스트 활성화 (ticketService mock 제거)

---

**핵심 원칙과 거버넌스는 `.specify/memory/constitution.md` 참조**