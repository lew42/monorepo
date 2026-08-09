# lew42 — design record

Ported from Figma, *July 2026* → `Frame 14643`, the five `app-class-*` comps.

Long form: `./doc/port.md` — what of a screen is a theme, the token renames, the type
scale verdict, and the known divergences from the comp.

## Decisions

**What of the comp is a theme?** **Values, not vocabulary.** The frame contains a
sidebar, a breadcrumb topbar, cards, a tab bar, a terminal window and a prev/next footer
— none of which a theme may name — plus four colours, a typeface, a type scale and a
radius, which are exactly what a theme *is*. The test the port had to pass: *does
`lew42.css` contain a selector naming a component class?* It does not. **Every time it
wanted to, that component was missing a token, and the token went into the component.**

**Figma's variable names are not our token names.** Only `prim` survived as-is; `dark`
became `--ink` and `--bg`, `med` became `--subtle`, `light` became `--line` and `--wash`.
**A token names a decision, not a value** — `--light` would be a lie the moment `.dark`
is on the element, and importing the names verbatim would have created four synonyms for
tokens that already existed.

**The type scale is a rule block, not eight new tokens.** `--h1-size` … would be eight
tokens each replacing exactly one hardcode, against a stated bar of *"a token needs an
existing hardcode to replace, ideally several"* — and `--h1-size: 3em` says less than
`font-size: 3em` does. A rule on generic HTML is ladder rung 3 and is precisely a
theme's job. Revisit when a *second* theme wants the same eight knobs.

**The comp has no dark mode; the theme has one anyway.** A theme with no `light-dark()`
would be lying by accepting `.dark`, and `.dark` is a class anyone can type — shipping
light-only means `theme-lew42 dark` silently renders light, which is worse than an
approximate dark. So every token has both values, and **the dark column is derived, not
drawn**: a designed dark pass should overwrite it rather than treat it as decided.

**Can a theme carry behaviour?** No class — a plain exported function the *site* calls,
never triggered by the CSS class appearing. `lew42.js` is that function, called from
`app.js`'s `config()`. The full argument is in `framework/doc/theme-behaviour.md`; the
short form is that **a theme is designed to appear more than once on a page, and
behaviour does not survive duplication.**

**Fonts are the one seam.** `--font: Montserrat` is declared here; the *file* is fetched
by `app.font("Montserrat")`, and CSS cannot make that call. An `@font-face` here would
make the theme self-contained and takes the face out of `App.loaders` — which is what
makes the first paint already-correct rather than a flash of system-ui at weight 900.
**Keep the seam, name it loudly:** `lew42.css`'s header says the theme requires the call,
and the fallback stack means a site that forgets gets the right *shapes* at the wrong
weight rather than nothing.

## Traps

- **⚠ `/styles.css` beats this file on `.app` only.** Layers rank declarations
  *competing on one element*, so `div.theme-lew42` **inside** `.app` wins for its own
  subtree (the closer element's declaration is what inherits down, and layers never enter
  it), while `.theme-lew42` **on `.app` itself** loses to `@layer site`. Flipping the
  whole site over was one class **plus** deleting the token block in `/styles.css` that
  the theme supersedes — silent if you miss it, and the symptom is a code box in the
  wrong palette and nothing else. Both halves are done; the prediction held exactly, and
  the deletion was the non-obvious one.
- **⚠ `.theme-lew42 h1` is (0,2,0)**, so it out-ranks any *component* rule that sizes a
  heading. Nothing does today (`Page.css` sets heading margins only, by design); if one
  appears, the fight is a bug report about that component.
- **⚠ Two dark values are deliberately not mirrored.** `--bg` stays dark in both modes,
  because `framework.css` pairs `button.bg` with a hardcoded `color: white` and a light
  `--bg` in dark mode is white-on-grey. `--code-ink` stays `#e6e6e6` in both, because the
  code box is dark under a light page in the comp and stays dark under a dark one.

## The base font size was the reason "everything felt too big"

Reported as *"I'm not 100% about this body 16-to-20px responsive font size, it feels too
big, too soon, on desktop."* Correct, and the middle term was the bug:

```css
font-size: clamp(16px, 2vw, 20px);    /* 2vw hits 20px at a 1000px viewport */
```

So **every** desktop — a small laptop and a 4K monitor alike — sat pinned at the 20px
maximum. It read as "responsive" and behaved as "20px on everything that isn't a phone."
And because this theme's scale is `em` off that number, a 25% overshoot on the base was a
25% overshoot on every heading.

```css
font-size: clamp(1rem, 0.68rem + 0.36vw, 1.25rem);
```

16px holds through 1440 — the width the comp was drawn at, so `h1` is now **exactly** the
comp's 48px — then grows slowly, reaching 20px near 2560. **`rem + vw` rather than plain
`vw`**, because a pure-viewport font size ignores the reader's browser font-size setting
and cannot be zoomed out of.

**The same compounding bit the page rhythm**, and the fix went the other way in the end.
Heading margins were `em`, which resolves against *the heading's own* size — so when this
theme took `h2` from 1.4em to 2.25em, `margin: 2.2em` silently went 49px → 79px. They
went to `rem`, then to a registered `--flow`, and both were reversed: rhythm is one
unregistered `--flow: 2em` now, resolving at each child on purpose, because a heading
*should* take air in proportion to its own type size. `core/Page/doc/layout.md` has the
whole arc — it is the same trade-off argued three times.

## What wasn't built, and why that's the right stopping point

Cards, the tab bar, the terminal window, the version pill and the prev/next footer are
all **components**, not theme. Each is a `page.js` + `readme.md` + class of its own, and
each is a naming decision that wants agreeing before it is typed. Building them inside a
theme port would have put five new component classes into a file that is not allowed to
name even one.
