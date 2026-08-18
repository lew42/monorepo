# DesignTool's interface — the design to build

Written 2026-08-17 from measurement, not reading. Every claim below carries a file
and line or a number. **This is a design to execute**, not a menu; where a call was
genuinely open I made it and said what would change my mind.

Scope note: `ext/DesignTool/**` was being edited by another agent while this was
written, so nothing here was applied. The rules-tier `score`/`grade` is gone from
`score.js` and **this design does not use it** — one of its first instructions is to
delete the row that still reads it.

---

## The headline, before anything else

**Opening the tool manufactures the finding it leads with, and that finding's
highlight is the whole page.** Mike's four complaints are one bug and three
consequences of it:

| # | complaint | measured cause |
|---|---|---|
| 1 | "we need the feedback to be accurate" | `gutter` fires on `.pages` **only when the rail is open** — 18 of 24 page×width pairs, top finding on 12 |
| 2 | "a report item highlights the whole page" | that finding's ring is 79% of the viewport; `dead-space` rings 100% of it |
| 3 | "we shouldn't have 2 screens" | the rail's readout and the full report are the same report twice, and one wipes the other |
| 4 | "not clear what is selected / looking at / the target" | 8 controls, 0 of which show the target or the selection |

Fix #1 first. It is one expression, it is provably zero-risk, and it removes the
worst instance of #2 for free.

---

## Job 1 — the whole-page highlight, to a line

### The hypothesis in the brief is eliminated, with a measurement

> `probe` walks a flat preorder node array with a depth cap and a `cut` flag — a
> finding pointing at a culled node has no element to highlight.

**Not the cause, and it cannot be.** Two independent proofs:

- **Mechanically impossible.** `probe.js:66-71` returns *before* `nodes.push()`
  when the caps are hit, so a culled child never gets an index. Every rule iterates
  `model.nodes`. A finding cannot reference a node that was never recorded. `cut`
  marks the surviving **parent**, and `read_text()` (probe.js:160) then skips that
  parent — so a cut container carries no text block and the text rules skip it too.
- **Measured.** 846 findings across 14 pages × 4 widths (390/1280/1920/3440):
  **0 unresolvable paths, 0 findings whose node is a `cut` container**, 12 nodes at
  the depth cap, 11 cut containers.

And a failed lookup could never *look* like a whole-page ring anyway:
`locate()` returns `null` (`address.js:9`), and `highlight.js:49` is
`if (!el) return void $spot?.rc("on")` — no ring at all. A path miss is **silent**,
which is its own (smaller) problem, addressed as cause D.

### Cause A — the rail invents a page-wide finding. `rules.js:123`

```js
// rules.js:122-123
const regions = m.nodes.filter(n =>
    (scrolls(n.ovx) || scrolls(n.ovy)) && n.w < m.viewport.w - 2);
```

That width comparison is a **geometric proxy for a structural question** — the
comment above it says so: *"not the shell — a full-bleed `.app` spans the viewport,
so its edge IS the window."*

`framework.css:170` pushes `.app` by the rail:

```css
padding-inline-end: min(calc(var(--drawer, 0px) + var(--devbar, 0px)), …)
```

So opening the rail makes `.pages` 272px narrower than the viewport **without
making it any less the shell**, and the proxy inverts. Measured, same page, same
width, rail the only difference:

| | `.pages` | census | leading finding |
|---|---|---|---|
| `/framework/ai/` @1920, rail **closed** | 1920 of 1920 | 0 high · 12 med | `med · measure · div.flex.v.gap` |
| `/framework/ai/` @1920, rail **open** | 1648 of 1920 | **1 high** · 8 med | **`high · gutter · div.pages`** |

Across 8 pages × 3 widths: **the rail creates `high · gutter · div.pages` on 18 of
24 combinations, and it becomes the top finding on 12.** Its ring is `div.pages`,
1008×900 at 1280 — **78.8% of the viewport**, i.e. the whole readable page.

The rule's own motivating example does not reproduce with the rail closed
(`/framework/ext/DesignTool/audit/` @1280 closed: `gutter []`).

