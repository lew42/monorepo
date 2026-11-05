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

## Done means: output (worktree, before the merge)

```
$ ls public/framework/ai2
ls: cannot access 'public/framework/ai2': No such file or directory
$ rg "ai2/x.js" on lines with import / from / src= (code, excluding sessions and archive)
public\framework\ai\dashboard\page.js:124:// from (`CardList`, ai2/inbox.js) — NOT the whole rail (composer, flagging,
public\framework\ext\drawer\tabs.js:29: * flip without re-importing anything, the same shape `ai2/inbox.js`'s
public\framework\ext\Refine\prompt-card.js:28: * card: `ai2/inbox.js`'s own comment explains why nothing in `ai2` imports
public\framework\ext\Refine\prompt-card.js:32: * and `ai2/faces.js` import it from here.
public\framework\core\Page\ext\Inbox\servex.js:3:/* SERVEX'S ADDRESS, AND WHETHER IT IS UP — moved here from `ai2/inbox.js` (2026-09-30,
public\framework\core\Page\ext\Inbox\servex.js:4:   review #3 of inbox-ext) so the Inbox extension imports nothing from AI 2. `ai2/inbox.js`
(the 6 hits are all comments; no import statement or script src names ai2/)
$ node check.mjs (worktree server)
/framework/ai2/ -> /framework/ai/ | title: AI | errors: only the generated-json 404s that /framework/ai/ also has
/framework/ai2/needs/ -> /framework/ai/live/ | title: AI | errors: only the generated-json 404s that /framework/ai/ also has
/framework/ai2/log/ -> /framework/ai/log/ | title: AI | errors: only the generated-json 404s that /framework/ai/ also has
/framework/ai2/2026/10/20/session-e00f55c9/ -> /framework/ai/sessions/2026/10/20/session-e00f55c9/ | title: AI | errors: only the generated-json 404s that /framework/ai/ 
/framework/ai/ -> /framework/ai/ | title: AI | errors: only the generated-json 404s that /framework/ai/ also has
/framework/dev/DevBar/ -> /framework/dev/DevBar/ | title: DevBar | errors: only the generated-json 404s that /framework/ai/ also has
```
