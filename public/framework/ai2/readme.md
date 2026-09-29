# ai2 — AI 2, a list of cards on the left and one card's page on the right

**What this page is FOR** (the owner, 2026-09-25): "get my dictations summarized and
timestamped. The timeline should help me understand what came first, what came next, and what's
in flight. As I dictate, I need to see my words transformed into useful, concrete, structured
outlines, using these cards." Every change here is judged against that sentence.

**What you have asked of this page, word for word, and whether it is done:
[`doc/owner-asks.md`](./doc/owner-asks.md).** Read it before changing the layout.

**Handover, 2026-09-25 (the AI 2 lead).** Start here if you are the next agent on AI 2.

- **What it is now**, one step per screen: [AI 2, step by step](/framework/ai/2026-09-25/ai2-lead/).
  Why each element is there: [audit.md](/framework/ai/2026-09-25/ai2-lead/audit.md). Decisions:
  the last two sections of [`doc/decisions.md`](./doc/decisions.md).
- **Done:**
  - The rail is one timeline, sorted by last-updated. Each row shows its time top-right and has
    no repeats.
  - Bars are short and say what they count. A card shows a To do · Delivered · All grid over one
    list, with to-do first.
  - Actions menu; tabs only when Tasks has something; Live's assistant is one row.
  - Usage bars show time left.
  - A `{"type":"focus","ref":…}` line on the `cards/live` log opens that card on every AI 2 page.
- **Done, 2026-09-25:** a resurfaced row shows a one-line "what happened" bar; clicking it
  opens the card's Activity tab (`…/<card>/activity/`: every card tab is a routed child page now), and the bar
  clears once seen. [`doc/cards.md`](./doc/cards.md), `activity.js`.
- **Done, 2026-09-28** (lead-2): a group row keeps its place after a reload
  ([ai2-row-vanish](/framework/ai/2026-09-28/ai2-row-vanish/)); an inbox row can be a real site page,
  Page and Servex so far: any log line with `"page": "<path>"` bumps it, and it opens at
  `/framework/ai2/framework/core/Page/` (`real.js`, [ai2-real-pages](/framework/ai/2026-09-28/ai2-real-pages/));
  the Floating page view is behind the "Floating page view (try it)" word, shown only on cards it
  changes (`floating.js`, `workspace.js`); a card's own `content.js` ([doc/cards.md](./doc/cards.md));
  rail rows use the default card padding and one cadence ([ai2-rail-rhythm](/framework/ai/2026-09-28/ai2-rail-rhythm/)).
- **Done, 2026-09-29** ([ai2-overview](/framework/ai/2026-09-28/ai2-overview/)): the Inbox · Overview
  tabs, and the [Overview](/framework/ai2/overview/), with one big card per concept.
