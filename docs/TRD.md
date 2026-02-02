# Tika - Technical Requirements Document (TRD)

> 버전: 1.0 (MVP)
> 최종 수정일: 2026-02-01

---

## 1. 시스템 아키텍처

### 1.1 전체 구성

Vercel 단일 플랫폼에서 프론트엔드, API, 데이터베이스를 통합 운영한다. `git push` 한 번으로 전체가 배포되고, CORS 설정이나 별도 서버 관리가 필요 없다.

```
┌──────────────────────────────────────────────────┐
│                     Vercel                        │
│                                                   │
│  ┌─────────────────┐   ┌──────────────────────┐  │
│  │                 │   │                      │  │
│  │  Next.js App    │   │   API Routes         │  │
│  │  (React 19)     │──▶│   (Route Handlers)   │  │
│  │  - 페이지       │   │   - /api/tickets     │  │
│  │  - 컴포넌트     │   │   - /api/tickets/:id │  │
│  │                 │   │                      │  │
│  └─────────────────┘   └──────────┬───────────┘  │
│                                   │               │
│                        ┌──────────▼───────────┐  │
│                        │  Service Layer       │  │
│                        │  (ticketService)     │  │
│                        └──────────┬───────────┘  │
│                                   │               │
│                        ┌──────────▼───────────┐  │
│                        │  Drizzle ORM         │  │
│                        └──────────┬───────────┘  │
│                                   │               │
│                        ┌──────────▼───────────┐  │
│                        │  Vercel Postgres      │  │
│                        │  (Neon)               │  │
│                        └──────────────────────┘  │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 1.2 프론트/백엔드 논리적 분리

Next.js App Router 기반으로, 프론트엔드와 백엔드를 **디렉토리 수준에서 분리**한다. 물리적으로 같은 프로젝트이지만, 코드 의존 방향이 명확하고 한쪽을 수정할 때 다른 쪽에 영향을 주지 않는다.

- **`app/api/`** — 백엔드 진입점 (Route Handlers, 요청 파싱 + 응답만)
- **`src/server/`** — 백엔드 로직 (services, db, middleware)
- **`src/client/`** — 프론트엔드 로직 (components, hooks, api 호출)
- **`src/shared/`** — 양쪽에서 사용하는 타입, 검증 스키마, 상수

```
요청 흐름:
클라이언트 → app/api/tickets/route.ts (요청 파싱 + 응답)
            → src/server/services/ticketService.ts (비즈니스 로직)
            → src/server/db/schema.ts (Drizzle 쿼리)
