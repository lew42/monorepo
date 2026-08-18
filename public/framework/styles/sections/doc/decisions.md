# Sections — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

**question → options → weighing → verdict.**

---

## 1. What is a section, given that `layouts/` already exists?

A layout says *where things go*. It is deliberately empty — a layout page fills its
boxes with the `surface` class, because a layout page arguing about copy is a layout
page arguing about the wrong thing.

But nobody ships a grey rectangle. The question a reader has after `layouts/` is
**"what does this look like with real content in it"**, and the honest answer
needs elements, ui components and a tint at the same time — which is exactly the
combination no single existing section was allowed to show.

**Verdict: a section is a layout with content in it**, and this folder is the
crossing. Five bands, five layouts, drawn from `elements/` and `ui/`.

The strongest reason to have it at all is negative: it is the only page on the
site that can be *wrong* about composition. A layout gallery cannot look
unbalanced, because there is nothing in it to balance.

---

## 2. The one idea: a band bleeds, the words don't

```js
export default (tone = "dark") =>
    div.c("section-band", () =>
        div.c("measure flex v gap", () => { … }).style("--measure", "62em")
    ).style(band(tone));
```

*(The inner div was `flow` until the de-flow pass — §7. It was a `section()` helper
in `parts.js` until §11, and the max-width was an inline pair until `.measure`
landed in `framework.css` and said the same thing in one word.)*

Two divs, and every section on the page is them. The outer takes the full width
and the fill; the inner holds a max-width, so the reading stays a column at any
window width.

**Options considered.**

| | |
|---|---|
| one div, `max-width` + `margin-inline: auto` | the fill then stops at the measure — a strip, not a band |
| one div, `padding-inline: calc((100% - 34em) / 2)` | works, and is unreadable; also breaks below the measure |
| the page's own `grid` | right for a *page* of prose with occasional wide things. Backwards here: on this page bleeding is the default and the measure is the exception |
| **two divs** | ✓ |

The two-div version is the one you can explain in a sentence, and the sentence is
the heading above.

### The measure is a token, not a second helper

The first version used `.layout-measure` (34em) for every band, and the features
grid came out two-up in a 544px column on a 1400px screen — cramped, and visibly
the wrong call. Measured before the fix: every band 544px inside a 1352px page.

**Reading wants 34em and a card wall does not, and the difference between those
two is one number.** So the token, overridden at the call site — `--section` at the
time, `--measure` now that `.measure` in `framework.css` says the same thing and the
band stopped writing its own `max-width`:

```js
div.c("measure flex v gap", () => { … }).style("--measure", "62em");
```

⚠ `.measure` **declares** `--measure`, so the override has to be inline **on that
div** — a value set on the band around it is inherited, and a declaration beats an
inherited value at any specificity. That is the idiom `framework.css` documents.

Rejected: a `wide_section()` twin (two names for one idea), and a `.wide` class
(a stylesheet, for one declaration). The token is the same move `--column` already
makes on a grid and `--basis` makes on a flex track — a utility that reads a
number is retuned by setting the number.

### REVERSED — the doc page is measured, not `full`

It shipped as `classes: "full"` on the argument that bleeding should be the
default here and the text should opt back in. That was wrong twice over.

**`Page.render()` draws the `h1` before `content()` runs**, so it was outside the
`pad` div that was supposed to inset everything — the title sat flush against the
sidebar and the top of the region, at 0,0. Measured, and reported.

And the premise was wrong anyway: **nothing on the doc page bleeds.** The bands are
inside a `demo()` box, which has its own padding; the only place they reach a real
edge is the `full` route, which is a separate page. The page was paying for a
capability it never used.

The rule, general: **`full` is for a page that overrides `render()`.** A page
with a title has something the framework puts above `content()`, and zero padding
gives that thing nowhere to go.

---

## 3. No stylesheet, and one class name

`.section-band` is emitted and never styled — it exists so the DOM is readable and
so a site can reach these bands if it wants to. Every visual decision is a
token-valued style object — `band(tone)`, in `tone.js` (§11):

```js
export const band = tone => ({
    background: tone === "dark" ? "var(--ink)" : …,
    color: …,
    padding: "3.5em 2em",
});
```

