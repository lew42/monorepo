# The logs it reads, and the ones it writes

**None of them ever reloads the page.** Three stream over the dev socket line by line as they
are appended; the fourth, the owner's own sentences, comes over Servex's `EventSource`. The one
thing that still reloads this page is an edit to its own modules — `page.js`, `card.js`,
`inbox.js`, `compose.js` — because a changed ES module cannot be re-imported over the old one
with no build step, which is why a minion editing AI 2 works in a worktree.

Every card on this page comes from a file. Nothing is stored anywhere else, there is no
database, and the page keeps no state of its own between loads — which is why two people
looking at it see the same thing, and why "what is on the screen" can be checked against
"what is in the files" by counting.

## Reading

**`ai/board.jsonl`** — what the mastermind and the minions posted. One `card` line per thing;
a later line carrying the same `id` updates the fields it names and leaves the rest alone. A
card whose title starts with `Note:` is an explanation written for the owner rather than a
report of work, and it is drawn as a note: a rule down the left, the full text, no icon box.

**Servex's `prompts` log** — `GET http://127.0.0.1:8090/log/prompts?n=400` for the backlog,
then `EventSource` on `http://127.0.0.1:8090/api/stream` for everything that arrives after.
This is the owner's own sentences, and every line the fast assistant appends about them. One
card per `prompt`; the assistant's `name`, `card`, `refined` and `proposal` lines all carry
`re` pointing back at the prompt they answer, which is how they find their way into the same
card instead of becoming four more.

A `card` with `route: "task"` grows one more: a `task` line, `re` pointing at the CARD's own
id (not the prompt's, since a task hangs off the idea). `Servex/agents/Dispatcher.js` watches
for it, spawns a task mastermind, and keeps rewriting that same id's `state` (`queued` →
`working` → `landed`/`blocked`) and `now` as it works — `threads()` in `inbox.js` folds it onto
the item as `it.task`. This file only decides the data exists; drawing the strip itself is
`/framework/ai/talk/`'s job today (`ai2-master-detail` is mid-reshape).

**`ai/prompts.jsonl`** — the same sentences, written by the dictation box when Servex is not
answering. Used only as a backlog when the fetch above fails; there is no stream for it, and
the page says "the assistant is off" when it is what got used.

**`ai/<today>/day.jsonl`** — the one line a task writes when it actually lands. Subscribed over
the dev socket, like the two above, so a task that lands while you are looking arrives on screen
by itself.

**Servex's `cards/<slug>` log** (decision `card-storage`, ai2-nested, 2026-09-23) — one card's
own append-only stream: every `prompt`, `refined`, `reply`, `name`, `task`, `proposal`, `flag`
and `archive` that belongs to it, in order. Read the same way as `prompts` — `GET
.../log/cards/<slug>?n=400` for the backlog, the same shared `EventSource` for everything after
— through `log_stream(name)`, the generalised form of what used to be `prompt_stream()` alone.
A card's own page and its sub-card pages fold this log with the same, unmodified `fold()` used
everywhere else on the site: `sub_rows()` turns it into the table of contents, `sub_row()` reads
one row's whole content for the third column. `ai/board.jsonl` stays the index (id, slug, title,
icon, status, author, at) — nothing above moved into this log; it only ever gains what happens
to a card AFTER it exists. `Servex/proof/migrate-cards.mjs` folds today's `board.jsonl` +
Servex's `prompts` log into one `cards/<slug>` file per card, once, so the two counts (events in,
events out) can be checked against each other.

**`ai/asks.jsonl`** — the asks ledger (`Servex/asks/Asks.js`), read straight as a static file,
no Servex route, like `ai/board.jsonl`. `fold_asks()` (`ai/asks/fold.js`) folds it the same way
Servex's own writer does, so the two can never disagree about what is stalled. One row per ask
whose folded `status` is `stalled` — an owner agent gone quiet, silent more than two hours, or
stopped outright — id `ask:<ask id>` (never a real card's own id, so it can't collide with one),
its quiet line "Stalled · owner · silent 2 h". **A stalled ask outranks everything else that is
only newest-first**: `items()` scores every row with `importance()` (`needs-rule.js` — the same
function the asks ledger's own page uses) and puts anything scoring 60 or more — a stalled ask,
a blocker, a question a live agent is waiting on — ahead of the plain newest-first list, highest
score first. Clicking it goes straight to its card when it has one (`resolve_card()`'s own
redirect, the same hop a migrated old board id already takes) or opens a small page of its own
links otherwise — its words, and the whole [ledger](/framework/ai/asks/). It is bold until you open it,
then plain. It uses the Inbox's own read state (`rules.js` `is_read()`, the row's dot), and
it is the one row that opening marks read; every other row waits for its dot. A cache inside
`inbox.js` refreshes itself in the background every 15 s rather than adding a second poller; a
stalled ask leaves the list by itself, with no code of its own, the moment the ledger's status
moves on (`items()` rebuilds this list fresh on every repaint, straight off whatever the cache
holds right then) — the ledger file itself keeps every line.

