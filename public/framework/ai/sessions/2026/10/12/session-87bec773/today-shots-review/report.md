# Today's UI, shot and read (2026-10-12)

Every page was shot at 400 / 1200 / 1920 / 3440 through [Shots](/framework/ext/Shots/) (pictures in each page's own `screenshots/`). `Server/smoke.mjs` showed no console errors, only 404 warnings (below). I read the 400, 1200 and 3440 shots by eye; 1920 was shot but not read separately.

| Page | Defects found | Fixed | Handed off |
|---|---|---|---|
| [`/framework/ai/sessions/`](/framework/ai/sessions/) | 3440: table uses ~740px, right two-thirds empty; 400: tab bar hides SESSIONS/TESTS with no scroll cue | no | `ai/todo.md` |
| a session detail (peek) | page 404s its own `page.jsonl` and `ai/2026-10-11/files.jsonl` on every load | no | `ai/todo.md` |
| [`ext/DataGrid`](/framework/ext/DataGrid/) | 400: the "live instance" card overlapped the filters (the `@container` rule had no container) | yes, `916492fc2` | none |
| [`ext/Refine`](/framework/ext/Refine/) | 400: "Said" label squeezed by the session link | yes, now wraps | none |
| [`ext/Figma`](/framework/ext/Figma/) and `/colors/` | none; contrast labels and prime colour read correctly | n/a | none |
| [`/framework/library/`](/framework/library/), [`/layouts/`](/layouts/), [`core/Page`](/framework/core/Page/), [`/framework/ai/`](/framework/ai/) | none beyond the tab bar above | n/a | none |

Before/after (each in its page's `screenshots/`): DataGrid 400 `2026-10-12-173218` → `2026-10-12-173717`; Refine 400 `2026-10-12-173245` → `2026-10-12-173733`.

Not checked: the inbox-scrollbar rail and a page's Inbox tab (they need a live interaction, not a static shot).
