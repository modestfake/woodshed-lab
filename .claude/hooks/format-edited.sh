#!/bin/sh
# PostToolUse hook: format + lint-fix the single file Claude just edited.
# Reads the hook payload on stdin, no-ops for non-TS files, never blocks the
# edit (enforcement is the lefthook pre-commit gate; this is just convenience).
f=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$f" ] && exit 0
case "$f" in
  *.ts | *.tsx)
    cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
    pnpm exec oxfmt "$f" >/dev/null 2>&1
    pnpm exec oxlint --fix "$f" >/dev/null 2>&1
    ;;
esac
exit 0
