# Incident Report: Changelog Skill 구조 오해 및 수정

**Date**: 2026-02-13 23:19 ~ 2026-02-14 01:18
**Severity**: Medium (기능 장애, 잘못된 문서화)
**Status**: Resolved
**Reporter**: Claude Sonnet 4.5

---

## Executive Summary

`.claude/skills/` 디렉토리 구조에 대한 오해로 인해 changelog 스킬이 인식되지 않는 문제가 발생했습니다. 공식 문서를 확인하지 않고 추측으로 구현하여 3번의 시도 끝에 올바른 구조를 적용했습니다.

**Root Cause**: 공식 문서 미확인 + 잘못된 파일 구조 사용
**Impact**: 1시간 30분 소요, 3번의 커밋, 잘못된 문서화
**Resolution**: 공식 문서 확인 후 올바른 구조로 수정 + Documentation First 원칙 추가

---

## Timeline

### 2026-02-13 23:19 - 첫 번째 시도 (커밋: 85091a5)

**의도**: Changelog 스킬을 `.claude/commands/`에서 `.claude/skills/`로 분리

**구현**:
```
.claude/
├── skills/
│   └── changelog.md          ❌ 잘못된 구조
└── commands/
    └── speckit.*.md
```

**문제점**:
- **잘못된 파일 구조**: `.claude/skills/changelog.md` (단일 파일)
- **올바른 구조**: `.claude/skills/changelog/SKILL.md` (디렉토리 + SKILL.md)
- 공식 문서를 확인하지 않고 추측으로 구현

**결과**: 스킬이 인식되지 않음

---

### 2026-02-13 23:44 - 두 번째 시도 (커밋: 14f9651)

**의도**: 인식 문제 해결

**가설 (잘못됨)**:
> "`.claude/skills/` 디렉토리는 아직 공식적으로 지원되지 않음"

**구현**:
```
.claude/
└── commands/
    ├── changelog.md          ✅ 작동하지만 레거시
    └── speckit.*.md
```

**액션**:
- `changelog.md`를 `.claude/commands/`로 재이동
- `.claude/skills/` 디렉토리 삭제
- CHANGELOG.md에 **잘못된 정보** 기록:
  - "Claude Code는 `.claude/commands/` 디렉토리만 스킬로 인식"
  - "`.claude/skills/` 디렉토리는 아직 공식적으로 지원되지 않음"

**결과**:
- ✅ 스킬 작동 (레거시 방식)
- ❌ 잘못된 이해 및 문서화
- ❌ 공식 문서 여전히 미확인

---

### 2026-02-14 00:00 - 사용자 지적

**사용자 피드백**:
> "Co-Authored-By는 없다고 기록했는데 왜 없어진거지?
> 그 무엇보다 한번이나 클로드 문서가 먼저아니야?"

**핵심 문제 지적**:
1. 워크플로우와 실제 구현의 불일치
2. **공식 문서를 확인하지 않음**

---

### 2026-02-14 00:05 - 공식 문서 확인

**Task Agent 사용**: `claude-code-guide` 서브에이전트로 공식 문서 조사

**발견 사항**:

| 내용 | 이전 이해 (잘못됨) | 실제 (공식 문서) |
|------|-------------------|-----------------|
| `.claude/skills/` 지원 | ❌ 미지원 | ✅ **공식 지원** |
| Skills 구조 | 단일 `.md` 파일 | **디렉토리 + `SKILL.md`** |
| Commands 상태 | 유일한 방법 | 레거시 (여전히 작동) |
| 권장 방식 | Commands | **Skills** |

**공식 문서**:
> Custom slash commands have been merged into skills. A file at `.claude/commands/review.md` and a skill at `.claude/skills/review/SKILL.md` both create `/review` and work the same way.

---

### 2026-02-14 01:18 - 세 번째 시도 (커밋: 4ab6ced)

**의도**: 올바른 구조로 수정 + 문서화

**구현**:
```
.claude/
├── skills/
│   └── changelog/
│       └── SKILL.md          ✅ 올바른 구조
└── commands/
    └── speckit.*.md          ✅ 레거시지만 작동
```

