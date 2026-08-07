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
        div.c("flow", ...args).style({ maxWidth: "var(--section, 34em)", marginInline: "auto" })
    ).style(band(tone));
```

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
