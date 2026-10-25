verdict: fix
1. [fix] Priority 1 is only half done: the second and third folders (`ai/2026/10/20/session-e00f55c9/`, `ai/sessions/2026/10/24/session-e00f55c9/`) are still on disk, and the session page still links "log, 2026/10/24" (one-url/shots/folder-1200.png, stats card). `Server/SessionConsolidate.mjs` exists but has not been run with `--apply`. The plan is to run it in main after the merge (session.jsonl, 00:26 log), so the merge is not done until that run's manifest is linked.
2. [fix] The project folder page shows raw JSONL to the owner (Page structure, Words). On shots/…sessions-and-tasks/1200.png the middle band is a file browser of `page.jsonl` source (`{"inbox":{"id":"n-bbbudg3q",…`; layout.json widest_text_sample is that line at every width), under the slug title "sessions-and-tasks". The minion's project-1200.png says this page "lists its task cards", but the review shots at head ac601e8f6 do not show that.
3. [fix] Stale docs (the readme check). `ai/sessions/readme.md:57` still says "One session: `/framework/ai/sessions/<id>/` → AISessionDetail". `StoreFolder.js`'s header still says "the flat /framework/ai/sessions/<id>/ session route is untouched", and AISessionDetail's top comment is stale too. The minion flagged all three as "left stale for the mastermind".
4. [fix] Unindexed: `Server/readme.md` names neither `SessionIdentity.mjs`, `SessionConsolidate.mjs`, nor the new tests `SessionIdentity.test.mjs`, `session-dir-clash.test.mjs` and `Servex/agents/turn-costs.test.mjs` (grep finds nothing). Law 10.
5. [fix] Done-when "its numbers are on the tracking page" is not shown. In shots/tracking-1200.png the identity table's visible rows include neither e00f55c9 nor 7c6c8d93. The shot also predates the merge: its heading reads "4. Session identity", but the code now says "6.". Run `TrackingCheck --id` for both ids and reshoot.
6. [fix] Owner ask "give agents a 'my own session' path… fix it if not": for a VS Code tab it is only proposed (identity.md "A VS Code tab cannot do that yet", ⬜, sent to ai-system-mastermind as i-mvndoowl03x). The reason is recorded (shared `.mcp.json` config), but the ask is not met.
7. [note] identity.md's evidence numbers disagree with each other. For 7c6c8d93 the short answer says "4 `compact_boundary` lines", the results table says "Compactions: none", and identity-7c6c8d93.json says 10. For e00f55c9 the doc says 18,306 lines, but the JSON says 18,653 lines and 7 compactions, while the brief said 14 compactions. Quote the JSON.
8. [note] The tracking identity table clips its right columns at 1200 ("Recour", "Folder" cut off; tracking-1200.png, bottom band).
9. [note] I started `node Servex/agents/page_tools.test.mjs`; it ran past 120 s and printed no pass line, so the typo-proof tests are unverified here. The other four tests passed: SessionIdentity 9, session-dir-clash 10, turn-costs 6, stale-close 14.

Widths given: 400, 1200, 1920 and 3440 of `/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/`, plus tracking at 400 and 1200. I also looked at the minion's one-url/shots/folder-1200.png.

