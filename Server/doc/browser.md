# The one browser rule

Every script starts Chromium through [`Server/browser.mjs`](/Server/browser.mjs) — never `chromium.launch(` directly — so the channel that opens no window lives in one place. `.claude/hooks/syntax-guard.mjs` and `Server/window-lint.mjs` flag any `.launch(` elsewhere.
