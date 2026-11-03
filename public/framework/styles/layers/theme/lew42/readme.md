# lew42 — the house theme: Montserrat, one orange, `light-dark()` tokens; a class you put on anything

## Use
```js /app.js
import { lew42 } from "/framework/styles/layers/theme/lew42/lew42.js";
new App({ config(){ lew42(this); } });   // fetches Montserrat + Material Icons before first paint
div.c("app theme-lew42", …);             // body-level themes the site; `div.theme-lew42` themes one box
```

## Watch out
- `.theme-lew42` on `.app` itself loses to `@layer site` (`/styles.css`) — flipping the site was one class **plus** deleting the superseded token block; the only symptom is a code box in the wrong palette. [doc/decisions.md](./doc/decisions.md)
- No selector here names a component; when one wants to, that component is missing a token and the fix goes there. [doc/port.md](./doc/port.md)
- The dark column is derived, not designed — overwrite it; `--bg` and `--code-ink` stay dark in both modes on purpose. [doc/decisions.md](./doc/decisions.md)
- `.theme-lew42 h1` is (0,2,0) and out-ranks any component rule that sizes a heading — a fight is a bug in that component. [doc/decisions.md](./doc/decisions.md)
- Fonts are a seam: `--font: Montserrat` is declared here, the file is fetched by `app.font()`; an `@font-face` here would flash system-ui at 900. [doc/decisions.md](./doc/decisions.md)
- Behaviour is a plain exported function the site calls — never triggered by the class appearing, because a theme renders more than once per page. [/framework/doc/theme-behaviour.md](/framework/doc/theme-behaviour.md)
- The base font was `clamp(16px, 2vw, 20px)` — pinned at 20px on every desktop; it is `rem + vw` now, 16px through 1440. [doc/decisions.md](./doc/decisions.md)
- Type scale is a rule block on `h1`–`h6`, not eight tokens; heading rhythm is `--flow` in `em`, argued three times. [/framework/core/Page/doc/css.md](/framework/core/Page/doc/css.md)

## More
- [Overview](/framework/styles/layers/theme/lew42/) — both modes, the two-token sidebar, groups and icons.
- [`doc/decisions.md`](./doc/decisions.md) — the Figma-port verdicts, the traps in full, the font-size arc, what wasn't built.
- [`doc/port.md`](./doc/port.md) — what of a screen is a theme, the token renames, divergences from the comp.
- `doc/file/*.md` — one note per file, rendered by the page's `files:`.
- Files that matter: `lew42.css` (tokens, type scale), `lew42.js` (the font call), `page.js` (the demos).
