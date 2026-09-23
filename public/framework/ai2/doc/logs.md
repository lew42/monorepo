# The four logs it reads, and the one it writes

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

## Why the two numbers can be checked against each other

Every source contributes an `id`, and an id that two sources share contributes it once: a
minion posts a board card called `padding-audit` and later lands a task called `padding-audit`,
and that is one piece of work, so it stays one card and the landing only adds its sentence and
a link. So the cards on the screen should equal *board ids ∪ prompt ids ∪ landed tasks*,
exactly — and the build's proof run checks it as a set comparison, from one snapshot, so a
mismatch names the id rather than just the difference.
