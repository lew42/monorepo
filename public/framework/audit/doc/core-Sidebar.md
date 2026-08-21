# core/Sidebar

**Sidebar is the best-documented module I've seen in this codebase, and one of
the smallest — it earns its place outright.** It's the only component tier
`core/` ships, it has seven real production callers (this is not a demo of
itself), and every method, property and note already had a `.md` before this
pass started. The one real gap was structural, not narrative: the `Files` tab
didn't exist — no `files:` key in `page.js`, no `doc/file/*.md` at all — so
this pass added it, then fixed six stale `framework/page.js:N` line citations
that had drifted after that file was edited, and added the usage-search
section the brief requires.

## State

| | |
|---|---|
| files | 3 (`Sidebar.js` 125 lines, `Sidebar.css` 190 lines, `page.js` 73 lines) |
| lines of JS / CSS | 125 / 190 |
| callers | 7 real `import { Sidebar }` sites — `framework/page.js`, `page.js` (root), `michael/page.js`, `styles/layers/theme/lew42/page.js`, `styles/layouts/sidebar/page.js`, `core/Page/old/nav/page.js`, and `core/Sidebar/page.js` itself. ~12 more files link to or quote it in prose without constructing one. |
| docs before | `readme.md` already had Decisions/Traps/Proposed/Open; `page.js` was a `Doc` (not `classdoc`) with `properties`/`methods`/`notes` all complete and accurate; **zero `doc/file/*.md`, no `files:` key** — no Files tab existed |
| docs after | added `files:` + 4 `doc/file/*.md` (including `readme.md.md`, per the `core/Page`/`ext/Doc` precedent); fixed 6 stale line citations (`framework/page.js` had shifted since these were written); added a "Who uses it" section to the readme |

## What I changed

- `page.js` — added `files: "Sidebar.js Sidebar.css page.js readme.md"`.
- `doc/file/Sidebar.js.md`, `doc/file/Sidebar.css.md`, `doc/file/page.js.md`, `doc/file/readme.md.md` — new, all with ranked Improvements.
- `doc/property/app.md`, `doc/property/pages.md`, `doc/property/brand_url.md`, `doc/method/header.md`, `doc/method/footer.md`, `doc/method/group.md`, `doc/placement.md`, `doc/entries.md` — corrected `framework/page.js:N` citations, all of which pointed at the wrong line after that file changed (confirmed against the live file; see Recommendation 2).
- `readme.md` — added "Who uses it" (the Step 2 usage search), between the intro and Decisions.
- Verified: `node --check` clean; `curl` on `page.js` returns 200; every `properties`/`methods`/`notes`/`files` name has its `.md`; `files:` matches the directory exactly (`Sidebar.css`, `Sidebar.js`, `page.js`, minus `readme.md` and `doc/`).

## Recommendations

1. **`Sidebar.js`'s 14-line JSDoc header (lines 8–21) violates CLAUDE.md's "Comments: near zero."** It restates every constructor property — already covered by the readme, `page.js`'s API tab, and six `doc/property/*.md` files. `core/View/View.js`, the sibling core class, carries zero API comments, only trap comments. This is a real style violation, outside my fences to fix (not a `page.js`). *(simple, important)*
2. **Six `framework/page.js:N` citations across this module's docs had drifted 2–32 lines from the real file** (`app.md`, `pages.md`, `brand_url.md`, `header.md`, `footer.md`, `group.md`/`entries.md`) — fixed this pass. The pattern (all consistently off by exactly the same small offset in most files) suggests they were written once, correctly, and never revisited after `framework/page.js` was edited. Nothing catches this automatically — a citation is not a check. *(simple, important — done)*
3. **The three `$`-handle properties (`$bar`, `$menu`, `$mode`) are assigned and never read anywhere in the repo** (grepped and confirmed). The readme already recommends dropping them, dated, with a clear rationale. It's a one-line-per-handle deletion in `Sidebar.js`, outside my fences. *(simple, useful — already decided, just not applied)*
4. **A demo of the narrow-screen collapse** (a fixed-width box under 52em) would make the responsive behavior visible in the Overview instead of requiring the reader to physically shrink the browser. Genuinely outside-the-box: nothing else on this page needs interaction to see its main feature. *(medium, useful)*
5. **Nested groups render `href="undefined"` silently** — `group()` calling `link()` on an entry that itself has `pages` and no `url`. The readme already weighs "warn" vs "recurse" vs "leave it" and recommends warn. Still unapplied, and it's the one place this component fails without saying so. *(simple, useful)*

## Where this module overlaps others

**None, cleanly** — and the readme itself makes the case explicitly (`## Decisions`, "why a component tier for exactly one thing"): a tab-bar proposal was rejected because tab-selection is a `Page` placement decision, and a card proposal was rejected because a card is just `.page-preview`. The one real seam is **`Sidebar.link()` vs `Page.link()`** — two components that render a similar row and were deliberately kept separate after a mixed-class row broke on stylesheet load order (`doc/method/link.md`). They are not the same thing and shouldn't merge — but a future reader building a third "row with icon + label" component should look at both before adding one.

## Skill feedback

**The skill doesn't say what to do when a module is already this thorough.** Every instruction in "Auditing an existing module" assumes gaps to fill; when the actual finding is "the readme/notes/API docs are already exemplary, only the Files tab is missing," the skill gives no guidance on how much new prose to add versus how much restraint to exercise. I erred toward small, targeted fixes (Files tab + stale citations + usage section) rather than rewriting a readme that didn't need it — but a line in the skill saying *"a module that already passes the checklist needs verification, not more prose"* would have saved a few minutes of second-guessing whether I was supposed to find more to write.

Second: **"doc/file/<path>.md — one per file... Never for doc/ or ai/"** doesn't say whether `readme.md` itself gets one — I initially skipped it, reasoning it's documentation *about* the module like `doc/` is, and only caught the miss by cross-checking `core/Page` and `ext/Doc` for tone calibration and finding both document their own readme (`core/Page/doc/file/readme.md.md` even lists this exact gap as its own Improvement #1, meaning at least one other audit pass made the identical mistake first). The skill should say explicitly: `readme.md` gets a `doc/file/readme.md.md` too, precedent already agrees, stop making each auditor rediscover it.
