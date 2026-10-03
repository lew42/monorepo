# /framework/: new home page with dark class cards — minion brief

Load the `minion` skill first. Your task dir is `public/framework/ai/2026-10-02/framework-home/minion-build/` —
log there as you go. The parent task (read it for full context) is
`public/framework/ai/2026-10-02/framework-home/` (`requirements.md`, `task.jsonl`).

**Work in the worktree already made for you**: `C:\Code\lew42\worktrees\framework-home`
(branch `worktree/framework-home`, dev server already running at `http://framework-home.localhost/`
and `http://localhost:60161/`). Do not make your own worktree. Commit as you finish each piece.

## The owner's own words (verbatim — this is the acceptance test, not the summary below)

> "When I go to the framework page, I want to see all the things in the framework. I think
> we're neglecting our /framework page… move [the current one] to /framework/old, back up the
> old version… make a new framework default page… sections, like the sidebar sections, Core,
> and then the icon items… Let's use dark-themed cards for classes from now on… whether it's an
> inline reference or a card… it differentiates it from a standard content page: it's a class…
> Each class should have an icon… the navigation icons should render from the page's icon
> property, so when we edit a page's icon it updates everywhere… I don't mind if this is a big
> sprawling page… use horizontally friendly layouts… don't limit the width, use all the space,
> show a grid, but use our responsive padding so the huge space gets enough padding and gap…
> If they're big cards, in a 1000px container, full-width sections stack into three rows; on a
> 3000px monitor, three columns of about 1000px each. We could call that verb sprawling…
> [whether] column heights can be adaptive is a big question."

## What already exists — read this before writing anything

1. **`Page.walls()`** (`public/framework/core/Page/Page.class.js:1112`) already does almost
   exactly deliverable 2: one rung per child, each child's own children drawn as cards
   (`previews()` → `preview_card()`). It currently **skips** a child that is `leaf: true` or has
   no children (`if (!page?.children.size || page.leaf) return;`). `/framework/page.js`'s
   children (`"start ai ai2 research faq versus core styles ui ux audio ext util dev servex
   audit sources design code sandbox"`) is already the exact list, in order, that
   `core/Sidebar` draws from (`Sidebar.js` walks `root.children` via `ux/Tree`) — "the same page
   tree the sidebar uses" is already true for free if you iterate `this.children`. **Your job
   is deliverable 2 and 5, not rebuilding this machine**: decide whether to call `this.walls()`
   as-is (which silently drops leaf/childless top sections like `ai`, `start`, `faq`, `versus`,
   `sandbox`, `audit`, `sources` — not "all the things in the framework") or extend it so every
   top-level child gets its own section, even a leaf one (render leaf/childless ones as a single
   icon item inside a trailing section, or just ONE card in a short section — your call, log the
   alternative). Err toward showing everything; the owner's ask was explicitly "all the things."
2. **`preview_card()` / `preview_link()`** (same file, ~line 1131–1163) already draw the icon
   from `nav.icon`, which comes from `nav()` (`line 1076`): `icon: this.icon`. **This is already
   the one source for a card's icon.** Nothing to fix there.
3. **Class detection already exists**: `ext/Doc/Doc.js:444`, `Doc.is_class = subject => typeof
   subject === "function" && /^class[\s{]/.test(String(subject))`. Every class's own doc page
   declares `subject: TheClass` (e.g. `core/Page/page.js:55` → `subject: Page`,
   `core/Item/page.js:126` → `subject: Item`, `core/List/page.js:22` → `subject: List`). A Doc
   page whose `subject` passes `is_class` IS a class page — use this, don't invent a second flag.
