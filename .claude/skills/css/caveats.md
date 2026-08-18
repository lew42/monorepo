# CSS caveats — what has bitten

One line each. Read the one that seems to apply; the detail is where the link points.

- **An unlayered rule beats every layer** at any specificity. Everything goes in a layer.
- **A layer name outside `base theme site util`** is appended last, past `util`, silently. `styles/readme.md`.
- **Overriding a `framework.css` rule is a bug report about `framework.css`** — de-escalate upstream (flatter selector, `:where()`, a token); never `!important` downstream. `styles/readme.md`.
- **Base-theme selectors stay flat** (one element, no descendant combinators) or a theme's `h2` can never win. `framework.css` header comment.
- **`page-<slug>` is stamped on every page**, so a module class `page-<x>` collides with any route slug `<x>` — `.page-catalog` broke the catalog Doc page. Guard every rule, not one. `ext/catalog/catalog.css`.
- **`.page.full` zeroes `--measure` and `--page-pad`**, and the title renders outside `content()`. `layout/caveats.md`.
- **A container query cannot restyle its own container**; the rule goes on a child. `layout`.
- **framework.css's `max-width: 100%` on media** clamps an iframe you meant to be wider (it clamped `frame()` at 3440). `ext/DesignTool/readme.md`.
- **A util-layer `:first-child { margin-top: 0 }`** beats a component's top margin — it is the highest layer.
- **A backtick anywhere inside `` css(`…`) ``** — even in a CSS comment — kills every page. `node --check` a copy as `.mjs` before trusting the browser.
- **`**/` closes a block comment** in a `.css` file too.
- **A stylesheet loaded before framework.css** in a hand-written html file: link `/framework/framework.css` first (`fly/index.html`).
- **A reset rule only resets what it names.** `pre > code { padding: 0; background: none }` did not reset the `box-shadow` later added to `code {}`, so the inline hairline drew a light rectangle inside every dark code block — for four hours, on every page with a sample. **Adding a property to a base rule? Grep for the rules that reset it.** One element can live in several very different contexts; see the CSSDoc work, `ai/2026-08-18/cssdoc/`.
- **Never split a `selectorText` on `,`** — `:is()`, `:where()`, `:not()` and `:has()` contain commas. `:where(p, li, td, th, dd, blockquote, .md) a:visited` shreds into seven fragments, nothing throws, and the output looks plausible. Split at paren depth 0; strip `::pseudo` after, not before.
