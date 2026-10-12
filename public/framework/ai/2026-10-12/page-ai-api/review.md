verdict: fix
1. [fix] `ai-api.md` is not linked from the core/Page readme or the Servex agents readme, and the brief asks for both. `git grep ai-api` on branch worktree/page-ai-api finds no hit in `public/framework/core/Page/readme.md`, `Servex/agents/readme.md` or `Servex/readme.md`.
2. [fix] The "Live proof" requirement is not met yet: the fresh-Haiku run that uses only the tool descriptions has not happened, and `ai-api.md:726-728` says so. The headless timings (39/12/14 ms) come from the builder's own probe, not from a model choosing its own deltas.
3. [fix] `Subpages.rename` and `Subpages.remove` never run `check_name` on `name` (Subpages.js:55-57, 72-73). So `page_set({"pages":{"remove":"../other-page"}})` moves a sibling page into `_removed/`. Validate `name` the same way `to` is validated.
4. [note] There are no 400/1200/1920/3440 layout shots or smoke results in the task folder. `build/` holds only `session.png` and `notes.png`, so the layout-check item is unproven.
5. [note] The `page_call`, `page_add` and `page_log` lines in page_tools.js (diff lines 274, 287, 349) have an extra indent level. Cosmetic only.
6. [note] In the `ai-api.md` table, "call any method" uses `{"q1":{"answer":"42"}}` as its example, but `answer` is a property. That clashes with the doc's own rule ("a key naming a method calls it"). Use a real method in the example, e.g. `{"q1":{"answers":{"add":{…}}}}`.
7. [note] `create_page` (Servex/pages.js:510) now goes through `Subpages.add`, which builds line 1 with `...more`. Any extra argument a caller passes ends up in line 1. That is harmless today, because the call passes only named fields.
8. [note] Simpler-way check: folding `pages` into `page_set` and keeping the old names as aliases is the smallest design that covers the brief's table. The session-only `AISessionDetail.Parts` duplicates what a Page content list does (CLAUDE.md law 6). `ai-api.md` already justifies this by the `Page.class.js` freeze, so it should become a follow-up once the split plan lands.

Widths given: none (no page shots; this is a light review: Requirements and Words only).

## Requirements
- "The model, one screen" (`core/Page/doc/ai-api.md`, delta table, links) — partly. The doc and the table cover every row asked for (ai-api.md:684-700), but the two readme links are missing (finding 1).
- "Tools match the model": the fewest tools, old names kept as aliases, each description carrying the model plus a pointer — yes. The `page_set` description teaches the three key rules, the card types and subpages, and links ai-api.md. The aliases point back to it (page_tools.js:306-317).
- "Subpage CRUD persists": made by a tool call, parent linked by code, rename/move by script, remove = move aside — yes, except the missing name check (finding 3). Subpages.js has a CLI with `--dry`, and the tests cover both page.jsonl and page.js parents (page_tools.test.mjs:405-442).
- "Live proof": a fresh Haiku from the descriptions alone, the browser sees each card within about 1 s, the run recorded — no (finding 2).
- "Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge" — not shown (finding 4).
- "Names: page, subpage, content, card" — yes. ai-api.md:702-706 defines each once.
- "Do not edit `Page.class.js`; only add" — yes. The diff does not touch it; it only calls the existing `link_child`/`unlink_child`.

## Words
- Plain, full sentences — yes. ai-api.md opens with what the API is in one sentence, and states its takeaway (one write tool, one read tool) up front.
- The same name every time — mostly. The doc title says "two tools", while the table also lists `page_read` as a row. That is consistent, but the aliases section lists four more names; fine, since they are clearly labelled as aliases.
- The owner's words — yes (page, subpage, content, card).
