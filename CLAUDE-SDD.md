# CLAUDE.md - Tika Project

## 프로젝트 개요
Tika는 티켓 기반 칸반 보드 TODO 앱이다.
Next.js App Router 기반으로, 프론트엔드와 백엔드를 디렉토리 수준에서 분리한다.
src/shared/에서 타입과 검증 스키마를 공유한다.

## 프로젝트 구조
- app/api/       : 백엔드 진입점 (Route Handlers, 요청 파싱 + 응답만)
- src/server/    : 백엔드 로직 (services, db, middleware)
- src/client/    : 프론트엔드 로직 (components, hooks, api 호출)
- src/shared/    : 공유 타입, Zod 스키마, 상수
- docs/          : 프로젝트 명세 문서

## 기술 스택
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Frontend: React 19
- Styling: Tailwind CSS 4
- Drag & Drop: @dnd-kit/core + @dnd-kit/sortable
- ORM: Drizzle ORM
- DB: PostgreSQL (로컬 개발), Vercel Postgres (배포)
- Validation: Zod
- Testing: Jest + React Testing Library
- Deployment: Vercel

## 프로젝트 문서 (반드시 참조)
- 제품 요구사항: /docs/PRD.md
- 기술 요구사항: /docs/TRD.md
- 상세 요구사항: /docs/REQUIREMENTS.md
- API 명세: /docs/API_SPEC.md
- 데이터 모델: /docs/DATA_MODEL.md
- 컴포넌트 명세: /docs/COMPONENT_SPEC.md
- 테스트 케이스: /docs/TEST_CASES.md

## 코딩 컨벤션

### TypeScript (공통)
- strict 모드 사용
- any 사용 금지, unknown 사용 후 타입 가드
- 인터페이스는 I 접두사 없이 명사로 (예: Ticket, BoardData)
- enum 대신 const 객체 + typeof 패턴 사용
- 공유 타입은 반드시 @/shared/types에서 import

### 백엔드 (app/api/ + src/server/)
- Route Handler는 얇게: 요청 파싱 → 서비스 호출 → 응답 반환
- 비즈니스 로직은 src/server/services/에 작성
- Zod로 요청 검증 (shared/validations에서 import)
- 에러 응답 형식 통일: { error: { code, message } }
- HTTP 상태 코드: 200, 201, 204, 400, 404, 500
- DB 쿼리는 Drizzle ORM으로만 작성 (raw SQL 금지)

### 프론트엔드 (src/client/)
- 함수 컴포넌트 + 화살표 함수
- Props 타입은 컴포넌트 파일 내 정의
- API 호출은 src/client/api/ticketApi.ts를 통해서만
- 파일명: PascalCase (예: TicketCard.tsx)

## 개발 규칙

### 반드시 지켜야 할 것
- 구현 전 반드시 관련 명세 문서 확인 (API_SPEC.md, COMPONENT_SPEC.md 등)
- API 구현 시 API_SPEC.md의 요청/응답 형식 정확히 따르기
- 에러 코드와 메시지는 명세에 정의된 것만 사용
- 컴포넌트 구현 시 COMPONENT_SPEC.md의 Props와 동작 준수
- 타입 변경 시 src/shared/types 먼저 수정

### 하지 말아야 할 것
- 명세에 없는 기능 임의 추가 금지
- any 타입 사용 금지
- console.log 커밋 금지 (디버깅 후 제거)
- src/client/에서 직접 DB 접근 금지
- src/server/에서 React 관련 코드 작성 금지

### 경계 규칙
- 백엔드 작업 시(app/api/, src/server/) 프론트엔드(src/client/) 코드 수정 금지
- 프론트엔드 작업 시(src/client/) 백엔드(app/api/, src/server/) 코드 수정 금지
- 양쪽에 영향을 주는 변경은 src/shared/ 먼저 수정 후 각각 반영

### Git 커밋 규칙
- 커밋 메시지에 Co-Authored-By 포함하지 않음

## SDD 워크플로우 규칙

### 구현 전 명세 확인
1. API 구현 전: API_SPEC.md에서 요청/응답 형식, 에러 메시지 확인
2. 컴포넌트 구현 전: COMPONENT_SPEC.md에서 Props, 이벤트 흐름 확인
3. DB 작업 전: DATA_MODEL.md에서 스키마, 비즈니스 규칙 확인

### 명세 우선 원칙
- 명세에 정의된 에러 메시지를 그대로 사용할 것
- 명세에 없는 필드나 동작을 임의로 추가하지 말 것
- 명세와 구현이 다를 경우, 명세를 먼저 수정한 후 구현 변경

### 검증 단계
- 구현 완료 후 TEST_CASES.md의 시나리오로 검증
- 테스트 실패 시 구현을 수정 (명세 오류인 경우 명세 먼저 수정)