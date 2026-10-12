# server-perf STATE
Landed on michael/dev (2c4913cce): socket/RPC per-message logs off (SOCKET_LOG=on). Findings for directory (already off), pool (Pool.js, Servex-owned, not edited) and whisper (already logs exit codes) are in Server/doc/perf-2026-10-09.md.
Open: dev-server restart needed for the logging change; merge used --skip-smoke (the worktree had no dev server to smoke) after an import check.
