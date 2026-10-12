# paging-fix-7 — the fix pass after audit 7 (Opus)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../mastermind-day/requirements.md`, `../../2026-09-04/mastermind-platform/minion-rules.md`, the two seventh audits — `../paging-audit-7/task.jsonl` (the newcomer: 5/5/5/4/5/5, eight steps passed, five items led by a field that says Saved and drops what you typed) and `../paging-audit-7b/task.jsonl` (the designer: conditions 1 and 2 true, the builder wears a drawer written for a simpler page; five items with file:line) — and `../paging-fix-6/task.jsonl`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css`, `ui-test`, `documentation`, `finish-task`. You own `public/imagine/paging/`.

## The merged list, in order

1. **The nest field never loses what you typed, and reads back.** Type a nest in the drawer, press *Make this a page* without Enter: a green tick names the file and the file has no `nest`. Read the field's live value at save time (and at every export), give it the same visible commit its neighbour has, and on arrival at `?nest=dashboard` the field shows `dashboard`.
2. **The drawer's exports are the page's, on both editors.** `config.js:229 node_for` / `:301 code_for_config` print seven words under "This page, as a file" / "The same page, as code" — on `/make/notes/` the printed `page.js` has no `pages:`/`children:`; on Build they disagree with the column's own file. Hand `fill_drawer` the node when the page has one and print with `build/words.js:207 code_for_node`. Then ONE file, ONE code box, ONE Save on a screen: skip the drawer's `json_box` when the page has its own Save; no link box over an `inner` stage (`stage.js:169` skips `from_url`, so the promised cold address is false there).
3. **Build keeps its nest.** `build/stage.js:51` builds its stage without `nest`; `build/page.js:377` sets `keep` and no `keep_nest` — two lines, both twins already in `make/page.js:108`/`:124`. Prove: put a dashboard in Build's box, press *Add a tab*, the dashboard is still there and the file pane says so.
4. **A page you make can be unmade.** No delete exists; a removed directory leaves the parent's `children:` naming a 404. Add delete to Make's row (it had one on 2026-09-05 morning — `×` — check `make/page.js`; if it went, bring it back) and to the made page's own drawer, removing the directory and the parent's child entry together. Prove: make, delete, the rail row is gone, the parent's `page.json` no longer names it, the url 404s cleanly.
5. **The builder's middle column** (`build.css:63`) is `position: sticky` with no height limit — 1617px in a 1400px window at 3440, painting over the file pane. `max-height` with its own overflow.
6. **Small:** `/imagine/paging/templates/navigation/`'s link text reads `words.js` while its href is `doc/mechanisms.md` — fix whichever is wrong; three places link raw `.md` (`/templates/theming/` "The proposal", `doc/persistence.md` from `/make/`, `/build/` and the made pages) — link the rendered page (`/imagine/paging/doc/persistence/`) instead.

## Prove it

`ui-test`: the nest field without Enter; a nested save read back; Build's nest surviving *Add a tab*; one Save on Build and on a made page; delete end to end. Screenshots at 1280 and 3440 of the drawer on Build and on a made page. Zero console errors at 400/1280/1920/3440 across the realm (104 pages last time; match it), only the known `readme/page.js` probe 404; restore any file a save test wrote; delete any page a test made.

## Fences and budget

Write only under `public/imagine/paging/`; this task dir. Never `core/`, `ext/`. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit. Budget ~350k tokens. Report in ≤ 10 plain lines: which of the six landed, the proofs for 1–4, what you left and why.
