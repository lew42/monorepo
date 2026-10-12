# The event schema — one append-only file per session, one typed line per thing that happened

Every session writes one `.jsonl`. A line is added and never touched again. Approving a
proposal, renaming a thing, disagreeing with a name — all three are just new lines. The
things a person looks at (tasks, names, decisions, proposals, prompts, cards) are **folded**
out of those lines by [`fold.js`](fold.js); nothing is stored twice and nothing is edited in
place. Worked story: [`sample.jsonl`](sample.jsonl), 30 lines, raw prompt to approved name.

## The envelope — six fields, on every line

| field | who writes it | what it is |
| --- | --- | --- |
| `at` | the appender | Local time with its offset, `2026-09-22T09:02:11-05:00`. Stamped when the line is written, never by the caller, so no clock in the system can drift. |
| `seq` | the appender | This line's own address: `<session>#<n>`, counting up. Human-readable, unique across every file because the session name is. Used to point at one exact line. |
| `id` | the writer | **The id of the THING this line is about** — `live-board`, `build-live-board`, `d-storage`. Many lines share one id; that is the point. |
| `type` | the writer | One of the 24 below. |
| `by` | the appender | Who appended it: `owner`, or an agent id (`assistant-fast`, `mastermind-servex`, `minion-live-board`), or `servex` for the machine. Taken from the connection, not from the body, so nobody can claim to be the owner. |
| `re` | the writer | The id, or list of ids, this line hangs off. A decision `re` its task; an answer `re` its ask. Optional. |

**An id is minted once and frozen.** The first `name` for a thing mints its id from that
name (`Live Board` → `live-board`) and the id never changes again, however many times the
thing is renamed. That is the whole reason a rename is safe: the label moves, the address
does not, and no link ever breaks.

## The 24 types

### Words — what was said

- **`prompt`** — the owner's words, verbatim, never tidied. `sentences` (the raw text split
  into sentences **once, at write time**, and frozen), `source` (`voice` or `typed`), `audio`
  (a path, later). Refers to nothing.
  `{"id":"p-1","type":"prompt","by":"owner","source":"voice","sentences":["I want one screen…","Not a wall of logs…"]}`
- **`refined`** — a cleaned, grouped, re-ordered reading of one or more prompts. `text`, and
  `cites: [{prompt, sentences: [i, …]}]`. `re` → the prompt ids.
  `{"id":"r-1","type":"refined","re":"p-1","cites":[{"prompt":"p-1","sentences":[0,2]}],"text":"One page listing every live agent…"}`
- **`proposal`** — a concrete, approvable shape. `stage` (`pre` when it is still a sketch,
  `full` when it names classes and methods), `title`, `shape` (bullets), `classes`,
  `methods`. `re` → the refined ids. *A pre-proposal is not a 25th type — it is a proposal
  whose `stage` is `pre`.*
  `{"id":"pr-live-board","type":"proposal","stage":"full","classes":["Board","Board.Card"],"methods":["fold()"]}`

### Judgment — what was settled

- **`name`** — someone named a thing. `name`, `kind`, `why`, and `alt: true` when it is
  offered as an alternative rather than a claim. `re` → optional, the thing it names when
  that differs from `id`.
  `{"id":"live-board","type":"name","by":"assistant-fast","kind":"feature","name":"Live Board"}`
- **`rename`** — a request to change a name that already exists. `name`, `why`. `re` → the id.
  Only the owner's rename applies to a name the owner has already seen; anyone else's is
  turned into a `dispute` by the appender (see the checks below).
- **`approve`** — the owner said yes. `re` → the id approved. It **locks**: after it, further
  names, renames and disputes are kept as alternatives and the approved value stays visible.
  `{"id":"live-board","type":"approve","by":"owner","re":"live-board"}`
- **`dispute`** — "not that — this instead", recorded **beside** the visible value, never over
  it. `text`, optionally `name`, and `refused` naming the type the appender turned down.
  `re` → the id disputed.
- **`decision`** — one choice and the alternatives it was chosen over: `about`, `options:
  [{id, say, why}]`, `chose`, `because`, `rule`, `status`. Unchanged from today's shape.
  `re` → its task.

### Work — what is being done

- **`task`** — one unit of work. `title`, `steps`, `step`, `status`, `landed_at`, `outcome`.
  `re` → the proposal it builds. Appended when the task opens and again whenever anything
  about it moves; the newest wins field by field.
  `{"id":"build-live-board","type":"task","re":"pr-live-board","title":"Build the Live Board","steps":["fold the log","draw the cards"],"step":1,"status":"working"}`
- **`intent`** — what an agent is doing *right now*, one sentence. `msg`. `re` → its task.
  The task's `now` is simply its newest intent.
- **`file_touch`** — a Write or an Edit landed. `did`, `files`. `re` → its task. Written by
  Servex from the PostToolUse hook, never by the agent that made the edit.
