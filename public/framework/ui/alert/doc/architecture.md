# alert architecture — markup and one token, no component

`alert` is a callout: a padded card with a coloured left edge. It is not a function. The markup is written by hand from a template in [`page.js`](../page.js), and the look comes from six lines of CSS in [`alert.js`](../alert.js). The page is at [/framework/ui/alert/](/framework/ui/alert/).

## There is no `ui.alert()`

**Decided:** an alert is markup (`div.c("ui-alert card flex gap accent", …)`), not a function call.
**Why:** the old export had only one job, `if (glyph)`, and two real faults: a bare `alert` shadows `window.alert`, and `alert("msg")` failed silently because the first argument was read as an icon name.
**Instead:** a `ui.alert(glyph, message)` helper. It would hide the markup, and the two faults would come back with it.
**Detail:** [the page, exhibit note](/framework/ui/alert/)

## The tone is a class, and the class names a token

**Decided:** a tone is a class (`accent`, `error`) whose CSS reads a theme token. The markup holds no colour.
**Why:** a token retunes with the theme, so an alert works in a theme it has never seen.
**Instead:** an inline colour or a `tone:` option. Either one puts colour into every call site, so a theme change would miss some of them.
**Detail:** [alert.js](./alert.js), tones demo on [the page](/framework/ui/alert/)

## Two tones, because the token set has two

**Decided:** only the default (`--line`), `accent` (`--prime`) and `error` (`--error`) tones exist.
**Why:** `framework.css` defines one accent and one error colour. It defines no `--ok` or `--warn`.
**Instead:** add a tone by adding a token, then two lines in `alert.js`. No tone option is needed, since a class is already the mechanism.
**Detail:** [framework.css](../../../framework.css) (the tokens)

## Import the module that emits the class you style

**Decided:** `alert.js` imports `View.js`, though it emits no code itself.
**Why:** its CSS styles `> .icon`, a class that `icon()` in `View.js` emits. Without the import, the rule loads before its class exists.
**Instead:** copy the icon class into `alert.js`, which would drift from `icon()` the first time it changed.
**Detail:** the comment at the top of [alert.js](./alert.js)

## Cards and rows, not a dismiss state

**Decided:** an alert has no close button, no title option and no state. Anything extra is a utility class or a button placed in the markup.
**Why:** a callout is a card with a coloured edge, and every other part is already a utility.
**Instead:** a stateful alert component, which would need its own API for each new use.
**Detail:** the `action` demo on [the page](/framework/ui/alert/)
