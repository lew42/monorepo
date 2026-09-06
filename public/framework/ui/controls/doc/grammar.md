# The control grammar, in full

Everything here is in `framework.css`, in one block, under the heading **THE CONTROL
GRAMMAR**. `ext/tabs/tabs.css` and `ext/Dropdown/dropdown.css` read the same numbers
for the two controls that are not plain HTML.

## The box

```css
.btn, button, summary, select, textarea,
input:not([type="checkbox"], [type="radio"], [type="color"], [type="range"]) {
    font-size: calc(1em * var(--size, 1));
    line-height: 1.5;
    min-height: 2.4em;
    padding: var(--pad-control, 0.2em 0.8em);
    align-content: center;
    background-color: var(--fill-a08);
    color: var(--ink);
    border: 1px solid var(--fill-a32);
    border-radius: var(--radius);
    box-shadow: inset 0 0 0 999px var(--ctl-lift, transparent);
}
```

Four things in it are worth knowing.

**The height is a `min-height`, not padding.** `box-sizing: border-box` is on for
everything, so `2.4em` *includes* the 1px border — scale the em and the whole box
scales with it. Sized by padding instead, the border cannot scale and `.size-small`
lands at 0.79× rather than 0.75×. The padding is deliberately smaller than the height
needs, so the min-height governs and `align-content: center` puts the label in the
middle of it. A textarea, whose content is taller, simply grows past it.

**One declaration carries `--size`.** `font-size: calc(1em * var(--size, 1))` reads
the *parent's* em. Every other length in the rule is an `em` of the control's own
font-size, so each is already scaled — there is no second multiplication anywhere,
and no token to keep in step.

**The hairline is `--fill-a32`.** `--line` is a floor's rule at 0.15 alpha (and this
site's skin flattens it to `#e6e6e6`): it measured 1.15:1 against a card and is
simply not there on a 3440 screen. `--subtle` is a *text* colour at 0.55, which is
why every field used to look twice as heavy as the button beside it. `a32` is the
rung between them — 2.29:1 in light, the same alpha in dark, one value everywhere.

**Hover is an inset shadow, not a background.** A background swap cannot serve both
the translucent default fill and the solid `.prim` / `.bg` fills; that is why hover
used to need three rules, one of them existing only to put `color: white` back
afterwards. An inset shadow paints on top of whatever fill is already there, so one
rule darkens a plain button, a text field and an orange CTA by exactly one rung:

```css
:is(…):hover  { --ctl-lift: var(--fill-a08); border-color: var(--prim); }
:is(…):active { --ctl-lift: var(--fill-a16); }
```

## The numbers

Measured with one row of nine controls injected into a live page, light mode.

| | before, 1280 | after, 1280 | before, 3440 | after, 3440 |
|---|---|---|---|---|
| button (base theme) | 36.6px | **36.1px** | 43.4px | **43.2px** |
| button (as this site paints it) | 40.5px | 36.9px | 48.1px | 43.8px |
| input · select · textarea | 36.6px | **36.1px** | 43.4px | **43.2px** |
| summary | 34.6px | **36.1px** | 41.4px | **43.2px** |
| tab | 43.7px | **36.1px** | 48.8px | **43.2px** |
| spread across the row | 9.1px | **0px** | 7.4px | **0px** |

Padding, at 1280:

| | before | after |
|---|---|---|
| button | 0.25em / 1em — 3.8 / 15.0px | 0.2em / 0.8em — 3.0 / 12.0px |
| field | 0.25em / 0.6em — 3.8 / 9.0px | 0.2em / 0.8em — 3.0 / 12.0px |
| tab | 0.5rem / 0.9rem — 8.0 / 14.4px (fixed) | 0.2em / 0.8em — 3.0 / 12.0px |

Vertical padding is a fifth smaller than the button's old number and 62% smaller than
the tab's; horizontal is a fifth smaller than the button's. The field's sides grow
from 9.0 to 12.0px, which is the price of one number instead of two — and the field's
*height* does not move at all.

The size ladder, measured on the page's three panels — every control in each panel,
not a sample:

| word | `--size` | at 1280 | ratio | at 3440 | ratio |
|---|---|---|---|---|---|
| `.size-small` | 0.75 | 27.06px | 0.750 | 32.39px | 0.750 |
| default | 1 | 36.09px | 1.000 | 43.19px | 1.000 |
| `.size-large` | 1.5 | 54.14px | 1.500 | 64.80px | 1.500 |

## How many rules

Counting every rule in `framework.css` that lands on a control, in all three layers:

| | rules | declarations |
|---|---|---|
| before | 15 | 40 |
| after | 19 | 49 |

**The aim was fewer, and it is not.** Four of the extra rules are new behaviour that
did not exist before — `:active`, `:disabled`, and the three `.size-*` words — and one
is the anchor's box, which `min-height` needs because an inline box ignores it. The
part the count is really about did shrink: the four separate boxes (`summary`, the
field rule, `.btn, button`, and `ext/tabs`' own) were **3 rules and 14 declarations in
this file, and are now 1 rule and 10**. Take the size ladder out — it belongs to the
`--size` standard rather than to controls — and the section is 16 rules against 15.

## What the skin still does

`styles/layers/theme/lew42/lew42.css` has this, and it wins at (0,2,0):

```css
.theme-lew42 :is(button, .btn) {
    font-size: 0.8em; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 0.7em 1.4em;
    border-radius: var(--radius);
}
```

Its `padding` and `font-size` beat the grammar, so a button on this site is 0.8em,
uppercase, and 36.9px rather than 36.1px tall. (It used to be 40.5px — the grammar's
`line-height: 1.5` reaches it even though the padding does not, because the skin
never set one.) Deleting those five declarations makes every control on the site
match; keeping them is a deliberate choice about voice, not about size. It is the
theme owner's call, not the framework's.

## What is deliberately not here

- **No `ghost` and no `danger`.** The two variants that exist are `.prim` and `.bg`.
  Nothing on the site asks for a third, and a word with no caller is shelf-ware.
- **No `.chip`.** Six modules have a chip of their own (`blog-chip`, `omnibox-chip`,
  `decks-chip`, `layouts-chip`, `paging-chip`, `mag-chip`), and a bare `.chip` in
  `framework.css` would be a new unprefixed framework word — which `css-scopes.txt`
  forbids. A chip that wants the grammar wears `.btn`.
- **Checkbox, radio, colour and range are excluded.** A hairline rectangle drawn
  around a tick-box or a slider is not a control anyone designed.
- **A dropdown option is one control tall too.** `ext/Dropdown` used to give its
  trigger `0.15em / 0.4em` of padding and its own `--line` border; both are deleted
  and both read the grammar, so a trigger is exactly as tall as the button beside it
  and a menu row is exactly as tall as the trigger that opened it.

## One 1px bug found on the way

A tab carries `margin-bottom: -1px` so it sits *on* the bar's rule. `framework.css`'s
util-layer `:last-child { margin-bottom: 0 }` reached the last tab in every strip and
cancelled it — and because a tab bar stretches its items, that one low tab made all of
its siblings a pixel taller. A set of "equal" tabs measured 37.09 and 36.09px side by
side. `ext/tabs/tabs.css` states it back in the `util` layer, scoped to `.underline`,
which is the only variant still using the negative margin.
