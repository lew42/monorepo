# ai2 — AI 2, a list on the left and one page on the right

One page at [`/framework/ai2/`](/framework/ai2/). A narrow rail down the left previews every
card there is, newest first, with a one-line box you talk to at its top. Click one and it opens
on the right, at its own url, and stays there: the list keeps filling behind it and nothing you
are reading moves.

**A card you talk into.** `+ New card` puts an empty card on the board, opens it and starts
listening. While a card is open, everything you say or type goes INTO it — each sentence carries
`re: <that card's id>` and lands in its transcript footer, pinned to the bottom of the page,
where the words never disappear and never move. With nothing open, a sentence starts a new card
as before. Every row says who it came from; `you` is marked.

**Nothing jumps**, and that is three mechanisms, not one:

1. The card on the right is a **separate routed page** from the list, so a card arriving cannot
   touch it.
2. The rail and the page each **scroll inside themselves**; the window never scrolls.
3. A new row only enters the list **when the list is quiet** — at the top, pointer elsewhere.
   Otherwise it waits behind a floating "3 new cards ↑" pill and nothing moves until you press it.

It replaces the v3 board (`ai/v/3/`), which is not touched or imported from here.

## Use

Nothing to call. The page mounts itself; open the url. A card's own url is
`/framework/ai2/<id>/` — paste it, reload it, press Back; the url is the truth.

To draw a card from anywhere, append a line to one of the logs it reads:

```js
// a card on the board — later lines with the same `id` update it in place
{"card": {"id": "my-task", "title": "…", "text": "…", "icon": "bolt", "links": [{"url": "/…/", "label": "Task page"}]}}
// a card that reads as an explanation for the owner, not a report of work
{"card": {"id": "my-note", "title": "Note: why the reload held", "text": "…"}}
```

## Watch out

- **Content never needs a reload; the page's own modules do.** All four logs stream — three over
  the dev socket, the owner's sentences over Servex's `EventSource`. The only thing that still
  reloads this page is an edit to `page.js`, `card.js`, `inbox.js` or `compose.js`, because a
  changed ES module cannot be re-imported over the old one with no build step. **So a minion
  editing AI 2 works in a worktree** and lands one patch at the end — otherwise every save
  throws away the owner's scroll position while they are using the page.
- **`leaf: true` on the page is load-bearing.** `route()` memoises each card page into
  `children`, and the site's sidebar walks that map — without it every card you open becomes a
  row in the nav rail.
- **Nothing marks a card read.** Opening one used to write a `read` line; it does not, and the
  `read` lines already in `verdicts.jsonl` are not replayed, so every card is unread. Deliberate
  — looking at a thing is not a decision about it.
- **`display: none` cannot hide anything wearing a utility class.** `@layer util` beats
  `@layer theme` at any specificity, and the composer's popover — which is `ux/Dictate`'s own
  `flex` markup, moved — stayed laid out and invisible over two buttons that then took no
  clicks. `visibility` + `pointer-events` is the escape when the markup is another module's.
- **A grid region must name its own row** if any sibling can be `display: none` at some width,
  or the rest shift up one and the numbers all still say "unchanged".
- **A card's `id` is its identity for good.** A flag is attached to it, and so is every sentence
  spoken into it. An entry with no id of its own gets one from its timestamp, never its
  position in the log.
- **The rows must not change height**, or the list can move under the pointer: a preview is a
  clipped title line and one clipped body line, and the unread dot keeps its space when hidden.
- **`refill()` compares the card's WHOLE record**, not a hand-written list of the fields the face
  draws — the first build listed them, forgot one, and the feature silently never rendered.
- **Servex may be down.** Then the prompt backlog comes from the static `prompts.jsonl`, and the
  page says the assistant is off. Nothing throws.

## More

- [`doc/decisions.md`](./doc/decisions.md) — every fork in the road, with the alternative named
- [`doc/logs.md`](./doc/logs.md) — the four files this page reads and the one it writes
- The rebuild and its measurements: [`ai/2026-09-22/ai2-master-detail/`](/framework/ai/2026-09-22/ai2-master-detail/)
- Files that matter: `page.js` (the shell and the selection), `card.js` (a card, small and whole),
  `inbox.js` (what there is to draw), `compose.js` (the box at the top), `ai2.css` (the look)
