# ai2 — AI 2, an overview first, then a list on the left and one page on the right

One page at [`/framework/ai2/`](/framework/ai2/). **The default view is an overview** — four
columns by importance: needs you (flagged or blocked, cleared per item), reports (the
mastermind's own notes and write-ups), landed (recent task landings), and live (what Servex is
running now, the usage windows, the last few events). Nothing pushes the top of a column down —
a new arrival waits behind a small pill.

Click "Open the full inbox →" (or any card in the overview) and the SECOND view takes over: a
narrow rail down the left previews every card there is, newest first, with a one-line box you
talk to at its top. Click one and it opens on the right, at its own url, and stays there: the
list keeps filling behind it and nothing you are reading moves. "← overview" goes back.

**A card you talk into.** `+ New card` puts an empty card on the board, opens it and starts
listening. While a card is open, everything you say or type goes INTO it — each sentence carries
`re: <that card's id>` and lands in its transcript footer, pinned to the bottom of the page,
where the words never disappear and never move. With nothing open, a sentence starts a new card
as before. Every row says who it came from; `you` is marked.

**Every card is a chat.** The bottom of a card's page is its conversation: what you said, and
every reply — from the fast assistant, from a helper it started, or from a task mastermind
working on it. Only one microphone is on at a time; pressing one stops the other.

**The Live card** ([`live/`](/framework/ai2/live/)) is the one card that is not on the board: the
usage limits (5-hour, weekly Fable, weekly all, each with the first dashboard's on-pace ▼), every
agent Servex is running, and today's open tasks, all in one column that scrolls as one. It rises
to the top of the rail whenever any of that changes. Its chat is the log of those changes, and
anything you say there reaches the assistant along with the list of what is running. The ✕ on a
task clears it until it changes again; running agents have none. A task spoken while dispatch was
paused shows "not started": the Dispatcher never replays it, so say it again. **Click a running
agent** and its conversation opens right under its row — what it said, live — with a box that
sends it a message (`POST /api/agents/<id>/message` on Servex); click the row again to close it.

**Nothing jumps**, and that is three mechanisms, not one:

1. The card on the right is a **separate routed page** from the list, so a card arriving cannot
   touch it.
2. The rail and the page each **scroll inside themselves**; the window never scrolls.
3. A new row only enters the list **when the list is quiet** — at the top, pointer elsewhere.
   Otherwise it waits behind a floating "3 new cards ↑" pill and nothing moves until you press it.

It replaces the v3 board (`ai/v/3/`), which is not touched or imported from here.

**A card's table of contents, and a third column.** A card's own page lists its sub-cards —
every task, proposal, refined reading and transcript paragraph in its own log, each one a row.
Click a row and it opens beside the card, in a third column, at its own address; talk into it
and the sentence carries `re: "<card>/<sub>"`. A back link closes it. Two columns split the
screen when nothing is open, three when a sub-card is.

## Use

Nothing to call. The page mounts itself; open the url. A card's own url is
`/framework/ai2/<id>/` — paste it, reload it, press Back; the url is the truth. A sub-card's is
`/framework/ai2/<id>/<sub>/`, one level deeper.

To draw a card from anywhere, append a line to one of the logs it reads:

```js
// a card on the board — later lines with the same `id` update it in place
{"card": {"id": "my-task", "title": "…", "text": "…", "icon": "bolt", "links": [{"url": "/…/", "label": "Task page"}]}}
// a card that reads as an explanation for the owner, not a report of work
{"card": {"id": "my-note", "title": "Note: why the reload held", "text": "…"}}
```

## Watch out

- **An agent's words reach a card only through the card's own log, `cards/<slug>`.** The fast
  assistant writes to `prompts`; until 2026-09-23 nothing copied its replies across, so it
  "could not respond". Any agent can speak into a card with the `card_reply` MCP tool.
  [`doc/logs.md`](./doc/logs.md).

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
- **A region's own visibility rule has to test `:is(.active-page, .active-ancestor)`, not
  `.active-page` alone**, the moment a page can stay mounted without being the true leaf — a card
  page does, once a sub-card opens beside it in the third column. Missing the ancestor case
  reintroduced `.ai2-empty` above a still-showing card and pushed its whole content down by its
  own height; every measured field still read "unchanged" because nothing in the CONTENT moved.
- **A card's own event log is `cards/<slug>`**, Servex-owned, not a repo file — `ai/cards/<slug>/`
  (a real directory, only once a card gets a page) is a different thing: the card's STATE, not
  its stream. `doc/persistence.md` has the whole split.

## More

- [`doc/decisions.md`](./doc/decisions.md) — every fork in the road, with the alternative named
- [`doc/logs.md`](./doc/logs.md) — every log this page reads, and the ones it writes
- [`doc/persistence.md`](./doc/persistence.md) — the survey: what each persistence system on this
  site saves and where, and which one a nested card page uses
- The rebuild and its measurements: [`ai/2026-09-22/ai2-master-detail/`](/framework/ai/2026-09-22/ai2-master-detail/)
- Per-card storage, sub-cards, the footer: [`ai/2026-09-22/ai2-nested/`](/framework/ai/2026-09-22/ai2-nested/)
- Files that matter: `page.js` (the shell, the selection, the third column), `card.js` (a card
  and a sub-card, small and whole, plus the table of contents), `inbox.js` (what there is to
  draw, and the per-card log), `compose.js` (the box you talk into), `ai2.css` (the look)
