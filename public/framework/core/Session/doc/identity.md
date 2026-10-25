# Session identity: which session owns each line, each dollar and each task

A **session id** is the uuid Claude gives one conversation. Everything this repo records about a session (its folder, its cost, its tasks, its children) hangs off that id. If an id is read wrong, work lands in the wrong place, or is counted twice, or is not counted at all. The owner, 2026-10-24: "it's of absolute importance that our session system does not misattribute things" ([brief](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/requirements.md)).

This page says how ids are given out, every way one can change, who may write where, how cost follows an id, and the check that proves it. Each claim names the code or the record it comes from.

## The short answer (2026-10-24)

| Question | Answer | Evidence |
|---|---|---|
| What is `eb0fe509-…` in the tab's transcript? | **Not a Claude session.** It is the `sessionId` that the Figma MCP's `create_session` returned on 2026-10-21 03:44Z. The tab then passed it as an argument to Figma tool calls. Nothing in the session store is filed under it. | Transcript `e00f55c9-….jsonl`, line 3692: a `mcp__figma__create_session` result `{"sessionId":"eb0fe509-…"}`. Every top-level `sessionId` in the file is `e00f55c9`. A search of `ai/sessions/**/*.json*` for `eb0fe509` finds nothing. |
| Does compaction keep the id? | **Yes, for tabs and for SDK agents.** | The tab's transcript: 18,306 lines, one top-level id, through its compactions. `7c6c8d93` (an SDK agent): 4 `compact_boundary` lines, one id. |
| Why did `ai-system-mastermind` come back as `7c6c8d93`? | **A deliberate renewal**, not a resume or a fork. Its role has `renew: {hours: 24, tokens: 100000}` (`Servex/agents/roles.js`). Its last context was 130,131 tokens, so the next wake started a **fresh session** under the same agent id (`Agent.renew`, `Servex/agents/Agents.js`). | Its agent log `agent-ai-system-mastermind.jsonl`: `{"type":"renew","why":"tokens","replaces":"2da03974-…","session":"7c6c8d93-…"}` at 2026-10-24 21:32:54. That is 11 renewals since 10-23. |
| Is the cost of both ids counted once? | **Yes, per transcript.** The two transcripts share 0 message ids and 0 line uuids, and each transcript is priced once, in its own folder (`session-2da03974`, `session-7c6c8d93`). **One bug:** `Agents.session_turns(sid)` returned every turn the agent id ever ran, so each renewed session counted its predecessors' turns as its own "untracked" spend. Fixed on this branch: each turn now carries its session. | 253 and 250 distinct messages, overlap 0. Fix: `Servex/agents/turn-costs.js`. |
| Where do the new id's lines go? | **The agent log** stays one file per agent id (`logs/agent-<id>.jsonl`). **The task record** stays the agent's task: a renewal does not open a new one. **The transcript** is a new file, `<new id>.jsonl`, and the indexer gives it a new folder, `session-<new id8>/`. **Children** spawned after the renewal are filed under the new session's folder. | `Agent.renew` keeps `this.task`. `default_task` nests a child under `caller.session_id`. |
| What happens to work in flight at the switch? | **None is in flight.** A renewal happens only when a dormant (or stopped) agent is woken, and a dormant agent has no process and no running turn. Messages that arrived while it slept are replayed as the new session's first turns. What is lost is the conversation itself: the new session starts from the readmes, priority.md and its inbox. | `Agent.awaken` → `renew_due()` → `renew()`; `held_messages` replayed. |
| StaleClose stopped this live tab on 10-22. | **Already fixed** that evening, before this task: StaleClose now treats a tab whose transcript was written in the last 24 h as alive. | Commit `2007ae0fc` (10-22 20:36); the close was at 10-22 00:02. Test `node Server/stale-close.test.mjs` (14 passing) includes "a VS Code tab whose transcript was written an hour ago is live". |
| Anything actually misfiled? | **Yes, one folder.** Five test sessions from 2026-09-19 had hand-picked ids `a1c1d1e1-000N-…`. They share their first 8 hex digits, so three of them wrote their cost into **one** folder, `2026/09/19/session-a1c1d1e1/`. Fixed on this branch: a clash now gets a folder named by the full uuid. | That folder's `cache.jsonl` has summaries for `-0001`, `-0002` and `-0004`. Test: `node Server/session-dir-clash.test.mjs`. |