```

이 계층 구조는 Express의 Router → Controller → Service → DB와 동일한 원칙이다. Route Handler가 Router와 Controller 역할을 합치고, 비즈니스 로직만 Service로 분리한다.

---

## 2. 기술 스택 상세

### 2.1 프론트엔드

| 기술 | 버전 | 용도 | 선정 이유 |
|------|------|------|----------|
| Next.js | 15.x | 풀스택 프레임워크 (App Router) | Vercel 네이티브 통합, 별도 서버 없이 API 구현 |
| React | 19.x | UI 렌더링 | 타입 안전성으로 AI 생성 코드 오류를 컴파일 시점에 포착 |
| TypeScript | 5.x | 타입 안전성 | strict 모드로 런타임 에러 사전 방지 |
| Tailwind CSS | 4.x | 스타일링 | 유틸리티 클래스 기반, AI가 일관된 스타일 코드 생성 |
| @dnd-kit/core | 6.x | 드래그앤드롭 | React 19 호환, 접근성 지원, 경량 |
| @dnd-kit/sortable | 8.x | 칼럼 내 정렬 | @dnd-kit/core와 통합 |

### 2.2 백엔드

| 기술 | 버전 | 용도 | 선정 이유 |
|------|------|------|----------|
| Node.js | 20.x | 런타임 | Vercel Serverless Functions 기반 실행 |
| Next.js API Routes | 15.x | REST API 엔드포인트 | 서버리스 함수로 실행, 사용하지 않는 API에 비용 없음 |
| Drizzle ORM | 0.38.x | DB 쿼리, 스키마 관리 | TypeScript 네이티브, 코드 생성 불필요, Vercel Postgres 공식 지원 |
| Drizzle Kit | 0.30.x | 마이그레이션 관리 | Drizzle ORM 공식 마이그레이션 도구 |
| @vercel/postgres | latest | Vercel Postgres 연결 드라이버 | 서버리스 환경 커넥션 풀 자동 관리 |
| Zod | 3.x | 요청 데이터 검증 | 프론트/백엔드에서 동일한 검증 스키마 공유 |

### 2.3 개발 도구

| 기술 | 용도 |
|------|------|
| Jest + React Testing Library | 테스트 (TDD 사이클) |
| ESLint | 린트 |
| Prettier | 코드 포맷팅 |
| drizzle-kit | DB 마이그레이션 |

### 2.4 ORM 선정 근거: Drizzle vs Prisma

| 비교 항목 | Drizzle | Prisma |
|-----------|---------|--------|
| 서버리스 cold start | 거의 없음 (경량) | 문제 있음 |
| 코드 생성 | 불필요 (TS 네이티브) | `prisma generate` 필요 |
| Vercel 공식 지원 | 공식 스타터 템플릿 제공 | 별도 설정 필요 |
| 번들 크기 | 경량 | 상대적으로 무거움 |
| SQL 친화성 | SQL과 유사한 API | 추상화된 API |

---

## 3. 프로젝트 디렉토리 구조

```
tika/
├── app/                              # Next.js App Router
│   ├── api/                          # 백엔드: API Route Handlers
│   │   └── tickets/
│   │       ├── route.ts              # GET /api/tickets, POST /api/tickets
│   │       ├── [id]/
│   │       │   ├── route.ts          # GET, PATCH, DELETE /api/tickets/:id
│   │       │   └── complete/
│   │       │       └── route.ts      # PATCH /api/tickets/:id/complete
│   │       └── reorder/
│   │           └── route.ts          # PATCH /api/tickets/reorder
│   │
│   ├── (board)/                      # 프론트엔드: 페이지 그룹
│   │   ├── page.tsx                  # 메인 칸반 보드 페이지
│   │   └── layout.tsx                # 보드 레이아웃
│   ├── layout.tsx                    # 루트 레이아웃
│   └── globals.css                   # 글로벌 스타일 + Tailwind
│
├── src/
│   ├── server/                       # 백엔드 로직 (서버에서만 실행)
│   │   ├── services/
│   │   │   └── ticketService.ts      # 비즈니스 로직
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle 클라이언트 초기화
│   │   │   ├── schema.ts             # DB 스키마 정의
│   │   │   └── seed.ts               # 시드 데이터
│   │   └── middleware/
│   │       ├── errorHandler.ts       # 에러 처리
│   │       └── validate.ts           # Zod 검증 유틸리티
│   │
│   ├── client/                       # 프론트엔드 로직 (브라우저에서 실행)
│   │   ├── components/
│   │   │   ├── board/
│   │   │   │   ├── Board.tsx         # 칸반 보드 컨테이너 (DnD 컨텍스트)
│   │   │   │   ├── Column.tsx        # 칼럼 (Backlog, TODO 등)
│   │   │   │   └── TicketCard.tsx    # 티켓 카드
│   │   │   ├── ticket/
│   │   │   │   ├── TicketModal.tsx   # 티켓 상세/수정 모달
│   │   │   │   └── TicketForm.tsx    # 티켓 생성 폼
│   │   │   └── ui/
│   │   │       ├── Button.tsx        # 공통 버튼
│   │   │       ├── Modal.tsx         # 공통 모달
│   │   │       ├── Badge.tsx         # 우선순위 뱃지
│   │   │       └── ConfirmDialog.tsx # 확인 다이얼로그
│   │   │
│   │   ├── hooks/
│   │   │   └── useTickets.ts         # 티켓 CRUD + DnD 상태 관리
│   │   └── api/
│   │       └── ticketApi.ts          # API 호출 함수 (fetch 래퍼)
│   │
│   └── shared/                       # 프론트/백엔드 공유 코드
│       ├── types/
│       │   └── index.ts              # Ticket, BoardData, ApiResponse 등
│       ├── validations/
│       │   └── ticket.ts             # Zod 스키마 (프론트 폼 + 백엔드 API 검증)
│       └── constants.ts              # 칼럼명, 우선순위 등 공유 상수
│
├── __tests__/                        # 테스트 코드
│   ├── api/                          # API Route 테스트 (백엔드)
│   │   └── tickets.test.ts
│   ├── services/                     # 서비스 단위 테스트 (백엔드)
│   │   └── ticketService.test.ts
│   ├── components/                   # 컴포넌트 테스트 (프론트엔드)
│   │   ├── Board.test.tsx
│   │   ├── Column.test.tsx
│   │   └── TicketCard.test.tsx
│   └── hooks/                        # Hook 테스트 (프론트엔드)
│       └── useTickets.test.ts
│
├── docs/                             # 프로젝트 문서
│   ├── PRD.md                        # 제품 요구사항
│   ├── TRD.md                        # 기술 요구사항 (이 문서)
│   ├── REQUIREMENTS.md               # 상세 요구사항 명세 (FR + NFR + US)
│   ├── API_SPEC.md                   # API 엔드포인트 명세
│   ├── DATA_MODEL.md                 # DB 스키마, ERD, 비즈니스 규칙
│   ├── COMPONENT_SPEC.md             # 컴포넌트 계층, Props, 이벤트 흐름
│   └── TEST_CASES.md                 # TDD용 테스트 케이스 정의
│
├── drizzle/                          # Drizzle 마이그레이션
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── jest.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md                         # Claude Code 프로젝트 설정
├── .env.local                        # 환경 변수 (Git 제외)
├── .env.example                      # 환경 변수 템플릿
└── .gitignore
```

---

## 4. 데이터 계층

### 4.1 DB 연결

```typescript
// src/server/db/index.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

