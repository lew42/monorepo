# The one browser rule

Every script starts Chromium through [`Server/Browser.mjs`](/Server/Browser.mjs) — never `chromium.launch(` directly — so the channel that opens no window lives in one place. `Browser.mjs` also starts `Server/browser-watchdog.mjs` (detached), which kills that Chromium the moment the launching node process is gone, however it died; `LEW_NO_BROWSER_WATCHDOG=1` turns it off. The full rule set: [Servex/doc/processes.md](/Servex/doc/processes.md). `.claude/hooks/syntax-guard.mjs` and `Server/window-lint.mjs` flag any `.launch(` elsewhere.

A chrome.exe launched this way is already recognisable: `channel: "chromium"` runs the build Playwright caches under `%LOCALAPPDATA%/ms-playwright/...`, never the owner's own Chrome install (2026-10-03 — a `--user-data-dir` tag was tried and dropped; Playwright's `launch()` refuses that flag). `Servex/Lifecycle.js`'s heartbeat sweep reaps one of these that's orphaned (its launching node process is gone) or older than 30 minutes — see `public/framework/ai/sessions/2026/10/03/0df64c47-b244-4a73-babb-16d86535c9b8/playwright-reap/`.

## Keeping a test browser off the live Servex (2026-11-02)

With `FENCE_SERVEX=1` in the environment, `Browser.launch()` calls `fence_servex(browser)` from [ServexFence.mjs](../ServexFence.mjs): every request any context makes to `127.0.0.1:8090`, `localhost:8090` or `servex.localhost` that the script has not stubbed itself is answered with a harmless stub. `core/Test/TestRunner.mjs --browser` sets it. Why, the test, and the `route.fallback()` rule: [Servex/doc/restart.md](/framework/servex/doc/restart.md#when-servex-crashes-what-comes-back-why-and-what-to-watch-2026-11-02).
