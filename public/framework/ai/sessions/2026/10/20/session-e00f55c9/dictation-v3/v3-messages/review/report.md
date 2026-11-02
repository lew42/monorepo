verdict: fix
1. [fix] The generated `ext/Chat/v3/fixture/files.jsonl` is committed (commit fd16af054), against the brief's "Never `git add` the generated `files.jsonl`". It even lists the test's deleted temp copy (`live-v3-44248.jsonl`, then `gone`). Drop it from the branch before merge.
2. [fix] `ChatV3.test.mjs` now writes `fixture/live-v3-<pid>.jsonl` beside the v3 fixture, but `.gitignore:232` only covers `ext/Chat/v2/fixture/live-*.jsonl`. The v3 readme's Test section says the copy is "gitignored", which is false. A killed run leaves an untracked file that the next `git add` picks up. Add `public/framework/ext/Chat/v3/fixture/live-*.jsonl` to `.gitignore`.
3. [fix] The partial reply is no longer cleared when its settled Reply arrives. The old `chat_line()` did `this.partial = null; this.$partial.el.remove()`, and nothing replaced it. Until the wire sends `""`, the card shows the settled Reply and the reply being written together, and every redraw of the newest card puts the partial back (`prompt()`, the `queueMicrotask(stream…)` line). The readme still says it is drawn "until its settled Reply message arrives". Either clear `partial` in `update()` when a Reply lands on the newest Prompt, or correct the readme line.
4. [note] The header comment of `placement.test.mjs` says `// node ChatV3.test.mjs`; it should name `placement.test.mjs`.
5. [note] `ChatV3.test.mjs` dropped the old served-tree logic (`main_tree`/`served`). It writes the live copy into the test file's own tree, so it passes only when `base` serves that same tree (the worktree's server, or the main tree after merge). Against `monorepo.localhost` from a worktree, the live checks would time out. Say this in the readme's Test line.
6. [note] `core/Test/results.jsonl` (37 generated test-run lines) rides in the diff. This is harmless, but it is noise in a review diff.
7. [note] Every card's muted first-words title repeats the first line of its body right under it (shots/…/1200.png, each card's top band: "Can you hear me? A second thought, no…" then "Can you hear me? A second thought, no pause."). This was the owner's earlier choice, kept as it was; it is worth a second look in step 4.
8. [note] ChatV3 is a changed class, and no page shows its live instances or their state (`dirty`, `partial`, `limit`). The demo page shows only its output.

Widths given: 400, 1200, 1920, 3440 (one page, `/framework/ext/Chat/v3/`, on the worktree server).

