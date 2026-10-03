# Build: two equal columns show the deepest two open card levels

Load the `minion` skill first. Worktree: `C:\Code\lew42\worktrees\subcard-columns`
(branch `worktree/subcard-columns`, dev server already running at
`http://subcard-columns.localhost/`, port 52660 — do not start another server).
Task dir (read-only context, your own log goes in this folder):
`public/framework/ai/2026-10-03/subcard-columns/` — read `requirements.md` there for the
owner's own words (verbatim) before you start. This file is your fence and build plan.

## The owner's ask, verbatim (also at the task dir's requirements.md)

> Let's see if we can get a nested card on any one of these pages. When we click a sub-card
> it could launch in a column: it's the rail process repeated, Miller columns in our page
> column system. With the drawer closed, the detail side is huge, 2000+ px, so the Now card
> can act as a preview rail that launches another column. I don't want a hand-managed
> navigation; a programmatic left nav that just lists the cards is more of a table of
> contents. It's the sub-cards I'm after. Routing and sharing the width may be tricky;
> figure it out.

Follow-up, same day, which decides the exact shape:

> The inbox rail stays: it's our monitor; anything important that pops up shows there. The
> DETAIL side splits into two equal columns. A card opens in the first; its sub-card opens
> in the second; the next sub-card opens a third column and hides the first, so you always
> see the last two levels, as deep as it goes. I did this before for three columns (the
> /imagine/paging column paging work); I want it deeper. Sub-cards drill down in place so we
> don't lose context. A link to a DIFFERENT thing with its own page links away, for now;
> don't import and render other pages here.

## What exists today (I already read the code — don't re-derive this)

- A card is `public/framework/ai2/card.js`, `class Card extends Page`. A card's folder is
  its data; a sub-card is one path segment deeper (`Card.child()`, line ~234) — arbitrary
  depth already works at the DATA layer.
