# live-page-error — landed

- Cause: unheld direct edits to live sessions-page modules (commits a3275bd04, 31ef0c85d); one reload hit a half-written batch. Merge was not the cause.
- Fix: `.claude/hooks/auto-hold.mjs` (+ settings.json), `Socket.js` pre-flight and pill bug, `merge.mjs` screenshots gate. Doc: `Server/doc/watch.md` last section.
- Open: Bash/PowerShell writes bypass the auto-hold; no Servex restart needed (hook + client + merge.mjs only).