## Requirements
- 1 "ChatV3.js draws the chat from `session.messages` … in list order, live from the Session's `delta` event" — yes — `card_roots()` filters `session.messages.messages`; `session.on("delta")` feeds `dirty`; the order check passes in ChatV3.test (six `m-` ids in list order)
- 2 "Tasks and Questions stay drawn beside, as now" — yes — shots/…/1200.png: the "Can you hear me?" Question sits nested in card 1, found through `task_for(p)` by the `prompt` link
- 3 "Drop the `{chat}` reply lookup; a Reply finds its Prompt by `re.to`" — yes — `chat_line`, `said` and `chat` are removed; `owning_prompt()` in placement.js; the 9 re.to checks pass in placement.test
- 4 "Keep: the live draft, the reply being written, AI title or first words, cleaned text" — yes, with a gap — `listen()`/`draft()` are kept (ChatV3.js:210), `stream()` is kept, `p.title` and `p.cleaned` are drawn; the settled Reply no longer clears the partial (finding 3)
- 5 "Paragraphs: a new paragraph where the gap … is long; name the threshold as a static" — yes — `PARAGRAPH_GAP_MS = 4000` in placement.js, also reached as `ChatV3.paragraphs`; shots/…/400.png, card 1: "A third thought, after a long pause." on its own line. The threshold is a module `export const`, not a class static; acceptable.
- 6 "Keep its methods small and overridable (draw a Prompt, draw a Reply, draw the marks slot)" — yes — `prompt()`, `reply()`, `marks()`, `note()`
- 7 "Prove it: node test over a fixture copied from v-u48msei, every Reply under its re.to, list order, a pause makes a paragraph" — yes — placement.test.mjs, 18 checks; the fixture adds two synthetic sentences, and both the test and the readme say so
- 8 "Headless shots at 400x860 and 1200 … read them yourself; existing suite passes" — yes — the test takes chat-v3-400/1200 shots; task.jsonl logs 16/16 Playwright, 18/18 node, 35/35 near-suite
- 9 "Docs, same branch: ext/Chat/readme.md (the V3 line) and views-on-messages.md (step 1 done)" — yes — both are in the diff, plus core/Session/Chat/readme.md "Next" ticked
- 10 "Do not edit ux/Dictate/, audio/Recite/, ext/Chat/v2/; message mastermind-ink-check first" — yes — none of those paths is in the diff; task.jsonl 21:33:42 logs the fence check
- 11 "Never `git add` the generated files.jsonl" — no — finding 1
- class page — no — finding 8 (a note: the view's state is short-lived)
- Indexing / continuity — yes — the task is in dictation-v3/session.jsonl; task.jsonl ends `wait on review` and the brief's Land checklist names every remaining step, so a fresh agent can continue from this folder. Stale docs: the v3 readme's "gitignored" claim (finding 2) and "until its settled Reply arrives" (finding 3); the `chat_line()` mentions in `ext/Chat/doc/*` are about Chat.js (V1) and are still true.
## Page structure
- page 1 (title says what it is) — yes — shots/…/1200.png top band: "Chat v3", and the intro names the fixture and `?src=`
- page 2 (one takeaway) — yes — a session's chat as cards per Prompt, with the Replies inside
- page 3 (most important first) — yes — the chat follows the one-line intro
## Navigation
- navigation 1 — a sidebar (site chrome), a bottom rail at 400, the ✦ drawer at 1920/3440; nothing this diff adds
- tabs — n/a
- links in cards — n/a
## Layout
- layout 1 (layout fits the content) — yes — `layout: standard`; a single chat column, right for a chat
- layout 2 (columns) — n/a
## Sizing
- sizing 1 (no overflow) — yes — `overflow_x false` at every width
- sizing 2 (measure) — yes — widest text 358/558/598/674 px, a readable line at every width
- sizing 3 (use of wide screens) — yes — empty 53/61/75 % at 1200/1920/3440 is the measure-capped chat column, with the drawer filling the right side at 1920+ (sheet.png)
## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — yes — `wraps` holds only `drawer-rail-ai`/`drawer-rail-menu` (3.2 lines, site chrome, not this diff); the card titles end in "…" rather than wrapping (400.png)
- wrapping 2 (tab rows) — n/a
## Spacing and padding
- spacing 1 (left edges align) — yes — `left_stack` h1/p 16 px at 400, 38 px at 1200; the cards sit on the same edge
- spacing 2 (gaps consistent) — yes — 400.png/1200.png: an even gap between cards and between replies, with a rule between reply blocks
- spacing 3 (no wasted band) — yes — at 400 the `chat-v3` band share is 1.599 and no band is `big_empty`
## Colour and contrast
- colour 1 (text contrast) — yes — the body is near-black on light grey; the muted titles and "show raw" are lighter but legible (1200.png)
- colour 2 (gray only for unsent words) — no — gray is still used for settled title text (the muted first-words title), as before this diff; the rule is about body words, so this is a note (finding 7)
## Flow
- flow 1 (reads top to bottom in order) — yes — Prompt → its sentences → "show raw" → 🧠 replies → its Question, in every card (1200.png)
- flow 2 (paragraph breaks) — yes — 400.png, card 1: the pause-based break
## Words
- content 1 (plain words) — yes — the intro and the page.js description are plain
- content 2 (jargon) — yes — "session.messages" in the intro is the module's own name, and the link explains it
- content 3 (short) — yes — the intro is two sentences
