# What already orders or holds work, and which one becomes the queue

| Piece | What it orders | Data | Read by | Becomes |
|---|---|---|---|---|
| **Task.rank** (`core/Task/Task.js`) | Tasks by recency (halves every 3 days) × `priority.score` × (1 + children). No cost, no re-asks | each task's `task.jsonl` `priority` line | task pages and lists | **Input.** Its weight idea moves into the queue's score; `rank()` stays for lists that have no cost |
| **TaskLoop** (`Servex/TaskLoop.js`, [doc](/Servex/doc/task-loop.md)) | Nothing by value. It launches an approved task that carries an `agent` config, writes a `queue` line when the machine is hot and retries each tick, and chases quiet tasks | `task.jsonl` lines (`queue`, `spawn`, `approve`) | itself, every 5 minutes | **Consumer, later.** It should take its launch order from the queue. Not touched in this slice |
| **Dispatcher** (`Servex/agents/Dispatcher.js`) | A routed spoken ask becomes an agent, first come first served; `max` slots, a `queue` array in memory | the `prompts` log | itself | **Left alone.** It is the door in, not an order |
| **priority.md** (`ai/priority.md`) | The three big things, by hand | the file | every mastermind | **Input.** The `big` number on a task's `priority` line is the importance |
| **Triage** (`ai/asks/triage.jsonl`) | 22 tasks accepted with `priority {score, big}`, 219 sent to the backlog | one line per task | the Undone asks page | **Input.** Its approvals are the queue's entry ticket |
| **Asks ledger** (`ai/asks.jsonl`) + inbox (`waiting_on: "owner"`) | Asks by status, by owner agent | the ledger | the asks pages, the Inbox | **View of it**, as the "why" link |
| **Refine asks** (`ext/Refine/queue/asks.jsonl`, `node Server/RefineQueue.mjs --repeats`) | Each ask the owner made, per session, with a short key | 1224 refined asks | `--repeats` | **Input.** Counting the sessions that asked again is the re-ask number |
| **"tasks" query source** (`Server/SessionIndex.mjs`) | Every task row, with the real `usd` | `task.jsonl` files | the AI pages, live | **Input.** Real cost lines, for the estimate; the pattern the queue's own source copies |

## The one that becomes the queue

None of these ranks by cost and re-asks together, so the queue is **a new class**, `TaskQueue` in `core/Task/TaskQueue.js` (beside `Task.js`), not a second copy of any of them. It uses `Task.replay` state and the `priority` lines, and it feeds nothing new into the data: it only reads. A thin node adapter (`Server/TaskQueue.mjs`) gathers records and serves the live `taskqueue` source for the page at `/framework/ai/queue/`.

Found while reading: only 22 tasks carry `big`; 143 open tasks carry a `priority` line in all (older ones from the asks sort have a `score` with no `big`), so the queue holds 143 and shows the top 20.
