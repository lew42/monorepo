# The one browser rule

Every script starts Chromium through [`Server/browser.mjs`](/Server/browser.mjs) — never `chromium.launch(` directly — so the channel that opens no window lives in one place. `.claude/hooks/syntax-guard.mjs` and `Server/window-lint.mjs` flag any `.launch(` elsewhere.

A chrome.exe launched this way is already recognisable: `channel: "chromium"` runs the build Playwright caches under `%LOCALAPPDATA%/ms-playwright/...`, never the owner's own Chrome install (2026-10-03 — a `--user-data-dir` tag was tried and dropped; Playwright's `launch()` refuses that flag). `Servex/Lifecycle.js`'s heartbeat sweep reaps one of these that's orphaned (its launching node process is gone) or older than 30 minutes — see `public/framework/ai/2026-10-03/playwright-reap/`.
