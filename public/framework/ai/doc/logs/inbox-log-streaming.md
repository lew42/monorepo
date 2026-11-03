# Inbox, Log and one streaming system

<!-- merged from inbox-log-streaming-2026-10-08.md (original kept in archive/) -->
## Inbox, Log and the one streaming system — owner thinking, 2026-10-08

Recorded from dictation. Owner of the study: `2026-10-08/ai-system-docs` (not session-class; that agent stays on Sessions). First stage = **find out what exists and how it works**, then how to integrate streaming; build only small safe parts.

### The inbox (intent)
A real-time **notification inbox like email**: surfaces urgent things and notifications; **unread items bold, un-bold when read**; basic read/unread. The owner remembers an **Inbox class** meant to manage it, so the same inbox UI can be dropped on any page. Not sure where it is or whether it still works: agents used to create things on the inbox and it "doesn't seem to" any more. Find: where inbox items are stored, how agents create them (an MCP/in-process tool? by hand?), who reads them, whether an Inbox class exists (`ux/Inbox`, `ext/Inbox`, `core/Page/ext/Inbox`), and why creation broke.

### The log
The log is basically an inbox with more verbosity. They might become one tab with filters. First: what is there, and is it a true real-time stream of everything (it should be).

### One streaming system everywhere
Use the **same** JSONL-tail-with-deltas streaming logic for every kind of data (cards, sessions, tasks, inbox, log, any screen): low latency, performant, robust, built into pages automatically, and also available to page sub-things (a session, a task). Inventory every place that streams or polls and what it uses; list the differences; recommend convergence on the existing mechanism (`ext/JSONL live()` + the dev-server socket).

### Programmatic writes
Agents must not write raw JSON. How do agents **and UIs** call a method on a page (a `page.log(...)` that stamps time and author)? The answer should be one programmatic path (node function; see `../design/tooling-architecture.md`), with the AI only passing the properties.

### Clean tree
Commit everything so there are save points; no loose uncommitted files; `.gitignore` machine state. (Done 2026-10-08 for the main tree; agents commit their own task dirs.)


---

<!-- merged from inbox-log-streaming-findings-2026-10-08.md (original kept in archive/) -->
## Inbox, Log and streaming — stage 1 findings (2026-10-08)

Answers [inbox-log-streaming.md](inbox-log-streaming.md). Read from code by grep; nothing run, nothing changed.

### The Inbox class exists: one class, two views
`core/Page/ext/Inbox/Inbox.js` (`class Inbox`, 233 lines) gives `.rail` (`Rail.js`, 612 lines, the list of previews) and `.compact` (the drawer's small note box). `ux/Inbox/` is only the demo and readme at `/framework/ux/Inbox/`; there is no `ext/Inbox`. Subclasses supply `source()`: AI 2 (`ai2/rail.js`, `ai2/inbox.js`, 937 lines) and the AI page tabs are subclasses.

### Where items live, and who creates them
- **Cards (the owner's inbox rows):** one folder per card, `ai/YYYY/MM/DD/<slug>/page.jsonl`, written by `Servex/cards/Cards.js` through the `create_card`, `card_set` and `card_reply` tools. `ai/cards.jsonl` is a debounced static index rewritten whole (6 of today's ~395 card folders are in it), so it is a lagging snapshot, not the source.
- **Older sources the AI 2 model still reads** (header of `ai2/inbox.js`): `ai/board.jsonl`, Servex's `prompts` log, each day's `day.jsonl`, `ai/asks.jsonl`.
- **Page inbox** (a note left on a page): `Servex/doc/inbox.md`. **Agent inbox:** `logs/inbox/<id>.jsonl`. Different things sharing one word.

### Why creation "seems broken"
Two likely causes, neither confirmed by a run. (1) `ai/board.jsonl`, the file the older posting verb wrote, was last written 2026-10-04, so anything still posting there is invisible; new cards go to card folders. (2) The rail reads a static index and a 20 s refresh, so a card made by `create_card` can take that long to show. Next step: create one card with the tool and see which list shows it, and when.

### Read / unread
The bold dot exists (`Rail.js` `is_read()`, class `inbox-unread`, a button toggles it). AI 2 keeps the flags in **this browser's `localStorage`** (`ai2/rules.js`, chosen on purpose after a shared verdict line made rows vanish for everyone). So unread state is per browser: not shared between phone and PC, lost on a cleared cache.

### Is the Log a real-time stream?
Partly. `ai2/inbox.js` opens an `EventSource` on Servex's `/api/stream` for its logs (backlog, then live): a true stream. The same file also has `static every = 20000` (a 20 s refresh), and other AI 2 screens poll.

### Streaming vs polling inventory
| Mechanism | Where | Kind |
|---|---|---|
| `ext/JSONL` `live()` over the dev-server socket (`dev/Socket`) | `page.jsonl` pages, `core/Page` | stream (the standard) |
| `EventSource /api/stream` | `ai2/inbox.js` (prompts, board) | stream, from Servex |
| `setInterval` 10 to 60 s | `ai2/live.js` (agents, usage, pool, tasks), `ai2/agents.js`, `ai2/needs.js`, `ai2/processes.js`, `ai2/inbox.js` | polling |
| `setInterval` | `ext/Session`, `ai/AITask/usage.js`, `ext/drawer/*`, `core/Task/live`, Dictate | polling |
| Debounced whole-file rewrite of `ai/cards.jsonl` | `Cards.js` | snapshot, not a stream |

Recompute with `grep -rc setInterval public/framework --include=*.js` (about 30 files; most under `core/new/` are demos).

### The programmatic write path
There is no `page.log(...)` on the browser `Page`. The one path is node-side: Servex tools `page_log`, `page_add`, `page_set`, `create_card`, `card_set` and `append_log` (`Servex/pages.js`, `Cards.js`, `MCP.js`) validate and stamp, and the `.claude/hooks/append.mjs` guard enforces it for shell writes. A UI would call the same tools through Servex's HTTP routes.

### Recommendation (default): converge on the stream that exists
Keep `ext/JSONL` `live()` plus the dev-server socket as the only mechanism. In order: (1) replace the `ai2/live.js` pollers by tailing the files they already read; (2) make read state a `read` event in the card's own `page.jsonl`, so it is shared across browsers; (3) retire `board.jsonl` as an inbox source once nothing posts there. **Alternative:** Servex pushes one multiplexed `/api/stream` of all events and pages subscribe by filter. Simpler for clients, but it builds a second system beside `live()` (Law 6). Built now: nothing, because step 1 edits `ai2/` files other agents own.
