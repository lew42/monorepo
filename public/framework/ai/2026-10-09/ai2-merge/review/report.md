verdict: fix
1. [fix] Old AI 2 doc and data links now lead nowhere (requirement 2: "keep /framework/ai2/... URLs resolving"). `ai2/doc/*`, `ai2/groups.json` and `ai2/overview/overview.json` were moved with no shim or alias, and the repo at 3485d0085 still links them about 230 times, mostly from landed task logs that rightly were not rewritten (`/framework/ai2/doc/cards.md` ×42, `card-standard.md` ×31, `overview/overview.json` ×30, `groups.json` ×19). Only the `.js` files and the page route got shims. Fix: give the old doc/data paths a stub, a redirect, or a route alias.
2. [fix] `ai/cards/` and `ai/rail/` are new folders with no `readme.md` or `page.js` (CLAUDE.md: every module has a readme; requirement 4: update "the module readmes touched"). `ai/readme.md` links `cards/` and `rail/` as bare folders, so those links probably go nowhere on the site.
3. [note] Requirement 3 asked for proof at four widths of a card page and of the Log, System and Sessions tabs, plus a passing `merge.mjs --dry-run`. The shots cover only `/framework/ai/` (Inbox), the Dashboard and `/framework/ai2/`. The card page and `ai2/log/` check is claimed in STATE.md but not shown, and no dry-run output is recorded.
4. [note] `ai2/files.jsonl` was compacted rather than appended to: duplicate lines and its `"gone":true` history lines were dropped. That edits a log in place (rules: "never rewritten", "never destructive"). Small, but it breaks the stated rule.
5. [note] `/framework/core/Page/overview/folders/` shows "Page Load Error — 404" at every width (`layout.json` widest_text_sample "404 — nothing matches…"). The diff only changed a comment in that file, so this is an existing route problem, not caused by this change, but it was in the review set.
6. [note] Link text still names the old file while the link points to the new one: `ux/Card/page.js` and `core/Page/make/page.js` show "`ai2/card.js`" but link to `/framework/ai/cards/card.js`.
7. [note] The moved files keep lowercase multi-export names (`card.js`, `rail.js`) instead of one class per file. STATE.md records this choice and the alternative (rename later, many callers), so it is acceptable for now; it should be a follow-up.

Widths given: 400, 1200, 1920, 3440 for all seven pages.

## Requirements
- 1 "Inventory (a script, not prose)" — yes — `inventory.mjs` + `inventory.md` + `inventory.json` in the diff
- 2 "move the live ai2 files into ai/ … shims … keep /framework/ai2/... URLs resolving … dead files moved to ai/archive/ai2/ with a manifest" — partly — 53 files moved to `ai/cards/` and `ai/rail/`, 23 one-line shims (e.g. `ai2/card.js` re-exports default + named), `ai2/page.js` kept as the route, archive + `manifest.json` present; doc/data URLs not kept (finding 1)
- 3 "ONE script: dry-run … git mv … manifest … reversible; prove pages load at four widths, zero same-origin 404s" — partly — `migrate.mjs` + `manifest.json`; `/framework/ai/`, `/framework/ai/dashboard/` and `/framework/ai2/` render at all four widths (shots/*/sheet.png); card page, Log/System/Sessions tabs and the dry-run are not shown (finding 3)
- 4 "Update the readmes … ai2-and-date-layout doc … add the new class names to ai/readme.md's index" — partly — `ai/readme.md` gains a "Classes that draw it" line and `ai2/readme.md` is now a short redirect; the doc was updated; `cards/` and `rail/` have no readmes (finding 2)
- 5 "Do NOT touch session folders, ai/sessions/, or core/Page semantics" — yes — the core/Page edits are link and comment path changes only (`make/page.js`, `overview/folders/page.js`, `ext/Inbox/readme.md`, `dynamic/doc/uses.md`); no sessions files in the diff
- Rules "nothing deleted; moved by script; no duplicates" — yes — the deleted files in the patch match the new files (same line counts); old page logs went to `ai/archive/ai2/`; but see finding 4
## Page structure
- page 1 (title says what it is) — yes — shots/monorepo-localhost-framework-ai/1920.png: "AI" with Inbox tab; ai2 still titled "AI 2" (the route alias, as intended)
- page 2 (unchanged look after move) — yes — ai and ai2 sheets match each other: same rail, Live, Processes, By task
- page (404/error) — no, existing problem — overview/folders sheet.png: Page Load Error (finding 5)
## Navigation
- navigation 1 — tabs (Inbox, Dashboard, Log, System, Sessions, Tests), a rail, the site sidebar
- tabs one row — yes — layout.json tab_rows 1 at 400 on ai, ai-dashboard and ai2
- route everything — partly — `/framework/ai2/` and card routes are kept by `ai2/page.js`; doc/data URLs are not (finding 1)
## Layout
- layout unchanged by the move — yes — ai/1920.png: rail | Live | Working on columns, as before
- overflow — yes — layout.json overflow_x false on every page and width
## Sizing
- sizing — yes — ai 1920: rail ~350px, Live and Working on columns fill the rest; bands ai2-back 0.039, ai2-full spans the screen
- 3440 empty — note — ai2 3440 empty 67%, dashboard 66%: same as before this move, not changed by it
## Wrapping
- unwanted wraps — no new wraps — layout.json wraps list only drawer-rail-ai / drawer-rail-menu (3.2 lines, existing on every page); rail card titles wrap to 3 lines at 1920 ("Task audit plan: 354 loose ends…"), already like that
## Spacing and padding
- left stack — yes — layout.json left_stack h1 14px doc-well on ai/ai2; 28px on doc pages; unchanged by the diff
## Colour and contrast
- colour — n/a
## Flow
- flow — yes — the change moved code without changing behaviour; the Inbox opens on the same rail order (Now, Today, Yesterday, Your prompts, Live)
## Words
- content 1 (plain sentences) — yes — `ai2/readme.md` is now 11 lines: where things moved and what stays, with links
- content (link every mention) — yes — `ai/readme.md` links cards/, rail/ and archive/ai2 (but see finding 2)
- content (names consistent) — no, small — link text "`ai2/card.js`" points to `ai/cards/card.js` (finding 6)