**수정 사항**:
1. Changelog를 올바른 skills 구조로 이동
2. YAML frontmatter 개선 (name, user-invocable 추가)
3. constitution.md에 "Documentation First" 원칙 추가
4. CLAUDE.md에 `.claude/` 디렉토리 구조 문서화
5. CHANGELOG.md에 정정 엔트리 추가

**결과**: ✅ 완전 해결

---

## Root Cause Analysis

### 1. 직접 원인 (Immediate Cause)

**잘못된 파일 구조 사용**:
```
❌ .claude/skills/changelog.md
✅ .claude/skills/changelog/SKILL.md
```

### 2. 근본 원인 (Root Cause)

**공식 문서 미확인**:
- Claude Code Skills 문서를 읽지 않음
- 추측과 오래된 지식에 의존
- "아마도 이럴 것이다" 가정

### 3. 기여 요인 (Contributing Factors)

1. **Documentation First 원칙 부재**
   - constitution.md에 문서 참조 원칙 없음
   - CLAUDE.md에 가이드라인 부족

2. **검증 부족**
   - 스킬이 작동하지 않을 때 문서부터 확인하지 않음
   - 추측으로 문제 해결 시도

3. **잘못된 문서화**
   - 검증되지 않은 정보를 CHANGELOG.md에 기록
   - 후속 작업자에게 잘못된 정보 전파 가능성

---

## What Went Wrong

### 기술적 오류

1. **파일 구조 오류**
   ```
   잘못됨: .claude/skills/changelog.md (단일 파일)
   올바름: .claude/skills/changelog/SKILL.md (디렉토리 구조)
   ```

2. **YAML Frontmatter 불완전**
   - `invoke_pattern` 필드 사용 (비공식)
   - `name` 필드 누락
   - `user-invocable` 필드 누락

3. **문서화 오류**
   - CHANGELOG.md에 검증되지 않은 정보 기록
   - ".claude/skills/ 미지원" (거짓 정보)

### 프로세스 오류

1. **공식 문서 미확인**
   - https://code.claude.com/docs/skills.md 확인 안 함
   - 추측으로 구현

2. **검증 부족**
   - 첫 시도 실패 시 문서 확인하지 않음
   - 잘못된 가설("미지원")로 두 번째 시도

3. **문서화 프로세스 미흡**
   - 검증 없이 "Key Learnings" 작성
   - 후속 작업자에게 혼란 야기

---

## Corrections Made

### 1. 코드 수정

**파일 구조**:
```diff
- .claude/commands/changelog.md          (레거시)
+ .claude/skills/changelog/SKILL.md      (현대적)
```

**YAML Frontmatter**:
```yaml
---
name: changelog                    # ✅ 추가
description: Record current...
user-invocable: true              # ✅ 추가
- invoke_pattern: /changelog      # ❌ 제거 (비공식)
handoffs:
  - When finished...
---
```

### 2. 문서 수정

**constitution.md**:
- Core Principle VII 추가: "Documentation First (NON-NEGOTIABLE)"
- 공식 문서 우선 참조 원칙 명시

**CLAUDE.md**:
- `.claude/` 디렉토리 구조 가이드 추가
- Commands vs Skills 비교표 추가
- 금지 사항: "공식 문서 확인 없이 추측으로 구현" 추가
- 확인 필요: "Claude Code 기능 → 공식 문서 확인" 추가

**CHANGELOG.md**:
- 새 엔트리 추가 (올바른 정보)
- 이전 두 엔트리에 ⚠️ CORRECTION 표시
- 잘못된 Key Learnings 정정

### 3. 프로세스 개선

**문서 참조 프로세스 수립**:
```
불확실한 사항 발생
    ↓
1. 공식 문서 검색 (https://code.claude.com/docs)
    ↓
2. 문서 없음?
    ↓
3. 사용자에게 확인
    ↓
4. 추측 금지
```

---

## Impact Assessment

### 시간 비용

- **첫 번째 시도**: 30분 (잘못된 구조 구현)
- **두 번째 시도**: 20분 (잘못된 가설로 재작업)
- **문서 확인 및 수정**: 40분 (공식 문서 조사 + 올바른 구현)
- **총 시간**: 1시간 30분

### 코드 비용

- **커밋 3회**: 불필요한 히스토리 복잡도
- **파일 이동 3회**: 혼란스러운 git 히스토리

### 문서 비용