**The fix — compare against the root's content width, not the viewport.**
The codebase already computes this number, in the same situation, for the same
reason (`dev/DevBar/layout.js:183-186`: *"`.app` reserves the rail as
padding-inline-end, so its rect reads the full window"*). The probe records what is
needed: `nodes[0].cw` (probe.js:98) and `nodes[0].pad` (probe.js:100).

```js
// rules.js, inside the `gutter` rule, replacing lines 122-123
const r0 = m.nodes[0];
const limit = Math.min(m.viewport.w, r0.cw - r0.pad[1] - r0.pad[3]);
const regions = m.nodes.filter(n =>
    (scrolls(n.ovx) || scrolls(n.ovy)) && n.w < limit - 2);
```

Verified against the live probe model without touching the module:

- rail open @1280: **10 → 0** `gutter` findings. All ten were `high · div.pages`.
- rail open @3440: **13 → 1**. The survivor is a genuine inset region
  (`low · table` on `/framework/styles/`).
- rail closed: **unchanged, necessarily** — when the root has no inline padding,
  `r0.cw - 0 - 0 == m.viewport.w`, so the new expression is *arithmetically
  identical* to the old one. The committed headless baseline (`audit/findings.json`,
  generated with no rail) cannot move. **Zero regression risk.**

⚠ Restate the *reason* in the rule's comment, not just the number: the test is "is
this region narrower than the space it was given", and the shell exclusion must
never be written against the viewport again.

### Cause B — two rules issue on the analysis root, so `path` is `""`

```js
rules.js:264   issue(m.nodes[0], …)   // dead-space
polish.js:275  issue(m.nodes[0], …)   // invisible
```

`probe.js:251-259` returns `""` for the root's path, and `address.js:9` is:

```js
export const locate = (root, path) => (path ? root.querySelector(`:scope > ${path}`) : root);
```

Empty path → **the root**. The root is `.app`, whose rect *is* the viewport, so the
ring is exactly the window. Reproduced live by hover:
`{"box":{"x":0,"y":0,"w":3440,"h":1440},"viewport":{"w":3440,"h":1440},"tag":"div.app.theme-lew42","cover":100,"edges":4}`
(`shots/21-annotated-wholepage-ring-3440.png`).

`dead-space` is gated at `m.viewport.w < 1500` (`rules.js:255`) — **which is exactly
why it is "sometimes"**: it cannot fire on a laptop and it fires all over a mega
monitor.

| width | top-3 findings that ring the root | 
|---|---|
| 390 | 0 / 41 |
| 1280 | 0 / 42 |
| 1920 | 1 / 42 |
| 3440 | **5 / 42 (12%)** |

15 of the 16 root-ringing findings site-wide are `dead-space`; the 16th is
`alignment` on `div.pages` at 390.

**The fix — do not offer a highlight.** The subject of `dead-space` and `invisible`
genuinely *is* the page; there is nothing else honest to point at, and a ring
identical to the viewport carries zero bits. Per the brief's own test — *an
affordance that lies is worse than an absent one* — the aim affordance is withheld:

```js
// report.js:78 already has the shape; generalise the condition
const at = ($view, i) => (root && i.path ? aim($view, () => locate(root, i.path), i.sel) : $view);
```

Three call sites, one condition each: `report.js:78`, `layout.js:177-178`,
`live.js:88`. The row still renders, still reads, still carries its proposed
declaration — it just is not clickable, and `dt-aim`'s pointer cursor and hover
tint (DesignTool.css:153-154) never appear, so nothing promises a location.

⚠ Do **not** "fix" this by ringing the dead band instead. `dead-space` knows
`left`/`right`/`viewport.w` (rules.js:259-261) and could carry a rect, and that
would be genuinely better feedback — but it means a new `issue.band` field, a
second code path in `highlight.js`, and API forever (RULE#6). Withholding the
affordance is one condition and is *correct*. Revisit only if Mike asks to see
where the dead space is; the measurement that would decide it is whether he ever
tries to click those rows once they stop ringing.

### Cause C — the roll-up retargets a finding onto a page-tall container

```js
// DesignTool.js:102-108
out.push({
    ...worst,
    sel: parent.sel, node: parent.i, path: parent.path, children: flock.length,
    …
});
```

`FLOCK = 2`, so **any two siblings sharing a rule collapse onto their parent** — and
the parent of a page's direct children is the page container. The attribution is
right (the fix belongs on the container; `parent_fix()` at DesignTool.js:139 is the
whole point) but the **location is useless**.

Measured: 47 findings ring a non-root box covering ≥60% of the viewport;
**32 of 47 are roll-ups, and 7 of 7 in the top-3 are.** Actual targets, with real
dimensions:

```
measure    → div.md.flow          390×25731   rollup 21
measure    → div.dt-audit.flow    348×25573   rollup 7
pad-scale  → div.page.flow        334×4789    rollup 3
whitespace → div.layouts-wall     ...         rollup 3
```

Combined with cause B: **at 3440, 24% of what the devbar shows points at the page
itself or a page-tall container** (10 of 42 top-3 findings); 17% at 1920, 7% at
1280, 2% at 390.

**The fix — ring the exemplar, name the container.** The roll-up already has the
worst instance in hand; it just overwrites its address. Keep it:

```js
// DesignTool.js:102-108, add one field
out.push({
    ...worst,
    sel: parent.sel, node: parent.i, path: parent.path, children: flock.length,
    at: worst.path,                 // ⚠ the exemplar's address — what to RING
    …
});
```

and every aim call site rings `i.at ?? i.path`. The detail line already reads
*"21 children of div.md.flow share this — worst is p, …"*, so the label on the ring
becomes `worst.sel` and the text and the ring finally agree. `repeats()`
(DesignTool.js:119-135) keeps `worst.path` already, so it needs nothing.

One line in the roll-up, one expression at three call sites. **This is the change
that makes the highlight useful rather than merely honest**, and it is why it sits
below A and B in the build order but above everything else.

### Cause D — an off-screen target rings nothing at all

The ring is `position: fixed` (DesignTool.css:135-140). A target below the fold is
drawn at coordinates outside the window, so **hover produces no visible feedback
whatsoever**. Measured at 390: 14 findings ring a box with ≤1 visible edge *and* 0%
viewport cover; **3 of 42 top-3 findings**. Clicking works (`hold()` calls
`scrollIntoView`, highlight.js:32) — but a hover that does nothing reads as broken,
and it is the gesture the row invites.

**The fix — clamp the spot to the viewport and say which way.** In `draw()`'s
`follow()` loop (highlight.js:54-65), when the box is fully outside, pin the spot to
the nearest edge as a 3px bar and put `↑`/`↓` in the tag:

```js
const off = box.bottom < 0 ? "up" : box.top > innerHeight ? "down" : null;
$spot.el.classList.toggle("off", !!off);
```

plus two rules in `DesignTool.css` (`.dt-spot.off { height: 3px; }` and the tag
already renders above it). ~8 lines JS, 4 CSS. Hover always produces feedback;
click still scrolls.

### Summary — the honest fix per cause

| cause | file:line | fix | kind |
|---|---|---|---|
| A | `rules.js:123` | compare against the root's **content** width | a wrong measurement, corrected |
| B | `rules.js:264`, `polish.js:275` | **no highlight** — the subject is the page | absent beats lying |
| C | `DesignTool.js:104` | ring the **exemplar**, name the container in the fix | a better target |
| D | `highlight.js:54-65` | clamp to the viewport, mark the direction | a better ring |
| (culled nodes) | — | **nothing — eliminated by measurement** | |

---

## Job 2 — one screen

### What the two screens are

Both live in the devbar's `layout` tab. `full report` (layout.js:63) **replaces**
the readout in place; the way back is the `re-run` button, which is not labelled as
a way back.

| | **A — the rail readout** (`layout.js:150-172`) | **B — the full report** (`report.js:19-25`) |
|---|---|---|
| verdict chip | `issues 1 high · 6 med · 10 low` | `report.card` — severity chip + url + census + total |
| `grade` | **`undefined · undefined`** (dead — score.js removed it) | — |
| `taste` | `A · 91` + three weakest bands | **absent** |
| metrics | one muted line: `measure 49.7ch · gap 0.38× · used 79.23%` | **six cards, each with a 3-line caption** |
| findings | top 3, `aim`-able | all, grouped by rule, up to 6 instances each |
| proposed fix | **absent** | `dt-fix` — selector + declaration |
| before/after | absent | `Show me this element…` (`mirror.js`) |
| defer | absent | `Not a problem here` (`defer.js`) |
| target line | `target div.app…` + a `page` button | inherited from A (rendered outside `$out`) |
| controls | 8 | **20** |

Everything above the dividing line is **the same information twice**. B is a
superset of A except `taste` — which is the one number the brief's own evidence says
correlates with how pages look.

There is a **third** renderer of the same report: `live.js` (`dt-live-panel`), used
by `tests/page.js:3` and `library/entry.js:15`. It shows a census badge, the same
metrics line, and the top 4 findings. Three near-duplicate renderers of one report
is the reporting layer's version of the RULE#7 problem.

### The single screen — B is deleted, three of its parts move into A

**Screen B ceases to exist inside the rail.** `report.js` survives untouched for the
two pages that have room for it (`ext/DesignTool/page.js:69`,
`audit/page.js:186`) — it is a *page* component, and a 272px rail was never its
size (`shots/02-devbar-fullreport-1920.png`: the url wraps mid-word, the total `17`
breaks onto two lines, and six metric cards each carry three lines of explanatory
prose).

Deleted from `layout.js`: the `full report` button (line 62), the `report()`
function (lines 112-118), and the `full()` dynamic import (line 13).

Moved into A, **on the selected finding only**:

1. **the proposed declaration** — one line, the most useful thing B had.
2. **`not a problem`** — `defer()`, one button, only when `deferrable(i)`.
3. *(not moved)* `Show me this element, before and after` — `mirror.js` clones the
   element at its own size, which needs page width. It stays on
   `audit/page.js` and `ext/DesignTool/page.js`. A one-line link
   *"see it on the audit page"* is the rail's answer.
4. *(not moved)* the six metric cards. A already shows the same three numbers in
   one line. The captions are documentation and belong on
   `/framework/ext/DesignTool/`.

**Why no third view.** Nothing in B is unrepresentable in A once the selected
finding can expand; A already owns the target line, the census, taste and the
findings, and it is the only surface that has a live `root` (layout.js:108-111 —
which is what makes `aim` work at all). A hosts everything. B hosts nothing A
cannot.

### The single screen's layout

```
┌ dev ─────────────────── block ✕ ┐   head, unchanged except…
│ [390] [810] [1920] [3440]  1648px│ ← the width moves here (Job 3)
│  page   layout   ai              │
├──────────────────────────────────┤
│ ⌖ .app                           │  TARGET — one chip line, hover rings it,
│                                  │  click toggles page ↔ focused panel
│ 1 high · 6 med · 10 low · taste B 84
│ weakest  scale 0% · depth 57%    │  muted
│ measure 50ch · gap 0.38× · used 79%
│ 906 nodes · 76ms                 │  muted
├──────────────────────────────────┤
│ ▎med · measure          ← SELECTED: expanded, 2px inline-start border
│ ▎ 10 children of div.md.flow share this — worst is p, ~107ch
│ ▎ div.md.flow { --measure: 52em }        ← the fix, from B
│ ▎ [not a problem]                        ← from B
│                                  │
│   high · gutter                  │  unselected: one line + detail
│   text reaches within 0px of …   │
│                                  │
│   med · alignment                │
├──────────────────────────────────┤
│ [measure]                        │  the one permanent button
└──────────────────────────────────┘
```

Rows deleted outright: `grade` (dead), and `root`'s width (it moves to the head);
`nodes`/`ms` demote to the muted meta line. `used 79.23%` rounds to `79%` — two
decimals next to `50ch` and `0.38×` is three number formats in one line.

⚠ Two display bugs to fix in the same pass, both visible in the screenshots:
`layout.js:164` writes `gap ${m.pad_em ?? "—"}×`, so a null metric renders as
**`gap —×`** — a unit welded to a dash (`shots/22`). And `layout.js:154`'s
`${data.grade} · ${data.score}` renders **`undefined · undefined`** (`shots/20`,
`shots/01`, `shots/04`) because `score.js` no longer computes either. A dash needs
its unit suppressed with it.

### 390 → 3440

**390 — the rail becomes a bottom sheet.** Measured problem: at 390 the rail is
272px = **70% of the window**, and `.app`'s `padding-inline-end` resolves to **0**
(the `--rail-floor` guard, settings.js:41) — so the page is not pushed, it is
*covered*. The readout says `root 390px`: it measured a page you cannot see, and
any ring it draws lands under the rail (`shots/23-annotated-390-covers-page.png`).

The fix is `devbar.css` only — no new token, no shell change, because the shell
already declines to push at this width:

```css
@layer site {
    @media (width < 34em) {
        .dev-bar { inset: auto 0 0 0; width: auto; height: 45dvh; }
    }
}
```

45dvh leaves the top 55% of the page visible, which is where a ring can land. One
companion change in `highlight.js:32`: `scrollIntoView({ block: ... })` uses
`"start"` below 34em instead of `"center"`, or the element it scrolls to lands
under the sheet.

**1280–1920 — as designed above**, one column, ~272px.

**3440 — the screen reflows when the rail is dragged wide.** `grip.js` already lets
the rail be any width. Above ~34em of *rail*, the list and the selected finding's
detail sit side by side — `flex-wrap` plus a `20em` basis, which is the same two
places above the threshold and one column below with no breakpoint written down
(the `layout-design` prescription for full-row items):

```css
.dev-layout-out { display: flex; flex-wrap: wrap; gap: 0.9em; }
.dev-layout-out > * { flex: 1 1 20em; min-width: 0; }
```

Two declarations. ⚠ `min-width: 0` is not optional — a `1fr`-equivalent flex item
keeps its content-based minimum and the monospace detail text will not shrink.

At 3440 with the rail at its default 272px, the honest answer to "does this use the
screen" is **no, and it should not**: the 3168px beside it is the page being
measured. The wide-screen surface for this tool is `audit/`, which already is a full
page. The rail's job at 3440 is to stay out of the way and be draggable.

---

## Job 3 — the three states

### The count, and what each control reflects

**8 controls on the layout screen** (counting a `label` + `input` knob as one),
**20** once `full report` is pressed, **19** on the `page` tab. Measured by
enumerating `button, input, select, a, label` inside `.dev-bar`.

| control | the target | what we're looking at | what is selected |
|---|---|---|---|
| `block` (live reload) | – | – | – |
| `✕` | – | – | – |
| `page` / `layout` / `ai` tabs | – | which **tool** | – |
| `follow the resize` | – | – (a mode) | – |
| `re-run` | – | – (an action) | – |
| `full report` | – | which **screen** — unlabelled, one-way | – |
| `Show me this element…` ×9 | – | – | – |
| `not a problem here` ×4 | – | – | – |
| the 4 width presets | – | the **width** — *on a different tab* | – |

**Zero controls reflect the target. Zero reflect the selection.**

### The five states with no visible representation

1. **Which screen you are on.** Nothing says. The only tell is that the content
   changed.
2. **Which finding is selected.** `dt-aimed` is
   `background: color-mix(in srgb, var(--prim) 14%, transparent)`
   (DesignTool.css:155) — 14% alpha on a dark rail. There is no border, no chip, no
   change in the row's shape. Functionally invisible.
3. **The target, on the page.** The target is named as text in the rail
   (`layout.js:127`) and marked in the document only *while you hover that one
   row*. Worse, the target can be **changed from outside the rail** — clicking an
   `ext/Panel` dispatches `panel-focus` and retargets the measurement
   (layout.js:74-77) — so the state changes with no acknowledgement anywhere.
4. **Page width vs window width.** They differ by exactly the rail (272px). The
   layout tab shows `root 1648px`; the `page` tab shows `size 1920 × 1080`. Two
   numbers, two tabs, neither labelled as which, and the four buttons that *set*
   the page width are on the tab that shows the window number.
5. **Staleness.** The readout is a snapshot with no age. A tab clicked inside the
   page, a demo toggled, a `md()` fetch landing — none of it triggers a re-measure
   (the `ResizeObserver` only watches geometry), and the numbers silently become
   wrong. `re-run` exists *because* of this and says nothing about it.

### The minimum design — 2 controls, not 8

⚠ **Fewer controls, not more labels.** The design below deletes six and adds none.

**Deleted:**

- `full report` — screen B is gone (Job 2).
- `follow the resize` — **always on.** The knob's original purpose (a number that
  moves *during* a drag) was already traded away for the 200ms settle, and DevBar's
  own readme records that nobody has asked for it back. One analysis per gesture at
  ~47ms is not a cost worth a control.
- `re-run` → renamed **`measure`**, and it is the *only* permanent control on the
  screen. It answers state 5 honestly: it is there because the readout is a
  snapshot.
- the `viewport` section's `size` / `font` rows on the `page` tab — replaced by the
  head's width line.

**The three states, one home each:**

**1. The target — one line, one chip, and a mark on the page.**

```
⌖ .app                    ← hover rings it (the one legitimate whole-page ring,
                             labelled as the target rather than as a finding)
⌖ .panel.focus  ⟲page     ← the ⟲ replaces layout.js:130's `page` button
```

It is the only line on the screen that carries a leading glyph, so it stops looking
like the five diagnostics beside it (`shots/20-annotated-clutter-1920.png` shows
four identically-weighted rows).

Plus: **while the layout screen is open, the target wears a persistent 1px dashed
outline** — a second `dt-spot`-style overlay with `dt-spot-target`, `outline: 1px
dashed var(--prim)`, no fill. Not a wash (that is what makes the finding ring
illegible), not a control, and it answers "what is being measured" from the page
side, which is where the question is actually asked. It also makes a `panel-focus`
retarget self-announcing.

**2. What we're looking at — the width, in the head, on every tab.**

The four presets move from `tools.js:74-88` into the rail head, above the tabs,
with the measured **page** width beside them:

```
[390] [810] [1920] [3440]   1648px · 103em
```

Rationale: the width is the one piece of state every tab's content depends on, and
it was the one state controlled from a different screen than it was reported on.
The number shown is `content_width()` (layout.js:183) — the same number the presets
promise (`innerWidth - rail`, tools.js:75), so one number with one meaning
everywhere. `em` rides along because every token on this site is em-based, and it is
one value not a row.

That is a **move**, not an addition: `viewport`'s `sizes()` + two rows leave the
page tab.

**3. What is selected — the selected finding is the expanded one.**

One state, three coherent signals, no new control:

- it is the only row showing its **proposed declaration** and its
  **`not a problem`** button (the two things that moved from screen B);
- `border-inline-start: 2px solid var(--prim)` replaces the 14% wash;
- the ring on the page is **held** (already true — `hold()`, highlight.js:26).

`DesignTool.css:155` changes from a background to a border. Clicking a second row
moves the expansion; clicking the same row again collapses and releases the ring
(`hold()`'s toggle already does this).

**Resulting control count on the layout screen: 2** — `measure`, plus
`not a problem` on the selected finding when the polish tier allows it
(`deferrable()`, defer.js:24). Down from 8, or 20 with the full report open.

---

## Job 4 — where vision fits, and the re-score trigger

### Vision goes *beside* the tool, not in it

Stated plainly, with the reasons:

- **The number is not trustworthy enough to sit next to a measured number.**
  `rubric-v2`'s verdict is **NOT YET**, and the blocker is a missing reference
  standard: the baseline does not reproduce itself (ICC(2,1) **0.510**, Spearman
  +0.507 on a blind re-score), while Sonnet reproduces *itself* at ICC 0.711. A
  score placed in the readout inherits the readout's authority.
- **A live readout with a paid model in it is a bill wired to an observer.**
  $0.0346/image lean, $0.07–0.17/page in the rubric harness. The layout screen
  re-measures on every resize by design. There must be **no code path from a resize
  to `ask()`** — this is Mike's three-exclamation-mark constraint, and the way to
  guarantee it is to keep vision off that screen entirely.
- **`available()` is false off localhost** (`Ask.js:9`), so anything in the rail
  would be a permanently absent feature on the deployed site, on every page.
- The **rules tier is anti-correlated** with appearance (Pearson −0.393) and taste
  is weakly positive (+0.134 Pearson, +0.266 Spearman). So vision's job is *not* to
  decorate the rules tier — it is to be the standard the tiers are checked against.

**So:** vision is a **separate pass whose committed results the tool displays.**
The mechanism already exists and must not be duplicated (RULE#7):

- **the asking**: `ext/Ask`'s `ask(prompt, { model, tools, shot: { url, selector,
  width }, on })` → `{ text, cost_usd, duration_ms }`. `vision.js` already wraps it,
  locked read-only to `tools: "Read,Glob,Grep"`.
- **the picture**: the `shot` log line
  (`{"shot": {at, path, url, width, label}}`) and
  `GET /screenshot?path=` (`Server/plugins/Screenshots.js`), loopback-guarded
  (`Screenshots.js:25-29`) and confined to `os.tmpdir()` after `path.resolve()`
  (`:31-38`). **Do not build a second route.**

**What changes in the UI — one column, no live cost.** The audit table
(`audit/taste/page.js:140`) gains a `looks` column: the frozen baseline's
mean-of-five for that url, muted, beside the taste grade and the finding census.
That is where the three axes become comparable at a glance, which is the whole
point. It reads JSON. It never calls `ask()`.

`vision.js`'s existing button stays exactly as it is — a **prose** second opinion on
one page, behind a click, on the two pages that already have it. It must **not**
start emitting a number into the UI until the reference standard lands (rubric-v2's
one unblocking artifact: Mike ordering the 18 frozen shots best-to-worst by eye).

### The re-score trigger, exactly

**The cache.** `public/framework/ext/DesignTool/vision.json`, committed — it is a
conclusion, not machinery (RULE#12), and it is where `vision-baseline`'s
`baseline.json` was already flagged to move once the rename landed.

```json
{
  "model": "claude-sonnet-5",
  "rubric": "v1-5axis",
  "scores": {
    "<sha256-16 of the png>": {
      "url": "/framework/", "width": 1280, "at": "…",
      "axes": { "layout": 78, "typography": 72, "contrast": 80, "density": 66, "hierarchy": 74 },
      "mean": 74
    }
  },
  "by_url": { "/framework/@1280": "<sha256-16>" }
}
```

**Triggers a re-score — exactly one thing:** a shot whose **content hash is absent
from `scores`**. This is the mechanism already chosen and already enforced —
`vision-baseline` hashed all 18 images, and `rubric-v2` re-hashed them and *stopped
before scoring* because every hash matched.

**Triggers a re-shoot:** an explicit human or agent run of the generator script.
Nothing in a browser ever takes a screenshot by itself.

**Triggers nothing, ever — write this list into the file:**

- a window resize, or any `ResizeObserver` delivery;
- opening, closing, dragging or retargeting the devbar;
- a navigation;
- a re-run of `analyze()` or `rate()`, however many times;
- opening `audit/` or `audit/taste/`, or loading `vision.json`;
- a page edit that does not change the rendered pixels.

**Invalidates a cached entry:**

- the pixels changed → new hash → new entry (and `by_url` repoints). A different
  width is a different image, so "one width: 1280" is policy, not mechanism.
- ⚠ **`model` or `rubric` changed** → *every* entry is stale. This is the one
  non-pixel invalidation and it must be explicit, or a rubric edit silently
  compares two different instruments. Both strings live at the top of the file, and
  a mismatch counts as absent.

**The enforceable rule, in one line for the readme:** *`ask()` may only ever be
reached from a `click` handler. Never from a timer, an observer, or a render.*

**Where the pass runs.** Mike suggested a fresh Claude session; `ext/Ask` already
*is* one headless turn per call, so no new mechanism is needed. But the scoring pass
is a batch over ~168 pages at $12–29 — that is a scripted run from the terminal
(the same harness `vision-baseline` and `rubric-v2` used), not something a page
triggers. The browser's role is to *display* `vision.json` and to ask for one prose
opinion on one page.

---

## Build order — cheapest decisive first

| # | change | files | size | why here |
|---|---|---|---|---|
| 1 | `gutter` compares against the root's **content width** | `rules.js:122-123` | **1 expression** | removes a manufactured HIGH from 18/24 pairs and the #1 whole-page ring; provably identical when the rail is closed |
| 2 | no aim affordance when `path` is empty | `report.js:78`, `layout.js:177`, `live.js:88` | 3 lines | kills the 100%-of-viewport wash |
| 3 | delete the `grade` row | `layout.js:154` | 1 line | it renders `undefined · undefined` today |
| 4 | **one screen** — delete `full report`, move fix + defer onto the selected finding | `layout.js:13,62,112-118,150-172` | ~40 lines, mostly deletion | Mike's headline complaint; net -1 import, -1 control |
| 5 | selection is visible — expand + `border-inline-start` | `DesignTool.css:155`, `devbar.css` | ~8 lines | state 2, and it is what makes 4 legible |
| 6 | the target line + its persistent dashed outline | `layout.js:125-131`, `highlight.js`, `DesignTool.css` | ~14 lines | state 1 |
| 7 | width presets move into the rail head | `tools.js:52-89`, `DevBar.js:23-42` | ~25 lines, net deletion | state 4 — the control and the readout finally on one screen |
| 8 | ring the **exemplar** on a roll-up | `DesignTool.js:104`, 3 aim call sites | ~5 lines | 32 of 47 page-tall rings; the change that makes the ring *useful* |
| 9 | clamp the ring, mark the off-screen direction | `highlight.js:54-65`, `DesignTool.css` | ~12 lines | 3 of 42 top-3 at 390 currently ring nothing |
| 10 | 390 bottom sheet + `block: "start"` | `devbar.css`, `highlight.js:32` | ~10 lines | the tool covers 70% of what it measures |
| 11 | rail dragged wide → two places | `devbar.css` | 2 declarations | 3440 |
| 12 | `looks` column from `vision.json` | `audit/taste/page.js:140`, new `vision.json` | the biggest | needs the reference standard first |

**Verification after 1–4** — re-run the same measurement this document was written
from, at 390/1280/1920/3440, with the rail **both open and closed**, and assert:

- `gutter` on `.pages` appears **zero** times in either state;
- **zero** top-3 findings resolve to the analysis root;
- opening the rail changes no page's `counts.high`;
- `audit/findings.json` regenerates byte-identical apart from expected drift.

**If it runs short:** cut 12, then 11, then 10, then 9. **1–4 are the task**; 1
alone is worth more than 5–12 combined, and 3 is a one-line embarrassment.

---

## Two things this design deliberately did not do

- **It did not unify the three report renderers** (`layout.js:verdict`,
  `live.js:head+body`, `report.js`). They are near-duplicates and that is a real
  RULE#7 problem, but two of them serve pages and one serves a 272px rail, and
  collapsing them is a bigger design than the one Mike asked for. Noted for a
  successor; the right first move is that `live.js` and `report.js` should be the
  same thing at two `limit`s, and the rail should be the only bespoke one.
- **It did not touch `probe.IGNORE`'s 39%.** `analyze()` reports how much of the
  page it never saw (DesignTool.js:49) and the rail does not show it. A page that is
  mostly a demo stage is being graded on its chrome, and the readout says nothing.
  That belongs in the same line as the census (`ignored 41%`), one muted word — but
  it is an accuracy claim about the *rules*, not the interface, and the tier
  calibration work owns it.

---

## Evidence

Screenshots (all in `shots/`, all headless Chromium at real viewports, all with
`document.visibilityState === "visible"`):

| file | what it shows |
|---|---|
| `20-annotated-clutter-1920.png` | screen A: four identically-weighted rows, `grade undefined · undefined`, 8 controls |
| `21-annotated-wholepage-ring-3440.png` | one finding's ring measured at 3440×1440 = 100% of the viewport, tagged `div.app` |
| `22-annotated-rail-causes-finding-1920.png` | `.pages` at 1648 of 1920 — the rail manufacturing `high · gutter` |
| `23-annotated-390-covers-page.png` | the rail at 272px = 70% of a 390 window, page not pushed |
| `01-devbar-layout-1920.png` | screen A, raw |
| `02-devbar-fullreport-1920.png` | screen B, raw — url wrapping mid-word, `17` broken across two lines, six captioned metric cards in 272px |
| `04-devbar-layout-390.png` | screen A at 390 |
| `13/14-ring-rollup-pagetall-1280.png` | a roll-up's ring at 78.8% of the viewport |
| `03-devbar-page-tab-1920.png`, `06-designtool-page-1280.png` | the `page` tab's 19 controls; the tool's doc page |

Measurement corpus: 14 pages × 4 widths = 846 findings for the ring geometry;
8 pages × 3 widths × {rail open, rail closed} = 48 runs for the `gutter` artifact;
12 pages × 2 widths × 2 rail states for the fix verification. The scripts are
scratch (RULE#12) and were not committed; every number they produced is quoted
above and in this task's `task.jsonl`.