## How a session gets its folder

Every session has one dated folder, `public/framework/ai/sessions/YYYY/MM/DD/<name>/`, on the **local** day it began ([sessions readme](/framework/ai/sessions/readme.md)).

| Kind | Who picks the id | Who makes the folder, and its name |
|---|---|---|
| **VS Code tab / CLI** | Claude Code | The SessionStart hook `.claude/hooks/session-page.mjs` writes line 1, `{"session":{"id","kind":"vscode-tab"}}`, into `DatedFiles.sessions.session_dir(id)`: `session-<first 8 hex>`. |
| **Servex agent** (SDK) | Servex: `Agents.spawn` mints a uuid and hands it to the SDK as `sessionId`. | `open_task` writes the **task** folder's line 1, `{"assign":{"session_id",…}}`. The **transcript** folder `session-<id8>/` (cache only) is made by `AISessionIndex` through `Session.locate`. |
| **Record session** (voice call, named agent) | Its writer | `RemoteMCP.voice_session`, `append.mjs`: a name such as `voice-20261016`. |

**Two code paths name the same folder**, `DatedFiles.session_dir` (Server side) and `Session.locate` (the class). They agree on the name `session-<id8>`. Both now check that a `session-<id8>` folder found on disk belongs to the id: `DatedFiles.owner(dir)` reads `index.json`, the cache summary, then line 1 of the record, the same sources `Session.scan` uses. If it belongs to another id, the new session gets a folder named by its full uuid. Folding the two paths into one is a ⬜ on [core/Session's readme](../readme.md).

**A session stays on the day it began.** `session_dir` looks back 31 days. Until 2026-10-24 it looked back 4, which split this tab across `2026/10/20/session-e00f55c9/` and `2026/10/24/session-e00f55c9/`. That second folder is still there, and the session page reads both. The check below reports it as `split`.

## Every way an id can change

| Event | Same id? | What links old and new |
|---|---|---|
| **Compaction** (`/compact`, or the CLI's own auto-compact) | Same | Nothing is needed. |
| **Tab reload / resume in VS Code** | Same | The extension re-appends earlier lines to the same file. This tab has 8,720 repeated line uuids. That is harmless for cost, because a message counts once by `message.id` (`AISession.merge_usage`), but a line counter must dedupe by `uuid`. |
| **SDK resume** (`resume: <id>`: a dormant agent woken, a revive after a Servex restart) | Same | The registry row's `resumed_from` (= its own id after a plain resume). |
| **Fork** (`fork_self`, `spawn_agent {resume, fork: true}`) | New | The registry row's `forked_from`. A fork's transcript starts with a copy of the parent's history, so the same message ids appear in two files. The check counts any shared ids. |
| **Renewal** (a role with `renew`) | New | The agent log's `renew` line (`replaces` → `session`). Nothing on disk under `ai/sessions` links the two folders yet (⬜ below). |
| **Another MCP's "session"** (Figma `create_session`) | Not a Claude id | It lives only in tool arguments. Readers must use the **top-level** `sessionId` of a transcript line, never grep for a uuid. |

## Who writes to which `session.jsonl`

- **The record's own session:** the SessionStart hook (line 1), `open_task` (line 1 of a spawn), and the item tool with no `path` (its own page).
- **Anyone, by path:** the item tool with a `path` (`Servex/agents/page_tools.js`) and `.claude/hooks/append.mjs <file>` both write to whatever record they are given. The item tool stamps `by: ctx.caller ?? "agent"`. A Servex agent's caller is its id. A VS Code tab's caller is null unless it registered (`register_session`), so most tab writes read `"by":"agent"`, and the record cannot say which session wrote them. This tab's own record has such lines (for example its line 3, the `start` that reopened it).
- **Node, by rule:** `SessionRecord.link_parent` (a `{"task":url}` reference in the parent), StaleClose (`stop`/`start`, `by: "StaleClose"`), PromptTasks.

**What goes wrong when an agent writes to the wrong record:** the line replays as that session's own. A task added there counts in its completion, a `stop` stops it, and cost attributed by time (`Task.attribute`) lands on its tasks. Nothing refuses it, and with `by: "agent"` nothing tells you afterwards.

**The owner's idea, weighed:** only the session (or the ids mapped to it) may write to its record, and others add to it through a checked path that stamps who they are.
- *For:* a wrong `path` is refused at write time, not found later. Every line's `by` is a real id, so attribution can be checked.
- *Against:* parents legitimately write into children's records (handoff, `link_parent`), node writers have no session id, and a tab's caller is often unknown today, so a strict rule would refuse the tab's own writes.
- *Proposal:* (1) stamp `by` with the caller's **session id** as well as its name, when known; (2) when a session writes into a record that is not its own or a descendant's, write the line but add `{"foreign": true}` and count it in the check below; (3) refuse only after the check shows (2) is rare and every writer is identified. Cheapest first step: (1). ⬜ on [core/Session's readme](../readme.md).

## How cost follows an id

There are two ledgers, and they must never be added together:

1. **Per transcript** (`AISession`, `ai/AISession/AISession.js`). This is the truth for a **session's own** cost. Each API message counts once, by `message.id`, using the largest usage any of its lines carries. One transcript is one folder's `cache.jsonl`. An independent recount (`AISessionAudit.cost_of_session`) must agree within 0.5%.
2. **Per agent id** (`turn_cost` lines in `logs/agent-<id>.jsonl`, `Agents.log_cost`). This is the cost of everything that **id** ever ran, across all its sessions. It is used for the registry's `cost`, for a task's cost (`Agents.task_cost`), and for child costs (`agents_under`, limited to turns since the parent session began).

**The chain:** renewals and forks give one agent id several sessions. Since this branch, each turn in (2) carries the session it belongs to (`turn_costs` reads the `renew` lines, the whoami line, `session <id>` transcript lines, and from now on a `session_id` field on every result line). So `session_turns(sid)` returns that session's turns only, and a session's per-task split (`by_task`) counts only its own spend.

**The double-count risks, and what guards each:**

| Risk | Guard |
|---|---|
| One message written on several lines, or re-appended on reload | dedupe by `message.id`, largest usage wins |
| A fork's copied history priced in both transcripts | the check's `shared_messages` (expected 0 outside forks) |
| A session's own cost (1) added to its agent's cost (2) | different fields: `cost.own` is (1), `cost.children` is (2) for **other** ids |
| One agent's turns counted for every session of that id | fixed: turns carry their session |
| Two ids writing one folder | fixed: a clash gets the full uuid |

## The check that proves it

`node Server/SessionIdentity.mjs <session id>` (class `SessionIdentity`) answers, for one session, as JSON:
- every transcript it owns, and any foreign top-level ids (expected none);
- its ids after compaction (expected just its own);
- its folders (more than one = `split`);
- cached cost against an independent recount;
- message ids it shares with any other transcript;
- for an agent, its chain of sessions, each with its turn cost and its transcript cost;
- its children and whether each is linked.

`TrackingCheck` runs it for recent sessions and the [tracking page](/framework/ai/tracking/) shows a "Session identity" row for each. Runs: [e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/identity-e00f55c9.json) (a tab), [7c6c8d93](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/identity-7c6c8d93.json) (a renewed agent).

What the two runs found (2026-10-24):

| | e00f55c9 (VS Code tab, 59 MB) | 7c6c8d93 (ai-system-mastermind) |
|---|---|---|
| Foreign ids on its lines | 0 | 0 |
| Compactions, id kept after each | 7, yes | none |
| Stored cost against recount | $280.70 = $280.70 | $11.95 = $11.95 |
| Messages shared with another transcript | 0 | 0 |
| Problem | two dated folders (10/20 and 10/24) | one child (`minion-process-page`) has no `task_dir`, so nothing links it |

The agent chain of 7c6c8d93 lists the 12 sessions `ai-system-mastermind` has run as. Their turn dollars (the SDK's own `total_cost_usd`) add to $43.66; their transcripts, priced by `AISession`, add to $33.29. Most sessions are 1.3 to 1.7 times higher in the log, so the two ledgers price the same tokens differently. Two neighbours swap (`94621591` $1.32 against $0.81, then `1c343e7b` $0.36 against $1.12), which means a turn near a renewal can land on the session before. Neither double-counts, because the two ledgers are never added together, but they disagree (⬜ below).

One caveat from review: in an agent log that has markers, a turn written before the first marker has no session, so `session_turns` gives it to none (the "not at all" case). The check shows such turns as a `null` row in the chain. 7c6c8d93's chain has none.

## Long-lived roles and context (proposal; the owner is unsure)

**What exists (Servex/agents/Agents.js, roles.js):**
- `renew: {hours, tokens}`: a fresh session under the same id once it is a day old or past 100k. Topic-blind. Only `ai-system-mastermind` has it.
- `oversized()`: a forced `/compact` at the end of a turn past 400k tokens or 500 MB.
- `nudge()`: an idle agent past its role's line (a mastermind's 150k) is told its size, the cache state and the minutes idle, and asked to compact at its next break.
- `sleep_compact()`: compact before going dormant past 100k.
- The parent sees each child's `context` in the registry row.

**What is missing:**
- **The CLI's own auto-compact still fires mid-turn.** `ai-system-mastermind` logged six `"trigger":"auto"` compactions near 167k on 10-24. That is exactly the "mid-flight" case the owner wants to avoid. Servex does not turn it off.
- **No timeout on a compaction.** `compact()` sets `compacting` and clears it only when the result arrives. A `/compact` that never answers leaves the agent `working` with `compacting` set, and it is never nudged or compacted again.
- **No parent-side view** of a child's window size, % used and age in one place. The numbers are in the registry and the agent log, but no tool or page shows them together.
- **Renewal ignores topic.** A follow-up five minutes after a renewal starts cold.

**Options for "singletons":**
- **(A) One session forever, compacted between tasks.** It keeps the context, but drift and compaction cost grow. The role reminder fights the drift ([context-drift](/framework/ai/doc/context-drift.md)).
- **(B) Today's renewal by age or size.** Simple and cheap. It loses context at arbitrary moments.
- **(C) Reuse by topic and recency** (the owner's idea). A message on the same topic within ~30 min reopens the warm session. A new topic, or a long gap, renews. It needs a topic per message, which the asks ledger and `claim_topic` already give for many. Cost: a topic match per wake (code, not an LLM).

**Recommendation:** (C) built on (B). Renew when the topic changes or after 30 min idle with context over 100k. Otherwise resume. Plus two small fixes worth doing first:
- set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (or the SDK's equivalent) high enough that Servex's own between-turn compaction always fires first;
- a 10-minute timeout on `compacting` that clears the flag and logs `compact-timeout`.

These change Servex's lifecycle, so they go to `ai-system-mastermind` as proposals, not quiet edits (⬜ below).

## Open (⬜), each small

- ⬜ A renewal writes a record line linking the two sessions (`{"session":{"id":<new>,"replaces":<old>,"agent":<id>}}` in the new folder), so the session page can show the chain.
- ⬜ Stamp the caller's session id on item-tool writes. A tab's writes carry its own id.
- ⬜ Merge the `2026/10/24/session-e00f55c9/` folder into `2026/10/20/` with a scripted move (manifest, dry run).
- ⬜ Re-index `2026/09/19/session-a1c1d1e1/`: move its mixed `cache.jsonl` aside so the indexer rebuilds one folder per id. Low value: these were test sessions.
- ⬜ Fold `DatedFiles.session_dir` and `Session.locate` into one naming rule.
- ⬜ Compaction: auto-compact threshold and timeout (above), proposed to `ai-system-mastermind`.
- ⬜ Find why the SDK's `total_cost_usd` runs 1.3 to 1.7 times the `AISession` price of the same transcript (likely the cache-write price or the model's rate), and why a turn near a renewal lands on the session before. Numbers above; one session pair is enough to test.
- ⬜ Give every Servex child a `task_dir` (or link it by `parent_session` alone), so `minion-process-page` and its kind are reachable from the parent's record.