4. **`nav()` already carries a `card` field** (`this.card`, Page.class.js:1076) that
   `preview_card()` applies as a CSS class via `.ac(nav.card)` (line 1136). **Deliverable 3's dark
   class card is therefore: in `ext/Doc/Doc.js`, override `nav()` to return
   `{ ...super.nav(), card: Doc.is_class(this.subject) ? [this.card, "class-card"].filter(Boolean).join(" ") : this.card }`
   (read the real `nav()`/`card` plumbing first — `this.card` may already be undefined for most
   Doc pages, keep it simple).** Then add `.page-preview.class-card { … dark ground … }` to
   `core/Page/Page.css` (near the other `.page-preview` rules, ~line 1179–1320) using the site's
   existing dark/surface tokens — load the `color` skill before picking the actual color values,
   and the `css` skill before writing the rule (it belongs under the `page-` scope, already
   reserved to core/Page in `public/framework/styles/css-scopes.txt` — `class-card` is a
   *modifier* class, not a new scope, so it does not need a new scope line; if the `css` skill's
   census disagrees, follow the skill).
5. **The hard-coded icon copy the owner means is `ext/Mention/maps/refs.js`.** Every entry is
   hand-typed: `Page: { url: "/framework/core/Page/", icon: "description" }` duplicates
   `core/Page/page.js`'s own `icon: "description"` by hand, in a second file, that nobody updates
   when the page's icon changes. **Fix it so a mention's icon (and whether it renders as a dark
   class-card chip) comes from the live page, not a literal in `refs.js`**:
   - `Mention.js`'s `build_row()` (line ~95) is where an inline mention is drawn:
     `item(entry.url ? { icon: entry.icon, name, href: entry.url } : { icon: entry.icon, name })
     .ac("inline mention")`. Look up the real page for `entry.url` (the app's root page is
     reachable — check `core/App/App.js` / how `Router`/`Page` expose the live root, e.g.
     `Page.instances()` from `core/track/track.js`, or a `child()` walk from the known root) and
     read ITS `.icon` and whether `Doc.is_class(page.subject)` for the dark look, falling back to
     `entry.icon` only if the live page can't be found (keeps old behavior as a safety net, never
     a silent blank icon).
   - If after investigating this turns out riskier than it's worth in one pass (import cycles,
     the root page not reachable from `ext/Mention` without an awkward dependency), the
     **minimum acceptable fix** is: delete every `icon` literal from `refs.js` that duplicates a
     page's own `icon:` (verify by opening each page.js), and write ONE small resolver function
     used by both `refs.js`'s consumer and `build_row()` that takes a url and returns the live
     page's `icon` — do not leave two copies of the truth. Log which approach you took and why.
   - Add the dark `class-card` look to an inline mention, too (deliverable 3: "whether it's an
     inline reference or a card"): `.item.mention.class-card` or similar, reusing the same visual
     language as `.page-preview.class-card` (name it once, share the rule across both if the
     `css` skill agrees — don't write the dark colors twice).
   - **Check**: change one page's `icon:` (anywhere already on `/framework/`, e.g. temporarily
     edit `core/Page/page.js`'s icon, screenshot, then revert) and confirm the sidebar, its card
     on `/framework/`, and any `#Page` mention on a page all show the new icon without editing
     a second file. This is deliverable 4's literal acceptance test — do it, don't just reason
     about it, and note the result in your log.
6. **Sprawl layout (deliverable 5) — UPDATED by an owner follow-up, read this version, not an
   earlier one.** The failure to avoid is ONE very tall column beside short ones (dead space).
   Equal-height CSS grid row stretching does NOT fix this — don't rely on it for placing
   sections. Columns are still `grid-template-columns: repeat(auto-fit, minmax(min(100%, 60rem),
   1fr))` (one column under ~1000px, ~three around 3440px), but WHICH section lands in WHICH
   column is decided by a small **greedy JS pass**: walk the sections in importance order (the
   sidebar's own order, same as you're already using), and place each one into whichever column
   is currently shortest (track each column's height, or its placed-section count as a cheap
   proxy). Run this pass **on load, and again on resize only** (debounce resize), never on
   anything else — so sections never jump while someone is reading. A column-count change from
   resize naturally re-triggers it. Below the one-column breakpoint, skip the algorithm entirely:
   everything just stacks in order. Inside a section, the module grid stays
   `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` as before. Use the site's existing clamp/gap
   tokens for padding and gap (load the `layout` skill — it has the exact token names; don't
   invent new ones). If one section (likely core/ext) ends up much bigger than the others, tabs
   for drilling into its subsections are fine (persistent in the URL, explorable) rather than
   letting it just render very tall.
   This probably lives as a new rule in `core/Page/Page.css` scoped to `/framework/`'s own page
   (a class on the page's root div, not a bare `.page-walls` override that would change every
   OTHER page using `walls()`) plus a small script for the placement pass — check who else calls
   `walls()`/`previews()` before changing their shared CSS; if anyone else does, give
   `/framework/page.js`'s own wrapper its own class instead of touching the shared one.
   Name the pattern "sprawl" in one line in `/framework/design/layout/` (find its `doc/` — most
   likely `public/framework/design/layout/doc/rules.md` or a new short doc file there; read its
   readme chain first) — one line, extended to record the REJECTED alternative: CSS `columns:`
   (the multi-column property) auto-balances column heights on its own, but its items reflow and
   visibly jump whenever content above them changes height, which is why the greedy JS pass was
   used instead. Still one line, not a new section of prose.
7. **Column heights "a big question"** — the owner explicitly left this open. Do NOT build
   adaptive heights. Plain CSS grid rows (equal height per row, content decides height) is
   correct for this task. Say in your log that this was deliberately left as CSS grid's default,
   per the owner's own words, and that `@task-mastermind-panel2-sessions` owns adaptive heights
   later (deliverable 6 — no action needed from you beyond not building it).

## Build

1. **Back up**: `/framework/old/` is a new declared child of `/framework/page.js`
   (`children: "... old ..."`), its `page.js` is the CURRENT `/framework/page.js` content
   verbatim (just update its own breadcrumb/meta if the Page constructor needs it — check how
   another `old/` sibling elsewhere in the repo (e.g. `core/Page/old/`) is declared and copy that
   pattern). Nothing about the old page's behavior changes; it just now lives one level deeper.
   Load the `new-page` skill for the mechanics of adding a declared child correctly.
2. **The new `/framework/page.js`**: one section per top-level child in sidebar order (see #1
   above), each section a grid of its children as icon items (icon, name, one-line
   `description`). Reuse `walls()`/`previews()`/`preview_card()` — don't hand-roll a second card
   renderer (CLAUDE.md law 6: one of everything).
3. Dark class cards (#3, #4, #5 above).
4. Icons from one source (#4, #5 above) — the check in #5 must actually pass.
5. Sprawl CSS (#6 above).
6. Keep the hero (`h1`, intro `md`, the live clock `panel`, `stats()`) — the owner asked for a
   new way to browse the framework's modules, not to delete the existing intro. Put the new
   sprawling sections where `this.walls()` used to be called, in the same `flow`/`default flow`
   structure the page already uses — don't restructure what isn't being replaced.

## Fence

Yours: `public/framework/page.js`, `public/framework/old/` (new), `public/framework/core/Page/Page.class.js`
(only if `walls()` needs to grow a parameter — keep the change small and backward compatible for
every other caller), `public/framework/core/Page/Page.css`, `public/framework/ext/Doc/Doc.js`,
`public/framework/ext/Mention/Mention.js`, `public/framework/ext/Mention/maps/refs.js`,
`public/framework/design/layout/doc/*` (one line), and these modules' own `readme.md`/`doc/*` for
the `documentation` pass at the end. Nothing else — if you think you need a file outside this
list, say why in your log instead of editing it.

## Prove it before you say done

1. `node Server/merge.mjs` is run by the mastermind, not you — but before handing back, load
   the pages yourself on the worktree's own server (`http://framework-home.localhost/framework/`,
   `/framework/old/`, a page with a `#Page` mention) and confirm zero console errors.
2. Run `node Server/layout-check.mjs http://framework-home.localhost/framework/ --widths
   400,1200,1920,3440` and actually look at each shot: sections stacking at 400/1200, ~3 columns
   at 3440, padding/gap present (not edge-to-edge, not a single column of tiny text at 3440).
   Describe what you saw per width, one line each, in your task.jsonl.
3. The icon single-source check from #5.
4. Run `documentation` skill on every module you touched before you report done.

Report back to `task-mastermind-framework-home` (your parent) when built, committed, and checked
— do not merge yourself; the mastermind runs `review.mjs` and `merge.mjs`.
