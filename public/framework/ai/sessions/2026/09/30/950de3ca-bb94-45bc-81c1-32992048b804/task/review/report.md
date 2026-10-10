verdict: fix
1. [fix] The dev shell's header strip renders light, not dark, even though `DevShell.js` lists `head` in `dark: ["head","left","right","foot"]` — the left rail, right rail and footer are all convincingly black, but the top bar (breadcrumb, block/edit/v1/✕) stays white at 400, 1920 and 3440. This breaks requirement 2's "obviously different" dark mode. Evidence: `/framework/dev/DevShell/shots/1920.png`, `/400-open.png`, `/3440-open.png` — top band in every one.
2. [fix] The review's own Shell-page shots don't show the shipped `paper: true` demo at all — `page.js` inserts it right after the intro paragraph and before "One region", but every given shot (`shots/127-0-0-1-54678-framework-core-Shell/1920.png`, `.../monorepo-localhost-framework-core-Shell/1920.png`) goes straight from the intro text to "One region" with nothing in between. Requirement 3 ("demos... at 400, 1920 and 3440") is unverifiable from the evidence on hand — most likely a dev server that wasn't restarted after the merge landed, not a code problem (the paper demo does appear, correctly, in the task's own supplementary screenshots: `shell-paper-demo/demo-1920.png`, `demo-400.png`). Fresh shots of the live `/framework/core/Shell/` page are needed before this can be called proven.
3. [note] Total spend on this task is $35.55 (`spend.json`) and the task is still open (AI 2's shell, merge 3, not yet done) — above both the brief's original "$15, hard" and the one authorized raise to $20 ("foundational... no rush", `task.jsonl` 2026-09-30T20:08). Worth a fresh number from the owner before merge 3 starts.
4. [note] The paper demo's caption (`page.js`, the `paper: true` demo) runs to roughly 80 words in one paragraph — over the 60-word rule. Everything else about the demo follows "show, don't tell" well; this one paragraph could lose a sentence.

## Requirements
- 1 "A general SHELL... every region optional... shells nest" — yes — `core/Shell/page.js` has 9 demos covering one-region, left+right, header+footer, all-five, dark, nested and frame (`grep h2(` confirms all 7 pre-existing plus the new paper one); this task extends it with `paper: true` rather than a second system, reusing `core/Sidebar`/`ext/grip`/`ext/drawer` as the brief asked.
- 2 "The DEV SHELL: Ctrl+\\ toggles a DARK-MODE shell... merges the dev bar in... nothing breaks underneath" — mostly yes, one gap — the shell opens, pushes `.app` by tokens (not reparenting it — `doc/decisions.md`), the old dev bar stays one click away as "v1", and left/right/footer go convincingly dark. The gap is finding 1 above: the header region itself stays light.
- 3 "Demos: Shell in each combination... plus the dev shell on a real page, at 400, 1920 and 3440" — the combinations exist in source and the dev-shell demo is proven at all three widths (`dev/DevShell/shots/{400,1920,3440}-open.png`), but the Shell page's own combinations (including the new paper demo) aren't shown by the shots this review was given — see finding 2.

## Page structure
- Shell page — yes — title + "Five regions, all optional..." says what it is in one line (`shots/.../1920.png`, top band).
- DevShell page — yes — title + "Ctrl + \\ now opens this — a dark `core/Shell`..." (same page, embedded screenshot band).
- Concept tiles right under the title — n/a — these are the framework's existing Doc-page shape (description → demos), unchanged by this task.
- Priority order / open-before-done — n/a — not a task or report page.
- Reachable via parent's `children:` — n/a — no new page created.
- Every view its own URL — n/a — no new tabs added by this diff.
- Approved layout/type — yes — standard Docs three-region Doc page, both pages.
- Self-evident labels — yes — the paper demo's placeholder list/box/footer are plain words ("Overview", "chat", "Saved · 3 items") explained by the caption right beside them.
- Element earns its space — yes — nothing in the diff repeats a neighbour.
- Best form — yes — the nine-grid is *shown* running, not described (`page.js`'s demo), matching "show, don't tell."
- Section titles clear — yes — "`paper: true` — a real nine-grid."
- Old version still reachable — yes — the old `dev/DevBar` rail stays one click away as "v1" (`DevShell/shots/1920.png`, head band; `doc/decisions.md`'s own checklist says the same).

## Navigation
- Identify: a left filter-pages rail (`core/Sidebar`), a top tab row (Shell/DevShell pages), a right drawer/sheet (`ext/drawer`, the ☰), and — on `dev/DevShell` itself — a frame-mode shell that is its own kind of overlay chrome.
- Tabs fit 1/≤2/≤3 rows at 1920/1200/400 — yes — `layout.json` `tab_rows: 1` at every width on the Shell page; the Core/Dev/DevShell doc pages don't register a `tab-bar` class so this is n/a there.
- Tabs own URL — n/a — unchanged by this diff (existing Doc tab system).
- Tabs grouped, not stacked — n/a — no new tabs.
- Rail/sidebar beside centred main at 3440, folds at 400 — yes — `shots/.../3440.png` shows the left nav rail beside a wide main column; `400.png` shows it collapsed, both pages, unchanged by this task.
- Rail/work area stay still — not measured — static shots only, can't confirm from them.
- Bottom rail leaves room — n/a — none added.
- Sheet/modal own URL, closes back to place — yes — the drawer (☰) is reachable at `?drawer=sessions` etc. (`ext/drawer/readme.md`).
- Full screen has a visible way back + own URL — n/a for the dev shell — it's dev-only chrome (Ctrl+\\ / ✕ / "v1"), not a routed content view; the way back is visible (`DevShell/shots/1920.png`).
- Selected item opens its own column, not expand-in-place — yes — the nested paper Shell sits in its own `main` cell, not pushing the outer layout (`shell-paper-demo/demo-1920.png`).

## Layout
- 3440 fills the width with nav + main — yes — `shots/.../3440.png`, both touched pages.
- Approved layout word — yes — Docs three-region, both pages.
- Region/box width right at 4 widths — yes — `overflow_x: false` at 400/1200/1920/3440 on every shot given.
- Padding only where needed — yes — paper mode separates regions with `gap`, not an extra pad-and-border combo (`Shell.css`, `doc/decisions.md`'s own reasoning for dropping the plain grid's borders in paper mode).
- Text keeps room from neighbours — yes — `shell-paper-demo/demo-1920.png`, every box's text sits inset from its own edge.
- Multi-column content in wide/bleed — n/a — the grid itself is the layout here, not a reading column.
- Band share matches importance — yes — `layout.json` bands for the Shell page show no `big_empty: true` band at any width.
- Equal-content columns — n/a — left/right are deliberately unequal (rail vs. card), that's the design.
- Dead space answered, not a stretched reading column — no — the Shell page's own intro paragraph (`widest_text_sample: "Leave one out and there is no empty box"`) measures 1775px wide at 3440 (`layout.json`), well past a readable measure — pre-existing on this page (not a line this diff touched), noted but not counted as a fix for this task.
- Content scaled to its box — yes — `shell-paper-demo/demo-1920.png`.
- Card wall balanced last row — n/a.
- Flush rows share outline / rounded cards gap — yes — paper's `main` keeps the border+radius, the well's four regions lose theirs (`Shell.css`).

## Sizing
- Auto height except real exceptions — yes — `frame: true` is the deliberate full-viewport exception, documented.
- Previews auto height — n/a.
- Bounded boxes say what happens to overflow — yes — `.core-shell-left/-right/-main` are all `overflow: auto` by design.
- Every scrollbar meant — yes — same three regions, intentional.
- Band above first nav budgeted — n/a.
- Floor and ceiling on every track — yes — `clamp(12rem, …, 50%)` now lives on the grid's own column (`--core-shell-col-left/-right`), confirmed no overflow at 400 anywhere in the shots.
- em for text-following, rem for floors — yes — `12rem`/`18rem` floors and default, `50%` ceiling.

## Wrapping
- Tab bar/title/button row on one line as meant — yes — Shell page `tab_rows: 1` at all 4 widths; DevShell's own header/footer rows fit one line at 400 too (`shell-paper-demo/devshell-400.png`).
- No new wrap only under 1920 — n/a — the one wrap found on the Shell page (a ToC link, `layout.json`) runs the other way (wraps at 1920/3440, not 1200) and isn't touched by this diff.
- Control row wraps cleanly where meant — n/a.
- At 400, full-row items stack, don't crush — yes — the dev shell drops its left rail and turns the right one into a bottom region below 34em, by design (`DevShell.css`).
- Preview descriptions not clipped at two widths — n/a.

## Spacing and padding
- Padding at the first heading/paragraph ≤3em at 400 — yes — `layout.json` `left_stack`: h1 28px, p 28px, both well under 3em.
- No triple-nested padding — yes — paper mode's `gap` replaces borders rather than stacking both (`doc/decisions.md`).
- Padding opted in, never `.pad` on a card — yes.
- Text never sits at 0 from an edge — yes — head/foot keep `padding-inline: 0.75em`; the drawer's new head keeps `1.1em 0.9em`.
- Gap/pad from the spacing clamp — yes — `gap: var(--gap-25)` on the paper grid.
- Controls keep their own em padding — yes — `.dev-shell-v1`/`.dev-shell-x`, `.drawer-menu` unchanged.
- Box with padding sits on a different ground — yes — the well (`--wash`) against the paper (`--surface`).
- Bled container keeps `.pad` inside — n/a.
- Every rule inside a layer — yes — every added rule in the diff sits inside the existing `@layer theme { … }` blocks; no new layer name.
- CSS as small as possible — yes — this diff nets CSS smaller: the rail-width fix *removes* two local workarounds (`DevShell.css`'s own column override, the paper demo's inline widths) once the real fix landed in `Shell.css`.

## Colour and contrast
- Body text 4.5:1, large/UI 3:1 — not measured — by eye, black-on-white (paper) and light-on-black (well/rails) both read clearly in every shot.
- Accent text keeps its ratio — not measured — the demo's placeholder body text reads fine by eye.
- Tokens, not literal colours — yes — `--well: var(--wash)`, `--surface`, `--darken-2`, all named tokens.
- Boxes that read as boxes differ from their parent's ground — yes — well vs. paper.
- Works in dark mode via `light-dark()` — mostly yes, with the one gap in finding 1 (the dev shell's own head doesn't flip).
- Seam between grounds deliberate — yes — documented reasoning for `--well` vs `--wash`/`--tint` (`doc/decisions.md`).
- Repeated anchor — n/a.
- Muted text via `.muted` — yes — `p.c("muted", label)` in every placeholder region.

## Flow
- Order matches priority — yes.
- Nothing hidden off-screen — yes — `overflow_x: false` everywhere in the shots.
- One rhythm per box — not measured from static shots.
- Label sits closer to its own card — yes — "Section · Details" sits directly above the nested card (`shell-paper-demo/demo-1920.png`).
- Live page stays still as items arrive — n/a — static demo.
- No prose line past the measure — no — same pre-existing Shell-page intro paragraph noted under Layout (1775px at 3440); not part of this diff's own lines.
- Fixed chrome pushes `.app` by tokens, not reparent — yes — `frame: true` writes `--shell-top/-left/-right/-bottom`, the same mechanism `--devbar` already used.
- Tab/nested page padded once — not tested by this diff.

## Words
- Shown before told — yes — the paper demo is a live, running grid with real sample content, not a description of one.
- Layout shows the structure — yes — the nine-grid's own empty corners and gap make the regions obvious without a sentence explaining them.
- Every paragraph ≤60 words — no — the paper demo's caption runs to about 80 words in one paragraph (finding 4).
- Owner gets the point in 10 seconds — yes.
- Every title says exactly what it is — yes.
- Pictures carry ≤1-line captions — yes — the DevShell page's embedded screenshot has one sentence under it.
- Concept named once, same way — yes — "paper"/"well" used consistently across `page.js`, `readme.md`, `doc/decisions.md`.
- Mentions link to their page — yes — readme/decisions link `doc/decisions.md`, `core/Sidebar`, etc.
- File of words paired with a picture — yes for the task's own report files (`result.md`s carry screenshots); `doc/decisions.md` itself is the deep-doc tier CLAUDE.md allows to "breathe" in prose.
- Most important thing leads — yes.
- Full plain sentences, no undefined jargon — yes.
