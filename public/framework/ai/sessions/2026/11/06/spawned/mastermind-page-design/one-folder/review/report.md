verdict: fix
1. [fix] Ask 5 is not fully met: `Servex/agents/doc/own-page.md:14` still says both doors print "Your own page is /framework/ai/sessions/<id>/", and its rule section still calls that url the session's folder. That is the exact wording this task retired, in the doc `Servex/agents/readme.md:136` links as "how it learns its own page". Rewrite it to the dated-folder line (`Agents.folder_line`) and link `ai/sessions/doc/one-folder.md`.
2. [fix] Ask 5: `public/framework/ai/doc/agent-context.md:26` still says whoami gives "its page `/framework/ai/sessions/<id>/`". Change it to the dated folder.
3. [fix] A fresh agent can't pick this up from the task folder alone. `one-folder/task.jsonl` holds one line (the shots), with no open, log or landing. The "Next: fold the 1,410 old twins on the main tree" step exists only as a sentence in `requirements.md`. It is not filed as a task on the session record, so nothing will pick it up (CLAUDE.md law 10, "file each ask").
4. [note] The comments in `.claude/hooks/prompt-relay.mjs:21` and `:239` still say the prompt goes to `sessions/<session_id>/page.jsonl`. The code at `:117` already uses the dated folder, so only the comment is stale. `Server/session-summary.mjs:14` has the same stale comment (`sessions/<id>/cache.jsonl`).
5. [note] The `page_tools.js` PAGE_PATH description still ends "Omit it to mean YOUR OWN page, /framework/ai/sessions/<your agent id>/". As a route that is harmless, but it is the same flat-looking form the new rule warns against. The tool schema in this reviewer's own prompt shows it verbatim.
6. [note] `agents.md` says to find the folder with `SessionFolders.at(store).of(id)`, while the hook and `Agents.folder_line` call `record_of(id)`. Both exist (`SessionFolders.mjs:115`, `:162`). The doc should say which one a writer uses and why.
7. [note] The moved `239b0bd4` page shows "No tasks recorded under this folder" (shots/…/1920.png, band 3). The two moved `page.jsonl` lines (a log and a finish outcome) are kept on disk but drawn nowhere on the page, so the data survived the move but can't be seen. Not checked: whether "This session's page →" (the uuid url) redirects back to this same folder in a loop.

Widths given: 400 and 1920 (one page: the moved `/framework/ai/sessions/2026/11/03/session-239b0bd4/`). The diff changes no page code; the shots prove the moved folder renders.

## Requirements
- 1 "Every writer goes through one path function (the dated folder only)" — yes — the page tool refuses flat uuid folders (`page_tools.js` FLAT_SESSION in `resolve_file`, UUID excluded from `plain`); the hook and whoami resolve through `SessionFolders.record_of` ?? `DatedFiles.sessions.session_dir`. In the worktree, the remaining `sessions/${session}/` strings are link urls (redirects), not writes. Ran the hook in qf-3: it printed `/framework/ai/sessions/2026/11/06/session-264be1c2/`
- 2 "Flat sessions/<uuid>/ folders get migrated or linked. No data is deleted" — yes — `239b0bd4…/page.jsonl` moved byte-identical to `2026/11/03/session-239b0bd4/` (diff lines 257–272); no flat uuid folder is left under `sessions/` in qf-3
- 3 "A test or startup check fails loudly when a flat <uuid>/ folder appears" — yes — `node Server/SessionConsolidate.test.mjs` → "ok" (scratch store fails on a flat folder, real store has none); `--check` prints FAIL and exits 1; TaskLoop posts a risk note daily while any exist
- 4 "The rule is written prominently in agents.md and the sessions readme" — yes — a ⚠ section in `ai/agents.md` and a ⚠ callout at the top of `ai/sessions/readme.md`, both linking `doc/one-folder.md`
- 5 "Every doc, hook or prompt that tells agents the wrong path is fixed" — no — `Servex/agents/doc/own-page.md:14` and `ai/doc/agent-context.md:26` still give `/framework/ai/sessions/<id>/` as the agent's page (findings 1, 2)
- Class live-instances page — n/a (no class added; `Agents.folder_line` is a static helper)
- Fresh agent can continue from the task folder — no — `task.jsonl` has one line; the twin fold is not filed as a task (finding 3)
- Docs indexed and current — mostly — `one-folder.md` records the new writer cause and check; `SessionConsolidate.test.mjs` is named in the sessions readme; two docs are stale (findings 1, 2)
- Tests pass — yes — `SessionConsolidate.test: ok`; `turn-costs.test.mjs` 6 passing (the old and new whoami wordings both parse)

## Page structure
- page 1 (title says what it is) — yes — shots/…/1920.png, top band: "session-239b0bd4"
- one main idea per page — yes — a dated session folder with a link to the session page
- content first — yes — the title, then the link, then the task status

## Navigation
- identify — tabs (AI section bar), a sidebar (1920), a bottom rail (400), a side panel (AI chat, 1920)
- tabs on one row — yes — layout.json tab_rows 1 at 400 and at 1920
- tabs fit — no — shots/…/400.png, top band: "QUEUE" is cut off at the right edge (pre-existing, not this diff)
- current tab marked — yes — 1920: SESSIONS underlined
- bottom rail at 400 — yes — shots/…/400.png, bottom band: three icons
- rail buttons wrap — n/a — layout.json wraps lists drawer-rail-ai/menu at 3.2 lines; the icons look fine in the shot (icon above a hidden label)

## Layout
- the content column suits the content — yes — a short page; the 1920 column leaves room, empty 0.78
- no overflow — yes — overflow_x false at both widths

## Sizing
- title size fits the width — yes — page-title band share 0.04 at 400, 0.053 at 1920
- widest text within measure — yes — widest_text 342 (400), 456 (1920)

## Wrapping
- nothing wraps that shouldn't — yes — no text wraps; layout.json wraps lists only icon buttons (mode-btn, drawer-menu, chatbox-compose-more), which are not visible as wraps in the shot

## Spacing and padding
- left edge is one line — no — left_stack h1 14 vs p 16 at 400, and 27 vs 54 at 1920. In the shot, the title, link and text line up; the gap that shows is "Files · 81", which sits further left than the body (shots/…/1920.png, bottom band; 400.png band 4). Pre-existing, not this diff
- band padding — yes — bands at y 118/200/253 (400): steady rhythm

## Colour and contrast
- text readable — yes — dark on light grey; the muted "No tasks recorded…" line is still legible
- accent used for links only — yes — orange underline on "This session's page →" and "Files · 81"

## Flow
- the reader knows what to do next — no — "No tasks recorded under this folder", yet the folder now holds the moved page lines with a finish outcome, and the page doesn't show them (finding 7)

## Words
- plain words, no jargon — yes — `agents.md` and the readme callout say "one session, one folder, always dated" in full sentences
- the new whoami line is clear — yes — "Your session is <id>; its one folder is <url> (… /framework/ai/sessions/<uuid>/ is only a redirect, never a folder)"
- one-folder.md says why — yes — it names the cause (the page tool treated an existing flat folder as a plain path) and the date
- no stale wording left — no — findings 1, 2 and 4
