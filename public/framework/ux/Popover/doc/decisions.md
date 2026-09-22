# Popover — decisions

Opened 2026-09-19: [`ai/2026-09-19/popover-system/`](/framework/ai/2026-09-19/popover-system/).
The owner's own words are in that task's `requirements.md`. Short version: *"if you
were to put the popovers nearby the content it's for, it would automatically
position itself properly in flow without much effort... explore both those
options, maybe build out both of them."*

## Why the top layer won

Built both, in the SAME hostile box — an `overflow: hidden` card inside a scrolling
column inside its own stacking context, beside a sticky sibling — on
[the comparison page](/framework/ux/Popover/). What it shows:

- **Option A (`position: absolute`, in flow)** needs zero placement code and moves
  with its content for free — a real advantage the demo states plainly. But the
  instant its box would extend past the card's edge, `overflow: hidden` clips it —
  not squeezed, not behind anything, **unpainted**. This is exactly the failure
  `ext/Dropdown`'s own sweep measured on `ext/Panel` a month ago: 365 popovers cut
  off at 1280px, 343 at 400px, every one a `.panel-pop` inside a workspace whose
  ancestors are all `overflow: hidden` (`ext/Dropdown/doc/decisions.md`).
- **The owner's z-index point is separately true, and is not shown by the clipping
  demo alone**: even a popup that ISN'T clipped is still confined to its own
  ancestor's stacking context, so raising its `z-index` to any number cannot lift
  it over a sibling that has its own stacking context (the sticky bar in the
  hostile box). A second staged demo just to PHOTOGRAPH that specific case was
  considered and skipped — it is the same root cause as the clipping failure
  (`position: absolute` binds a box to its nearest positioned ancestor, both for
  layout AND for paint order), and the site's own z-index count below is the
  concrete evidence for it, not a staged screenshot.
- **Option B (`popover` attribute)** opens whole, on top of the sticky bar, never
  clipped by the card — because it does not compete in that stacking context at
  all. It costs one browser feature and, for placement, CSS anchor positioning.

**Chromium here reports `151.0.7922.34`** (`playwright` `chromium.launch()` →
`browser.version()`). CSS anchor positioning (`anchor-name`, `position-anchor`,
`position-area`, `position-try-fallbacks`) shipped unflagged in Chrome 125 (May
2024), so 151 has the whole declarative path — the comparison page and
`Popover.js` both run on it, not the fallback, on this machine. The fallback
still ships and is real code, not a stub: `Popover.place()` is `ext/Dropdown`'s
own `place()` (measure with `getBoundingClientRect()`, write `left`/`top`,
flip once if it would run off-screen), generalised from two sides to four.

## Why a class, and what it copies from `ext/Dropdown` on purpose

Same call `ext/Dropdown/doc/decisions.md` already made, restated because this
module leans on it rather than re-arguing it:

- **The popup stays a DOM sibling of its trigger**, not appended to
  `document.body` — so whatever built the trigger can throw the whole thing away
  and take the popup with it, and it is still authored "nearby" in the markup the
  way the owner asked.
- **`popover="auto"` is outside-click and Escape for free.** Neither is code here.
- **One `toggle` listener** drives placement AND focus-return for every close path
  alike (a light-dismiss click, Escape, or a script calling `close()`) — the same
  shape `Dropdown.list()`'s `.on("toggle", …)` already uses.

What is new, not copied: **four placements instead of two** (`top`/`bottom` plus
`left`/`right`, for the owner's "opens to the side"), **CSS anchor positioning as
the primary path** (Dropdown predates it being safe to rely on and still measures
every time — this module's `doc/decisions.md` is where that upgrade is recorded;
Dropdown's own migration is listed as future work below, not done today), and
**hover as a trigger mode** (for the tooltip — Dropdown only ever opens on click).

## Focus return: only if the keyboard actually went in

The obvious version returns focus to the anchor on every close. That is wrong for
a hover-triggered tooltip — the mouse is still wherever it is, and grabbing focus
out from under it would be the module causing the bug it exists to prevent.
`toggled()` checks `this.$box.el.contains(document.activeElement)` before
returning focus: true only when Tab (or a click inside the box) actually moved
focus there. Verified with the keyboard proof below.

## The z-index audit — what this could retire

Method: `rg -n "z-index\s*:" public/framework --include="*.css"`, then dropped
every hit inside `core/new/1/` (explicitly "prior art — read, never import",
`code` skill §8) and this module's own three (the demo hostile box and its
sticky bar, which are illustrating the PROBLEM, not fixing one). **39 real,
live declarations** — the brief's own "about forty" estimate, confirmed. (Not
counted: `ui/menu/menu.js`'s `.ui-menu-list { z-index: 10 }`, which lives in a
`.js` template string, not a `.css` file, so neither the brief's `rg` nor this
one caught it — one more `ux/Menu` carries, on top of the count below.)

