verdict: fix
1. [fix] The new "Twins fold" table is not on either shot (requirement 2): the newest truth.jsonl line (2026-11-09 06:05 UTC) has no `fold` key, so `page.js` skips the block. Run `node Server/Truth.mjs --write` against the main tree (worktree `truth.jsonl` tail has no `fold` either), then reshoot — shots/127-0-0-1-49465-live-truth/1920.png, 400.png.
2. [fix] A merged record with no readable cost counts as "lost". `cache.jsonl` is gitignored, so `node Server/FoldAccounting.mjs` run inside the worktree prints `mismatched 404, lost 404, cost_after 0`; from the main tree (`--root C:/Code/lew42/monorepo`) it prints `matching 1408, mismatched 2, lost 0`. A null merged cost should read "unreadable", not lost, and Truth.mjs `--write` from a worktree would publish 404 losses. Say in both readmes that the check needs the main tree's caches.
3. [fix] The "reader" verdict only compares cache versions: session 05abc8e4 drops from $0.257 to $0 and is called `reader: merged cache is v2, half v1`. A recost to exactly zero is not a recost; that case (merged usd null/0) should count as lost or unreadable.
4. [fix] `Server/readme.md` lists every script (Truth.mjs at line 56, SessionConsolidate.mjs at line 55) but not `Server/FoldAccounting.mjs` or its test (law 11, readmes are the index).
5. [fix] A fresh agent can't continue from the task folder: it has no `plan.md` (brief-common asks for one), no log or decision lines, and no landing. session.jsonl ends with "session ended (other) without landing", and the totals and the mismatch answer the brief asks for are reported nowhere. Commit 321ddc843 on worktree/fold-accounting is the only record.
6. [note] The brief says the halves' cost and tasks are "added together"; the code takes the larger half instead, because twins are two records of one session. The reason is in the code comment and the truth readme, but the owner should hear about this departure from their words in the report, not find it in code.
7. [note] Every half has 0 tasks (`tasks_before 0`), so the task part of the check never fires on real data. Say so where the table is shown.
8. [note] The CLI exits 1 when the only differences are reader differences (`mismatched 2, lost 0`). Exiting on `lost` would match the page's own "nothing lost" headline.
9. [note] The moved-aside halves are shown as local paths, not links. That is unavoidable because they are outside the site, but requirement 2 asked for links, so state it.

Widths given: 400 and 1920.
Totals (main tree, run by this reviewer): 1,410 checked, 1,408 matching, 2 differ, 0 lost; cost $6,108.36 before vs $6,090.15 after; tasks 0 before vs 86 after. Both differences are later recosts (v2 cache): e938046a ($1,616.64 → $1,593.88) and 05abc8e4 ($0.26 → $0, see finding 3). Tests: `FoldAccounting.test: ok`, `Truth.test: ok`.

## Requirements
- 1 "an accounting check, computed by code… per session and in total… read only" — yes, with a departure — Server/FoldAccounting.mjs reads cache.jsonl summaries and Session/Task `replay().tally()`. It writes nothing, but takes the larger half instead of the sum (note 6), and calls a missing cache a loss (fix 2).
- 2 "one table on /live/truth/: totals row, then the mismatches listed… if everything matches, say so in one line" — no — the code is in page.js, but the table is absent from both shots because no truth.jsonl line has `fold` (fix 1).
- 3 "moved-aside originals linked from sessions/readme.md… manifest, plus the check's command" — yes — the diff adds one paragraph to public/framework/ai/sessions/readme.md with the path, the purpose, a manifest link and `node Server/FoldAccounting.mjs`.
- 4 "a lean test… Truth.test.mjs still passes" — yes — both print ok (run in the worktree).
- class shows live instances — n/a, because FoldAccounting is a server-side checker with no state to watch. The /live/truth/ table is its view.
## Page structure
- page 1 — yes — shots/…/1920.png, top band: "Truth", "Counted by code once a day".
- page 2 — n/a
- page 3 — yes — the headline count comes first, then the table, then how each row is counted. The fold block sits before the trend (from page.js; not drawn).
- page 4 — n/a
- page 5 — n/a (the page already existed)
- page 6 — n/a
- page 7 — yes — layout.json `layout: standard` at both widths.
- page 8 — yes for the existing page. In the new table, "Differ" vs "Lost" needs the footnote to explain it (from code).
- page 9 — yes
- page 10 — yes — numbers go in a table.
- page 11 — yes — the new section is titled "Twins fold: nothing lost". That title stays fixed even when `lost > 0` (from code), so it would contradict its own sentence; a small point.
- page 12 — n/a
## Navigation
- navigation 1 — a bottom rail at 400 (drawer-rail), a side drawer (AI panel) at 1920. No tabs.
- navigation 2 — n/a
- navigation 7 — yes — shots/…/400.png, bottom band: the rail sits below the content, layout.json no overflow_x.
## Layout
- layout 1 — not measured (no 3440 given)
- layout 2 — yes — standard
- layout 3 — yes — the reading column is 626px widest at 1920 and 368px at 400.
- layout 7 — yes — bands: title 0.053 share, `truth` 1.831 share at ink 0.278 (1920), no big_empty.
- layout 9 — yes — the empty 0.676 at 1920 is the right gutter beside the standard column, accepted.
- layout 10 — yes
- layouts 4–6, 8, 11–12 — n/a
## Sizing
- sizing 13 — yes — the table rows are auto height.
- sizing 16 — yes — overflow_x false at both widths.
- sizing 18 — yes
- sizing 14, 15, 17, 19 — n/a
## Wrapping
- wrapping 20 — yes — wraps list only h2s at 400 ("How each row is counted", "Trend…" 2 lines) and chrome buttons. The table headers wrap at 400 (shots/…/400.png, table band), which is acceptable for a 4-column table.
- wrapping 21 — yes — nothing wraps at 1920 that is content.
- wrapping 23 — yes — the 400 table keeps four columns; they are narrow ("with no task (needs review)" runs 4 lines). The new 6-column fold table will be tighter still: check it after fix 1.
- wrapping 22, 24 — n/a
## Spacing and padding
- spacing 33 — yes — left_stack 16px at 400.
- spacing 34 — yes — a single `page` layer.
- spacing 36 — yes
- spacing 37 — yes (no new CSS in the diff)
- spacing 35, 38, 39 — n/a
## Colour and contrast
- colour 1 — yes — dark ink on white, and the table header on light grey, at both widths.
- colour 3 — yes — no new colours in the diff.
- colour 2, 4–8 — n/a
## Flow
- flow 25 — yes
- flow 26 — yes — no overflow_x. The 404 in `errors` is a resource failing to load, not missing content.
- flow 30 — yes — widest_text 626px at 1920.
- flow 27–29, 31, 32 — n/a
## Words
- words 1 — yes — counts are shown as a table.
- words 3 — yes — the new paragraphs are under 60 words. The sessions readme paragraph runs about 70 words in one sentence; a small point.
- words 4 — yes
- words 5 — no (small) — the "nothing lost" title stays even when there are losses (page 11).
- words 7 — yes — "moved-aside half" is used throughout.
- words 8 — yes — the readme links the manifest and /live/truth/.
- words 11 — yes
- words 2, 6, 9, 10 — n/a
