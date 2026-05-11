#!/usr/bin/env bash
set -euo pipefail

run_step() {
  local name="$1"
  shift
  echo "==> Running step: $name"
  if ! "$@"; then
    echo "STEP FAILED: $name" >&2
    exit 1
  fi
}

run_step "install"    pnpm install
run_step "lint"       pnpm lint
run_step "typecheck"  pnpm typecheck
run_step "test"       pnpm test

echo "==> Running step: root-name-check"
PKG_NAME=$(node -e "console.log(require('./package.json').name)")
if [ "$PKG_NAME" != "ai-content-factory" ]; then
  echo "STEP FAILED: root-name-check - package.json name must be 'ai-content-factory', got '$PKG_NAME'" >&2
  exit 1
fi

echo "==> Running step: naming-check"
if grep -riqE 'book|chapter|novel' packages/core/src/ 2>/dev/null || find packages/core/src -regextype posix-extended -iregex '.*(book|chapter|novel).*' -print -quit | grep -q .; then
  echo "STEP FAILED: naming-check - prohibited naming found in packages/core/src/" >&2
  exit 1
fi

if [ -n "${DATABASE_URL:-}" ]; then
  run_step "db:check" pnpm db:check
else
  echo "==> Skipping step: db:check (DATABASE_URL not set)"
fi

echo "==> All CI steps passed."
