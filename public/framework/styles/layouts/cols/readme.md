# Columns

Six words for a 2- or 3-column row, and the measurements that argue for them.

The claim: **`.flex.auto` is a wrap threshold and a column layout is a ratio.** Different
questions. `.flex.auto` answers the first one well and the second one only by accident.

## Use

`div.c("cols-row cols-two-one", …)` — the row plus one word. Six of them:

| word | ratio | floor |
|---|---|---|
| `cols half` | 50 / 50 | 34rem |
| `cols-golden` | 61.8 / 38.2 | 34rem |
| `cols-two-one` | 2 : 1 | 34rem |
| `cols main-aside` | 68 / 32, aside capped at `--cols-aside` (26rem) | 34rem |
| `cols-thirds` | 1 : 1 : 1 | 52rem |
| `cols-rail-main-aside` | `--cols-rail` (16em), then 70 / 30, aside capped at 22rem | 60rem |

`half` and `main-aside` promoted to framework.css 2026-08-31 — [adoption](doc/adoption/) has the migration.

Tokens: `--cols-floor`, `--cols-aside`, `--cols-rail`, and `--gap` as everywhere else.

## Watch out

- **A share bounds the TRACK, not the measure.** `cols-half` at 3440 is two 1490px
  columns; prose in one still wants `.measure`.
- **The floor is `rem` and the rail is `em`, deliberately.** A floor is a place, so it
  must not move with the viewport; a rail holds type, so it must.
  ([Words](/framework/styles/layouts/cols/doc/words/))
- **`.flex.auto` is still right for a wall of tiles** — that is what a wrap threshold is
  for. Reach for a word here only when the row is a named ratio.

## More

- [Indictment](/framework/styles/layouts/cols/doc/indictment/) — what `.flex.auto` measures at four widths, and
  the three things it cannot say.
- [Words](/framework/styles/layouts/cols/doc/words/) — the one rule, and why a percentage basis rather than a
  zero one.
- [Adoption](/framework/styles/layouts/cols/doc/adoption/) — the hand-rolled rows on the site today, counted,
  and which words earn `framework.css`.
- [Matrix](/framework/styles/layouts/cols/matrix/) — every word at 400 / 1280 / 1920 / 3440, live.