export const db = drizzle(sql);
```

`@vercel/postgres` 패키지가 서버리스 환경에서의 커넥션 풀을 자동으로 관리한다.

### 4.2 마이그레이션 전략

- `drizzle-kit generate`로 마이그레이션 SQL 생성
- `drizzle-kit migrate`로 마이그레이션 적용
- 마이그레이션 파일은 Git에 포함하여 버전 관리

---

## 5. 데이터 흐름

### 5.1 읽기 흐름 (보드 조회)

```
컴포넌트 (Board.tsx)
  → src/client/api/ticketApi.ts (fetch 래퍼)
  → GET /api/tickets (Route Handler: 요청 파싱)
  → src/server/services/ticketService.ts (getAll)
    - 4개 칼럼별 그룹화 (BACKLOG, TODO, IN_PROGRESS, DONE)
    - DONE 칼럼: completedAt 기준 24시간 이내 티켓만 포함 (24시간 경과 시 제외)
    - 각 티켓에 isOverdue 파생 필드 계산 (dueDate < 오늘 AND status ≠ DONE)
  → src/server/db/ (Drizzle 쿼리)
  → Vercel Postgres
```

### 5.2 쓰기 흐름 (티켓 생성)

```
폼 (TicketForm.tsx)
  → src/shared/validations/ticket.ts (클라이언트 Zod 검증)
  → src/client/api/ticketApi.ts (fetch 래퍼)
  → POST /api/tickets (Route Handler: 서버 Zod 검증)
  → src/server/services/ticketService.ts (create)
  → src/server/db/ (Drizzle 쿼리)
  → Vercel Postgres
```

### 5.3 드래그앤드롭 흐름

```
Board.tsx (DnD 이벤트)
  → 낙관적 업데이트 (UI 즉시 반영)
  → src/client/api/ticketApi.ts
  → 대상 칼럼에 따라 API 분기:
    - Done으로 이동: PATCH /api/tickets/:id/complete (completedAt 자동 설정)
    - Done 외 이동: PATCH /api/tickets/reorder (startedAt/completedAt 규칙 적용)
      · TODO로 이동 시: startedAt = 현재 시각
      · TODO→BACKLOG 복귀 시: startedAt = null
      · Done→다른 칼럼 복귀 시: completedAt = null
  → src/server/services/ticketService.ts (position 재계산)
  → Vercel Postgres
  → 실패 시 롤백 (이전 상태로 복원)
