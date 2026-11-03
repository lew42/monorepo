verdict: pass
1. [note] Widths given: all four (400, 1200, 1920, 3440) for 4 pages whose `notes:` line gained an "architecture" tab (Search, Dropdown, editor, Menu); 8 other modules changed only in markdown, so no shots.
2. [note] The Dropdown readme "Watch out" line was reworded (Escape is handled by `keys()`, not the browser) — a correction beyond "link it once", but inside the readme fence and matches the code claim in the new doc; worth a glance, not a fix.
3. [note] `core/new/readme.md` also changed a line (`Router.js` "line-for-line" to "earlier, diverged copy"); a factual correction in the fence.
4. [note] editor `notes:` uses "shell decisions, architecture" (comma) while Search and Dropdown use spaces; the editor line already had its own style, so it is consistent with the file it sits in.

## Requirements
- 1 "next 12 by importers with no doc/architecture.md; skip recently touched; say so if under 3 importers" — yes — task.jsonl census line lists 12 modules at 5-6 importers each, notes the skipped ux/Dictate, and the diff has 12 `doc/architecture.md` files
- 2 "same method; readme More line and doc/files.jsonl link it once" — yes — each of the 12 readmes gained exactly one `doc/architecture.md` line and each `doc/files.jsonl` one `architecture.md` entry (ui/* also got `{"file":"doc/"}` in the root files.jsonl)
- 3 "commit per module on a worktree, merge.mjs once; census before/after in log" — yes, partly checked — the log has "census before: 66/113"; the diff is one worktree branch, I did not verify the after line or the per-module commits
- 4 "card report with the links; landing line checked" — not measured — outside the diff

## Page structure
- page 1 — yes — shots/127-0-0-1-59459-framework-core-Search/sheet.png: the title says what it is, with the tabs Overview Docs Files Inbox
- page 2 — n/a — the four pages gained only a notes tab entry, with no structure change

## Navigation
- page — tabs, a sidebar, a bottom search rail (Search page)
- tabs — yes — layout.json tab_rows 1 at 400 on all four pages, so the added entry does not wrap
- other nav questions — n/a

## Layout
- doc layout kept — yes — layout.json `layout: "doc"` on all four pages; sheet.png shows the same column at all four widths

## Sizing
- n/a — no sizing was touched; the sheet shows the content column growing as it did before

## Wrapping
- overflow — no — layout.json overflow_x false at 400 on all four pages (widest_text 340 to 342)
- tab_rows — 1 at 400 on all four pages

## Spacing and padding
- yes — layout.json `empty` at 400 is 0.29 to 0.51 (editor highest, a long page); shots/…Search/sheet.png shows the usual rhythm and nothing cramped. Empty rises with width, as before this change.

## Colour and contrast
- n/a — no CSS or colour changes

## Flow
- n/a — only a notes tab was added

## Words
- architecture docs — yes — the `ui/tooltip` doc (diff sampled) uses the Decided / Why / Instead / Detail shape in plain sentences, links to the page, and has no "the owner said" or date lines
- dates — yes — the only date in the added lines is an anchor in a link (`#direction-of-the-token-sync-decided-2026-10-13`) to an existing heading
- stubs — yes — no TODO or stub lines found in the added text
- readme More lines — yes — one short link line each, "(decisions and why)", the same wording everywhere
