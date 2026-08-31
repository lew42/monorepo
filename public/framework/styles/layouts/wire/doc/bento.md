# The word we do not have: a fluid track that is twice its neighbour

Eight wireframes, one of which the vocabulary cannot say. Two of them want the same thing —
a **2:1 seam that is still fluid** — and neither can have it from a class string.

## Why every flexible word splits evenly

| word | what a child gets | ratio |
|---|---|---|
| `.flex.auto > *` | `flex: 1 1 var(--column)` | even, once the row is wider than the bases |
| `.flex.all-1 > *` | `flex: 1` | exactly even, always |
| `.flex.three > *` | `flex: 1 1 calc(((var(--column) * 3) - 100%) * 999)` | three even, or one |
| `.flex-1` | `flex: 1; min-width: 0` | even, and a **zero** basis |
| `.basis` | `flex: 0 0 var(--basis, var(--column))` | fixed — the opposite problem |

Every one of them sets `flex-grow: 1`. Free space is therefore always distributed **equally**,
whatever the bases were. Nothing in `framework.css` sets `flex-grow` to anything else, and
nothing reads a per-child weight.

So `styles/layouts/wire/bento/` and `wire/board/` both carry an inline
`.style({ flex: "2 1 30em" })`, which is the only declaration in `specs.js` that no class
string can make.

## Candidate 1 — no new CSS: `flex auto`, and each child declares its own `--column`

`.flex.auto > *` is `flex: 1 1 var(--column)`, and `var()` in that declaration resolves against
**the child's own** computed `--column`. So two children under one `flex auto` can have
different bases from one class string:

```js
div.c("flex auto gap", () => {
	div.c("…").style("--column", "30em");   // the feature
	div.c("…").style("--column", "15em");   // the rail
});
```

**It works, and it decays.** Measured on `/framework/styles/layouts/wire/bento/full/`, a
30em/15em pair in a full-width row:

| viewport | basis A / B | rendered A / B | ratio |
|---|---|---|---|
| 400 | 420 / 210px | 358 / 358 | 1.00 — both wrapped, both full width |
| 1280 | 451 / 226px | 723 / 497 | 1.45 |
| 1920 | 480 / 240px | 1048 / 808 | 1.30 |
| 3440 | 540 / 270px | 1819 / 1549 | 1.17 |

The **basis** is a true 2:1 at every width (the `em` bases track the viewport font clamp). The
**rendered** ratio starts at 2 and decays toward 1 as the row widens, because the equal
`flex-grow: 1` dilutes it. On a mega screen a "two-thirds" feature is really 54%.

Two things it gets for free that the inline `flex: 2 1 30em` does not: at 400 both children
wrap **and grow to full width**, and there is no hand-written `flex` shorthand anywhere.

## Candidate 2 — one word, and the ratio holds

A weight the child declares, in the same shape `--gap`, `--pad`, `--basis` and `--column`
already take — the class is the request, the token is the size:

```css
.flex.weighted > * { flex: var(--grow, 1) 1 var(--column); min-width: 0; }
```

`.style("--grow", "2")` then holds 2:1 at **every** width, and an unweighted child keeps
today's behaviour. One rule, one token, no new concept — and it is a superset of
`.flex.auto`, which is the argument against adding it as a *fourth* flex modifier rather than
teaching `auto` to read `--grow`.

## Resolved — `auto` learned `--grow` (2026-08-18)

The second candidate shipped: `.flex.auto > *` reads
`flex: var(--grow, 1) 1 calc(var(--column) * var(--grow, 1))`, so `.style("--grow", "2")`
holds 2:1 at every width — measured exactly 2.000 at 400/1280/1920/3440
([`cols/doc/indictment.md`](/framework/styles/layouts/cols/doc/indictment/)). The inline
`flex` declarations these pages shipped with predate the fix; the per-child `--column`
workaround they compare against decays to 1.19 at 3440 and should not be copied.

**The recommendation is Candidate 2, taught to `.flex.auto` rather than added beside it** —
because Candidate 1's decay is invisible at the width most people design at and wrong at the
width the owner actually uses.
