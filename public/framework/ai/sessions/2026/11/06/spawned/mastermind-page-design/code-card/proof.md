# Proof — LiveCode card

| Check | Result |
|---|---|
| `node --check` on every edited/new `.js` | OK (highlight.js, LiveCode.js, LivePage.js) |
| `node public/live/LiveCode.test.mjs` | 4 passed |
| `node Server/smoke.mjs . /live/ /live/demos/code-card/ --base http://127.0.0.1:53343` | 15 ok, 0 fail — the only console/HTTP warnings are the pre-existing `/framework/ai/page-work.json`, `tasks.json`, session `index.json` 404s, confirmed present on plain `/live/` too (baseline, not from this change) |
| Shots | [400px](/live/demos/code-card/shots/400.png), [1200px](/live/demos/code-card/shots/1200.png) — no sideways scroll at 400, three cards (js/json/css) highlighted |
| No console errors specific to `/live/demos/code-card/` | confirmed (diffed against baseline `/live/` 404s) |

Commit: `717846174` on `worktree/pd-code-card`.
