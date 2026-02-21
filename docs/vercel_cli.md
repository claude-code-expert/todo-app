## 7.2.5 Vercel CLI 활용

지금까지 Vercel의 Dashboard와 Git Push를 사용해 배포를 진행했다. 화면을 통해서 연동하는 것은 직관적이라 쉽지만 여러 탭과 메뉴들을 클릭해야 하고 메뉴나 버튼들이 사라지거나 변경되는 경우도 있어서 다소 혼동을 주는 경우도 있다. 따라서 Vercel CLI를 사용하여 터미널에서 직접 배포하고 환경 변수를 관리할 수 있는 명령어들을 정리하였으니 참고하기 바란다. (Vercel CLI 설치는 7.2.1 배포 전 준비사항을 참고)

### 계정 관련 명령어

```bash
# 로그인
vercel login

# 현재 로그인된 계정 확인
vercel whoami

# 로그아웃
vercel logout
```

login 시 브라우저가 열리며 인증을 요청한다. GitHub 계정으로 로그인하면 터미널에 성공 메시지가 표시된다.

```
Vercel CLI 39.x.x
? Log in to Vercel
  Continue with GitHub  ← 선택
✔ Success! GitHub authentication complete for user@email.com
```

**계정 변경** (예: 개인 계정에서 회사 계정으로 변경)

```bash
# 1. 현재 계정에서 로그아웃
vercel logout

# 2. 새 계정으로 로그인
vercel login

# 3. 프로젝트 연결 해제 후 재연결
rm -rf .vercel
vercel link
```

왜 `.vercel` 디렉토리를 삭제하나? `.vercel/project.json`에 이전 계정의 프로젝트 ID와 조직 ID가 저장되어 있다. 계정을 변경하면 이 정보가 맞지 않으므로 삭제 후 새 계정으로 다시 연결해야 한다.

[📸 캡처: 터미널 — vercel login 실행 및 성공 메시지]

### 프로젝트 연결

Dashboard에서 이미 프로젝트를 생성했다면 로컬 디렉토리와 연결한다.

```bash
cd /path/to/tika
vercel link
```

```
? Set up "~/tika"? [Y/n] Y
? Which scope should contain your project? your-username
? Link to existing project? [y/N] Y    ← 기존 프로젝트 연결
? What's the name of your existing project? tika
✔ Linked to your-username/tika
```

`.vercel/` 디렉토리가 생성되며 프로젝트가 연결된다.

### 환경 변수 관리

```bash
# Vercel에 설정된 환경 변수를 로컬 .env.local로 가져오기
vercel env pull .env.local

# .vercel/ 디렉토리로 환경 변수 + 프로젝트 설정 가져오기
# (vercel dev, vercel build에서 사용)
vercel pull

# 환경 변수 추가
vercel env add DATABASE_URL production
# 프롬프트에 Neon 연결 문자열 붙여넣기

# 환경 변수 목록 확인
vercel env ls

# 환경 변수 삭제
vercel env rm DATABASE_URL production
```

`vercel env pull`은 Vercel에 설정된 모든 환경 변수를 `.env.local`로 내려받는다. 기존 `.env.local`을 덮어쓰므로 백업 후 사용한다. `vercel dev`나 `vercel build`를 사용할 계획이라면 `vercel pull`을 사용하는 것이 좋다. 이 명령은 환경 변수를 `.vercel/` 디렉토리에 저장하며 프로젝트 설정도 함께 가져온다.

### CLI로 직접 배포

Git Push 없이 로컬에서 바로 배포할 수 있다.

```bash
# Production 배포
vercel deploy --prod

# Preview 배포 (기본)
vercel deploy
```

```
Vercel CLI 39.x.x
🔍  Inspect: https://vercel.com/your-username/tika/xxx
✅  Production: https://tika-xxx.vercel.app [1m]
```

[📸 캡처: 터미널 — vercel deploy --prod 실행 및 배포 완료 메시지]

**언제 CLI 배포를 쓰나?**

일반적으로는 git push로 자동 배포한다. CLI 배포는 긴급 핫픽스, Git에 커밋하기 전 테스트 배포, 또는 CI/CD 파이프라인에서 활용한다.

### 로컬 개발 서버

환경 변수만 주입하여 개발 서버를 실행하려면 다음 명령을 사용한다.

```bash
vercel env run -- npm run dev
```

이 명령은 Vercel에 설정된 환경 변수를 가져와 `npm run dev`(내부적으로 `next dev`)에 전달한다. `.env` 파일에 쓰지 않고 프로세스에 직접 주입하므로 깔끔하다.

Vercel Functions나 Edge Middleware를 로컬에서 테스트해야 한다면 다음 명령을 사용한다.

```bash
vercel dev
```

`vercel dev`는 Vercel 배포 환경을 로컬에 복제하여 Serverless Functions와 Edge Middleware를 테스트할 수 있게 한다. 단, Next.js 프로젝트에서는 `next dev`가 이미 Functions, redirects, rewrites, headers 등 대부분의 기능을 네이티브로 지원하므로, Vercel 고유 기능을 테스트할 필요가 없다면 `vercel env run`을 사용하는 것이 권장된다.

### 배포 로그 확인

배포 후 문제가 발생하면 로그를 확인한다.

```bash
# 연결된 프로젝트의 최근 로그 확인
vercel logs

# 특정 배포의 로그 확인
vercel logs --deployment <deployment-url>

# 실시간 로그 스트리밍
vercel logs --follow
```
