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

**A session stays on the day it began.** `session_dir` walks every day folder oldest first and takes the first one that holds the id (`DatedFiles.days()`: 66 days, 6 ms). Until 2026-10-24 it looked back 4 days, then 31, newest first, so `TaskDirs --new` found or opened a later folder: this tab was split across `2026/10/20/session-e00f55c9/` and `2026/10/24/session-e00f55c9/`. The check below reports a split as `split`.

## One session, one folder, one URL (2026-10-25)

The owner: "We don't want two folders for the same thing… the web page at a different path than the actual path that saves all of its stuff… that's confusing and wrong" ([brief, last section](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/requirements.md)).

**The folder.** A session's one folder is `ai/sessions/YYYY/MM/DD/session-<first 8 hex>/` on the day it began. Everything it writes goes there: its record (`session.jsonl`), its prompts (`prompts.jsonl`, and the prompt cards in `page.jsonl`), its cache and its task folders. The folder is **named by the id** because an id is stable and unique: a title changes, an id never does. The page shows the readable title.

**How a tab gets its folder.** The SessionStart hook `.claude/hooks/session-page.mjs` gets the id from Claude Code itself and writes line 1, `{"session":{"id","kind":"vscode-tab"}}`, into `DatedFiles.sessions.session_dir(id)`. Every later writer finds the same folder with the same call: the prompt hook `prompt-relay.mjs`, `TaskDirs --new` (through `$CLAUDE_CODE_SESSION_ID`) and the item tool (through `Session.scan`, which reads that line 1).

**What was split, and how it was folded.** e00f55c9 had three folders: the record (10/20); the old card folder `ai/2026/10/20/session-e00f55c9/`, where `prompt-relay.mjs` wrote every prompt card (504 lines) through a tmp marker; and `ai/sessions/2026/10/24/session-e00f55c9/` (2 task folders), opened by `TaskDirs`. Now:
- `prompt-relay.mjs` writes to `session_dir(id)`, the record's folder; the marker is no longer read.
- `session_dir` takes the oldest folder (above).
- `node Server/SessionConsolidate.mjs <uuid>` (dry run) and `--apply --manifest <file>` fold every second folder into the first: subfolders move in (a `task` line in `ai/sessions/task-moves.jsonl`), `.jsonl` lines are appended in order (no duplicates, URLs rewritten), originals are copied to `%LOCALAPPDATA%/lew42/servex/moved-aside/<run>/` first (`page.jsonl` is gitignored, so git cannot undo it), a `redirect` line maps the old URL, and links in `.md`/`.js` files are rewritten.

**The URL.** The page is the folder's own path, `/framework/ai/sessions/2026/10/20/session-e00f55c9/`. The uuid URL `/framework/ai/sessions/<uuid>/` only redirects there (the AISession readme says how the router does it).

**The stray `ai/sessions/a56900e3-…/`.** A session whose transcript holds no message (126 bytes; title "Dictation cleanup and outline instructions"). `Session.locate` leaves an old flat folder in place until the session's `first_at` is known, and an empty session never gets one. It now files such a folder by the folder's own date.

## A typed id that drifts (typo-proof paths, 2026-10-25)

The owner: "What if the session ID drifts in context by one character, and now we're writing to a different session directory?" Hooks and scripts take the id from Claude Code, so they cannot drift. **The risk is a path an agent types**, in an item-tool `path` or a brief.

- **A session folder is made only by the SessionStart hook, `TaskDirs` or a spawn**, never because a path was typed. The page tools (`Servex/agents/page_tools.js`, `resolve()`) refuse, and write nothing, when a path names a uuid with no folder, no transcript and no Servex agent; an agent name the registry does not know; or a dated session folder (or a folder inside one) that is not on disk. The answer names the nearest real id or folder (one character off is distance 1). Tests: `node Servex/agents/page_tools.test.mjs`.
- **Your own session, with no id typed:** omit `path`. A Servex agent's MCP connection carries its id (`?as=<agent id>`), so `item({delta})` writes to its own page.
- **A VS Code tab cannot do that yet.** Its MCP connection (`.mcp.json`) carries no caller, so an omitted `path` has no owner and the tab must pass the path the SessionStart hook printed. The refusal above is what protects it. ⬜ The fix is a caller on the tab's connection, for example `"url": "http://servex.localhost/mcp?as=${CLAUDE_CODE_SESSION_ID}"` if Claude Code expands that variable when it connects. That is shared config and changes how every tab is addressed, so it is proposed to `ai-system-mastermind`, not made here.

## Every way an id can change