⚠ It was one `fetch()` until 2026-09-22, and the fix is not the one it looks like: the dev
server routes **every** `.jsonl` change to `Tail.changed()` — its own line-streaming wire — and
never broadcasts it as a reload, so the socket's `data` event never fires for a `.jsonl` at all,
however plainly the tab has fetched one. Subscribing is the only wire that carries it.

## Writing

**`ai/verdicts.jsonl`** — one append-only line per press, through the dev server's
`rpc:card_say` (`Server/plugins/CardAnswer.js`). Three words:

| word | what it means | who hears |
| --- | --- | --- |
| `read` | the owner opened this card | nobody — private bookkeeping |
| `improve` | the flag, with a sentence and sometimes a quoted span | the mastermind's inbox, and it rings the running session |
| `reopen` | the flag, withdrawn | the mastermind's inbox |

Nothing is ever edited or deleted. A flag put on and taken off again is two lines, not none,
and the file still holds both. The page reads the file back into two separate bins — every id
ever read, and the ids flagged right now — so a `read` line can never hide a flag and a flag
can never hide a read, however they interleave.

**Servex's `cards/<slug>` log, again** — a card you talk into writes here too, not only reads.
`compose.js`'s `send()` (typed) and the microphone's own `log_prompt()` both post the entry
TWICE: once to `/log/prompts`, unchanged, so the fast assistant and the Dispatcher — which only
ever watch that one log — keep hearing every sentence exactly as before; once to
`/log/cards/<slug>`, fire-and-forget, the durable per-card copy this task added. A sentence said
into a sub-card carries `re: "<slug>/<sub>"` — the file is still the PARENT card's
(`CARD_NAME` only ever allows one segment after `cards/`), and the sub-card's own identity lives
entirely inside that `re` field.

## Who else writes a card's log (2026-09-23)

A card's chat (`chat.js`) is drawn from `cards/<slug>` alone, so anything that should appear
there has to be written there. Four writers do:

| writer | what it writes | when |
| --- | --- | --- |
| the fast assistant (`Assistant.mirror()`) | its `reply`, copied from `prompts` | a sentence was spoken into this card |
| any agent, via the `card_reply` MCP tool | `{type: "reply", by, re, text}` | a helper answering, a task mastermind reporting |
| the Dispatcher (`Dispatcher.mirror()`) | every `task` line for a task spoken into this card | queued, working, blocked, landed |
| Servex's agent host (`moment()`) | `{type: "update", ref, text}` on `cards/live` only | an agent (not the two always-on assistants) starts, ends a turn, stops, errors |

**`cards/live` is the Live card's log**, and it also takes `{type: "clear", ref: <item id>}` from
a task's ✕ or from any agent (`POST /log/cards/live`). A clear hides that item until its own
timestamp moves past the clear's. The Live card's chat adds today's `task opened` and `landed`
lines from `day.jsonl`, which Servex cannot see, so those are read by the page, not copied.

⚠ **The Dispatcher's own `task` lines carry `by: "dispatcher"`, and it ignores them.** Without
that, its "dispatch is paused" note — itself a `queued` task line — was heard as a new task,
forever: 1.2 million lines and 294 MB in ninety seconds, then Servex died out of memory
(2026-09-23 15:04). The trimmed log kept every real line; the bloated original is in
`%LOCALAPPDATA%/lew42/servex/backup/`, deliberately outside `logs/`, where anything listing
"every log" would read it whole.

## Why the two numbers can be checked against each other

Every source contributes an `id`, and an id that two sources share contributes it once: a
minion posts a board card called `padding-audit` and later lands a task called `padding-audit`,
and that is one piece of work, so it stays one card and the landing only adds its sentence and
a link. So the cards on the screen should equal *board ids ∪ prompt ids ∪ landed tasks*,
exactly — and the build's proof run checks it as a set comparison, from one snapshot, so a
mismatch names the id rather than just the difference.