Not a stylesheet, because **a fill, a text colour and a padding are a LOOK**, and
rung 4 of the ladder is layout only. `styles/parts.js` and `ui/parts.js`
both made this call already; this is the house answer rather than a new one.

**Nothing in this folder names a colour.** That is the test — *would this rule
still be right in a different site* — and a hex value fails it every time. The
four tones are `--surface`, `--wash`, `--prim`, `--ink`, which the theme already
defines, so alternating them keeps a page in palette by construction and a theme
swap retints all five bands with nothing edited here.

---

## 4. Why the tone scale has exactly four steps

Two would not be enough to alternate without a repeat becoming obvious across
five bands. Six would need two more surface tokens invented for this page, which
is a section deciding something that belongs to the theme.

Four is what the theme already has. **A scale you did not have to invent is a
scale that cannot drift from the rest of the site**, and the constraint is doing
real work: `stats` is `prim` only because `dark` was taken by the band above it,
and that turned out to be the better page.

---

## 5. REVERSED — inline children, where this kept a registry

**Question.** Fifteen bands, one module each. A registry (`catalogue.js`: name →
title, icon, tone, render) plus a `route()` that builds a page per entry — or
fifteen **inline object children** in `children:`?

**The registry's case**, as this file argued it, and it was not silly: there was
exactly *one* list. `layouts/` had the superficially identical shape and was wrong
there only because its map sat *beside* a `children` string naming the same eight,
and `fit` fell between them. A section is also a **fragment** rather than a page,
and the whole-page demo wants the bands in order, which is what an array of render
functions is for.

**What decided it.** The one list is `children` itself. Routing, nav order,
titles and icons, and **a preview card per child** all come free from `Page`,
and the registry was re-implementing three of them — the gallery card, `route()`,
and the composition order — from a second source of truth that could disagree with
the page. The "fragment" argument also expired: each band has had a url with its
own source, tones and a back link for a while now, which is a page.

**Verdict: inline object children.** An entry *is* the page, so there is no
second list to fall out of:

```js
children: [
    { ...band, name: "hero", title: "Hero", icon: "campaign", tone: "dark", section: hero, card: "two" },
    …
],
```

- **`band` is the shared half**, spread in: `classes`, `preview()` and `content()`
  are identical for all fifteen, so they are written once, visibly, above the list.
  A method in an object child *is* the method — never a name string, which would
  send the router to the server looking for a page.
- **`section:`, not `render:`** — `render()` is `Page`'s own, and a child that
  overwrote it would blank itself. `this.section(this.tone)` reads as what it is.
- `whole()` walks `children` for the composition demo and the `full` route, so the
  order on screen is the order in the list. `full` is a `route()` child with no
  band, so it draws no card and `whole()` asks with `?.`.

`demo(() => this.whole())` still shows the *real* source of the whole composition,
which is the one thing a "here is a real page" example must not fake.

---

## 6. Open

- ~~**The bands are one page, and a real site would want them separately.**~~
  **Closed by §5.** Every band is a child with its own url, its own card in the
  index's rail, and its own source — a menu of parts that still composes into one
  page. The index became a `catalog()` on 2026-08-11, so a band now opens *beside*
  its fourteen siblings instead of replacing them; this page's own prose is the
  rail's first card (`ext/catalog/readme.md`).
- ~~**`price()` and `feature()` are near-duplicates of `ui/card`.**~~ **Closed by
  §11 the other way:** neither is shared any more, so neither is a candidate to
  collapse into anything. Each is a `const` in the one band that calls it, beside
  the three that were always local (`quote`, `person`, `channel`). A card with a
  price in it is a different *content* shape, and a content shape belongs to its
  content.
- ~~**No dark-mode check.**~~ **Checked, and it inverts.** `--ink` as a background
  becomes `#e6e6e6` with `#1e1e1e` text, so the "dark" band is the *high-contrast*
  band rather than a literally dark one — which is the correct reading of a
  `light-dark()` token and the reason the tone is named for its role. All four
  hold their contrast. The one that does not move is `prim`, which is the brand
  and should not.
- **A band inside the whole-page demo still cannot be linked to.**
  `/sections/pricing/` is the band's url now, but `/sections/#pricing` — a
  position in the composition — has no id to aim at, and `toc()` still has
  nothing to scan.

---

## 7. De-flow: a section is a layout, and a layout owns its spacing