| Event | Same id? | What links old and new |
|---|---|---|
| **Compaction** (`/compact`, or the CLI's own auto-compact) | Same | Nothing is needed. |
| **Tab reload / resume in VS Code** | Same | The extension re-appends earlier lines to the same file. This tab has 8,720 repeated line uuids. That is harmless for cost, because a message counts once by `message.id` (`AISession.merge_usage`), but a line counter must dedupe by `uuid`. |
| **SDK resume** (`resume: <id>`: a dormant agent woken, a revive after a Servex restart) | Same | The registry row's `resumed_from` (= its own id after a plain resume). |
| **Fork** (`fork_self`, `spawn_agent {resume, fork: true}`) | New | The registry row's `forked_from`. A fork's transcript starts with a copy of the parent's history, so the same message ids appear in two files. The check counts any shared ids. |
| **Renewal** (a role with `renew`) | New | The agent log's `renew` line (`replaces` → `session`). Nothing on disk under `ai/sessions` links the two folders yet (⬜ below). |
| **Respawn under a reused id** (a reviewer reusing its name, `assistant-fast` on every Servex boot) | New | Since 2026-10-24, the spawn writes a `renew` line with `why: "respawn"` (`replaces` → `session`). Before that, nothing linked them. A spawn with its own system brief also writes `why: "spawn"` for its first session, because it gets no whoami line. |
| **Another MCP's "session"** (Figma `create_session`) | Not a Claude id | It lives only in tool arguments. Readers must use the **top-level** `sessionId` of a transcript line, never grep for a uuid. |

### A Servex restart keeps every id (proved on the 23:13 restart, 2026-10-24)

The rule: a restart revives each agent by SDK resume, so its id never changes. Only a renewal or a respawn may give an agent id a new session, and either one writes a `renew` line linking the two.

The proof, computed from the registry, the agent logs and the transcripts:
- **11 of 11** agents revived after the restart kept their id. Each has `resumed_from` equal to its `session_id`, a process start within 15 minutes of the restart, and one transcript with lines both before and after it. None carries a foreign id. Among them: `mastermind-deputy` (d9c3caec), `mastermind-page` (83e9996a), `ai-system-mastermind` (7c6c8d93) and this task (83b71020).
- **3 agents got a new id after the restart, and none of them is a fork.** `assistant-fast` starts a fresh session on every boot by design (`Assistant.start()`; its memory is the prompts log). `reviewer-minion-tracking-perf` and `-2` were spawned again under their old names at 23:29 and 23:33. All three were unlinked until this change.

### Why ai-system-mastermind became 7c6c8d93 (2026-10-24)

1. At 21:07:56, session `2da03974` went dormant with **130,131 tokens** of context, past the role's `renew` line of 100k tokens.
2. At 21:32:54, a message woke it ("session-is-a-task brief, part 4"). `wake()` saw that `renew_due` was `tokens` and spawned a fresh session, `7c6c8d93`, under the same id. The agent log's line 3901 records the switch: `{"type":"renew","why":"tokens","replaces":"2da03974…","session":"7c6c8d93…"}`.
3. The held message was replayed to the new session. Nothing was in flight: a renewal only happens from dormant or stopped.
4. **Cost is counted once.** Each transcript is priced on its own (2da03974 $10.59, 7c6c8d93 $11.95), and no message id is in both. In the agent ledger, each turn now carries its own session (`turn_costs`).

The role readme says so: the role can be renewed at any time, so it logs everything as it goes and needs no hand-off ([ai-system-mastermind.md](/Servex/agents/roles/ai-system-mastermind.md)).

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
- ⬜ Run `Server/SessionConsolidate.mjs` over every session the check reports as `split` (e00f55c9 is folded first, by hand, once its hook fix is live).
- ⬜ Give a VS Code tab's MCP connection its caller, so `item` with no `path` finds its own page (above).
- ⬜ Re-index `2026/09/19/session-a1c1d1e1/`: move its mixed `cache.jsonl` aside so the indexer rebuilds one folder per id. Low value: these were test sessions.
- ⬜ Fold `DatedFiles.session_dir` and `Session.locate` into one naming rule.
- ⬜ Compaction: auto-compact threshold and timeout (above), proposed to `ai-system-mastermind`.
- ⬜ Find why the SDK's `total_cost_usd` runs 1.3 to 1.7 times the `AISession` price of the same transcript (likely the cache-write price or the model's rate), and why a turn near a renewal lands on the session before. Numbers above; one session pair is enough to test.
- ⬜ Give every Servex child a `task_dir` (or link it by `parent_session` alone), so `minion-process-page` and its kind are reachable from the parent's record.
