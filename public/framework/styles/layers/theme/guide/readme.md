# Theming — design record

## Where do component looks live — in the theme, or in the component?

**As posed:** *"if a single theme defines a bunch of component styles, we're
cross-contaminating."* Exactly right, and it is symmetrical, which is what makes it
interesting.

| | theme owns component looks | component owns theme variants |
|---|---|---|
| adding a theme | edit nothing… but write every component again | edit **every component** |
| adding a component | edit **every theme** | edit nothing |
| unused component costs | dead lines in every theme | nothing |
| read one component | must read every theme | must read every theme's section |

Both columns are the same coupling, transposed. Neither side can own the other.

**Verdict: neither owns it — both talk to tokens.** A theme defines values, a component
consumes them, the token set is the interface, and neither side names the other. Adding a
theme is one file that touches nothing; adding a component is one file that touches no
theme.

## Then what about a theme that needs a structurally different tab bar?

The honest limit of pure tokens. **Verdict: a four-rung ladder, and rung 4 is a bug.**

1. **A global token** — `--prim`, `--font`, `--radius`. Almost always enough.
2. **A component token** — `--tab-bar-bg`, declared *by the component* with a fallback to
   a global: `background: var(--tab-bar-bg, var(--surface))`. The component still owns its
   rules; the theme only supplies a value.
3. **A rule on generic HTML** — legal, because restyling generic elements *is* a theme's
   job. Note the exact inversion of the rule for modules: a module styles only classes it
   emits and never generic elements. Same boundary, opposite sides.
4. **A rule naming a component class** — `.theme-x .tab-bar { … }`. **Don't.** That is the
   god-file failure above, arriving one rule at a time.

Rung 2 is load-bearing and has a discipline attached: **a component does not pre-declare a
dozen tokens on the chance a theme wants them.** It consumes globals until a theme
actually needs to differ, then promotes exactly that one. Speculative tokens are
speculative API.

## `framework.css @layer theme` is a base theme, explicitly

Not "framework styles a theme fights", and not nothing — a bare page would look like 1994
and every consumer would write the same twenty rules. **Using no theme is a supported,
finished-looking outcome**, which is the property that makes the whole system optional.

Two consequences:

- **⚠ Selectors in it stay flat** — one element, no descendant combinators. The entire
  override model is *"a later `@layer theme` wins at equal specificity"*, and a
  `.page > h2` in the base would out-rank a theme's `h2` no matter when the theme loaded.
  Low specificity is a feature the base has to actively maintain.
- **A theme retunes tokens; it doesn't replace the floor.** Element defaults (`button`
  padding, `pre` block padding, the form-control block) stay in force under every theme,
  which is what keeps a theme file short enough to read.

**The caveat that will bite: "loads later, wins" is true only at equal specificity.**
`Page.css`'s `.page > h2` beats a theme's `h2` regardless of load order. That is correct —
a component adapting a heading in its own context — but it does mean a theme cannot
restyle every heading on the site with one flat rule.

## `:where()` — tried, reverted

Every selector in the base theme wrapped in `:where()`, so it carries zero specificity and
any downstream rule beats it without a fight. **The problem it solves is real but
hypothetical here:** the base theme's selectors are already flat and single-element. What
it costs is immediate and paid by every reader — an unfamiliar wrapper on forty rules, and
a cascade *inside* the layer that resolves by source order rather than selector weight, so
`button.bg` no longer beats `button` by being more specific, only by being lower in the
file.

**Keep the plain selectors. Reach for `:where()` if and when a real override fight
happens**, and then only around the rule that caused it. Recorded so the idea isn't
re-derived: a good tool aimed at a problem this file doesn't have.

## Light and dark — one file, `light-dark()` per token

`light.css` / `dark.css` is the one to avoid: the two files drift, and the failure mode is
a token defined in light and missing in dark, which nobody sees until night. A
`prefers-color-scheme` block keeps them together but doubles the declaration list and puts
a token's two values in different places.

**Verdict: one file per theme, `color-scheme: light dark` on the theme class,
`light-dark(a, b)` per token.** A token *cannot* exist in one mode only. Declaring
`color-scheme` also fixes form controls and scrollbars for free.

**Light and dark are not themes**, they are modes of one — which is why they are an axis.
And **a theme declares `.light` / `.dark` itself** rather than inheriting them: honouring
the axis is a promise, and a theme with no `light-dark()` would be lying by accepting the
class. `terminal` supports dark only and says so by not declaring them.

## Naming — separate identity from axes

**The failure mode:** `theme-1`, `theme-2`, `theme-blue`, `theme-big`, `theme-blue-big`,
`theme-blue-big-compact`. Nothing tells you which is an identity and which is a modifier,
so they multiply.

| | form | combines? | examples |
|---|---|---|---|
| **theme** | a proper noun | no | `paper`, `terminal`, `lew42` |
| **axis** | an adjective | yes | `dark`, `compact` |

A theme gets a **name, not a description**: `blue` becomes a lie the first time the accent
changes, `big` is a density axis wearing a costume, `v2` re-opens the versioning argument.
Proper nouns also don't *invite* combination — nobody writes `theme-paper-terminal`. Axes
are orthogonal and safe to stack: two themes × two modes × two densities is eight looks
from two files.

**The test: does the variant change the *vocabulary* or only the *values*?** Values → an
axis or a token override on the existing class. Vocabulary → a new theme. Almost
everything is values.

**Legacy:** `styles.css` has `body.theme-1` with real consumers in `alex/` (~10 files).
It is the exact anti-pattern and it stays — renaming it would break a downstream dev's
pages for a cosmetic gain. The look it describes is "white sheet floating on grey", i.e.
`paper`.

## Dark mode: honest now

This section used to read *"dark mode is not honest yet"*, with `:root` pinning
`color-scheme: light` and a list of components hardcoding `#fff`. Both halves are done:
`lew42` pairs every token with `light-dark()`, `ext/highlight`'s `--syn-*` palette is
paired too, `core/App/mode.js` ships the light/dark/auto toggle, and the components that
hardcoded light values read `var(--surface)` / `var(--line)`.

The one rule that came out of it and is worth carrying: **a colour that backs a whole app
cannot be translucent.** `--wash` was `rgba(230,230,230,0.07)` in dark, and
`.app { background: var(--wash) }` composited that over a transparent `body` — i.e. over
the browser's white. Dark mode rendered as pale grey with pale text.
