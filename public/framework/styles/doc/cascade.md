# The cascade — layers, `:where()`, and the escalation ratchet

Split out of `readme.md`.

**`util` beats `theme` at any specificity — a component rule cannot win by adding classes, only by
moving to `util` too.** `framework.css`'s bare `:first-child { margin-top: 0 }` / `:last-child
{ margin-bottom: 0 }` (§ "collapse a container's outer gap") silently beat `Page.css`'s four-class
`.page-column-prose > .bleed:not(…):first-child` in `theme`, so a bled block's top/bottom margin
never actually cancelled — measured on `/imagine/sections/`, a 15px strip of column floor stayed
above and below a full-bleed block regardless of the selector written against it. Fixed 2026-09-05
by moving `Page.css`'s two declarations into `@layer util` beside the rule they were losing to —
same layer, so the more specific selector wins the ordinary way (`core/Page/doc/columns.md`,
`ai/2026-09-05/core-fixes/`).

## 13. Escalation is a ratchet — the `site` layer

**The observation that started this** (and it's the sharpest one in the record):
once you use a cascade mechanism to win, you can't reuse it. Reaching for a
stronger tool doesn't just solve today's conflict, it *spends* that rung for
everyone after you.

There are five rungs and you get each one once:

| rung | beats | what's left above |
|---|---|---|
| specificity | equal-specificity rules | four |
| a layer | everything in lower layers | three |
| unlayered | every layer, any specificity | two |
| `!important` | everything unimportant | one |
| inline `!important` | — | nothing |

**The rule:**

> **Never escalate downstream. De-escalate upstream.**

When site CSS can't beat framework CSS, don't raise the site — *lower the
framework*. The framework has room to go down (a flatter selector, a token,
`:where()` around the one rule that caused it); downstream has nowhere to go up
that doesn't cost the next person. **The framework holds the low ground on
purpose so nobody downstream has to climb.**

That's also the mechanism behind §1's "override = bug report," which until now
was an exhortation with no method attached. And it's why §9 kept `:where()` in
reserve *for `framework.css` specifically* — the asymmetry is the whole point.

### The worked example

A `code { background: var(--bg); color: white }` in `/styles.css`, wanting dark
code blocks. It half-worked, which is the interesting part:

| property | winner | why |
|---|---|---|
| inline `code` background | site | equal specificity, loads later |
| `pre` background | framework `pre, code` | site never mentioned `pre` |
| `pre > code` background | framework (0,0,2) | out-specifies site's `code` (0,0,1) |
| `pre > code` **color** | **site** | uncontested — nothing else sets it |

Result: white text on a light box. Note that `pre > code { background: none }`
was *not* the villain — it prevents a double box and is correct. The trap was
that a partial override left one property stranded from the others.

Three ways to fix it, and only one is right:

- **Out-specify from the site** (`.app pre > code`) — climbs a rung, and the
  next person who wants to restyle code has to climb two.
- **Unlayer `/styles.css`** — climbs to the top rung for a background color,
  and takes out `util` as collateral (`.pad` would lose to a blanket site rule).
- **De-escalate upstream** — the framework was missing a token. Added
  `--code-bg` / `--code-ink` as component tokens falling back to the globals;
  the site now sets two *values* and no selectors, and reaches inline code,
  block code, fences and demo code areas at once. **Rung zero.**

The same pass found `.demo-code { background: rgba(0,0,0,0.06) }` — a component
hardcode at (0,1,0) that would have out-ranked the site's token for demo blocks
only, i.e. the "restyled everything except that one box" bug, pre-installed. Now
it reads `pre`'s background like everything else.

### The `site` layer

Even with the rule above, `/styles.css` shouldn't be in the same layer as the
framework it's skinning. It is now `@layer site`, between `theme` and `util`:

```css
@layer base, theme, site, util;
```

**Why between, not on top.** Site rules should beat the framework and every
component at *any* specificity — that's the point. But `util` must still win,
because a utility class is something you typed on purpose at the element; a
blanket `div { padding: 0 }` in the site has no business defeating `.pad`.

**Why a named layer rather than unlayering.** Three reasons: unlayered beats
`util` too; unlayered is the last cheap rung and this doesn't warrant it; and a
named layer is *positioned*, so something can later be placed above **or** below
it, which "on top of everything" forecloses.

**The gotcha this exposed, worth knowing.** Layer order is fixed by the *first*
`@layer` statement encountered, and a name first seen later is appended at the
**end**. `Page.css`'s `<link>` is appended before `framework.css`'s — `App.js`
imports `Page` at module scope, and imports are hoisted above `App.js`'s own
`View.stylesheet()` call. So `Page.css` establishes the order for the whole
site. Declaring `site` only in `framework.css` would have produced
`base, theme, util, site` — site beating utilities, silently. **Every stylesheet
now restates the full four-name list**, which is what the existing "every
stylesheet states it" convention was always for; it just had no teeth while all
the lists agreed.

---

## 9. `:where()` — tried, reverted

**The fear, stated exactly.** Base-theme rules are the ones you end up fighting.
There aren't many and they're mostly right, but when one is wrong for your page
you're in a specificity argument with the substrate — and the usual escalation
(more classes, `!important`, a later layer) makes the next person's fight worse.

**What was tried.** Every selector in `framework.css`'s `@layer theme` wrapped in
`:where()`, which carries zero specificity. The framework then loses to any rule
you write, at any specificity, with no escalation available or needed.

**Why it was reverted.** The problem is real but *hypothetical here*. The base
theme's selectors are already flat and single-element, so the ordinary model
covers essentially every case:

```css
framework.css    h2 { font-size: 1.4em }    /* loads first */
your-theme.css   h2 { font-size: 2em }      /* loads later, wins */
```

Equal specificity, later declaration takes it. And if that ever isn't enough,
an unlayered rule beats every layer — heavy, but it's there.

What `:where()` costs is immediate and paid by every reader: an unfamiliar
wrapper on forty rules, and a cascade *inside* the layer that resolves by source
order rather than selector weight — so `button.bg` stops beating `button` by
being more specific and starts depending on being lower in the file. That's fine
in one hand-ordered file and a trap the moment anyone forgets it.

**Verdict: keep plain selectors. Reach for `:where()` if a real override fight
happens, and then only around the rule that caused it.** Recorded so the idea
isn't re-derived from scratch — it's a good tool aimed at a problem this file
doesn't currently have.

**Two obligations this verdict creates**, since the simpler model only works if
they're honored:

- **Base-theme selectors stay flat.** One element, no descendant combinators. A
  `.page > h2` in `framework.css` would out-rank a theme's `h2` no matter when
  the theme loaded. The low specificity is a feature that has to be maintained
  on purpose, not an accident.
- **"Loads later, wins" is true only at equal specificity.** `Page.css`'s
  `.page > h2` beats a theme's `h2` regardless of order. That's correct — a
  component adapting a heading in its own context should win — but it means a
  theme cannot restyle every heading on the site with one flat rule. This is the
  known sharp edge of the model.

### 9a. The real override fight arrived — and `:where()` was the right tool

The trigger this verdict was waiting for. `Page.css` had four rhythm rules
(`.page > h2`, `.page > p`, …) which are exactly the sharp edge above: they
out-ranked a theme's flat `h2` forever, and they were unreachable from a `.md`
block anyway.

They are now the **flow** rules, and every one is `:where()`d to specificity zero:

```css
:where(.flow, blockquote) > * + * { margin-block-start: var(--flow); }
```

The selector names two things, not five: `.page`, `.md` and `.demo-render` each
**emit `.flow`** in their own render, so the rule never has to name a class its
own tier cannot import.

Three things this buys, all of which the plain-selector model could not:

- A theme or a component that genuinely wants its own spacing wins by being an
  **ordinary class** — `.md-details` and `.demo` do exactly that. No escalation.
- The second obligation above is retired for rhythm: `Page.css` no longer out-ranks
  a theme's flat rules.
- Retuning is one token, not a selector, so a theme changes one value. `--flow` is
  deliberately **unregistered** — it inherits as the literal `2em` and re-resolves
  at each child, so a heading's gap scales with the heading's own font-size. A
  registered `<length>` would compute once at the flow root and lose that.

The cost §9 warned about is real and is paid here: **inside the flow block, order
decides**, because all the selectors weigh the same. That is load-bearing — the
`h3`/`h4` "half again" rule has to follow the plain owl to win, and `.page-title +
*` is a real class precisely so it can out-rank both. It is exactly the trap §9
predicted, contained to five rules in one place instead of forty.

**Verdict stands, and this is what honoring it looks like:** plain selectors by
default, `:where()` around the rules that caused a real fight. It has now happened
once.

---

## 4. Versioned CSS — `v1`, `v1.1`, `v2`

**The ambition.** Rather than editing a working rule and breaking whatever
depended on it, add a class that layers the change on top, or swap to a new one.
A tree of versions instead of a mutating trunk.

**Weighing.** The additive half is already how the framework works, just without
the version numbering: `col: "narrow"`, `.page-preview.active`, `body.theme-1`,
`View.ctrl()` toggling classes. That's the good half and it costs nothing.

The numbering is where it gets expensive. `v1.1` only means something if there
is a promise about what `v1` contains, which means every rule needs a version,
which means `.card.v2` and `.button.v1.1` on the same page and a real question
about which cascade order they land in. Worse, it institutionalizes never
deleting anything — the opposite of the goal of this document.

**Verdict: no version numbers; keep the additive-class habit.** The thing
versioning is actually protecting against is *fear of editing a shared rule*,
and the cheap fix for that is small rules with obvious owners, which is §1. If a
component genuinely needs two incompatible looks, they get two names that say
what they are (`.page-preview` / `.page-preview-compact`), not two numbers.

Revisit if a real consumer outside this repo pins a look and can't move.

---

## 11. Native CSS mixins?

**Not usable yet.** `@mixin` / `@apply` are specified in **css-mixins-1** and
have landed in Chrome Canary, with Chrome 146 the expected ship — no browser
supports them in a release build, and no second engine has shipped. For a
no-build framework that runs the source directly, that's a "check back in a
year." (`@function`, the value-returning half of the same spec, shipped in
Chrome earlier and is equally single-engine.)

**What does the job today, and why you mostly don't want the mixin anyway:**

| want | native answer |
|---|---|
| `el1, el2, el3 { … }` written once | `:is(el1, el2, el3)` — or `:where(…)` when it should also be overridable |
| a named bundle of values | custom properties — `--pad: 0.25em 1em` |
| "piggyback on rules declared earlier" | a class, applied in the markup |
| undo an inherited decision | `revert-layer` |

The specific shape asked about — `el2 { @el1 }`, i.e. Sass's `@extend` — is the
one to avoid even once it's available. `@extend` works by rewriting selector
lists, so the styles you inherit arrive with the *original* selector's
specificity and source position, and the resulting cascade is genuinely hard to
predict. That's a known Sass footgun, not a gap in CSS. `:where()` plus a token
covers the honest cases without it.

---