## Requirements
- 1 "What made eb0fe509… is anything filed under it?" — yes — identity.md short answer: Figma `create_session` result on transcript line 3692; nothing in ai/sessions holds it.
- 2 "Confirm that compaction keeps the id, for tabs and for SDK agents" — yes — identity-e00f55c9.json: 7 compactions, ids_after_compaction [e00f55c9]; identity-7c6c8d93.json: ids_after_compaction [7c6c8d93] (counts inconsistent, finding 7).
- 3 "SDK agents change id on revive… resume, fork, or rollover?" — yes — a renewal at the 100k-token line, shown by the agent log's `renew` line 3901.
- 4 "Is the cost of both ids counted once?" — yes — 0 shared messages; the session_turns bug is fixed (turn-costs.test 6 passing). The ledger gap (turn $ 1.3–1.7× transcript $) is open as a ⬜.
- 5 "Where do the new id's log lines go… work in flight?" — yes — identity.md table rows 5–6.
- 6 "StaleClose… fix it… with a test" — yes — commit 2007ae0fc, stale-close.test 14 passing (it landed before this task).
- 7 "Write core/Session/doc/identity.md, linked from the core/Session readme and the ai readme" — yes — core/Session/readme.md:95,103; ai/readme.md Sessions line.
- 8 "A check script that proves it… numbers on the tracking page" — partly — Server/SessionIdentity.mjs plus TrackingCheck check 6; the two runs are not visible on the page (finding 5).
- 9 "Long-lived roles and context (proposal)" — yes — identity.md options A/B/C, a recommendation, what exists and what is missing.
- 10 "A Servex restart must never fork a session id. Prove it" — yes — 11 of 11 revived agents kept their ids; 3 new ids, none a fork.
- 11 "Singleton rollover logged, linked, role docs say restartable" — yes — the spawn/renew line in Agents.js; ai-system-mastermind.md "A fresh session is still you".
- 12 "Explain why it rolled over tonight" — yes — identity.md "Why ai-system-mastermind became 7c6c8d93".
- 13 "A write to a session folder that doesn't exist gets refused" — yes — page_tools.js resolve(); page_tools.test asserts it (unverified run, finding 9).
- 14 "Give agents a 'my own session' path… fix it if not" — no — finding 6.
- 15 "Document how a tab gets its folder, why id-based" — yes — identity.md "One session, one folder, one URL".
- 16 "One folder: (1)" — no — (2) and (3) still exist (finding 1).
- 17 "The hook writes prompts into the real record's folder" — yes — the prompt-relay.mjs diff uses `DatedFiles.sessions.session_dir`.
- 18 "(2) and (3) are moved into (1) by a script with a manifest" — no — the script is written but not applied (finding 1).
- 19 "The page lives at the folder's own path… the uuid URL only redirects" — yes — one-url/shots/folder-1200.png and uuid-1200.png; AISessionsPage.route redirect.
- 20 "Every link points there" — mostly — links go through AISession.page_url; the sessions readme still documents the uuid URL (finding 3).
- 21 "TaskDirs never opens a second day folder" — yes — session_dir takes the oldest folder; session-dir-clash.test "36 days later… the oldest folder wins".
- 22 "Find out what the stray ai/sessions/a56900e3-…/ is" — yes — an empty-transcript session; Session.locate now files it by birthtime. The folder is still flat on disk, which is expected until the indexer runs.
- 23 "The task is completed with its outcome and links" — no — still in review (expected).
- Class: "can you open a page that shows its live instances?" — yes for SessionIdentity (tracking page, check 6); SessionConsolidate is a script whose output is its manifest.
## Page structure
- page 1 (says what it is) — no — 1200.png top band: the title is the slug "sessions-and-tasks"; the body is a file browser.
- page 2 (one takeaway) — no — the main band is raw page.jsonl source (finding 2).
- page 3 (most important first) — no — the file list and JSON come before any task card.
## Navigation
- navigation 1 — tabs (AI top tabs), a sidebar; the drawer rail at 400.
- tabs fit one row — yes — layout.json tab_rows 1 at every width.
- current place shown — yes — SESSIONS tab marked, 1200.png.
- sidebar — yes — consistent across widths, sheet.png.
## Layout
- layout 1 (content uses the width) — no — the viewer is a fixed box about 600 px wide; layout.json empty 0.458 at 1200 and 0.574 at 3440.
- layout 2 (no overflow) — yes — overflow_x false at all four widths.
## Sizing
- sizing 1 (bands sized to content) — yes — the flow band share is 0.45–0.59; nothing is big_empty.
- sizing 2 (scales at 3440) — no — the same small viewer, with ink 0.495 at 3440.
## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — no — drawer-rail buttons wrap to 3.2 lines at 400; mode-btn to 1.7 lines at 1200+. This is chrome, not this diff.
- tracking table — no — columns clipped at 1200 (finding 8).
## Spacing and padding
- spacing 1 (consistent rhythm) — yes — title → flow → inbox chip gaps are even, 1200.png.
- spacing 2 (left stack) — yes — h1 doc-well 14/19/27/54 px, which scales.
## Colour and contrast
- colour 1 (text readable) — yes — dark viewer with light mono text; orange accents on the list.
- colour 2 (tokens, not one-offs) — yes — no new colours in the diff.
## Flow
- flow 1 (reader knows what to do next) — no — a reader sees JSON, not tasks or a way into them.
## Words
- content 1 (plain, the owner's words) — yes — identity.md opens with the owner's quote and plain short answers.
- content 2 (no raw data shown) — no — raw JSONL on the page (finding 2).
- content 3 (numbers agree with their source) — no — finding 7.
- content 4 (a fresh agent can continue) — yes — session.jsonl's 00:26 log names the next steps (review 7 → smoke → merge → SessionConsolidate --apply), and identity.md's ⬜ list holds the rest.
