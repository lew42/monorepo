# cols-lab — 2- and 3-column layouts at every resolution

## The ask (owner, verbatim, 2026-08-30)

> In our layout explorations, we need to thoroughly explore 2 and 3 column layouts, at all
> resolutions. the flex.auto system that breaks at a specified place might not work so well
> for 3440 2 and 3 columns.

## Scope

`public/framework/styles/layouts/cols/` — beside `space/` and `wire/`, the layouts tier.

1. **The indictment** — today's `.flex.auto` + `--column` rendering the same 2-col and 3-col
   intents at 400 / 1280 / 1920 / 3440, measured. Numbers that prove or refute the suspicion.
   Where `.flex.auto` is fine, say so.
2. **The word set** — a small `cols` vocabulary in the lab's own css: percentage bases per the
   decks finding, a container-query stack floor, a floor AND a ceiling on every track.
3. **The matrix page** — every word x every resolution, browsable, with measured px.
4. **The adoption note** — which words earn framework.css, with usage evidence from the site.
   NO framework.css edits this task.

## Stands on (read, do not rebuild)

- `.claude/skills/layout/SKILL.md` Q3 — every flexible word sets `flex-grow: 1`.
- `styles/layouts/wire/doc/bento.md` — the 2:1 seam, and the `--column` decay 2.00 -> 1.17.
- `/imagine/decks/` — `flex: 61.8 1 0` reads 1.527, a percentage basis reads 1.618.
- `core/Page/doc/findings.md` — of the five content kinds, only a nav list does not scale.

## Fence

`public/framework/styles/layouts/cols/**`, the one `cols` entry in `styles/layouts/page.js`
BANDS, and the `cols-` prefix line in `styles/css-scopes.txt`. Nothing else.