- `Card.content()` (line ~250) is where "replace parent" happens today. `sub = this.parent
  instanceof Card`. A TOP-LEVEL card borrows the shell's shared region: `if (shell && !sub)
  this.$pages = shell.$sub;` — so its own sub-card mounts into the Inbox shell's ONE shared
  `.inbox-sub` div (`core/Page/ext/Inbox/Rail.js` line ~233, `sub(){ this.$sub =
  div.c("inbox-sub"); }`). A SUB-card does NOT get this treatment — its own children mount
  the normal nested way, inside its own box. That's why today only one extra level ever gets
  its own column; anything deeper just takes over inside that one column (`Card.css` ~1123:
  `.inbox-shell:has(> .inbox-sub > .page.active-page) > .inbox-detail > .page.ai2-card-page {
  grid-template-columns: minmax(0,1fr); }` collapses the parent's own chat when a sub is
  open).
- `Inbox.css` (`.inbox-shell`, line ~117): a CSS grid, `rail | detail | sub(2fr)`. Below
  ~40em (see the file's own narrow media query, search `.inbox-sub { display: none }`'s
  sibling rules near line 619) it already collapses to ONE visible region with a back link —
  **that narrow fallback is correct already and must not be touched.**
- `Card.seam()` (`card.js` line ~346) is the existing draggable-divider helper: one call,
  built on `ext/grip`, writes one CSS custom property, remembers the width in `localStorage`,
  resets on double-click. Two calls already exist (`--ai2-chat`, `--ai2-subw`). **Reuse this
  verbatim for the new divider — do not use `ext/Panel`'s seam, which is a different, heavier
  system for a different job (wireframing arbitrary layouts).**
- The core/Page `columns({even:true})` system (`core/Page/Page.class.js` ~1430-1680,
  `core/Page/doc/columns.md`) is a SEPARATE, general mechanism for a row of independently
  routed pages that scrolls sideways past N open columns. **Do not build on it.** It's built
  for a different shape (a finder-style row, unlimited scroll-past-N) and pulling it in here
  would entangle two systems that don't need to know about each other (CLAUDE.md law 6 cuts
  both ways: reuse what fits, don't force-fit what doesn't). The decision to use 2 fixed
  equal columns + a breadcrumb, built directly in `ux/Card`, is this task's own — logged in
  `public/framework/ai/2026-10-03/subcard-columns/task.jsonl` as a `decision` line.

## The architecture to build (this is the plan — implement it, don't redesign it)

**One shared flat row, not nested boxes.** Today, each deeper sub-card's box is physically
nested inside its parent's own DOM (because only the top level reassigns `$pages` to the
shared region). Change this so EVERY card in an open chain — top-level or sub, any depth —
mounts into the SAME shared flat host area (the existing `shell.$sub` div, repurposed as a
flex row that accumulates one box per open level, in order, oldest first). Concretely:

1. In `Card.content()`, replace the `if (shell && !sub) this.$pages = shell.$sub;` line so
   it applies at every depth when a shell exists: every card, when building its content,
   should ask the shell for the shared flat host and mount its OWN "column box" there as the
   next item in the row, instead of nesting its sub's box inside itself. (The top-level card
   itself currently mounts in `.inbox-detail`, handed down by the Router — that's fine to
   leave as is IF simpler, OR move it into the same flat row too so the whole chain is
   uniform; pick whichever is less invasive once you're looking at the real code. Either way
   the end state is: the row of open levels is visually flat, not nested.)
2. **Only the last two boxes in that row are visible**, at equal width. CSS: something like
   `.ai2-window > .ai2-card-page:not(:nth-last-child(-n+2)) { display: none; }` (adjust the
   real selector to the real DOM — a breadcrumb bar may be a sibling, not a card, so count
   carefully) plus `.ai2-window { display: flex; }` and each visible box `flex: 1 1 0;
   min-width: 0;`.
3. **A breadcrumb strip** at the top of the row (first visible column), listing every level
   before the two now showing, each a plain link (reuse the look of the existing `.ai2-back`
   link — `a.c("ai2-back …").href(...).text("← " + title)`, one per hidden ancestor, most
   recent first or oldest first — pick whichever reads naturally once you see it rendered,
   and say which you picked in your log). Simplest correct source for this list: walk
   `this.parent` pointers from whichever card is currently deepest/open (the leaf), collect
   titles+urls, and render all-but-the-last-one as the breadcrumb. Only the leaf card needs
   to compute and render this (it knows its own ancestry); don't make every level duplicate
   the computation.
4. **The divider between the two visible columns**: `Card.seam()`, same pattern as the
   existing `--ai2-subw` one (`card.js` ~327), one token, equal default (50/50) via CSS
   `flex: 1 1 0` on both, a dragged width overrides one side only (the other takes the
   remainder) — follow the existing `--ai2-chat`/`--ai2-subw` seams as the exact model for
   "lo, hi_of, before" arguments.
5. **Keep the existing narrow (<~40em) one-column-with-back-link fallback working
   unchanged** — it already does the right thing per the brief; just make sure your flat-row
   change doesn't break it (the narrow CSS may need the same `.ai2-window`/breadcrumb classes
   added to its selectors so it still shows exactly one box + back link below the width
   threshold).
6. **Every level is routed already** (each sub-card is a real `Page` at a real URL via
   `Card.child()`) — don't add a new URL scheme. Back/forward/reload must land on the same
   two visible columns: verify this by hand (open a 3-deep chain, hit back, confirm column 1
   and 2 shift correctly and the breadcrumb updates).
7. **A link to a different page (not a card) still just navigates away** — don't change
   that; this task only touches the card-opens-sub-card path.

## Fence (yours alone — don't touch files outside this list)

- `public/framework/ux/Card/Card.js` doesn't exist — the real class is
  `public/framework/ai2/card.js`. Write there.
- `public/framework/ux/Card/Card.css` — the CSS (styling only; "look" lives here per its own
  readme).
- `public/framework/ux/Inbox/Inbox.css` — ONLY if the shared `.inbox-shell`/`.inbox-sub` grid
  genuinely needs a change (e.g. equal-width columns, or widening the region now that it
  holds 2 columns instead of 1). **Any change here must not break other Inbox consumers**
  (anything using `InboxRail` that is NOT a Card — e.g. a plain list+detail page with no
  sub-cards). Check: does your change still render correctly for a page with zero sub-levels
  open? If unsure, scope your new rules to a new class you add from Card.js (e.g.
  `.inbox-sub.ai2-window`) rather than editing the bare `.inbox-sub` rules other consumers
  rely on.
- `public/framework/ai2/rail.js` — only if something there truly must change for this to
  route; read it first, most likely you won't need to touch it.
- `public/framework/ai/2026-10-03/subcard-columns/minion-build/` — your own log
  (`task.jsonl`, same shape as any task log — see `public/framework/ai/2026-10-03/subcard-columns/task.jsonl`
  for the parent's log as a model) and this requirements file.
- **Never** `core/Page/`, `ai2/inbox.js`, `ai2/faces.js`, or anything under
  `imagine/paging/` — out of scope, and `core/Page` columns is a separate system (see above).
- **Never** the `mcp__playwright` tools (per the parent task's fence).

## Prove it before you say done

1. Pick a card with at least 2 sub-levels to test with. The Now card
   (`/framework/ai/2026/10/03/now/`) has only one sub-card today
   (`your-prompts-refined-live`) — either add a throwaway second-level test sub-card
   folder under it for your own testing (delete before landing, or note it if the owner
   might want it kept — ask the parent mastermind via your task log if unsure, don't block),
   or find/create a 2-deep chain elsewhere in `public/framework/ai/` that's safe to use.
2. Screenshot (`node Server/layout-check.mjs <url> --widths 1200,1920,2560,3440`, run it from
   the worktree against `http://subcard-columns.localhost/<path>`) the 2-deep state at all
   four widths, with the drawer closed. Also do it once with the drawer open if you can
   reach that state without driving the owner's real browser (headless only — launch your
   own throwaway tab, never `mcp__site__pages/claim/eval` on a connected tab).
3. Confirm back/forward and a hard reload all land on the same two visible columns — write
   what you did and what you saw in your log, in plain sentences.
4. Confirm the narrow (<40em) fallback still shows one column + a working back link.
5. Run `node Server/merge.mjs <this worktree path> <pages you touched>` yourself before
   telling the parent you're done — if it fails, fix it; don't hand back a red smoke test.

## Report back

Log each step as you go (`node .claude/hooks/append.mjs` into your own task.jsonl, this
folder). When done — or if you hit a real blocker — message the parent mastermind
(`task-mastermind-subcard-columns`) with: what you built, the screenshot paths, whether
`merge.mjs` passed, and anything you changed from this plan and why.
