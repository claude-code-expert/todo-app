#!/bin/bash
# Git hooks 설치 스크립트
# 사용법: bash .specify/scripts/bash/install-hooks.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
HOOKS_SRC="$PROJECT_ROOT/.specify/hooks"
HOOKS_DST="$PROJECT_ROOT/.git/hooks"

echo "🔧 Git hooks 설치 시작..."

# .git 디렉토리 확인
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "❌ .git 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# hooks 소스 디렉토리 확인
if [ ! -d "$HOOKS_SRC" ]; then
    echo "❌ .specify/hooks 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# pre-commit hook 설치
if [ -f "$HOOKS_SRC/pre-commit" ]; then
    # 기존 hook 백업
    if [ -f "$HOOKS_DST/pre-commit" ] && [ ! -L "$HOOKS_DST/pre-commit" ]; then
        echo "⚠️  기존 pre-commit hook을 백업합니다: pre-commit.backup"
        cp "$HOOKS_DST/pre-commit" "$HOOKS_DST/pre-commit.backup"
    fi

    # 심볼릭 링크 생성
    ln -sf "$HOOKS_SRC/pre-commit" "$HOOKS_DST/pre-commit"
    echo "✅ pre-commit hook 설치 완료"
else
    echo "⚠️  pre-commit hook 파일이 없습니다."
fi

echo ""
echo "📋 설치된 hooks:"
ls -la "$HOOKS_DST" | grep -v "\.sample$" | grep -v "^total" | grep -v "^\." | head -5
echo ""
echo "🎉 Git hooks 설치 완료!"
echo ""
echo "제거하려면:"
echo "  rm $HOOKS_DST/pre-commit"
