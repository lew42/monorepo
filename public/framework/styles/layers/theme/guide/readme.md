# Theming — design record

Format as everywhere: **question → options → weighing → verdict.**

---

## 1. Where do component looks live — in the theme, or in the component?

**The problem, as posed:** *"if a single theme defines a bunch of component
styles, we're cross-contaminating."* Exactly right, and it's symmetrical, which
is what makes it interesting.

| | theme owns component looks | component owns theme variants |
|---|---|---|
| adding a theme | edit nothing… but write every component again | edit **every component** |
| adding a component | edit **every theme** | edit nothing |
| unused component costs | dead lines in every theme | nothing |
| read one component | must read every theme | must read every theme's section |

Both columns are the same coupling, transposed. Neither side can own the other.

**Verdict: neither owns it — both talk to tokens.** A theme defines values; a
component consumes them; the token set is the interface and neither side names
the other. Adding a theme is one file that touches nothing. Adding a component
is one file that touches no theme.

This is the same move as §8's "the class name is the registry," applied to
values instead of names, and it's why §3's rule (*a theme never writes to
`:root`*) was worth settling first.

---

## 2. Then what about a theme that genuinely needs a different tab bar?

The honest limit of pure tokens. A theme might want a *structurally* different
component, not just a recolored one.

**Verdict: a four-rung ladder, and rung 4 is a bug.**

1. **A global token** — `--prim`, `--font`, `--radius`. Almost always enough.
2. **A component token** — `--tab-bar-bg`, declared by the component with a
   fallback to a global: `background: var(--tab-bar-bg, var(--surface))`. The
   component still owns its rules; the theme only supplies a value.
3. **A rule on generic HTML** — `h1::before`, `a { text-decoration: … }`. Legal:
   restyling generic elements *is* a theme's job. (Note the exact inversion of
   the rule for modules, §10: a module styles only classes it emits and never
   generic elements. Same boundary, opposite sides.)
4. **A rule naming a component class** — `.theme-x .tab-bar { … }`. **Don't.**
   That's the god-file failure from §1, arriving one rule at a time.

Rung 2 is the load-bearing one and it has a discipline attached: **a component
does not pre-declare a dozen tokens on the chance a theme wants them.** It
consumes globals until a theme actually needs to differ, then promotes exactly
that one. Same "stop at the first rung" logic as everywhere else — speculative
tokens are speculative API.

---

## 3. Should `framework.css @layer theme` be a base theme?

**Options.** (a) Ship no defaults — a bare page looks like 1994 and every
consumer writes the same twenty rules. (b) Ship defaults as "framework styles"
that a theme fights. (c) Ship defaults *as a theme*, explicitly.

**Verdict: (c), and it's mostly a renaming of what already exists.** The block
is the **base theme** — the one you get when you load nothing else. Using no
theme is a supported, finished-looking outcome, which is the property that makes
the whole system optional rather than mandatory.

Two consequences worth stating:

- **Selectors in it stay flat.** One element, no descendant combinators. The
  entire override model is "a later `@layer theme` wins at equal specificity,"
  and a `.page > h2` in the base would out-rank a theme's `h2` no matter when
  the theme loaded. The base theme's low specificity is a feature it has to
  actively maintain.
- **A theme retunes tokens; it doesn't replace the floor.** Element defaults
  (`button` padding, `pre` block padding, the form-control block) stay in force
  under every theme. That's what keeps a theme file short enough to read.

---

## 4. `:where()` — tried, reverted

**What was tried.** Every selector in the base theme wrapped in `:where()`, so
it carries zero specificity and any downstream rule beats it without a fight.

**Why it was reverted.** The problem it solves is real but *hypothetical here* —
the base theme's selectors are already flat and single-element, so the ordinary
model (later `@layer theme` wins at equal specificity; unlayer as the last
resort) covers essentially every case. What `:where()` costs is immediate and
paid by every reader: an unfamiliar wrapper on all forty rules, and a cascade
inside the layer that resolves by *source order* rather than selector weight —
so `button.bg` no longer beats `button` by being more specific, only by being
lower in the file.

