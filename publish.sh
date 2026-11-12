#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"

REPO_NAME="EE_Portfolio"
BRANCH="main"
printf '\n=========================================\n'
printf ' Engineering Portfolio GitHub Publisher\n'
printf '=========================================\n'

for command in git gh python3; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'ERROR: Required command missing: %s\n' "$command" >&2
    exit 1
  fi
done

printf '[1/6] Validating portfolio content...\n'
python3 build_data.py

printf '[2/6] Preparing local Git repository...\n'
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b "$BRANCH"
fi
CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "$CURRENT_BRANCH" ]]; then
  printf 'ERROR: Detached HEAD is not supported.\n' >&2
  exit 1
fi
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  printf 'ERROR: Current branch is %s, expected %s. Switch branches before publishing.\n' "$CURRENT_BRANCH" "$BRANCH" >&2
  exit 1
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "Publish portfolio updates"
else
  printf 'No new changes to commit.\n'
fi

printf '[3/6] Checking GitHub repository...\n'
if ! gh auth status >/dev/null 2>&1; then
  printf 'ERROR: GitHub CLI authentication is required. Run: gh auth login\n' >&2
  exit 1
fi
# Ensure Git HTTPS requests use the authenticated GitHub CLI.
gh auth setup-git
OWNER="$(gh api user --jq .login)"
TARGET_URL="https://github.com/${OWNER}/${REPO_NAME}.git"
if git remote get-url origin >/dev/null 2>&1; then
  REMOTE_URL="$(git remote get-url origin)"
  case "$REMOTE_URL" in
    "https://github.com/${OWNER}/${REPO_NAME}"|"https://github.com/${OWNER}/${REPO_NAME}.git"|"git@github.com:${OWNER}/${REPO_NAME}.git") ;;
    *) printf 'ERROR: origin points to a different repository: %s\n' "$REMOTE_URL" >&2; exit 1 ;;
  esac
else
  if gh repo view "${OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
    printf 'Using existing GitHub repository %s/%s\n' "$OWNER" "$REPO_NAME"
  else
    printf 'Creating GitHub repository: %s\n' "$REPO_NAME"
    gh repo create "$REPO_NAME" --public --description "Electrical engineering portfolio and project showcase" --confirm
  fi
  git remote add origin "$TARGET_URL"
fi

printf '[4/6] Pushing %s to %s/%s...\n' "$BRANCH" "$OWNER" "$REPO_NAME"
git push --set-upstream origin "$BRANCH"

printf '[5/6] Checking GitHub Pages...\n'
if gh api "repos/${OWNER}/${REPO_NAME}/pages" >/dev/null 2>&1; then
  printf 'GitHub Pages is already configured.\n'
else
  printf 'Enabling GitHub Pages from %s at repository root...\n' "$BRANCH"
  gh api --method POST "repos/${OWNER}/${REPO_NAME}/pages" -f 'source[branch]=main' -f 'source[path]=/' >/dev/null
fi

printf '[6/6] Verifying GitHub Pages configuration...\n'
if ! gh api "repos/${OWNER}/${REPO_NAME}/pages" --jq '.html_url' >/dev/null; then
  printf 'ERROR: Could not verify GitHub Pages.\n' >&2
  exit 1
fi
printf '\nPublishing push and Pages configuration succeeded.\n'
printf 'Repository: https://github.com/%s/%s\n' "$OWNER" "$REPO_NAME"
printf 'GitHub Pages: https://%s.github.io/%s/\n' "${OWNER,,}" "$REPO_NAME"
printf 'Note: GitHub Pages deployment may still be processing.\n'
