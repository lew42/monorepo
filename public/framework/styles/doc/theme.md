# The base theme — type scale, tokens, dark mode, contrast

Split out of `readme.md`.

## 12. `@layer theme` is the base theme

Recorded here because it changes how the whole file reads; the full theming
record — component looks vs. theme files, the four-rung ladder, light/dark, and
naming — lives next to the guide, in `layers/theme/guide/readme.md`.

**The reframe.** `framework.css`'s `@layer theme` block is not "the framework's
unavoidable styles." It is **a theme** — the one you get when you load no other.
Using no theme is a supported, finished-looking outcome, which is the property
that makes the theme system optional rather than mandatory.

Nothing moved to make this true; it was already the case. What changed is that
it's now stated, which settles two things that were previously arguable:

- **The base is allowed to have opinions**, because a theme is what replaces
  them. §6's eviction list stops being "delete anything opinionated" and becomes
  "delete anything *dead*." The `select` arrow stays; it's the base theme's
  answer to an unstylable control, and a theme may override it.
- **Element defaults are the floor, not the skin.** A theme retunes tokens; it
  doesn't re-specify `button` padding or the form-control block. That's what
  keeps a theme file short enough to read in one sitting.

**Token expansion, and why it isn't scope creep.** Theming needs a vocabulary,
and the file had almost none — six tokens, none of them for surfaces or text.
Six were added (`--ink`, `--surface`, `--line`, `--wash`, `--radius`, `--font`),
and **every one replaces a value that was already hardcoded**, most in several
places: `#fff` in four files, `rgba(0,0,0,0.1–0.2)` borders in about eight,
`system-ui` in the base layer. That's the bar for the next one — a token names a
decision that already exists, it doesn't invent one.

`font-family` also moved from `@layer base` to `@layer theme`. A typeface is a
look, and a theme has to be able to change it by loading later; in `base` it
couldn't be reached without out-specifying a layer.

### 12a. Dark mode: the honest half is done, the switch is not thrown

The gap used to read: *"`:root` pins `color-scheme: light`, so dark mode is defined
but not honest — components still hardcode `#fff` and `rgba(0,0,0,…)`."*

**What was actually blocking it was the syntax palette, and it was worse than a
hardcode.** `ext/highlight`'s ten `--syn-*` tokens were light-only, while
`--code-bg` falls back to `--wash`, which **is** mode-aware. So a dark page would
have got a dark code box with `#cf222e` keywords painted on it — not a wrong shade,
an unreadable one. A half-mode-aware token set is worse than a fully light one,
because the failure is invisible until you flip the switch.

Paired with `light-dark()`, so a token cannot exist in one mode and go missing in
the other:

| | |
|---|---|
| the ten `--syn-*` | GitHub Light / GitHub Dark |
| `scrollbar-color` | the thumb no longer vanishes on a dark page |
| **`--error`, new** | replaced `#c00` in `md.css`, `demo.css` and a near-copy in `highlight.css` — three files with an opinion about one state, none readable on a dark surface |

**`:root { color-scheme: light }` was deliberately left alone**, and that is the
point of stopping here. Flipping it makes every visitor's OS setting change what
the site looks like — a taste decision with a visual pass attached, and not one to
make on the way past. The work that had to be true *first* is now true, so the
switch is one word instead of a project.

**Measured no-op today:** `theme-lew42` already overrides all ten `--syn-*`, so the
painted keyword colour is unchanged (`#FF8F60` before and after). What improved is
the site that loads **no theme** — which is the whole thing this section is about.

### 12b. The switch is thrown, and one token was lying