**Verdict: keep the plain selectors. Reach for `:where()` if and when a real
override fight happens**, and then only around the rule that caused it. Recorded
so the idea isn't re-derived from scratch: it's a good tool aimed at a problem
this file doesn't currently have.

The honest caveat on the simpler model, since it's the thing that will bite:
"loads later, wins" is true **only at equal specificity**. `Page.css`'s
`.page > h2` beats a theme's `h2` regardless of load order. That's correct —
`Page.css` is a component adapting a heading in its own context — but it does
mean a theme cannot restyle every heading on the site with one flat rule.

---

## 5. Light and dark — one file or two?

**Options.** (a) `light.css` / `dark.css`; (b) one file, `@media
(prefers-color-scheme: dark)` block; (c) one file, `light-dark()` per token.

**Weighing.** (a) is the one to avoid: the two files drift, and the failure mode
is a token defined in light and missing in dark, which nobody sees until night.
(b) keeps them together but doubles the declaration list and puts a token's two
values in different places. (c) puts both values on one line.

**Verdict: (c).** One file per theme, `color-scheme: light dark` on the theme
class, `light-dark(a, b)` per token. A token *cannot* exist in one mode only.
Declaring `color-scheme` also fixes form controls and scrollbars for free.

**Light and dark are not themes**, they're modes of one — which is why they're
an axis (§6) and not two entries in the theme list.

**A theme declares `.light` / `.dark` itself** rather than inheriting them from
the framework. Honoring the axis is a promise, and a theme with no
`light-dark()` in it would be lying by accepting the class. `terminal` supports
dark only and says so by not declaring them.

---

## 6. Naming — how to add variants without chaos

**The failure mode**, and it's the one asked about: `theme-1`, `theme-2`,
`theme-blue`, `theme-big`, `theme-blue-big`, `theme-blue-big-compact`. Nothing
tells you which of those is an identity and which is a modifier, so they
multiply.

**Verdict: separate identity from axes.**

| | form | combines? | examples |
|---|---|---|---|
| **theme** | a proper noun | no | `paper`, `terminal`, `lew42` |
| **axis** | an adjective | yes | `dark`, `compact` |

- A theme gets a **name, not a description.** `blue` becomes a lie the first
  time the accent changes; `big` is a density axis wearing a costume; `v2`
  re-opens the versioning argument §4 of the styles record already closed.
  Proper nouns also don't *invite* combination — nobody writes
  `theme-paper-terminal`.
- Axes are orthogonal, each a single dimension, and combining them is safe:
  `class="app theme-paper dark compact"`. Two themes × two modes × two densities
  is eight looks from two files.

**The test:** does the variant change the *vocabulary* or only the *values*?
Values → an axis or a token override on the existing class. Vocabulary → a new
theme. Almost everything is values.

**Legacy:** `styles.css` has `body.theme-1` with real consumers in `alex/`
(`app.$body.ac("theme-1")` in ~10 files). It's the exact anti-pattern and it
stays — renaming it would break a downstream dev's pages for a cosmetic gain.
The look it describes is "white sheet floating on grey," i.e. `paper`.

---

## 7. Known gap: dark mode is not honest yet

`:root` pins `color-scheme: light`, so nothing changes today. That's deliberate,
because the token rewiring is only half done:

- **Done** — `--ink`, `--surface`, `--line`, `--wash`, `--radius`, `--font` exist
  and use `light-dark()`; `framework.css`'s own `pre`/`code`/`table`/`th`/`body`
  read them.
- **Not done** — components still hardcode light values: `#fff` in `Page.css`
  (`.page-preview`), `ColumnPager.css` (`.column`, `.topbar`, `#eef0f4` on
  `.main`), `/styles.css` (`.page`, `.app`), and `rgba(0,0,0,…)` borders in most
  component files.

Until those read `var(--surface)` / `var(--line)`, flipping to dark gives a dark
base with white cards punched through it. The rewiring is mechanical but touches
six stylesheets and wants a visual pass, so it's a commit of its own — and it's
the single highest-value thing left in this directory.