- **`log`** — a finding, a measurement, a milestone, in one sentence. `msg`. `re` → its task.
- **`shot`** — a screenshot taken outside the repo. `path` (absolute), `url`, `width`,
  `label`. `re` → its task.

### Agents — what actually ran

- **`transcript`** — one complete assistant turn. `text`. `id` is the turn id. `re` → its task.
- **`delta`** — one partial chunk of a turn still arriving, carrying the **same turn id** as
  the `transcript` that will complete it, so a UI can stream and then settle. `text`.
- **`tool`** — a tool call. `tool`, `input` (a short summary, never the whole payload).
- **`result`** — the turn ended. `cost_usd`, `duration_ms`, `turns`.
- **`subagent`** — nested transcript text from an agent inside an agent. Same fields as
  `transcript`; it exists as its own type because `Servex/agents/` writes it today, and the
  fold reads it exactly as a transcript whose `by` is the nested agent.
- **`agent_msg`** — a message injected into a live agent. `to`, `reply_to`, `text`. `re` →
  the task it is about.
- **`error`** — something failed. `msg`, optionally `stack`. `re` → its task.

### The owner's surface

- **`card`** — one preview card on the board. `icon`, `title`, `text`, `status`, `links`.
  `re` → everything the card is about. **Appending a card marks everything it references as
  `seen`** — a card is, by definition, the owner's screen, and `seen` is what the rename check
  reads.
- **`ask`** — a question put to the owner. `question`, `options`. `re` → what it is about.
- **`answer`** — the reply to one ask. `answer`. `re` → the ask id.
- **`rank`** — an order for one list, best first. `list`, `order` (**every** id in it),
  optional `fold`. `re` → whatever owns the list. The last rank wins outright — half an order
  is not an order.

## Today's verbs map onto it, so nothing on the board is orphaned

Today a line is `{"<verb>": {…}}`; tomorrow it is `{"type": "<verb>", …}`. A reader converts
one into the other in a single line — `{type: Object.keys(e)[0], ...Object.values(e)[0]}` —
so every `task.jsonl` and `board.jsonl` already written stays readable with no rewrite.

| today | becomes | note |
| --- | --- | --- |
| `assign` (title, steps, step, landed_at, outcome) | `task` | The merge-by-assign the log already does IS the newest-wins fold. |
| `assign.now` | `intent` | The card's "what I'm doing" line, now its own timestamped event. |
| `log` | `log` | Unchanged. |
| `action` did edit | `file_touch` | |
| `action` did run | `log` | A command that ran is a milestone, not a file touch. |
| `agent` | `task` | An `agent` row was always one task seen from outside; the orchestrator and the minion now append `task` lines with the same id, from their two sides. |
| `ask` | `ask` + `card` | The question is the ask; the card is what puts it on screen. `conclusion` becomes the card title, as it does today. |
| `ask.quote` | `prompt` | The owner's verbatim sentence gets to be its own immutable event. |
| `ask.needs` | `ask` with `needs` | Unchanged — it is what the "Needs you" strip reads. |
| `decision` | `decision` | Unchanged. |
| `verdict` say approve | `approve` | |
| `verdict` say improve | `dispute` carrying the note | An Improve is literally "not that — here is what instead". |
| `rank` | `rank` | Unchanged. |
| `note` | `card` | A note to the owner's board was always a card with no buttons. |
| `chat` from the owner | `prompt` | |
| `chat` from an agent | `transcript` | |
| `shot` | `shot` | Unchanged. |
| board `card` | `card` | Unchanged. |
| `ask_chunk` (the streaming bridge) | `delta` | Same turn id, same job. |

## The naming rules, as checks the appender runs

These are not advice in a skill. They are four `if` statements in `Log.append()`, and
`POST /log/<name>` is the only door into the file, so **no agent can bypass them** — not by
forgetting, not by being told to, not by being a different model.

| The rule | The event | What the appender checks | What happens when it fails |
| --- | --- | --- | --- |
| The fast assistant names things at once | `name` on an id nobody has named | Nothing at all. Accepted from any tier, instantly. | — |
| A mastermind may propose alternatives | `name` on an id that already has one | Accepted, stored with `alt: true`. The **first** name stays visible. | — |
| Nothing the owner has seen is renamed unless they ask | `rename` | Is the target `seen` (has any `card` referenced it)? If so, is `by` the owner? | Refused. The appender writes a `dispute` carrying the same text and `refused: "rename"`, and answers with that dispute's id. |
| An approved name is locked | `name`, `rename` or `dispute` on a locked id | Has any `approve` referenced this id? | Refused. Recorded as an alternative; the approved value stays visible. |

Two more the same door enforces, from the tier table: `by` is read from the connection, not
from the body, so an agent cannot append as `owner`; and only the owner's connection may
append `approve`, `answer` or `rank`.

**A refusal is never an error.** The appender writes the safe line instead and returns its
id, so a careless agent and a careful one both end up with the owner's intent intact. The
difference shows up only as a `dispute` the owner can glance at and ignore.
