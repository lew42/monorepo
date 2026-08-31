# The program — several topics, dug continuously, one front

A **topic** (`verbs.js`, `Research.js`) is one question, argued by minions to a
verdict, then closed. A **program** is the other shape the same job takes:
several subjects dug in parallel, nobody arguing to a close, each minion
appending to its own file. Added 2026-08-30, wired to a live run of four.

```
public/imagine/research/
  page.js                  new Program({ topics: "stone depictions disclosure theories" })
  stone/log.jsonl          one topic, one append-only file, one owner
  stone/page.js            the minion's own page, if it wants one
  stone/*.md              its curated pages — already pages, no declaration
```

One line is the entry itself, with no verb key:

```json
{"at":"…","topic":"stone","kind":"finding","title":"…","summary":"…","url":"…","credence":"contested"}
```

`kind` — `finding` `source` `theory` `opinion` `question`. `title` ≤ 140,
`summary` ≤ 700. The schema is `entries.js`, browser and Node, exactly as
`verbs.js` is for a topic; the writer is `entry.mjs`.

## Credence is the backbone

Four words, ordered by how much stands behind them, and they are claims about
**who agrees and what can be checked** — not a confidence slider:

| | |
|---|---|
| `established` | mainstream consensus, checkable against a source |
| `contested` | specialists disagree — the evidence cuts both ways |
| `fringe` | argued outside the mainstream, by someone who names their evidence |
| `speculation` | nobody has evidence — a possibility, written down |

The presentation must never flatten one into another, so each carries the
difference **three ways at once**: hue (`--ok --warn --hot --subtle`), border
texture (`solid dashed dotted double`) and the printed word with its promise as
`title`. Texture is not decoration — it is what survives greyscale, a
screenshot on a projector, and a reader who does not see the hue difference.
`speculation` is also the one credence that changes the TYPE, to italic.

⚠ **The page never upgrades a credence.** Repetition is not evidence; a claim
appearing in three topics is three `speculation` entries, not a promotion.

## Tolerant reader, strict writer

`entry.mjs` refuses an illegal line with a reason and exit 1 — the same bargain
`research.mjs` keeps. The **reader does not**: everything parseable reaches the
page carrying `bad` (why the schema refuses it) and `notes` (why it is weak),
and the page prints both on the card.

A reader that dropped an illegal line would hide the defect it exists to show.
So the arithmetic holds and is printed at the foot: **entries + unreadable
lines = the files' line count**. Verified 2026-08-30 against the live run —
`wc -l` over the four logs read 175, and the page read 175.

`entry.mjs <log> --check` is the same validation over a file that already
exists, with line numbers. Run it before handing a log over.

## What the front does not do

- **It does not join an `opinion` to the `theory` it assesses** — the schema
  has no field for it, so the theories board groups by topic and says so.
  Adding a `parent` would be the natural next move, and would make the board a
  claim-and-rebuttal pair instead of two lists side by side.
- **It does not rank — but it does cap.** The stream is chronological and the
  board is grouped; nothing is sunk by quality, because a program has no
  orchestrator to rank it. Importance and votes belong to the topic shape, where
  a verdict is coming. What the front does instead is show the NEWEST few:
  `board_cap` theories per topic (4) and `cap` stream entries (20), each with
  the count of what is not shown and a link to the topic's own page. Measured
  2026-08-30: uncapped, the board alone was 35 cards and 10.8 screens with the
  stream's 9 below it — 20.6 screens of front. Capped: 9.4.
- **It does not crawl.** Topics come from the `topics:` string; whether a topic
  has a page comes from `directory.json`. A topic dir with neither a log nor a
  page renders as "no log yet" and costs nothing.

## Traps

- ⚠ **A `Page` subclass may not have a method named `card()`.** `Page.nav()`
  reads `this.card` as the extra classes for this page's preview and hands it
  to `.ac()`; a method there throws `arg.split is not a function` — on the
  PARENT's card wall, not on this page, which is where the hour goes. `topic()`
  is taken by core too. Cost an hour, 2026-08-30.
- ⚠ **A method may not share a name with a config field.** `topics()` was
  silently replaced by the `topics:` string in the constructor's
  `Object.assign`. In an assign-based codebase every method name has to miss
  both lists.
- ⚠ **Do not probe `<topic>/page.js` with a fetch.** Four topics that have not
  started answer with four console 404s, on a page whose normal state is that
  they have not started. `directory.json` answers all four in one request, and
  also names the `.md` files each topic has curated.
- ⚠ Under a columns host a deep url renders its ancestors too — two `Program`s
  are on screen at once, so anything measuring the page must scope per
  `.research-program` root, not `querySelector`.