**The bug, measured before the fix:** the hero's `h1` carried **96px** of top
margin, a feature card's `h3` **72px**, a stat tile's number **96px** — inside
bands whose whole rhythm should be about a line of body text.

The mechanism (**REVISED — see core/Page/readme.md**), not obvious from any one
file at the time: `section()`'s inner div was `.flow`, and the flow tokens were
four unregistered **em** values (`--flow: 2em`, `--flow-sub: 3em`) despite the
comment beside them saying `rem`. An unregistered em custom property resolves **at
the point of use** — against the heading's own font-size — so `--flow-tight` on a
48px `h1` was 2 × 48 = 96px. Page prose never showed it this badly because page
headings are smaller than a hero's.

**That mechanism no longer exists.** There is one token, `--flow`, registered with
`@property` in `framework.css`, so it computes against the flow root it is declared
on and inherits as an absolute length — compounding is now structurally impossible.
The verdict below is unaffected: it was never really about the unit.

**Verdict: the same rule `Page/readme.md` already states** — *a page that
overrides render() into a flex or grid layout owns its children's spacing.
`gap`, not flow.* A section is exactly that, one level down. `section()` is now
`flex v gap`; `feature()`, `price()` and `stat()` are `pad flex v` with a small
gap — the shape `card` already had, for the reason `card`'s page already
documents. After: every measured margin is 0 and the gaps are the container's.

The em-vs-rem token was the upstream half and belonged to `framework.css`, not
this folder; it was reported rather than edited, and registering `--flow` is what
came back.

## 8. REVERSED AGAIN — render first, and no control above the fold

This page has now been both ways. It shipped render-then-source; §8 reversed it to
source-then-render on *code → result is the site's reading order*; and a leaf demo
page is the case where that rule breaks, because the code block is a screen tall
and pushes the only thing worth looking at below the fold.

**Verdict: the band first, full-bleed, at its home tone.** Then one caption line,
then `demo.source.file(import.meta, name + ".js")` — a `details`, **closed**. The
source is unchanged in kind (the real file, imports and all); it is one click and
a scroll away instead of first. It is also in the panel, so the two shapes can be
compared by use.

~~**No stage on a leaf band.**~~ **REVERSED by §11** — on the stated condition.
The argument was that the stage frames and pads its render while a band's entire
point is reaching the window's edge, and the verdict said *revisit if the stage ever
grows a flush mode.* It did: `.demo-stage.bleed .demo-screen { padding: 0 }`, so the
render really touches the window and the drag handle comes free.

**The tone switcher is panel content now** (`tone.js`, ~20 lines): four chips
registered with `layout.context()`, so nothing above the fold is a control. Same
mechanic as the old buttons — re-run `tone => view` — and the chosen tone lands on
the page, so a re-opened panel agrees with what is on screen. The one thing to know
is that a click inside a region selects the *child* under the pointer, so the chips
are registered on the `.section-band` as well as on the box that holds it.

## 9. Three more bands: logos, testimonials, sign up

What a launch page needs and the catalogue lacked. `logos` is wordmarks in the
type scale, dimmed with the band's own ink — no assets. `testimonials` is the
cards layout with a real `blockquote` and the Avatar component's named export —
a section using a component is the crossing this folder exists to show.
`signup` is one email input beside one button, wrapping with no query. Zero new
CSS in all three; tones chosen so no two neighbouring bands in the whole-page
order repeat.

## 10. Three more: team, changelog, contact

The bands a project asks for the week it goes public. Same rule as §9 — zero new
CSS, tones chosen so no two neighbours repeat — and each one had to earn its
place against a band already in the catalogue:

- **`team`** — the cards layout with the Avatar component's named export. Nearly
  cut as a duplicate of `testimonials` (both are avatar cards) and kept for the
  thing that differs: a testimonial is *quoted prose*, so its card is a
  `blockquote`; a team card is a **record** — name, role, one line — and reads as
  a wall rather than as a page. The tell is that they want different measures.
- **`changelog`** — the [Timeline](/framework/ui/timeline/)
  component with real releases in it. This is the **third** cross-import into
  `ui/`, and it is the one that paid: a band can be worn in any of four
  tones, so the component had to derive every colour from the band's own ink
  instead of naming `--subtle` beside it (§12c of the styles record, which
  measured that mistake at 1.06:1 on the `prim` band). The dot reads
  `var(--eyebrow, var(--prim))` — `band()` already hands that variable down, so
  the accent that is safe on this band was API rather than a new token.
