# Sections — design record

**question → options → weighing → verdict.**

---

## 1. What is a section, given that `layouts/` already exists?

A layout says *where things go*. It is deliberately empty — `layouts/parts.js`
fills its boxes with grey rectangles, because a layout page arguing about copy is
a layout page arguing about the wrong thing.

But nobody ships a grey rectangle. The question a reader has after `layouts/` is
**"what does this look like with real content in it"**, and the honest answer
needs elements, components and a tint at the same time — which is exactly the
combination no single existing section was allowed to show.

**Verdict: a section is a layout with content in it**, and this folder is the
crossing. Five bands, five layouts, drawn from `elements/` and `components/`.

The strongest reason to have it at all is negative: it is the only page on the
site that can be *wrong* about composition. A layout gallery cannot look
unbalanced, because there is nothing in it to balance.

---

## 2. The one idea: a band bleeds, the words don't

```js
export const section = (tone, ...args) =>
    div.c("section-band", () =>
        div.c("flex v gap", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
    ).style(band(tone));
```

*(The inner div was `flow` until the de-flow pass — §7 below.)*

Two divs, and every section on the page is them. The outer takes the full width
and the fill; the inner holds a max-width, so the reading stays a column at any
window width.

**Options considered.**

| | |
|---|---|
| one div, `max-width` + `margin-inline: auto` | the fill then stops at the measure — a strip, not a band |
| one div, `padding-inline: calc((100% - 34em) / 2)` | works, and is unreadable; also breaks below the measure |
| the page's own `breakouts` grid | right for a *page* of prose with occasional wide things. Backwards here: on this page bleeding is the default and the measure is the exception |
| **two divs** | ✓ |

The two-div version is the one you can explain in a sentence, and the sentence is
the heading above.

### The measure is a token, not a second helper

The first version used `.layout-measure` (34em) for every band, and the features
grid came out two-up in a 544px column on a 1400px screen — cramped, and visibly
the wrong call. Measured before the fix: every band 544px inside a 1352px page.

**Reading wants 34em and a card wall does not, and the difference between those
two is one number.** So `--section`, overridden at the call site:

```js
section("surface", () => { … }).style("--section", "62em");
```

Rejected: a `wide_section()` twin (two names for one idea), and a `.wide` class
(a stylesheet, for one declaration). The token is the same move `--column` already
makes on a grid and `--basis` makes on a flex track — a utility that reads a
number is retuned by setting the number.

### REVERSED — the doc page is measured, not `page-full`

It shipped as `classes: "page-full"` on the argument that bleeding should be the
default here and the text should opt back in. That was wrong twice over.

**`Page.render()` draws the `h1` before `content()` runs**, so it was outside the
`pad` div that was supposed to inset everything — the title sat flush against the
sidebar and the top of the region, at 0,0. Measured, and reported.

And the premise was wrong anyway: **nothing on the doc page bleeds.** The bands are
inside a `demo()` box, which has its own padding; the only place they reach a real
edge is the `full` route, which is a separate page. The page was paying for a
capability it never used.

The rule, general: **`page-full` is for a page that overrides `render()`.** A page
with a title has something the framework puts above `content()`, and zero padding
gives that thing nowhere to go.

---

## 3. No stylesheet, and one class name

`.section-band` is emitted and never styled — it exists so the DOM is readable and
so a site can reach these bands if it wants to. Every visual decision is a
token-valued style object in `parts.js`:

```js
export const band = tone => ({
    background: tone === "dark" ? "var(--ink)" : …,
    color: …,
    padding: "3.5em 2em",
});
```

Not a stylesheet, because **a fill, a text colour and a padding are a LOOK**, and
rung 4 of the ladder is layout only. `layouts/parts.js` and
`components/parts.js` both made this call already; this is the house answer rather
than a new one.

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

## 5. Kept: the sections are functions, not markup in `page.js`

Same call `layouts/` and `components/` make. Each band is a module exporting one
function, so it can be rendered three ways — in the demo, in the `full` route, and
by anything later that wants one — with no second copy to fall out of date.

It also means `demo(page)` shows the *real* source of the whole composition, which
is the one thing a "here is a real page" example must not fake.

---

## 6. Open

- **The five bands are one page, and a real site would want them separately.**
  `hero()` on its own is a legitimate thing to reach for, and nothing here says so
  — the page reads as a single composition rather than a menu of parts.
- **`price()` and `feature()` are near-duplicates of `components/card`.** They are
  here because a card with a price in it is a different *content* shape, not a
  different component. If a third one appears, the three should collapse back into
  `card` with slots.
- ~~**No dark-mode check.**~~ **Checked, and it inverts.** `--ink` as a background
  becomes `#e6e6e6` with `#1e1e1e` text, so the "dark" band is the *high-contrast*
  band rather than a literally dark one — which is the correct reading of a
  `light-dark()` token and the reason the tone is named for its role. All four
  hold their contrast. The one that does not move is `prim`, which is the brand
  and should not.
- **A section cannot yet be linked to on its own.** `/sections/#pricing` would be
  the obvious ask and there are no ids. `toc()` would then have something to scan,
  which it currently does not.

---

## 7. De-flow: a section is a layout, and a layout owns its spacing

**The bug, measured before the fix:** the hero's `h1` carried **96px** of top
margin, a feature card's `h3` **72px**, a stat tile's number **96px** — inside
bands whose whole rhythm should be about a line of body text.

The mechanism, not obvious from any one file: `section()`'s inner div was
`.flow`, and the flow tokens in `framework.css` are **em** (`--flow: 2em`,
`--flow-sub: 3em`) despite the comment beside them saying `rem`. An em custom
property resolves **at the point of use** — against the heading's own font-size —
so `heading + *`'s `--flow-tight` on a 48px `h1` is 2 × 48 = 96px. Page prose
never shows it this badly because page headings are smaller than a hero's.

**Verdict: the same rule `Page/readme.md` already states** — *a page that
overrides render() into a flex or grid layout owns its children's spacing.
`gap`, not flow.* A section is exactly that, one level down. `section()` is now
`flex v gap`; `feature()`, `price()` and `stat()` are `pad flex v` with a small
gap — the shape `card` already had, for the reason `card`'s page already
documents. After: every measured margin is 0 and the gaps are the container's.

The em-vs-rem token is the upstream half and belongs to `framework.css`, not
this folder; reported rather than edited.

## 8. Code first on every section page

The per-section route pages drew the render, then the source. Reversed: the
source (`code.file`, imports and all) now sits directly above the `toned()`
render, because *code → result* is the site's reading order and the visible
source is the pitch. The tone switcher stays — it is the proof that a section is
`tone => view` and nothing else.

`demo()` was the obvious tool and was not used: its source pane shows
`fn.toString()`, which for a section is right, but the tone switcher has nowhere
to live (the toolbar takes no custom controls) and the stage pads its render, so
a band cannot reach an edge. What it would need is on the worker report; until
then `code.file` + `toned()` is the same object in two boxes.

## 9. Three more bands: logos, testimonials, sign up

What a launch page needs and the catalogue lacked. `logos` is wordmarks in the
type scale, dimmed with the band's own ink — no assets. `testimonials` is the
cards layout with a real `blockquote` and the Avatar component's named export —
a section using a component is the crossing this folder exists to show.
`signup` is one email input beside one button, wrapping with no query. Zero new
CSS in all three; tones chosen so no two neighbouring bands in the whole-page
order repeat.