`core/App/mode.js` is the switch (moved beside App — theme-agnostic behaviour,
and core's Sidebar footer renders it): one button, `auto → light → dark`, stored in
`localStorage` and applied as inline `color-scheme` on `.app`. Not on `<html>` —
tokens live on `.app`, and two themes render side by side on `layers/theme/guide/`, so a
mode forced at the root would take both.

`auto` clears the override rather than storing a resolved value. The OS can change
while the tab is open, and a stored `"light"` would outlive the reason it was
chosen.

**Throwing it exposed one bug, and it was in the tone ladder rather than in any
component.** `theme-lew42` had:

```css
--wash: light-dark(#f2f2f2, rgba(230,230,230,0.07));
```

`.app { background: var(--wash) }`, and `body` has no background — so in dark mode
the app painted 7% white **over the browser's white canvas**. Dark mode rendered as
pale grey with pale text. Measured: `.app` computed to
`rgba(230,230,230,0.07)`, `--ink` to `#e6e6e6`.

**A colour that backs a whole app cannot be translucent.** The three surface tokens
are opaque now and form one ladder, with elevation reading *lighter* on both sides
of the switch:

| | light | dark |
|---|---|---|
| `--wash` — the floor | `#f2f2f2` | `#171717` |
| `--tint` — a panel in a card | `#f8f8f8` | `#1f1f1f` |
| `--surface` — a card | `#ffffff` | `#262626` |

`--tint` is new in the same pass. `th`, the demo toolbar and the demo caption were
all painted `--wash` — the floor, two levels below the card they sit in — because
there was no name for "one step down from a surface".

**Then the whole framework section was audited in dark**, every page, looking for a
computed background lighter than 55% luminance. Eight hits, and seven are correct:
two `.section-band`s in the `dark` *tone* (which is the high-contrast band, and
inverts on purpose), and five elements inside `layers/theme/guide/`, which renders
`theme-paper` and an explicitly-light `theme-lew42` to prove exactly that.

The eighth was real: **`<mark>`** kept the UA's yellow with `canvastext` on it, so a
highlight in dark mode was light text on yellow. Paired now, like everything else.

**`:root { color-scheme: light }` still stands.** The base theme has translucent
`--wash` for the same reason it always did, and it is honest about being light-only;
a theme opts into both modes and `theme-lew42` now genuinely does.

### 12c. The contrast pass, and what a fixed grey costs

Every page in the site was walked in both modes, at 1400px and 390px, comparing
each leaf text node's computed colour against the first opaque background above it.
**Zero horizontal overflow and zero clipped boxes** in the framework — the structural
work held. Contrast had four real findings.

**`--subtle` was 4.24:1**, just under AA, in roughly 150 places — ToC rows, demo
buttons, icons, `summary`, captions. Two shades darker (`#737373` → `#6a6a6a`)
clears it without changing the grey's character. This is the highest-value single
token change on the site, because `--subtle` is what every de-emphasised thing
reads.

**`--syn-comment` was `light-dark(…)`, and should never have been.** `--code-bg` is
dark in *both* modes, so the "light mode" value was a dark grey on a dark box.
Measured on `#3f3f3f`: `#9d9d9d` 3.88:1, `#b5b5b5` 5.14:1. **A token only takes
`light-dark()` if the surface behind it actually flips.**

**`<mark>` kept the UA's yellow** with `canvastext` on it — light text on yellow in
dark mode. Paired now.

**A fixed grey on a variable band is the interesting one**, because it is a *design*
bug rather than a value bug, and it bit `styles/sections/` twice:

| | was | measured |
|---|---|---|
| the eyebrow | `color: var(--prim)` | **1.06:1** on the `prim` band |
| a stat label | `color: var(--subtle)` | **1.06:1** on the `prim` band |

Both are the same mistake: **a colour picked against the band you were looking at.**
A band whose fill is a variable cannot have de-emphasis that is a constant. Two
fixes, and the second generalises:

```js
"--eyebrow": COLOURED[tone] ? "currentColor" : "var(--prim)",
muted = { color: "color-mix(in srgb, currentColor 68%, transparent)" },
```

`currentColor` has *already* been chosen to contrast with whatever is behind it, so
a mix of it cannot fail the same way. **De-emphasis should be derived from the ink,
not named alongside it** — and that is the rule to reach for anywhere a component
can land on more than one surface.

### 12d. Two things the audit got wrong, which is worth more than the findings

**`color(srgb 0.9 0.9 0.9)` components are 0–1, not 0–255.** The first pass divided
them by 255 anyway, read every `color-mix`ed value as near-black, and reported the
sidebar's icons at 1.13:1. They are about 7:1. **Thirty false positives, and the fix
was nearly applied.** If a measurement disagrees with the screenshot, the
measurement is on trial too.

**`--prim` as *text* is 2.01–2.25:1** and is left alone deliberately — a call the
owner of the brand made, not an oversight. It affects `.toc-link.current`, `.prim`
labels and `.page-link.active`. Recorded so the next person does not "discover" it
and quietly repaint the accent.


Still open, and smaller than it was: `Page.css`'s `box-shadow: rgba(0,0,0,0.08)` on
a hover, and `/styles.css`'s `body.theme-1` block, which is legacy with real
consumers.

---

## 2. The type scale: one vocabulary, or per-component sizes?

**Before.** `Page.css` set `.page-title { font-size: 1.9em }`, `.page > h2 {
1.15em }`, `.page > h3 { 1em }`. `TabPager.css` and `ColumnPager.css` each
re-set `.page-title` for their context. `framework.css` had the heading rule
commented out. So the site's type scale was three-quarters of a scale, owned by
a component, scoped to direct children of `.page`.

That scoping was deliberate — the comment said headings inside a `demo()` should
keep "their plain browser look." But the same scoping meant an `h2` inside a
`.md` block (i.e. inside every readme and half the prose on the site) got the
*browser's* 1.5em while the `h2` beside it got 1.15em. Two scales, silently.

**Options.**

| | per-component (before) | scale in `framework.css` | separate opt-in `theme.css` |
|---|---|---|---|
| one answer for "how big is an h2" | no | yes | yes |
| works inside `.md`, demos, anywhere | no | yes | yes |
| `framework.css` stays opinion-free | yes | **no** | yes |
| files to import to get a normal-looking page | 1 | 1 | 2 |

**Weighing.** The third column is the principled one and it loses on the last
row. A framework whose baseline output is UA-default headings isn't neutral —
it's just wearing the browser's opinion instead of its own, and every consumer
immediately writes the same six rules. Six declarations is a small enough
opinion to hold, and it *removes* more CSS than it adds.

**Verdict: the scale lives in `framework.css` `@layer theme`.** Six levels — h1
page title, h2 section, h3 sub-section, h4 uppercase annotation, body, code —
each with a class alias (`.h1`–`.h4`, `.code`) so an element can borrow a level
without lying about the document outline. Sizes are the ones `Page.css` already
used, so nothing about this site moved except that it moved *consistently*.

Two deliberate consequences, recorded because they are visible:

- **`h2`/`h3` inside `.md` blocks got smaller** — they now match the scale
  instead of the UA default. This is the point, but it is a site-wide change.
- **Headings inside a `demo()` are now themed.** The old comment wanted them
  unthemed; that was never actually "neutral," it was the UA's opinion. A demo
  now shows what your code makes *in this theme*, which is the honest thing for
  a themed site to show.

**Margins stayed out of the scale.** Size/weight/tracking is what a level *is*;
margin is rhythm, and rhythm is set by whatever is arranging the content.
`Page.css` keeps `.page > h2 { margin: 2.2em 0 0.7em }` and the section rule
under it. This split is why the scale can apply globally without wrecking tight
contexts like a demo box or a preview card.

**Open:** the scale still has no `margin: 0` reset on headings, so an unarranged
`h2` gets UA margins (`0.83em`, relative to its own font-size). Zeroing them
would make rhythm fully explicit — and would require every arranger to opt in.
Not yet; revisit if a second context needs the same override `Page.css` does.

---

## 3. Should themes be scoped to `.app` so two variants can sit side by side?

**The want.** The same page rendered twice on one screen under two themes.

**Options.** (a) tokens on `:root`, themes override on `:root` — today's shape if
you're careless; (b) tokens on `:root`, themes override on `.app` /
`body.theme-x`; (c) tokens declared on `.app` itself, `:root` holds nothing.

**Weighing.** (c) sounds like the "correct" scoping and buys nothing: custom
properties already cascade, so a token declared at `:root` is overridable at any
depth. What actually blocks side-by-side variants isn't where the *defaults*
live, it's where the *overrides* live — an override at `:root` is global no
matter how the defaults were declared. (c) also breaks anything outside `.app`
(a portal, a dialog in the top layer).

**Verdict: keep (b), and make it a rule.** Defaults on `:root`; **a theme never
writes to `:root`.** `/styles.css` already does this correctly with
`body.theme-1 { … }`. Side-by-side variants work today with zero framework
changes — `div.c("app theme-a")` beside `div.c("app theme-b")`.

The real obstacle to two live apps on one page is JS, not CSS: `View.captor`,
`View.stylesheets` and `Page.registry` are statics, and the module registry is
per-realm (see `framework/readme.md` §7). CSS is not the binding constraint.

---

