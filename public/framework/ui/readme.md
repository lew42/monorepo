# ui — design record

Nineteen UI components. Sixteen are exported functions on one namespace; three
are copy-paste templates with a page and no export.

```js
import { ui } from "/app.js";

ui.card(() => { h3("View"); p("A DOM element with a chainable API."); });
ui.badge.c("accent", "live");
```

## Encapsulate only what a user shouldn't have to understand

**Encapsulating hides internals, and hiding internals makes modification
harder.** A function you can't see inside is a function you have to fight the
first time your case is half a step off the one it was written for — and for a
padded flex row, that is the *second* use.

So the bar is: is there **logic** here that a user should not have to carry? A
loop over rows, a listener, a group name that must be unique, a trap that costs
an afternoon. If yes, export a function. If no — if it is four elements and three
utility classes — the honest deliverable is the **markup itself**, documented on
its page with a copy button, so the reader takes it and edits it in place.

| exported, and why | template, and why |
| --- | --- |
| `table` `crumbs` `pagination` `stats` `tags` `timeline` `keys` — a loop | `field` — a label, a control, a note. Every real form needs the fourth thing |
| `menu` `dialog` `accordion` — a listener, a trap, or a name that must be unique | `toolbar` — a flex row with `flex-1` on the part that absorbs the slack |
| `card` `badge` `panel` `alert` `avatar` `tooltip` — the class name *is* the component | `progress` — the component is `<progress>`. The browser wrote it |

Three of the sixteen are near the line. `card` is one div and would be a template
if it were not the shape every other component is made of; naming it once is what
lets `panel`, `alert` and `tags` all wear `ui-surface`.

## The CSS

Every component's CSS is a template string in its own `.js`, injected by
`css()` from `parts.js`. Two rules, both silent when broken, and `css()` handles
the first for you:

- **The layer order is restated in full** — `@layer base, theme, site, util;`.
  `css()` prepends it, so no component file can ship a short list.
- **Every rule is inside a layer.** An unlayered rule beats *every* layer.

Look goes in `theme`. Two blocks are in `util` on purpose and say so at the line:
`.ui-tags-input` (an opt-out of the theme's input border, which a `theme` class
would lose to on specificity) and `.ui-dialog`'s `margin: auto` (which
`.flex > * { margin: 0 }` erases from a later layer).

**No component relies on a theme.** Every value is a framework token —
`--surface --ink --line --radius --wash --prim --bg --error` — all of which
`framework.css` defines on `:root`, and `View.js` loads `framework.css`. Drop a
component into an unthemed page and it renders.

**Nothing is styled inline** except `--gap`, `--column` and `--avatar`, which are
knobs rather than declarations: `.style("--column", "12em")` retunes a tile strip
without a selector, the same move `grid auto` already invites.

## Shared

`parts.js` holds four helpers and the classes more than one component wears
(`ui-surface`, `ui-pill`, `ui-muted`).

| | |
| --- | --- |
| `css(rules)` | a `<style>` tag with the layer statement written for you |
| `component(fn)` | adds the `.c("classes", …)` form every View factory has |
| `palette([label, render, url?], …)` | the variants side by side — every page opens with one |
| `copy(source, lang?)` | a code block with a copy button — the template pages |

`parts.js` and every `<name>.js` import from `../../core/View/View.js`, never
`/app.js`: `app.js` exports `ui`, so importing back through it would be a cycle
that breaks on deep reloads only. `page.js` and `renders.js` are loaded by the
Router long after that, so they use `/app.js` like any page.

`renders.js` is one call per exported component — what the index wall renders, and
what `/michael/previews/` renders. A cell therefore cannot show something its
page doesn't.

## Two things that will bite

- **`ui/` is imported by `app.js`**, so all sixteen modules and their `<style>`
  tags load on every page of the site. Sixteen small style elements, measured as
  noise; the alternative was a second import in every page that wants a card.
- **A tooltip or a menu panel is out of flow**, so an ancestor with
  `overflow: hidden` clips it — `.demo` is one.

The long record — the ladder per component, the nine findings the set produced,
and what was dropped — is in `doc/record.md` beside this file.
