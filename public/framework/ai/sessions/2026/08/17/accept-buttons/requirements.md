# accept-buttons — Mike rubber-stamps each layout change from the accept screen

Laws: less is more · clarity · prioritize. **Deliverable: Accept / Reject on every row of `/framework/ai/2026-08-17/layout-primitives/`, the verdict recorded, the row showing it. Final message ≤ 15 lines.**

Mike: *"a Before + After UX that shows the change, with an accept button would be pretty sweet. That's how I'd like to run this framework/site. You find me improvements, I rubberstamp them."* The screen exists (`layout-primitives/page.js` + `changes.js`, 22 rows across three waves, each with a one-line revert). Only the buttons and the record are missing.

## Build

1. Each row: **Accept** · **Reject** buttons (reuse the site's button; no new component). Click → append one line to `layout-primitives/verdicts.jsonl`: `{"verdict": {"id": "<change id>", "accept": true|false, "at": "<ISO>"}}` — via the dev socket the way `ext/DesignTool/audit/twin.js:85-91` does (`Socket.singleton().async_rpc("write", path, existing + line)` — read back, append, resend whole; say so in a comment). If `ext/JSONL` or `ext/Saver` already offers an append, use that instead — check their readmes first.
2. On load, read `verdicts.jsonl` (latest verdict per id wins) and show it on the row: an `accepted` / `rejected` tag; a rejected row shows its revert line under a "to apply" label (an agent applies reverts — the page does not touch CSS). A header line: `N accepted · N rejected · N open`.
3. Nothing else changes on the screen. Prove headless: click Accept on one row and Reject on another in a fresh context, reload, both tags present, `verdicts.jsonl` has two lines; then **remove your two test lines** so Mike's file starts empty (or leave it absent — say which). Shot of the screen with the tags saved here.
4. One line in `ext/AITask/readme.md`? No — this is a task page. Put the how-it-works in a comment at the top of `page.js` and one line in `layout-primitives/requirements.md` §"accept screen".

## Rules

- Files: `ai/2026-08-17/layout-primitives/{page.js,changes.js,requirements.md,verdicts.jsonl}`, this dir. Not the Server, not `ext/**` (if the RPC you need doesn't exist, log it and stop — a proposal is fine).
- `code` skill once; `finish-task`. Log in `task.jsonl` (bash `printf`; timestamps from `date -Iseconds`); bump step. Never Mike's live tabs; headless only.