- **잘못된 문서화**: CHANGELOG.md에 거짓 정보 기록
- **정정 필요**: 후속 엔트리로 정정 (추가 작업)
- **혼란 가능성**: 미래 작업자가 잘못된 정보 참조 가능

### 신뢰 비용

- 사용자 신뢰 저하 ("문서 먼저 확인했어야지")
- AI 에이전트의 문서 참조 능력 의심

---

## Lessons Learned

### 1. Documentation First는 필수

**Bad**:
```
문제 발생 → 추측 → 구현 → 실패 → 다른 추측 → ...
```

**Good**:
```
문제 발생 → 공식 문서 확인 → 올바른 이해 → 구현 → 성공
```

### 2. 검증되지 않은 정보는 문서화하지 말 것

**Bad**:
```markdown
### Key Learnings
- `.claude/skills/` 디렉토리는 지원되지 않음 (추측)
```

**Good**:
```markdown
### Key Learnings
- `.claude/skills/`는 공식 지원됨 (출처: https://...)
```

### 3. 실패는 즉시 문서로부터 재검증

첫 시도 실패 시:
1. ❌ 다른 가설로 재시도
2. ✅ 공식 문서부터 확인

### 4. Constitution에 핵심 원칙 명시

모호한 가이드라인:
```
"명세를 따르세요"
```

명확한 원칙:
```
Documentation First (NON-NEGOTIABLE)
- 불확실하면 공식 문서 필수 확인
- 문서 없으면 사용자 확인
- 추측 금지
```

---

## Action Items

### ✅ 완료

1. [x] Changelog를 올바른 skills 구조로 수정
2. [x] constitution.md에 Documentation First 원칙 추가
3. [x] CLAUDE.md에 .claude/ 디렉토리 구조 가이드 추가
4. [x] CHANGELOG.md 잘못된 정보 정정
5. [x] Incident Report 작성 (이 문서)

### 🔄 향후 개선

1. [ ] `.claude/skills/` 디렉토리에 README.md 추가 (구조 설명)
2. [ ] 새로운 스킬 추가 시 체크리스트 작성
3. [ ] constitution.md를 주기적으로 리뷰
4. [ ] 공식 문서 북마크 목록 작성

### 📚 장기 개선

1. [ ] AI 에이전트 프롬프트에 "공식 문서 우선" 명시
2. [ ] Incident Report 프로세스 표준화
3. [ ] 문서 참조 실패 시 경고 시스템 구축

---

## References

### 공식 문서
- [Claude Code Skills Documentation](https://code.claude.com/docs/skills.md)
- [Claude Code Plugins Reference](https://code.claude.com/docs/plugins-reference.md)

### 관련 커밋
- `85091a5` - 첫 번째 시도 (잘못된 구조)
- `14f9651` - 두 번째 시도 (잘못된 가설)
- `4ab6ced` - 세 번째 시도 (올바른 수정)

### 관련 문서
- [constitution.md](../../.specify/memory/constitution.md) - Core Principle VII
- [CLAUDE.md](../../CLAUDE.md) - .claude/ 디렉토리 구조
- [CHANGELOG.md](../../CHANGELOG.md) - 2026-02-14 01:18 엔트리

---

## Appendix: 올바른 .claude/ 구조

### Skills (권장)

```
.claude/skills/<skill-name>/
├── SKILL.md              # 필수: 스킬 정의 (YAML frontmatter 포함)
├── README.md             # 선택: 사용 가이드
├── templates/            # 선택: 템플릿 파일
├── examples/             # 선택: 예제
└── scripts/              # 선택: 헬퍼 스크립트
```

**SKILL.md 최소 구조**:
```yaml
---
name: skill-name                    # slash 커맨드 이름
description: 스킬 설명               # Claude가 자동 호출 판단에 사용
user-invocable: true                # 사용자가 수동 호출 가능
---

# 스킬 내용
```

### Commands (레거시)

```
.claude/commands/
├── command1.md
├── command2.md
└── ...
```

**특징**:
- 단순 `.md` 파일
- 여전히 작동하지만 제한적
- 지원 파일 불가
- 기능이 제한적

---

**Document Version**: 1.0
**Last Updated**: 2026-02-14 01:30
**Author**: Claude Sonnet 4.5 with User Guidance
