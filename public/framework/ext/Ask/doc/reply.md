# Reply in place — talk to one item, where it already is

Every item on a task page is a thing you might want to say something about: an
**ask** card, a **decision** row, a **task** card on the day board. `reply()`
puts two small buttons under any of them — **reply** and **🎤** — and a one-line
box that opens when you press either. What you type or say goes to Claude with
that item already explained, and the answer lands under the same item a few
seconds later.

The point is the one thing you never have to do: **say which item you mean.**

```js
import { reply } from "/framework/ext/Ask/reply.js";

reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary, quote: ask.quote } });
```

`m` is the task's own manifest — an `ext/JSONL` `TaskJSONL`. `about` is the item:
`kind` and `id` are what the thread is filed under; everything else on it
(`summary`, `quote`, `status`, `topic`, `tasks`, `options`, `chose`) is what the
turn gets told before a word is typed.

## What one press does, in order

1. **The box opens** under the item. Nothing scrolls, nothing else opens, and
   Escape closes the box and only the box.
2. **One turn is sent.** Its prompt opens with plain sentences — *"The owner is
   replying to ask `even-columns`: the columns are not even. They first asked for
   it like this: …"* — then the owner's words verbatim, then the job (below).
   The answer streams into a bubble as it arrives.
3. **The exchange is filed** into that task's own `task.jsonl` as two `chat`
   lines carrying `about: {kind, id}`, through the dev socket's `rpc:append`.
4. **The appended lines come straight back** off the same socket as a stream
   frame, `TaskJSONL` folds them into `m.chats`, and every thread on the page
   redraws itself — in this tab and in every other tab open on that task.

## The turn is a minion, not a chat partner

A reply is usually a *request*, so the turn is told to act on it, not to discuss
it. Its instruction, in full, is the `MINION` constant in `reply.js`:

- Answer in at most four plain sentences.
- Then, **only if the words asked for something**, end with one fenced `jsonl`
  block: `ask`, `decision` and `log` lines, one per line, ids in kebab-case.
- Always include a `log` line reading `reply handled: …`, which is what the
  mastermind reads at its next wake.

The browser parses that block, stamps every line with the clock, drops anything
that is not one of those three verbs, and appends them with the chat lines. They
merge by `id` like every other verb, so **reusing an existing id amends that item
instead of adding a second one** — and because they arrive back off the wire, a
new ask card appears on the wall within seconds without a reload.

⚠ **The block is stripped out of the answer.** Raw `jsonl` under a card is not
something anybody reads, and those lines are about to show up on the tab as cards
and rows anyway. The send line says `$0.021 · 6s · wrote 2 lines` instead.

⚠ **If the turn writes no `log` line, the browser writes one** from the answer's
own first line. A reply the mastermind never hears about is a reply that did not
happen.

## The turn gets no tools at all, and that IS the scoping

`tools: ""`. The turn never touches a file: it answers, and the **browser** does
the writing through `rpc:append`, which can only ever reach a `.jsonl` under
`public/`. The alternative — handing the turn `Bash` or `Edit` so it appends its
own line — is a shell on a browser-typed prompt with the run of the whole repo,
to do a job that needs no tool. See [decisions](/framework/ext/Ask/doc/decisions/).

## Which session a reply talks to

**A reply thread is its own session.** The first reply on a task starts a fresh
one; its id lands in the log as `chat_session_id`, and every reply after that
sends `resume: chat_session_id`. So the thread under an item is a real
conversation that remembers what was said in it — and nothing else.

It does **not** inherit the task's own session by default, and that is a change
of mind with a number behind it. The obvious design is to fork the task's session
(`from: m.session_id`, which is `--resume … --fork-session`) so the reply starts
out knowing everything that session knows. Tried against a mastermind session
that had been running all day, that fork cost **$0.18** and came back with four
words: *"Prompt is too long"* (measured 2026-09-18). The prompt already says
everything about the item, so the fork was buying context it did not need, at a
price that rose all day until it stopped working.

`fork: true` opts back in when a task's own history really is wanted — and it is
safe, because `turn_it()` catches exactly that failure, says *"that session is too
big for this model — starting a fresh one…"* where the answer goes, and asks
again with no session at all. The id that **answered** is the one recorded, so a
thread whose session has grown past the model repairs itself on the next reply
rather than failing forever.

⚠ The dev server hands the browser the turn's *text*, not its error flag — a
failed turn arrives looking exactly like a good one, with a real cost attached.
So the handful of complaints worth recovering from are matched by name
(`CLI_FAILED` in `reply.js`). A miss costs nothing worse than the answer it
already was.

⚠ **One turn at a time per session.** A second reply sent while one is in flight
on the same thread is refused with *"That session is mid-turn"* — two processes
resuming one transcript is corruption. The message appears in the bubble.
[fork](/framework/ext/Ask/doc/fork/) is the rule this is a considered exception
to.

## Dictation — talking, turned into asks

`dictate()` is the same machine with a different job: one box at the top of a
task's Asks tab, where you say what you want and **each thing you name comes back
as its own ask card**. Its turn is told to split, not to answer: one `ask` line
per thing wanted, each with an `id`, a `summary` in the owner's own words, the
`quote` it came from copied verbatim, a `topic`, and `status: "open"`. It runs on
haiku, because splitting is mechanical.

```js
import { dictate } from "/framework/ext/Ask/reply.js";

dictate({ m, about: { kind: "dictation", id: "asks" } });
```

Each new ask carries `prompt: <the chat line's own id>`, so the card's **the
prompt** pill leads back to the dictation the ask came out of.

⚠ The pill opens the Session tab, which is where the `chat` lines are — it does
not scroll to the sentence, because a dictated ask has no message in the CLI
transcript to scroll to. The verbatim `quote` on the card is the provenance that
always works.

## Where the thread lives

Nowhere new. A reply is a `chat` line in the task's own `task.jsonl` — the same
verb `ext/Ask`'s panel has always written, plus one optional field:

```json
{"chat": {"id": "…", "at": "…", "role": "user", "text": "…", "about": {"kind": "ask", "id": "even-columns"}}}
```

An item shows the lines whose `about.kind` and `about.id` are its own, newest
last. A `chat` line with no `about` is the task-wide conversation the Session tab
already shows, and it is untouched. Schema:
[`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).

## Traps

- ⚠ **The host card is a click target.** An ask card's whole body opens its detail
  sheet and a task card's title spreads a link over its entire row, so the control
  stops its own clicks before they reach either.
- ⚠ **The control is mounted in three different boxes** — a flex column, a plain
  block and a three-track grid — so `.ask-reply` states `grid-column: 1 / -1` and
  a `z-index`, and the two hosts that are not grids ignore them.
- ⚠ **The buttons fight the skin.** `.theme-lew42 :is(button, .btn)` is (0,2,0):
  0.8em, uppercase, bold, 0.7em/1.4em of padding. Two of those under each of
  thirteen ask cards is a second wall, so `ask.css` overrides them at (0,2,1), the
  same move `.ask-chip-row` already makes.
- ⚠ **A thread is redrawn from the log, so an in-flight exchange lives in its own
  box** (`.ask-pending`) until the lines are filed. Otherwise an unrelated append
  would wipe a half-streamed answer.
