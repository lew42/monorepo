---
name: css-strategy
description: Decide WHERE a CSS declaration belongs before writing it — which rung of the ladder, which layer, the container or the item, a token or a rule, and whether the block already exists. Load before writing or editing any .css file, before adding a class or a token, when a rule "won't take" or needs !important, when overriding framework.css, or when a page needs unsetting somewhere. Companion to layout-design (which owns sizing) and code-architecture (which owns JS); this owns the cascade.
---

# CSS strategy

Every CSS problem in this repo has been one of five questions answered wrong.
Answer them in order, out loud, before writing the declaration. The long form
with worked examples lives at **`/framework/styles/rules/`** — five pages, with
live demos measured by `ext/LayoutTool` as they render.

## 1. Does this need CSS at all? — the ladder

**Stop at the first rung that works.** Do not skip ahead because a rule "would
be cleaner".

1. **Nothing.** The default already handles it.
2. **A utility class** — `flex gap v-center wrap`, `grid auto gap`, `measure`,
   `surface`, `wash`, `tint`, `muted`, `pad`, `flex-1`, `basis`, `h1`–`h4`.
3. **An existing component's class** — `.page-preview`, `.sidebar-link`,
   `.ui-table`, `.tab-bar`.
4. **The module's own `.css` — layout only.** Where things sit, how they size.
   The test: *would this rule still be right if the component were dropped into
   a completely different site?* Flex sizing yes; `background: #eef0f4` no.
5. **`/styles.css`** — skin, this site's opinion, loaded last.

**Read `framework.css` before inventing anything.** The vocabulary is small and
most "new" needs are already words.

## 2. Container or item?

> **Constrain the container. Never the items.**

A property set on a leaf must be **unset on every exception**; a property set on
a container is **overridden by the one child that wants out**. `max-width: 52em`
on every `p` means unsetting it for tables, code blocks, figures, card grids —
and the sixth `unset` gets written by someone who never saw the other five.

The blessed shape: the container owns a **track**, and a child opts out by
**asking for a wider track** — additive, visible at the call site, nothing unset.

```js
div.c("wide")    // ✅ this block claims the wide track
```

## 3. A token, or a declaration?

**A custom property inherits. A declaration does not.** That difference is the
whole lever.

- Set the token **high**, read it **low**: `--measure`, `--page-pad`, `--column`,
  `--gap`, `--flow`.
- A subtree disagrees by **re-declaring the token on itself** — a declared value
  beats an inherited one at any specificity, in any layer. No specificity war,
  no `!important`, no unset.
- A different colour, gap or column count is a **token override, not a new
  component**: `div.c("grid auto gap").style({ "--column": "22em" })`.
- **A token needs an existing hardcode to replace**, ideally several. Tokens are
  public API — adding is free, renaming is breaking.

⚠ **`.page.full` zeroes `--measure` AND `--page-pad`.** A page that wants full
width *with* a gutter declares the two tokens itself; it does not take `full`
and add padding back on an inner wrapper, because the page **title** is rendered
outside anything `content()` builds. This shipped, and the `gutter` rule exists
because of it.

## 4. Which layer?

```css
@layer base, theme, site, util;   /* restate IN FULL, in every stylesheet */
```

- **The first `@layer` statement fixes the order.** A name first seen later is
  appended at the *end* — one short list silently drops `site` past `util`.
- **Every rule lives inside a layer.** An unlayered rule beats every layer at
  any specificity.
- **Base-theme selectors stay flat** — one element, no descendant combinators —
  or a theme's `h2` can never win.

**The ratchet:** specificity → a layer → unlayered → `!important` → inline. Each
rung works once and raises the cost for everyone after you. **Never escalate
downstream; de-escalate upstream.** Overriding a `framework.css` rule is a bug
report about `framework.css` — fix it there with a flatter selector, a
`:where()`, or a token, and record the eviction in `framework/styles/readme.md`.

## 5. Does this block already exist?

A near-duplicate is worse than either thing it sits between: it splits one
answer across two files and nobody can later tell which is real.

- **Census first.** `rg "^\s*\.[a-z-]+\s*\{" public/framework/framework.css -o`
- **Close beats new.** Extend the existing component with a modifier rather than
  adding a sibling.
- **A pattern earns a name on its second appearance**, and must have one by the
  third. Naming the first guesses at a shape you have seen once.
- **The class name is the registry** — one namespace, no build step. Prefix with
  the owning component (`.page-preview`, not `.preview`). If your CSS styles a
  class you do not emit, `import` the module that does; the import *is* the
  loading edge, so comment it or it gets deleted as unused.

## The proportion rule

Two floors, because they measure different things:

| floor | against | asks |
|---|---|---|
| legibility | the text's font size | can the text breathe next to the edge? |
| composition | the box's own width | is the frame proportionate to what it holds? |

```css
padding: clamp(0.75em, 3.5%, 3.5em);   /* both floors, one declaration */
```

20px on a 240px card is 8.3% and fine; the same 20px on a 1000px card is 2% and
looks off. `pad-scale` measures it. Live proof:
`/framework/styles/rules/proportion/`.

## Nesting, in one line

**A block-level box in normal flow, containing block-level boxes in normal flow,
cannot break.** Six departures are what does: a flex/grid item's `min-width:
auto`; an unbounded `1fr` maximum on a reading column; leaving the flow
(`absolute`/`fixed`/`float`); a chosen `height`; `overflow: hidden` with no
scrollbar; negative margins and transforms. Full table:
`/framework/styles/rules/nesting/`.

## Before you commit

Run the analyzer on what you built — it is free and it is the same rules:

```js
const m = await import("/framework/ext/LayoutTool/LayoutTool.js");
m.analyze(document.querySelector(".page.active-page"));
```

Zero high-severity findings at 400 / 1280 / 1920 / 3440, or a stated reason why
a finding is a false positive. `/framework/ext/LayoutTool/audit/` ranks the whole
site and shows the offending element before and after the fix.
