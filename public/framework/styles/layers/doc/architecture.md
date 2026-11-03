# Layers architecture — four cascade layers, declared once

`styles/layers/` is the four-layer CSS strategy as a readable module: its pages show the one `@layer` line and the rules that come with it. The line itself lives in [`framework.css`](/framework/framework.css), the first stylesheet `app.js` loads. The layers are `base`, `theme`, `site`, `util`, in that order.

## One `@layer` line, in `framework.css`

**Decided:** `framework.css` holds the only `@layer base, theme, site, util;` statement; every other rule just names its layer.
**Why:** the first `@layer` statement fixes the order for the whole document, and `app.js` puts `framework.css` first in `<head>`.
**Instead:** each stylesheet restating the order, which drifted.
**Detail:** [cascade.md](/framework/styles/doc/cascade.md)

## A new layer name goes in that same line

**Decided:** a layer name outside `base theme site util` is added to the one line in `framework.css`, never first used in a component file.
**Why:** a name first seen later is appended after `util` with no warning, so it wins the wrong fights silently.
**Instead:** a layer declared in each file, which only works if that file loads first.
**Detail:** [cascade.md](/framework/styles/doc/cascade.md)

## Every rule sits inside a layer

**Decided:** every rule sits in a named layer; none is written unlayered.
**Why:** an unlayered rule beats every layer at any specificity, which defeats the whole order.
**Instead:** unlayered rules as a last resort, the most expensive rung on the ladder.
**Detail:** [decisions.md](/framework/styles/doc/decisions.md)

## Escalate upstream only, never downstream

**Decided:** a fix moves toward the layer it belongs in, rather than climbing to a stronger rung for everyone after it.
**Why:** each cascade tool (specificity, a layer, unlayered, `!important`) can be used once; spending one raises the cost for every later rule.
**Instead:** `!important` or unlayered CSS, which are cheap today and block every later fix.
**Detail:** [cascade.md](/framework/styles/doc/cascade.md#13-escalation-is-a-ratchet--the-site-layer)

## The four layers

- **`base`** — the reset (browser defaults that are wrong). Loses to everything. Page: [base](/framework/styles/layers/base/)
- **`theme`** — tokens and the default look. A theme you load replaces it. Page: [theme](/framework/styles/layers/theme/)
- **`site`** — `/styles.css`, this site's skin; beats the framework at any specificity. Page: [site](/framework/styles/layers/site/)
- **`util`** — opt-in classes such as `.pad`; wins because you asked for it. Page: [util](/framework/styles/layers/util/)

## Watch out

- The `layers/` pages have no stylesheet of their own, so they render under the same order they teach.
- No `page.js` `notes:` list exists in this module yet, so this doc is linked from the readme only.
