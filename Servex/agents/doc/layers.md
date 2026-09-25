# The assistant layers

Every card on the AI dashboard gets two agents of its own. Two more agents watch across all
cards. Every agent talks under its own id, so a message always says who it is from: you (the
owner), or one of them. This page says how that works, as the code does it today.

Code: [`Layers.js`](../Layers.js) (the two agents on each card), [`Global.js`](../Global.js) (the
two across cards, the reaper, the memory check), [`policy.js`](../policy.js),
[`claims.js`](../claims.js), [`brief.js`](../brief.js), [`tiers.js`](../tiers.js).

## The four agents

| agent | id | tier, effort | its job |
|---|---|---|---|
| card assistant | `assistant-<card>` | fast (Sonnet), low | Hears every prompt spoken on its card and turns it into UI within seconds. Has no repo tools. |
| card manager | `manager-<card>` | manager (Opus), medium | Started by its assistant when something needs doing. Plans, claims the topic, starts minions, reports on the card. |
| master assistant | `master-assistant` | fast, medium | Hears every card in one batch every 20 seconds. Silent unless two cards collide or something failed. |
| Servex mastermind | `mastermind-servex` | architect (Opus), medium | Keeps the claims list honest, settles what crosses cards, writes today's focus. |

`<card>` is the card's last path segment (`2026/09/24/fix-the-sidebar` gives
`assistant-fix-the-sidebar`). A card is always the first four segments of an id; a sub-card belongs
to its root card. If two cards end in the same word, the second gets `-2`. Ids are minted once
and kept in `layers.json` (in `%LOCALAPPDATA%/lew42/servex/`), beside each agent's session id.

## A card's life

1. **First words.** You speak on a card. The card's assistant is started with the card's whole
   log in its first message, so it needs nothing more. It answers with tool calls only:
   `card_reply`, `create_card`, `card_set`.
2. **Something needs doing.** The assistant makes a request sub-card holding your words and calls
   `ask_manager`. The first ask starts the manager with the log and the request; later asks are
   messages into the same session. Only `ask_manager` starts a manager, and there is one id per
   card, so a card never has two.
3. **Idle stop.** One cheap timer checks every few seconds. An agent that has been quiet for
   ten minutes is stopped; its session id is kept. A working agent is never stopped, and an
   assistant is left running while its manager is working.
4. **Resume.** The next prompt or ask finds the kept session id and resumes that session under
   the same id, with everything it knew. If the session file is gone, the id starts fresh from
   the card's log and a `session-missing` line goes in the servex log.
5. **Compact.** `POST /api/agent/<id>/compact` tells the agent to write everything important as
   one `summary` line on the card (`card_summary`). Its session is then recycled.
6. **Recycle.** `POST /api/agent/<id>/recycle` (or a `card_summary`) stops it and forgets its
   session id. It keeps its id and restarts from the card's log, from the last `summary` line on.

`GET /api/card-agents?card=<card>` shows each agent's state and how full its context is.

## Who may message and spawn whom

`send_to_agent` and `spawn_agent` ask [`policy.js`](../policy.js) first. A refused message is
not delivered, the sender is told why, and the refusal is logged in the `policy` log. The live
rules and the last 50 refusals are at `/api/policy`. Rules are checked in this order: the owner,
Servex itself, then the parent/child tree, then a reply window, then the table.

| from | may message | may spawn |
|---|---|---|
| owner (a tab), `dispatcher`, `mastermind-servex` | anyone | anything |
| `assistant-X` | `manager-X`, `master-assistant`, `mastermind-servex` | nothing |
| `manager-X` | `assistant-X`, `mastermind-servex` | anything except a task-mastermind, manager, mastermind, master assistant or assistant |
| `master-assistant` | any assistant, `mastermind-servex` | nothing |
| `task-mastermind-*` | `mastermind-servex` | like a manager |
| any other agent (a worker) | see below | only a `minion` or `helper` |

Two rules apply to everyone: an agent may message its **parent** and its **own children** (this is
how a manager talks to its minions), and it may **answer anyone who messaged it in the last 30
minutes**. Nothing else goes sideways, so two managers never message each other; they go through
`mastermind-servex`. `SERVEX_POLICY=off` turns the whole check off.

## Claims

Before starting work, a manager calls `claim_topic({topic, card})`. Topics are compared by a slug
(lower-case words joined by dashes). If another **live** agent already holds the topic, the claim
is refused with that agent's name and the refusal is logged in the `policy` log; the manager then
asks `mastermind-servex`. A claim whose holder has stopped is *stale*: shown as stale by
`list_claims`, and simply taken over by the next claimant. `release_topic` frees one. The list
is one small file, `claims.json`, written only by Servex.

## The one-screen brief

Every long-lived agent's system prompt ends with the same short screen, built by code (never by a
model), at most 25 lines: what is being worked on (claims, six shown), which agents are running
(minions, helpers, forks and jobs left out), and today's focus, a sentence set with `set_focus`
and kept in the servex log. It is read once, when an agent starts or resumes.

## Tiers

[`tiers.js`](../tiers.js) is the one place a tier becomes a model id. `fast` is Sonnet,
`manager` and `architect` are Opus, `scan` is Haiku. To move a tier to another model, change that
one line; nothing else names a model for these four agents.

## Memory

An idle `claude` process holds about 250 MB, so nothing is left running by accident.

- **Idle stop.** Card assistants and managers: 10 minutes. `master-assistant` and
  `mastermind-servex`: 15 minutes. A message to a stopped one resumes it by session id.
  `master-assistant` is the one exception: it starts a fresh session each day.
- **The reaper.** Every minute, a minion, helper or fork that has finished a turn (its parent was
  woken then) and has been idle for 3 minutes is stopped, and a `reaped` line is logged.
- **The admission check.** Before any spawn, `admit()` refuses while less than 4 GB of memory
  is free, or while 30 agents are live. A child of a live parent skips the ceiling, so parents
  never starve waiting on their children. A refused spawn waits and starts when it passes.

## Every setting the layer files read

| variable | default | what it does |
|---|---|---|
| `SERVEX_CARD_IDLE_MS` | 600000 (10 min) | how long a card assistant or manager may be quiet before it is stopped |
| `SERVEX_GLOBAL_IDLE_MS` | 900000 (15 min) | the same for `master-assistant` and `mastermind-servex` |
| `SERVEX_REAP_EVERY_MS` | 60000 | how often the reaper looks |
| `SERVEX_REAP_MS` | 180000 (3 min) | how long a finished minion, helper or fork may sit idle |
| `SERVEX_AGENT_CAP` | 30 | most live agents before a new spawn waits |
| `SERVEX_MIN_FREE_MB` | 4096 | free memory needed before a spawn starts |
| `SERVEX_MASTER_BATCH_MS` | 20000 | least time between two batches sent to `master-assistant` |
| `SERVEX_POLICY` | on | `off` disables every message and spawn check |
| `SERVEX_NO_LAYERS` | unset | set to skip the card assistants and managers |
| `SERVEX_NO_ASSISTANT` | unset | set to skip the master assistant, `mastermind-servex` and the fast assistant |
| `SERVEX_HOME` | `%LOCALAPPDATA%/lew42/servex` | where `claims.json` lives |
| `CLAUDE_CONFIG_DIR` | `~/.claude` | where Layers looks for a session file before resuming it |
| `LOCALAPPDATA` | set by Windows | root of the `layers.json` state file |
