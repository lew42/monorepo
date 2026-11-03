# Backgrounds that adapt: a grounds × lighten/darken lab, plus the two new classes

Load the `minion` skill first, then the `color` skill (contrast, tokens, light/dark — read it
before touching any colour) and the `page` skill. Then come back here.

## The owner's words (verbatim, from the task brief)

> In Figma I experimented with white, light gray, primary, dark gray, maybe black backgrounds,
> layered with tinting: a transparent white or transparent black that naturally tints whatever
> is behind it. A `lighten` class (better: `bg-lighten`, `bg-darken`) whose amount varies with
> the container it's on: white, light, dark or primary each need a different amount. Stacking
> lighten on darken and vice versa was another test, and contrast ratios become moving targets.
>
> Typography themes: a text colour token (`--color-text`?) that's dark on white/light, light on
> dark, and on primary either, chosen by testing the contrast ratio, going to black or white if
> needed. An accent token. What worked before: calling the primary colour the ACCENT; `--prim`
> still exists and maps to the accent on the light and dark schemes; on primary, the accent is
> set separately. There were two primary schemes (primary 1 and 2). Confusing part: a scheme is
> named after its background. Naming: `dark` is a theme's dynamic dark colour; `bg` is the
> ADAPTIVE token that maps to dark, primary, white, light, a lighten, whatever the usage needs.

## What exists already — read this first, don't rebuild it

`framework.css` already has a lighten/darken ladder: `--lighten-1/2/3` (white at 8/16/32%
alpha) and `--darken-1/2/3` (black at 8/16/32%), plus three classes, `.darken-1/.darken-2/
.darken-3`, that paint a ground with one of those steps AND set `--field-bg` so inputs on that
ground still look right (search `framework.css` for `--lighten-1` and `.darken-1`). There is no
`.lighten-N` class yet, and no `.bg-lighten`/`.bg-darken` at all. Also read
`/framework/styles/doc/stacking.md` (the alpha rules this site already settled on 2026-08-30) —
rule 7 there says alpha compresses on a saturated floor (`--prim`) and to start one rung higher
there; that's exactly the "each ground needs a different amount" problem the owner is describing.

## What you're building

### 1. Two new utility classes, in `framework.css`, beside the existing `.darken-1/2/3` block

`.bg-lighten` and `.bg-darken` — ONE class each (not `-1/-2/-3` variants), where the actual alpha
step comes from a CSS custom property that each GROUND declares, not a hardcoded value in the
class. Shape:

```css
/* each ground declares how much its own lighten/darken utility should move */
.bg-white   { --bg-lighten-amt: var(--lighten-1); --bg-darken-amt: var(--darken-2); }
.bg-light   { --bg-lighten-amt: var(--lighten-1); --bg-darken-amt: var(--darken-1); }
.bg-prim    { --bg-lighten-amt: var(--lighten-2); --bg-darken-amt: var(--darken-1); }
.bg-dark    { --bg-lighten-amt: var(--lighten-2); --bg-darken-amt: var(--darken-1); }
.bg-black   { --bg-lighten-amt: var(--lighten-2); --bg-darken-amt: var(--darken-1); }

.bg-lighten { background: var(--bg-lighten-amt, var(--lighten-1)); }
.bg-darken  { background: var(--bg-darken-amt, var(--darken-1)); }
```

The exact numbers above are a starting guess, not a spec — YOUR job is to measure the contrast
ratio of `--ink`/`--prim` text on top of each (ground × lighten/darken) pair in the lab below and
pick whichever step clears 4.5:1 (or comes closest, if none do — say so). Nest one inside the
other (lighten-inside-darken, darken-inside-lighten) and re-measure; the owner specifically asked
about this ("stacking lighten on darken and vice versa... contrast ratios become moving targets")
— show the measured number, don't guess it.