- **Open, first — the Overview's next steps.** (1) `overview.json` is a snapshot. Rebuild it with
  `node Server/ai2-overview.mjs` from the main tree, since `.claude/prompts` exists only there. Nothing
  rebuilds it when a task lands yet; a finish-task step or a Servex route would. (2) Only about 3% of
  quotes are proven to be the owner's own words (`owner: true`). A task's session is usually an agent's,
  not the one the owner spoke in. Tracing a task to the card it came from would fix most of the rest.
  (3) About 150 tasks match no concept. (4) Page is the catch-all: about 400 tasks.
  `ui/section` belongs to task-mastermind-section-variants. Card weight, when wanted, is a
  `{"weight": 1|2|3}` line (the latest wins; missing means 2; the organization task's rule).
- **Open, later:** remove the composer at the bottom of a card once page-drawer's `into_card` is merged
  (the drawer's AI tab holds it). The drawer following a real page is called but not yet seen in a
  picture. The list filter is not in the url. The chat's `···` and `⚙` have no labels. Tasks in class
  folders: [proposal](/framework/ai/2026-09-28/ai2-real-pages/proposal-tasks.md), mastermind-servex-3's call.
- **Landing, a caveat:** `Server/merge.mjs`'s link-following smoke fails on pages the Live panel links
  (task pages throw `this[verb] is not a function`; page-drawer's m1/m2 404). Not AI 2's; when only those
  fail, check that AI 2's files match the merge base and land by hand.

One page at [`/framework/ai2/`](/framework/ai2/). **The default view is Needs you** (2026-09-29,
see above); the inbox — a narrow rail down the left, with `+ New card` and its filters at its
top — moved to [`/framework/ai2/inbox/`](/framework/ai2/inbox/), one click in. Click anything in
the rail and it opens on the right, at its own url, and stays there: the list keeps filling behind
it and nothing you are reading moves.

**The rail leads with seven groups** (2026-09-24) — System design, Servex, AI dashboard, Pages &
markdown, Cards & content, Layout & columns, Audits — each an icon, a name, and the newest thing
that happened inside it, in full. The busiest group is on top. Click one and its card shows the
real task page of every task in it, newest first. Below the groups sits the Live card, then
**Not filed yet**, a fold holding every card no group holds. How a thing joins a group:
[`doc/groups.md`](./doc/groups.md).

**"Needs you" is the default view** (2026-09-29): one ranked list of every card still waiting on
you — an open Decision or Question, a card typed "question", or one whose own last message asks
you something — with its answer control right there, so you never have to open the card to answer
it. The inbox rail's own "Needs review" checkbox (`?review=1`) filters to the SAME rows. Both read
one shared rule: [`doc/needs-you.md`](./doc/needs-you.md), [`needs-rule.js`](./needs-rule.js).

**Three tabs under the title: Needs you, Inbox and Overview** (Needs you added 2026-09-29, see
just above). Inbox is the rail and a card's own page, described just below; the
[Overview](/framework/ai2/overview/) is one big icon card per concept (Servex, Page, View, App,
AI 2, Dictation, Research & Collab), each with its open asks and a folded "Completed (n)" line,
built from the task logs. How: [`doc/overview.md`](./doc/overview.md).

**A card you talk into.** `+ New card` puts an empty card on the board, opens it and starts
listening. While a card is open, everything you say or type goes INTO it — each sentence carries
`re: <that card's id>` and lands in its chat — the right-hand column on a wide screen, the
footer on a phone — where the words never disappear and never move
([`doc/columns-seams.md`](./doc/columns-seams.md)). With nothing open, a sentence starts a new card
as before. Every row says who it came from; `you` is marked.

**Every card is a chat.** The right-hand column of a card's page is its conversation: what you said, and
every reply — from the fast assistant, from a helper it started, or from a task mastermind
working on it. Only one microphone is on at a time; pressing one stops the other.

**What it cost.** Every group row shows what its tasks cost together, and every row that points
at a task shows that task's dollars (a "+" means an agent on it is still running). A group's
card opens with a table of its tasks, each split into mastermind and minions, and each task page
inside it says who spent it, agent by agent, with each model. The figures come from
`Server/task-cost.mjs`, which splits a shared mastermind by time so no dollar is counted twice
([`ext/AITask/doc/cost.md`](/framework/ext/AITask/doc/cost.md)). A card's page fills the whole
column; only its text keeps the reading width ([`doc/decisions.md`](./doc/decisions.md#cost-and-fill)).

**The Live card** ([`live/`](/framework/ai2/live/)) is the one card that is not on the board: the
usage limits (5-hour, weekly Fable, weekly all, each with the first dashboard's on-pace ▼), every
agent Servex is running, and today's open tasks, in one page that scrolls as one — split into columns on a wide screen ([`doc/columns.md`](./doc/columns.md)). It rises
to the top of the rail whenever any of that changes. Its chat is the log of those changes, and
anything you say there reaches the assistant along with the list of what is running. The ✕ on a
task clears it until it changes again; running agents have none. A task spoken while dispatch was
paused shows "not started": the Dispatcher never replays it, so say it again. **Click a running
agent** and its conversation opens in the agent column beside the list when the card is wide enough
(the column opens on `assistant-fast` by default), or takes over the card with "← Live" to go back
when it is not — what it said, live — with a box that sends it a message
(`POST /api/agents/<id>/message` on Servex).

**Nothing jumps**, and that is three mechanisms, not one:

1. The card on the right is a **separate routed page** from the list, so a card arriving cannot
   touch it.
2. The rail and the page each **scroll inside themselves**; the window never scrolls.
3. A new row only enters the list **when the list is quiet** — at the top, pointer elsewhere.
   Otherwise it waits behind a floating "3 new cards ↑" pill and nothing moves until you press it.

It replaces the v3 board (`ai/v/3/`), which is not touched or imported from here.

**A card has two tabs, and a third column.** The words: a *card* is a topic, a *request* is
one thing asked inside it (a sub-card), a *task* is what an agent does for a request. A card's
**Overview** tab shows what it is, where it stands and its summary; its **Tasks** tab lists its
requests, grouped under a heading per `{"group": "…"}` line, with the agents' task pages below.
The open tab is remembered per card. Click a request and it opens beside the card, in a third
column, at its own address; talk into it and the sentence carries `re: "<card>/<sub>"`. A back
link closes it. Details: [`doc/cards.md`](doc/cards.md).

## Use

Nothing to call. The page mounts itself; open the url. **A card is a folder** under
`ai/`, and its url on AI 2 is that folder's path: `/framework/ai2/2026/09/24/<slug>/`, a
sub-card one segment deeper, any depth. Paste it, reload it, press Back; the url is the truth.
An old id (`/framework/ai2/topic-xyz/`) still opens its card. `view/open/`, `view/today/`,
`view/all/` and `view/<tag>/` list cards by view. Each card is drawn by [`card.js`](./card.js),
a real `Page` built from the card's own `page.jsonl` — [`doc/cards.md`](./doc/cards.md).

**A card can draw anything:** put a `content.js` in its folder that imports any site modules and
renders them, and place it with `{"place": {"module": "content.js"}}` —
[`doc/cards.md`](./doc/cards.md#a-cards-own-contentjs), with a working example card.

**A real page is a row too** (2026-09-28). `/framework/ai2/framework/core/Page/` shows the real
`/framework/core/Page/` page (the same page and view, with its own tabs) in the detail column. A
line with `"page": "/framework/core/Page/"` in today's `day.jsonl` or a recent `task.jsonl` puts
that page in the rail, sorted by its newest event, with a "what happened" bar. No card is made.
`real.js`; how and why: [`ai/2026-09-28/ai2-real-pages/answers.md`](/framework/ai/2026-09-28/ai2-real-pages/answers.md).

**Try the workspace view** (an experiment, 2026-09-28): `?view=workspace`, or the `workspace`
word at the top of the rail. An opened card becomes a centred page with its own left nav
(`floating.js`). Off, nothing changes. [`doc/cards.md`](./doc/cards.md#the-workspace-view-an-experiment-off-by-default).

To make a card from an agent, use Servex's `create_card` tool, never a folder by hand. The
older way below still draws a card when Servex is down.

To draw a card from anywhere, append a line to one of the logs it reads:

```js
// a card on the board — later lines with the same `id` update it in place
{"card": {"id": "my-task", "title": "…", "text": "…", "icon": "bolt", "links": [{"url": "/…/", "label": "Task page"}]}}
// a card that reads as an explanation for the owner, not a report of work
{"card": {"id": "my-note", "title": "Note: why the reload held", "text": "…"}}
```

## Watch out

- **`card.js` stays lowercase.** It is the `Card` class, and every card's line 1 names
  `/framework/ai2/card.js`; a `./Card.js` import is a second module on Windows and a 404 on a
  case-sensitive host. The older board-card faces are `faces.js`. [`doc/cards.md`](./doc/cards.md).
- **A card is a folder, and only Servex writes into it.** Each card lives at `ai/2026/MM/DD/<slug>/page.jsonl`, dated by the day it was created. Agents make and read cards with the `create_card`, `read_card`, `attach_card` and `list_cards` tools, and speak into one with `card_reply`; never append to the file yourself. [`Servex/cards/readme.md`](/Servex/cards/readme.md), [`doc/persistence.md`](./doc/persistence.md).
- **An older Servex has no card routes, and AI 2 must not ask it.** Its `/cards` answer has no CORS header, so the browser logs an error nothing can hide. A Servex running the card code writes `{"cards": 1}` to its `features` log at boot; `cards_ready()` in `inbox.js` reads that once, and until it is true every card call returns null without a request — the rail reads `board.jsonl`, and the type picker, `clear` and `+ request` are hidden.
- **A group's time must be known on the first paint, or a reload hides it.** Any saved module the page imports reloads it, and a group whose time waited on its members' logs sorted to the bottom of ~350 rows for seconds, then jumped back — "it was there and then it wasn't". `Groups.at()` reads the card index (`cards.jsonl`) too, which arrives with the rail's first rows. Task log: [`ai2-row-vanish`](/framework/ai/2026-09-28/ai2-row-vanish/).

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
- **A preview is never clipped** (the owner, 2026-09-24: "render the whole thing as tall as it
  needs to be"), and never shows a slug or an id. What stops the list jumping is the pill: a
  new row, or a new group order, only lands while the list is quiet.
- **A group's `{"group": …}` line is not `assign.group`** (the older "effort"). A method called
  `group()` on a card or a task reader gets overwritten by that data — [`doc/groups.md`](./doc/groups.md).
- **A card's task page lives outside the box the card redraws** — rebuilt, it refetches and
  closes the tab you had open. `tasks.js`.
- **Every redraw compares before it draws** — a live batch that changed nothing here must mutate nothing (a flicker that "returns to the way it was"). `Card.draw_sig()`, `agents.js`, the index rows and the rail's `flush()`/`count()` each skip on an equal signature; [`task card-page-flicker`](/framework/ai/2026-09-24/card-page-flicker/) has the MutationObserver probe.
- **`refill()` compares the card's WHOLE record**, not a hand-written list of the fields the face
  draws — the first build listed them, forgot one, and the feature silently never rendered.
- **Servex may be down.** Then the prompt backlog comes from the static `prompts.jsonl`, and the
  page says the assistant is off. Nothing throws.
- **A region's own visibility rule has to test `:is(.active-page, .active-ancestor)`, not
  `.active-page` alone**, the moment a page can stay mounted without being the true leaf — a card
  page does, once a sub-card opens beside it in the third column. Missing the ancestor case
  reintroduced `.ai2-empty` above a still-showing card and pushed its whole content down by its
  own height; every measured field still read "unchanged" because nothing in the CONTENT moved.
- **Only the Live card keeps an old-style log** in Servex's out-of-git logs; every other card's history is in its folder.

- **No `bleed` on a page with no gutter.** `.page > .bleed` pays the page's padding back with a
  negative margin; the overview page has padding 0, so the payback slid its first column under
  the site sidebar with text at 0px (fixed 2026-09-24).
- **A size container re-bases every `cqi` inside it** — the spacing utilities (`gap-25`…) are
  `cqi` clamps, so turning a box into a container quietly shrinks the gaps of everything in it.
  Measure gaps before and after.

## More

- [`doc/card-standard.md`](./doc/card-standard.md): what every card shows, in order: its folder, its objects, its checklist, then words
- [`doc/groups.md`](./doc/groups.md) — the seven groups, how a thing joins one, how a group rises
- [`doc/owner-asks.md`](./doc/owner-asks.md) — every dashboard ask you made, 17–24 Sep, with its status
- [`doc/decisions.md`](./doc/decisions.md) — every fork in the road, with the alternative named
- [`doc/logs.md`](./doc/logs.md) — every log this page reads, and the ones it writes
- [`doc/columns.md`](./doc/columns.md) — how the Live card splits into columns on a wide
  screen, and how many levels of navigation fit at each width
- [`doc/persistence.md`](./doc/persistence.md) — the survey: what each persistence system on this
  site saves and where, and which one a nested card page uses
- The rebuild and its measurements: [`ai/2026-09-22/ai2-master-detail/`](/framework/ai/2026-09-22/ai2-master-detail/)
- Per-card storage, sub-cards, the footer: [`ai/2026-09-22/ai2-nested/`](/framework/ai/2026-09-22/ai2-nested/)
- [`doc/cards.md`](./doc/cards.md) — card folders: the addresses, `card.js`'s vocabulary, every write
- Files that matter: `page.js` (the shell, the selection, the third column), `card.js` (a
  card folder's own page), `faces.js` (a board card, small and whole, plus the table of contents), `inbox.js` (what there is to
  draw, and the per-card log), `groups.json` + `groups.js` (the groups and who is in them),
  `tasks.js` (a task's real page inside a card), `compose.js` (the box you talk into), `ai2.css` (the look),
  `floating.js` (the Floating page layout: a left nav beside a centred page; no AI 2 imports),
  `workspace.js` (the `?view=workspace` switch), `real.js` (a real site page shown in the detail column, and its rail row)