- **`contact`** — the split layout: channels beside a real form. Kept apart from
  `signup`, which is one email field and one button, because they answer
  different questions ("subscribe" vs "reach a human") and because the form here
  is what shows `label.c("flex v")` — **the label element IS the row**, so
  clicking the caption focuses the field with no `for`/`id` pair to keep in sync.

**Dropped from the shortlist:** a pricing comparison table (`pricing` plus
[Data table](/framework/ui/table/), composed, teaching neither
again) and a cookie/consent bar (a position, a state and a stylesheet — the one
band that could not make this folder's point).

## 11. The exhibit, and the end of `parts.js` (2026-08-12)

Two changes on one day, and the second is a consequence of the first.

### The detail page is `demo.exhibit()` now

This folder hand-rolled its own: a `layout bleed` band holding the render, a
`layout.bar()`, the tone chips, and `demo.source.file()` under it. That is the
assembly `ext/demo/doc/record.md` §15 built once, so the hand-roll went and the config
is four keys — `stage`, `def`, `file`, `note`. What changed for a reader:

- **The band is on a stage you can drag.** §8's objection expired (see the reversal
  above); the handle is the thing this folder most wanted and never had, because
  *"every band re-lays-out on its own, none of them contains a media query"* was a
  claim you previously had to take on trust unless you resized the whole window.
- **The source is the band's own function, not the file.** `def: this.section`
  prints `hero.js`'s export; the whole file is one click away beside the summary.
  §15's argument, unchanged: the lesson is the function, and the imports are
  harness the reader has no use for.
- **The tone chips did not move.** They were already `layout.context()` panel
  content (§8), so integrating them cost one line: the exhibit's `steer` hands the
  render to `layout.bar()` and to `tones()` in the same callback. **One control
  surface** — the bar and its panel — rather than a bar plus a chip row. A chip row
  inside the stage chrome was the alternative and would have been a second control
  surface on the one page arguing there is only ever one.

### `parts.js` is deleted

**The question** (the owner): *"we don't want these defined in `/sections/` — either we
don't need them (preferred, if we can just define them more explicitly with raw
`div.c()`), or they should be moved to `ui/` if they're useful."*

The change above is what made it obvious: **a band's source is now the displayed
lesson**, so anything it builds that lives in another file is a hole in the lesson.
Per part:

| | outcome | |
|---|---|---|
| `section(tone, …)` | **eliminated** | fifteen bands write the two divs out. `.measure` in `framework.css` already *was* the inner one, so inlining removed the inline `max-width`/`margin-inline` pair rather than duplicating it |
| `eyebrow(text)` | **eliminated** | `p.c("h4", "WHY").style("color", "var(--eyebrow, var(--prim))")`. One declaration, and it puts the `--eyebrow` handoff at the call site instead of leaving a band setting a variable a helper three files away reads. The invented tracking and opacity went with it — `h4` already tracks |
| `cta(text, kind)` | **eliminated** | `button.c("prim", "…")`. Its own comment said *"this IS a button"* |
| `feature()` | **local const** in `features.js` | one caller |
| `price()` | **local const** in `pricing.js` | one caller; `pill` was its only importer and became three declarations there, so `styles/parts.js` lost that export too |
| `stat()` | **local const** in `stats.js` | one caller — and the copy `ui/stats/page.js` names as one of three reasons there is no `ui.stats()` |
| `band(tone)` | **moved to `tone.js`** | the only survivor, and not markup: a four-way token map plus the `--eyebrow` contrast handoff, read by all fifteen. `tone.js` already owned the four names and the switcher, so it now owns everything a tone is |

**Nothing moved to `ui/`.** The test was "does this carry irreducible logic", and
five of the seven carried none — they were markup with a name on it. The one that
does (`band`) is a style object, not a component, and its home is the module that
already answers "what is a tone".

The cost is honest and small: a band is three or four lines longer, and the two-div
sandwich is written fifteen times instead of once. That is the trade §11 accepts —
**a lesson you can read top to bottom beats a lesson with one import in it**, and
the sandwich is two lines that the page's own "The one idea" section quotes in full.
