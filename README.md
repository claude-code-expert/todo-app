# Tika - Ticket-based Kanban Board TODO App

> 티켓 기반 칸반 보드 할 일 관리 애플리케이션

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit
- **ORM**: Drizzle ORM
- **Database**: Vercel Postgres (Neon)
- **Deploy**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 `POSTGRES_URL` 값을 설정합니다.

**Vercel Postgres 사용 시:**
- Vercel 대시보드에서 Storage → Postgres 생성
- `vercel env pull .env.local` 로 자동 설정

**로컬 PostgreSQL 사용 시:**
```
POSTGRES_URL=postgresql://username:password@localhost:5432/tika
```

### 3. DB 마이그레이션

```bash
npm run db:generate   # 마이그레이션 파일 생성
npm run db:migrate    # 마이그레이션 적용
```

### 4. (선택) 시드 데이터

```bash
npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | 테스트 실행 |
| `npm run test:watch` | 테스트 감시 모드 |
| `npm run db:generate` | DB 마이그레이션 생성 |
| `npm run db:migrate` | DB 마이그레이션 적용 |
| `npm run db:studio` | Drizzle Studio (DB GUI) |
| `npm run db:seed` | 시드 데이터 삽입 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |

## 프로젝트 구조

```
tika/
├── app/                    # Next.js App Router
│   ├── api/tickets/        # REST API Routes
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (칸반 보드)
│   └── globals.css
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── board/          # 보드, 칼럼, 카드
│   │   ├── ticket/         # 티켓 폼, 모달
│   │   └── ui/             # 공통 UI (버튼, 모달, 뱃지)
│   ├── db/                 # Drizzle 스키마 + 쿼리
│   ├── hooks/              # 커스텀 훅
│   ├── lib/                # 유틸리티, 검증, 상수
│   └── types/              # TypeScript 타입
├── docs/                   # 프로젝트 문서
├── migrations/             # Drizzle 마이그레이션
├── __tests__/              # 테스트 파일
├── CLAUDE.md               # Claude Code 설정
└── drizzle.config.ts       # Drizzle Kit 설정
```

## 문서

- [PRD (제품 요구사항)](docs/PRD.md)
- [TRD (기술 요구사항)](docs/TRD.md)
- [REQUIREMENTS (상세 요구사항)](docs/REQUIREMENTS.md)
- [API 명세서](docs/API_SPEC.md)
- [데이터 모델](docs/DATA_MODEL.md)
- [컴포넌트 명세](docs/COMPONENT_SPEC.md)
- [테스트 케이스](docs/TEST_CASES.md)

## Claude Code로 개발하기

이 프로젝트는 Claude Code와 함께 TDD 방식으로 개발하도록 설계되었습니다.

```bash
# 프로젝트 디렉토리에서 Claude Code 실행
claude

# Claude Code에게 CLAUDE.md를 참고하도록 요청
> CLAUDE.md를 읽고 프로젝트 컨텍스트를 파악해줘
```

## 라이선스

MIT
