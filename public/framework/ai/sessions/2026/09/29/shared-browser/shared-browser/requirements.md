# One browser launcher, and a watcher that sees browser windows

The owner still got `ms-playwright/chromium_headless_shell-1234` windows after hidden-windows landed. They came from the health watchers the pool starts for each worktree (qf-2's started at 12:14:24, the moment one appeared). The VS Code tab switched every Server/ launch to `channel: "chromium"` in commit 38bfb384, and smoke passes with it. It is not yet proved from the real parent chain (Servex, then the pool, then health.mjs).

## Deliverables

1. **`Server/browser.mjs`**: one `browser(opts)` that every script uses to start Chromium. It sets the channel that opens no window, with windowsHide where it applies, and one place to change it. Move every launcher onto it: `Server/health.mjs`, `layout-check.mjs`, `padding-check.mjs`, `smoke.mjs`, `m4a2wav.mjs`, `.claude/skills/ui-test/drive.mjs`, `ext/DesignTool/diff/site-diff.mjs`, and any other a search finds.
2. **The guard:** `syntax-guard.mjs` and `Server/window-lint.mjs` flag a `.launch(` of Chromium anywhere except browser.mjs, the same way they flag a missing windowsHide.
3. **window-watch sees browsers:** add `chrome-headless-shell`, `chrome` and `chromium` to `TARGETS` in `Server/window-watch.mjs`, counting only windows owned by processes under the ms-playwright folder or started by our node processes. The owner's own Chrome is not ours.
4. **Proof from the real chain:** with window-watch running, have Servex's pool start a worktree (so its health watcher launches), run smoke.mjs and layout-check.mjs, and show window-watch logging zero visible windows. Then show it catching one: launch the old headless shell on purpose, from a scratch script, and see it logged.
5. One line in `Servex/doc/` or `Server/doc/` naming the rule: every browser goes through browser.mjs.

## Fence

The files named above. Main tree: these files are live system code, and Server/window-watch.mjs is not yet tracked in git. Never stash, checkout or reset.

## Added (mastermind-servex-3, from task-mastermind-dictation-playground)

6. **health.mjs false alarms.** The health-guard hook raised three false "you broke /framework/core/Page/" alarms. A check in `Server/health.mjs` measured a bare `.page`, which matched the homepage ancestor (0px when idle). Find every `.page` measurement in health.mjs and scope it to the page on screen (`.page.active-page`, as smoke-links did). The proof: /framework/core/Page/ runs through health.mjs with no finding.
