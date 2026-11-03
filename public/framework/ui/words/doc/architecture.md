# Config words architecture — a word sets custom properties and nothing else

A config word is a class on a section (`ui-contrast`, `ui-compact`) that re-skins every ui template inside it. Entry: [`words.js`](../words.js), demo [`page.js`](../page.js); see the [readme](../readme.md).

## A word sets custom properties only
**Decided:** a word declares tokens (`--ink`, `--pad`, `--gap`, ...) and never element selectors, component classes or `!important`.
**Why:** templates already read the tokens, so a new word costs each component zero lines, two words compose by inheritance, and a word is safe on `<html>`, `.app` or one card.
**Instead:** per-component overrides, which would touch twenty templates per word and start specificity fights.
**Detail:** header comment in [`words.js`](../words.js)

## Words live in `@layer theme`
**Decided:** both words sit in the `theme` layer, not `util`.
**Why:** utilities read the tokens (`.pad { padding: var(--pad, 1em) }`), so there is no specificity war, and a later site theme can still beat a word.
**Instead:** `util` layer, which would make a word harder for a theme to override.
**Detail:** [`words.js`](../words.js)

## A word can replace a token, never scale one
**Decided:** words state only tokens nothing else declares; `--radius` (theme-owned) is not touched.
**Why:** `calc(var(--radius) * x)` is a self-reference and CSS drops the declaration; restating the value would overrule a theme's corner language.
**Instead:** a radius scale inside `.ui-compact`, measured as a no-op at best.
**Detail:** `⚠` comment in [`words.js`](../words.js)

## Density is one knob, not a class ladder
**Decided:** `.ui-compact` sets `--density` (default 0.5) and derives `--pad`, `--gap`, `--pad-cell`, `--pad-control` from it; `--density: 1` lands on the framework's numbers.
**Why:** one word and one number replaces a micro/mini/small ladder to argue about. Font size is left alone: shrinking it is `zoom`, a different word.
**Instead:** named size classes, or scaling `font-size` (which shrinks the reading too).
**Detail:** [`words.js`](../words.js)

## Contrast is alpha bumps and a mix, naming no hue
**Decided:** `.ui-contrast` swaps `--ink`, `--subtle`, `--line`, `--wash`, `--tint` with `light-dark()` values and mixes `--prime-ink` toward `--ink`.
**Why:** one word covers light and dark, and a retinted `--prime` gets a matching contrast word free.
**Instead:** fixed hex palettes per theme.
**Detail:** [`words.js`](../words.js)

## `--flow` is set on the flow root by a selector
**Decided:** `.ui-compact :where(.flow, blockquote)` (and the self form) sets `--flow` directly.
**Why:** `framework.css` declares `--flow` on each flow root, so an inherited value is overwritten; specificity (0,1,0) beats that (0,0,0).
**Instead:** setting `--flow` on the word alone, which silently kept the 2em rhythm.
**Detail:** [`words.js`](../words.js)
