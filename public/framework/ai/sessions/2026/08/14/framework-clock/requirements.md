# framework-clock

## The ask (verbatim)

> add the Panel: clock element to the /framework/ page, this is badass.

## Reading

`clock` is one of the eight **experiences** in the `ext/Panel` T vocabulary
(`ext/Panel/templates.js`): a live `HH:MM:SS` in tabular numerals over a long
date, scaled by container queries so it fills whatever panel it lands in. It is
already the most striking thing in the vocabulary and currently only reachable by
opening a workspace and picking `clock` from a `T` menu.

`/framework/` (`public/framework/page.js`) is the site's front door — a **layout**
page: sidebar + `.pages`, whose landing content is h1, prose, `stats()`, a code
sample, `walls()`, then closing prose.

## Scope

- Put a **live** clock on the `/framework/` landing, between the intro block and
  `walls()`.
- Use `ext/Panel`'s own door (`panel(fn)`), not a new preview/frame helper — the
  five-block rule: the panel *is* the block, and the chrome is the advert (hit `T`
  and the front door becomes the whole vocabulary).
- One line of prose beneath it, linking to `/framework/ext/Panel/`.
- Verify at 1280 / 1920 / 3440, light and dark.

## Not in scope (phase 2)

- Persisting what a visitor picks (`panel()` deliberately has no saver).
- A clock template variant (12-hour, timezones, seconds off).
- Touching `templates.js` — the clock ships as-is.

## Proposal / steps

1. Read the seam — `panel()`, `paint()`, `templates.clock`, the landing's tracks.
2. Decide the band: track (`bleed`), height, and what it does with 3440.
3. Wire it into `public/framework/page.js`.
4. Render and screenshot at 1280 / 1920 / 3440.
5. Fix what the screenshots show.
6. Land — readme/log, verify no console errors on the front door.

## Files owned

- `public/framework/page.js` (edit)
- possibly `public/framework/ext/Panel/panel.css` (only if the band needs a token)

No agents; this is a single-seam edit.