```

프론트엔드 폼에서의 **클라이언트 검증**과 Route Handler에서의 **서버 검증**, 두 단계 모두 `src/shared/validations/`의 동일한 Zod 스키마를 사용한다.

---

## 6. API 설계 원칙

### 6.1 REST API 규칙

- 기본 경로: `/api/tickets`
- JSON 요청/응답
- HTTP 상태 코드 표준 준수: 200, 201, 204, 400, 404, 500
- Route Handler는 얇게 유지: 요청 파싱 → 서비스 호출 → 응답 반환

### 6.2 에러 응답 형식

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "티켓을 찾을 수 없습니다"
  }
}
```

### 6.3 요청 검증

모든 API 요청은 `src/shared/validations/`의 Zod 스키마로 검증한다. 검증 실패 시 400 Bad Request와 구체적인 에러 메시지를 반환한다.

---

## 7. 계층 간 경계 규칙

이 규칙은 같은 프로젝트 안에서 프론트/백엔드 분리를 논리적으로 강제한다.

| 규칙 | 설명 |
|------|------|
| `src/server/` → `src/client/` import 금지 | 백엔드에서 프론트엔드 코드 참조 불가 |
| `src/client/` → `src/server/` import 금지 | 프론트엔드에서 백엔드 코드 직접 참조 불가 |
| `src/shared/`만 양쪽에서 참조 가능 | 타입, Zod 스키마, 상수만 공유 |
| Route Handler 안에 비즈니스 로직 금지 | 요청 파싱 → 서비스 호출 → 응답 반환만 |
| `src/client/`에서 직접 DB 접근 금지 | 반드시 API를 통해 데이터 접근 |
| `src/server/`에서 React 관련 코드 금지 | 서버 코드에 UI 로직 혼재 방지 |

**양쪽에 영향을 주는 변경 시**: `src/shared/`를 먼저 수정한 후 각각 반영한다.

---

## 8. 프론트엔드 아키텍처

### 8.1 렌더링 전략

- **서버 컴포넌트**: 초기 보드 데이터 로드 (SSR)
- **클라이언트 컴포넌트**: 드래그앤드롭, 모달, 폼 인터랙션

### 8.2 상태 관리

- **서버 상태**: fetch + React 상태 (useState/useReducer)
- **낙관적 업데이트**: 드래그앤드롭 시 즉시 UI 반영 → API 호출 → 실패 시 롤백
- 별도 상태 관리 라이브러리(Redux, Zustand 등)는 MVP에서 사용하지 않음

### 8.3 드래그앤드롭

- @dnd-kit 사용
- 칼럼 간 이동: 상태(status) 변경 + 순서(position) 업데이트
- 칼럼 내 이동: 순서(position)만 업데이트
- 터치 디바이스 지원

### 8.4 API 호출

- 모든 API 호출은 `src/client/api/ticketApi.ts`를 통해서만 수행
- 컴포넌트에서 직접 fetch 호출 금지

```typescript
// src/client/api/ticketApi.ts
export const fetchTickets = async () => {
  const res = await fetch('/api/tickets');
  return res.json();
};
```

---

## 9. 배포 설정

### 9.1 Vercel 배포

- GitHub 연동 자동 배포
- 프로덕션 브랜치: `main` (push 시 자동 배포)
- 프리뷰 배포: PR 생성 시 자동
- 환경 변수: Vercel Dashboard에서 관리

### 9.2 환경 변수

```bash
# .env.example
POSTGRES_URL=              # Vercel Postgres 연결 문자열
```

### 9.3 로컬 개발 환경

- `vercel env pull`로 Vercel에 설정된 환경 변수를 로컬로 가져오기
- 또는 로컬 PostgreSQL + `.env.local` 수동 설정

---

## 10. 성능 기준

| 지표 | 목표 |
|------|------|
| First Contentful Paint | < 1.5초 |
| Largest Contentful Paint | < 2.5초 |
| API 응답 시간 (p95) | < 300ms |
| 드래그앤드롭 반응 | 즉시 (낙관적 업데이트) |
| Lighthouse 점수 | > 90 (Performance) |

---

## 11. 보안 고려사항 (MVP)

- SQL Injection 방지: Drizzle ORM 파라미터 바인딩
- XSS 방지: React 자동 이스케이핑 + 입력 검증
- HTTPS: Vercel 기본 제공
- 환경 변수: DB 연결 정보 코드에 미포함