Read every one. **Most are not popovers at all**, and Popover cannot touch them:

| Why it stays | Count | Examples |
|---|---|---|
| Sticky headers (own stacking order against scrolled content, not a clip fight) | 5 | `Page.css:584`, `Sidebar.css:285`, `Page.css:544` |
| The "stretched-link card" trick (a clickable spot needs `z-index:1` to sit above the card's own `::after` link-overlay) | 4 | `ai.css:598,610,677`, `ask.css:146` |
| Drag/resize chrome — a ghost, a grip, an insert line, ALL cooperating inside one gesture, not fighting an ancestor's `overflow` | 9 | `draggable.css:15`, `grip.css:15`, `Panel/grip.css:15`, `Panel/split.css:14,35`, `Panel/insert.css:33` |
| Data visualisation layering (a timeline's bars and "now" line) | 4 | `Timeline.css:41,76,90,106` |
| Persistent chrome (always-on-top, or a fixed rail/pill that is never dismissed the way a popup is) | 5 | `Claim/claim.css:8`, `DevBar/devbar.css:20`, `App/mode.css:8`, `Search.css:14`'s OWN trigger vs its overlay — see below |
| A panel's own internal ladder — floating panels, corner badges, control strips, ALL siblings inside one editing surface that already cooperates on purpose (`Panel/size.css`'s own comment: *"a floating panel that paints under the chrome is not floating"*) | 8 | `Panel/controls.css:28,140`, `Panel/display.css:64`, `Panel/focus.css:30,41`, `Panel/templates.css:224`, `Panel/tools.css:12` |
| Full-page overlays / instruments (a crosshair picker, a measuring rail, fullscreen demo mode) — one thing covering the WHOLE viewport is not what a top layer helps with; it already paints above everything by being `inset: 0` on top | 3 | `ask.css:35`, `DesignTool.css:129`, `demo/stage.css:148` |
| Demo-only (a styles lab page, illustrating a concept, not live site chrome) | 2 | `styles/layouts/layouts.css:20,36` |

**That leaves four real candidates** — a popup that opens NEAR a trigger and is
dismissed by clicking away or pressing Escape, which is exactly what
`popover="auto"` is for:

1. **`core/Search/Search.css:14`** (`z-index: 45`) — the omnibox's results overlay.
2. **`ext/drawer/drawer.css:23`** (`z-index: 40`) — the slide-out drawer panel.
3. **`ext/Panel/text.css:23`** (`z-index: 41`) — a floating text-formatting toolbar
   that appears near a selection.
4. **`ui/menu/menu.js`**'s `.ui-menu-list` (`z-index: 10`, not in the `.css` count
   above) — `ux/Menu`'s own panel, which `doc/decisions.md`'s own "no named
   extension" section already names the Popover API as *"the eventual native
   upgrade"* (2026-08-21, before this module existed).

Plus the two already named in the brief: **`ext/Dropdown`'s own placement**
(the module this one's fallback was copied from) and **`ux/Menu`** (item 4
above, restated). **Five total candidates, four real z-index lines it could
retire** (`ux/Menu`'s is the fifth, uncounted by `*.css`) — a small number, and
that is itself a finding: the owner's read ("hard to get z-indexes to work
properly if the elements are nested") is correct for the shape it describes, but
most of the site's 39 z-indexes are a DIFFERENT problem (layered chrome
cooperating on purpose) that a top-layer popup does not solve and should not
try to.

## Not done today, and why

- **None of the four candidates above were migrated.** Each is a live, working
  feature outside this task's fence (`core/Search`, `ext/drawer`, `ext/Panel`,
  `ui/menu` are all off-limits — the brief's fence names `ux/Popover/**` only).
  Migrating one is a real, separate task: each has its own open/close call sites
  to rewire, and `ext/Panel`'s in particular sits inside the size/grip ladder the
  table above shows is genuinely cooperating, so its ONE popover-shaped piece
  (`text.css`'s toolbar) would need care not to disturb the other eight.
- **A dedicated visual proof of the z-index-only failure** (not clipped, still
  buried) was scoped out — see "Why the top layer won" above; the clipping demo
  and the count together carry the argument without a second staged box.
