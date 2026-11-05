# ai2 removal: result

- **Folder:** `public/framework/ai2/` is gone. `page.js` (renamed `page.js.archived`), `ai2.css` and `readme.md` are in `ai/archive/ai2/`; 18 one-line shims and 5 generated listings were removed (git keeps them). Script: `move-ai2.mjs` (dry run, `--apply`), manifest: `manifest.json`.
- **295 audit lines (nothing missing, nothing restored):**
  - `ai2-retire/audit-ai2.mjs` cannot be rerun: it scans `ai2/tasks`, which the 2026-11-01 cleanup already removed (ENOENT at line 240, in the main tree too).
  - That cleanup's own check, `ai2-retire/verify.json` (written by `move-ai2.mjs --verify`): 1,260 distinct lines from 1,560 removed files, LOST 0, 815 lines appended to 9 files.
  - My read-only `lines-check.mjs`, from git at `fa90c3a41^`: 72 tracked lines. 17 are identical in the store, 54 are rewritten there (task stubs point at real task folders that exist; the rest match by content), and 1 is a session-start line (`v-js3vqn5`) whose session record is at `sessions/2026/10/12/v-js3vqn5/session.jsonl`.
  - The big untracked part: the 240 lines of the 2026-10-13 `session-730e8a7b` card log are in the store (`cards/session-730e8a7b/page.jsonl` has 284 lines, its own 44 plus the 240).
- **Dev bar chat:** `chat-proof.mjs`: `chat.js` exports `chat_button, default, open_page_chat`; `AgentTalk` resolves from `ai/rail/live.js`; 7 chat elements render on `/framework/dev/DevBar/?chat=open`; no page errors. The only 404s are generated, gitignored json files that `/framework/ai/` also lacks.
- **Old addresses:** an inline script in `public/index.html` (works on the static host). `check.mjs` and `urls.mjs` show `/framework/ai2/`, `/needs/`, `/log/`, a dated card and a session folder all land on a real page. 531 card `page.jsonl` files still name `"class": "/framework/ai2/card.js"`; `core/Page/Jsonl.js` maps that one path (the card page broke without it).
- **Dead `ai/` folders** (not moved): section 4 of `../ai2-and-ai-folders/findings.md`.
- **Merge output and what was closed:** the last lines of `session.jsonl`.