Check `/framework/styles/css-scopes.txt` (the `new-css-class` skill's six-step list) before you
add these two names — `bg` alone is already reserved there for `ui/background`'s own classes,
but `bg-lighten`/`bg-darken` live in `framework.css` itself, same bucket as `darken-1/2/3`
above them, so add them to that same "framework.css" block in `css-scopes.txt`, not a new prefix
entry.

### 2. The lab page: `public/framework/styles/grounds/page.js`

Link it from `public/framework/styles/page.js`'s `children:` string — but DO NOT edit that file
yourself; a sibling minion (`minion-widths`) is adding its own page to the same line at the same
time. Tell your parent (`task-mastermind-card-measure-colors`) the page's slug (`grounds`) when
you report back, and the parent will wire both links in one edit after you both land.

A grid: 5 grounds (white, light, primary, dark, black — use `--surface`, `--wash` or a light-gray
step, `--prim`, `--bg` (the sidebar's dark token), and black `#000` or whatever reads as "black"
in this theme) × 4 children in each cell: plain `.card`, `.bg-lighten`, `.bg-darken`, and
lighten-inside-darken-and-back (two small nested boxes). **Every cell shows:**
- its own background swatch, named (e.g. "primary + bg-lighten")
- a line of body text in `--ink` (or whatever text colour you're proposing, see below)
- a small accent sample (a button or a link in `--prim`)
- the MEASURED contrast ratio number for the text against that cell's actual rendered
  background — compute it for real (sRGB relative luminance formula; the `color` skill or
  `/framework/styles/system/studies/color/` may already have a helper — reuse it, don't
  hand-roll a second contrast calculator if one exists) — and colour that number red if it's
  under 4.5:1.

This is a lab, not a finished component: a flat grid of cells is enough, no interaction needed.

### 3. The naming proposal — on the page, not just in your head

Write a short section on the page proposing these token names, with the owner's own naming notes
quoted above it (don't paraphrase the naming rule — it's subtle and the owner was explicit):
- `--color-text` — the adaptive text colour (dark on white/light, light on dark, tested on primary)
- `--accent` — the accent (what `--prim` already is; this is a rename proposal, not a rename)
- `--dark` — a theme's own dynamic dark colour
- `--bg` — the ADAPTIVE token (maps to dark/primary/white/light/a lighten depending on usage) —
  note this is a DIFFERENT meaning from today's `--bg` (`framework.css`'s `--bg: #42404B`, the
  sidebar's fixed dark colour) — flag that collision explicitly on the page, it's the most likely
  thing a reader will trip on.

**This is a proposal only — do not rename `--prim`, `--bg`, `--ink`, or any other existing token
in `framework.css` or anywhere else on the site.** Say on the page why not (the blast radius —
`--bg` alone is read by the sidebar and others; a rename is "ask before" territory, CLAUDE.md).

## Fence — files you may touch

- `public/framework/styles/grounds/` (new: `page.js`, `readme.md` if you add one)
- `framework.css` — ONLY the `.bg-lighten`/`.bg-darken` classes and their per-ground `--bg-*-amt`
  variables, placed beside the existing `.darken-1/2/3` block (search for it)
- `public/framework/styles/css-scopes.txt` — two new lines in the existing framework.css block
- This brief's own directory for your log

Don't touch `core/Page/Page.css`, `.claude/skills/`, `public/framework/styles/page.js`, or
anything under `minion-widths/` — a sibling minion is building the widths lab in parallel.

## Hold reloads

`node Server/hold.mjs on "minion-grounds — grounds lab"` before your batch (check first, the
parent may already have one running — holds expire after 5 minutes, re-issue if yours runs
long), write the batch, load the page to confirm it works and the contrast numbers actually
compute (not NaN, not all-red by a bug), `node Server/hold.mjs off "minion-grounds"`.

## Land

Commit your files (small commits, exact paths — main tree, not a worktree). Log your work in
your task.jsonl. Report back to your parent: the page URL, which ground×lighten/darken
combinations cleared 4.5:1 and which didn't (the actual numbers), and the page's slug (`grounds`)
so the parent can wire the `children:` link.
