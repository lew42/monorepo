# lew42 — design record

Ported from Figma, *July 2026* → `Frame 14643`, the five `app-class-*` comps
(overview / api-reference / source-code / tabbed ×2).

Format as everywhere: **question → options → weighing → verdict.**

---

## 1. The comp is a screen. What of it is a theme?

**The problem.** The frame contains a sidebar, a breadcrumb topbar with a version
pill, three cards, a tab bar, a terminal window with line numbers, and a
prev/next footer — none of which a theme is allowed to name (guide §2, rung 4).
It also contains four colours, a typeface and a type scale, which are exactly
what a theme *is*.

**Verdict: split on vocabulary vs. values, and only the values landed here.**

| in the comp | where it went |
|---|---|
| `prim` `dark` `med` `light`, Montserrat, the 6-level scale, the radius | `lew42.css` — this file |
| sidebar groups, per-item icons, active chevron | `core/Sidebar` — structure it genuinely lacked |
| white-vs-black sidebar | **one token**, `--sidebar-bg` |
| cards, tab bar, terminal window, version pill, prev/next | **not built** — §5 |

The test the port had to pass: *does `lew42.css` contain a selector naming a
component class?* It does not. Every time it wanted to, that component was
missing a token and the token went into the component.

---

## 2. Figma's variable names are not our token names

The file defines `prim` `dark` `med` `light`. Only the first survived as-is.

| Figma | here | why not the literal name |
|---|---|---|
| `prim #ff8f60` | `--prim` | already ours, already this colour (`m_svg.svg` is `#FF8F60`) |
| `dark #3f3f3f` | `--ink`, `--bg` | it's *body text* and *the dark surface*, two decisions wearing one hex |
| `med #737373` | `--subtle` | same decision, existing name |
| `light #e6e6e6` | `--line`, `--wash` | hairlines and fills are different jobs at the same value **today** |

**A token names a decision, not a value.** `--light` would be a lie the moment
`.dark` is on the element — which is the whole reason the token set is worded
the way it is. Importing Figma's names verbatim would have created four
synonyms for tokens that already existed, and no way to tell which of the two
jobs `--light` was doing at any given call site.

---

## 3. The type scale — tokens, or a rule block?

**Options.** (a) Add `--h1-size`, `--h1-weight`, … to `framework.css` and set
values here. (b) Write `.theme-lew42 :is(h1, .h1) { … }` — ladder rung 3.

**Weighing.** (a) is the doctrine-preferred direction (*de-escalate upstream*),
but it means **eight new tokens each replacing exactly one hardcode**, against a
stated bar of "a token needs an existing hardcode to replace, ideally several."
It also puts a theme's most characteristic decision behind a layer of
indirection: `--h1-size: 3em` says less than `font-size: 3em` does.

(b) is explicitly legal — rung 3 is *"a rule on generic HTML"*, and restyling
generic elements is precisely a theme's job. `terminal.css` already carries one.

**Verdict: (b).** Revisit if a second theme wants the same eight knobs; two
themes restating the scale is the signal that it should have been tokens, and
one is not.

The cost, recorded honestly: `.theme-lew42 h1` is specificity (0,2,0), so it
also out-ranks any *component* rule that sizes a heading. Nothing does today
(`Page.css` sets heading **margins** only, by design), and if one appears the
fight is a bug report about that component.

---

## 4. The comp has no dark mode. Should the theme?

**Options.** (a) Light only, like `terminal` is dark only. (b) Ship
`light-dark()` with derived dark values.

**Weighing.** (a) is the honest reading of what was designed. But the framework's
own rule is that *a theme with no `light-dark()` would be lying by accepting
`.dark`* — and `.dark` is a class anyone can type. Shipping light-only means
`theme-lew42 dark` silently renders light, which is worse than an approximate
dark.

**Verdict: (b), and say so.** Every token has both values; the dark column is
**derived, not drawn**, and a designed dark pass should overwrite it rather than
treat it as a decision already made.

Two dark values are deliberately *not* mirrored:

- **`--bg` stays dark in both modes.** `framework.css` pairs `button.bg` with a
  hardcoded `color: white`. A light `--bg` in dark mode is white-on-grey.
- **`--code-ink` stays `#e6e6e6` in both.** The code box is dark under a light
  page in the comp, and stays dark under a dark one.

---

## 5. What wasn't built, and why that's the right stopping point

Cards, the tab bar, the terminal window, the version pill and the prev/next
footer are all **components**, not theme. Each is a `page.js` + `readme.md` +
class of its own, and each is a naming decision that wants agreeing before it's
typed (`.card`? `.tab-bar`? `.terminal`?). Building them inside a theme port
would have put five new component classes into a file that is not allowed to
name even one.

The tab bar in particular is not a fresh design: `legacy/Pager/TabPager.css` had
`.tab-bar` / `.tab`, and `Page.tabs()` still exists. That's a *revival*
question, not a theming one.

---

## 6. Known divergences from the comp

Small, deliberate, listed so nobody re-derives them as bugs.

- **`h2` keeps its underline.** `Page.css` puts a `border-bottom` on `.page > h2`
  as rhythm; the comp rules under the *title block* instead. Removing it is a
  change to every page on the site, not a theming call.
- **Sizes are `em`, not the comp's px.** The comp is a fixed 1440; `body` is
  `clamp(16px, 2vw, 20px)`, so the whole scale rides the viewport instead of
  pinning one width's pixels everywhere.
- **The active chevron is `›`, not `chevron_right`.** `Sidebar.css` must not
  depend on a font the app may never have loaded, or an unstyled sidebar reads
  "chevron_right" down its margin.

---

## 7. The gotcha: this site's `/styles.css` beats this file *on `.app` only*

`/styles.css` declares `--code-bg`, `--code-ink` and the `--syn-*` palette on
`.app`, in `@layer site`. Layers rank declarations **competing on one element**,
so:

- `div.theme-lew42` **inside** `.app` — the theme wins for its own subtree. The
  closer element's declaration is what inherits down; layers never enter it.
  This is the case on the doc page, and it works.
- `.theme-lew42` **on `.app` itself** — both rules target that element, and
  `@layer site` beats `@layer theme`. The theme's code palette loses.

So flipping the whole site over is one class **plus** deleting the token block in
`/styles.css` that the theme now supersedes. Cheap, but not zero, and silent if
you miss it — the symptom is a code box in the wrong palette and nothing else.

---

## 8. Fonts: the one seam

`--font: Montserrat` is declared here; the *file* is fetched by
`app.font("Montserrat")` (`core/App/Font.js`). Two places, and CSS cannot call
the second.

**Weighed:** `@font-face` in this file would make the theme self-contained and
need no JS — but it takes the face out of `App.loaders`, which is what makes the
first paint already-correct rather than a flash of system-ui at weight 900.

**Verdict: keep the seam, name it loudly** — the header of `lew42.css` says the
theme requires the call, and the fallback stack (`system-ui, …`) means a site
that forgets gets the right *shapes* at the wrong weight rather than nothing.

The call sits on the **page**, not in `app.js`: 166KB (38 Montserrat + 128
Material Icons) on every route, for a theme one page currently uses, is not a
trade worth making by default. `Font.load` memoizes, so the second page to ask
costs nothing.
