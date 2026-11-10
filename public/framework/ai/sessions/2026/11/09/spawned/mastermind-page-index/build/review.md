verdict: fix
1. [fix] The index path visibly changes /framework/: in the worktree's `shot-fw-index-1200.png` against `shot-fw-off-1200.png`, the "Sidebar" card is titled "Framework" (flag icon) and the "Item" card is titled "Doc" (`{}` icon), so the titles are wrong. Requirement 7 ("the same titles and icons both ways") is not met, and `doc/index-jsonl.md` Status says the opposite ("1200 px shots of each look the same").
2. [fix] Cause of 1: `Server/PageNav.mjs:105` (`LITERAL`) takes the first `title:` / `icon:` literal anywhere in a `page.js`, so a demo's or a nested child's literal written before the page's own wins. Run `node Server/PageNav.mjs public` as a dry run and diff every nav against a real `page.nav()` (the `nav_check` warnings), then anchor the read to the page's own options or skip files with more than one literal.
3. [fix] With the index on, the dark class cards lose their surface (in `shot-fw-off-1200.png`, View, Page, Router, App, Shell, Item and List are dark; in `shot-fw-index-1200.png` they are white). `nav_for` (`core/Page/Page.class.js:703`) and the line's `nav` don't carry `card` / `class_card`, which `Previews.js:64` reads. Either put them on the line or keep loading children whose card is a class card.
4. [fix] Deliverables 6 and 7 are missing. There is no `measure-after.txt`, and no `shots/` folder beside the brief. Only 4 shots were taken, at 1200 px, for 2 pages, and they sit gitignored (`.gitignore:187`, `ai/**/*.png`) one folder up. `/framework/core/`, `/framework/ai/sessions/` and `/framework/core/Page/` were never measured or shot, nothing was shot at 400 or 1920, and no `Server/smoke.mjs` run is logged in `session.jsonl`.
5. [fix] The docs are not done (deliverable 8). `core/Page/readme.md:31`, the `files.jsonl` row, still describes `{"file":…}` lines with no `nav`. "How a url becomes a page" (`readme.md:37`) doesn't say a parent reads nav lines. The Status section in `doc/index-jsonl.md` names no commit.
6. [fix] The generated `files.jsonl` changes were not reverted: `git status` in the worktree shows 35 modified files, and the log says "Not reverted". The brief and `finish.md` step 6 both require `git checkout --` on them before the report, so the merge has to avoid them by hand.
7. [note] `ux/Tree/Tree.js:690` loads every placeholder it lists anyway. So wherever the sidebar tree expands a page, its children are imported in full and the saving disappears; only the last wall level saves. That fits the measured result (139 → 27 page.js), but say it in the Status so nobody expects the sidebar to get cheaper.
8. [note] `Server/plugins/PageIndex.js:373`: when a folder has no `files.jsonl` and its `page.jsonl` holds no file lines, nothing is cached, so every request re-reads the whole `page.jsonl`. On a session page that file can be large. Cache the empty answer by mtime too.
9. [note] `Server/AIIndex.test.mjs:78`: the old trailing comment was pasted onto the new line ("…carries it                    // the stream line stays small…"). Line 77 lost its comment.
10. [note] `Page.class.js:265–266`: the new `from_index` lines sit between the "⚠ Folders inside a dated task folder" comment and `UNLOGGED`, the line that comment explains. Move them above the ⚠ comment.
11. [note] The rest checks out. `node Server/PageNav.test.mjs` passes (13 checks) and `Listing.test.mjs` passes (9 checks). A `page.jsonl` change re-syncs the parent (`PageFiles.js` `handle`), and a line is written only when the nav differs. `/api/index` is registered in `run.js` and indexed in `Server/readme.md`. `Index.js` is indexed in `core/Page/readme.md`. A fresh agent can continue from `requirements.md`, `finish.md` and the `log` lines in `session.jsonl`.

## Requirements
- 1 PageNav.of + CLI + test: yes, with wrong titles in practice (finding 2)
- 2 PageFiles lines carry nav, written only on a difference: yes (PageNav.test "unchanged nav: no new line")
- 3 GET /api/index: yes (`Server/plugins/PageIndex.js`, `run.js`)
- 4 Browser placeholders carry nav, `?index=0`: partly. The titles are wrong and class-card surfaces are lost (findings 1 and 3)
- 5 nav_check warns: yes (`Page.class.js` `nav_check`), but nobody acted on what it found
- 6 measure-after.txt for 4 urls ×2: no (finding 4)
- 7 shots at 400/1920 for 3 pages ×2, smoke run: no (finding 4)
- 8 docs + tests: partly (finding 5); tests yes
- Class page for a new class (PageNav, PageIndex): n/a. Both hold no live state

## Words
- The Status table and the log are plain and give numbers: yes. The Status claim "look the same" is false: no (finding 1)
