# How agents talk to each other, and what survives on disk

An agent's context window dies when its session ends. Only files survive, and only files in the repo are found by the next agent (the readme chain leads there; Servex's own logs live outside the repo, in `%LOCALAPPDATA%\lew42\servex\logs\`, and no readme leads a new agent into them). This page lists every way one agent reaches another today, verified against the code on 2026-10-20, and says where each message ends up.

## Every path, and where it lands

| Path | How it works (code) | In the repo (committed) | Outside the repo (Servex home) | Only in a context window |
|---|---|---|---|---|
| `send_to_agent` | `tools.js` → `Agents.send` → `Agent.send` queues a turn | nothing | `logs/agent-<to>.jsonl` (an `agent_msg` event); a VS Code tab gets `logs/inbox/<id>.jsonl` (`External.deliver`) | the question and the whole answer |
| The parent wake (a child ends a turn) | `Agent.log` on `result` → `Agents.wake_parent`: the child's last words, up to 4000 chars | one line in the parent's task dir, `inbox.jsonl` (`Agents.inbox`) | the parent's agent log | everything the child did not put in its last words |
| `fork_self` | `Agents.fork`: a copy of the caller answers once; the answer comes back as a wake starting `fork answer:` | `inbox.jsonl` in the caller's dir, if it has one | the fork's and the caller's agent logs | the reasoning behind the answer |
| `wait_for_agent` | `Agents.wait`: blocks, then returns what the agent said that turn | nothing | nothing new | all of it |
| `follow` | `Servex/Follow.js`: a file under a module changes, the follower gets the new lines as a message (`from: servex-follow`) | the source is already a file in the repo | `follow.json` (the subscriptions) | nothing that matters: the file is the truth |
| Module inbox | `ModuleInbox.add` (`module_inbox` tool): one line in `<module>/inbox.jsonl`; nobody is woken | the line | — | — |
| Page inbox | `page_note`: a `note` line in the page's `page.jsonl`; wakes the page's coordinator | the line | — | the coordinator's answer, unless it writes one |
| Cards | `card_reply` / `card_ask`: a line in the card's log, streamed to the owner's screen | nothing | `cards/<slug>` log | — |
| `interrupt_agent` | stops a turn; carries no words | — | an event in the agent log | — |

**The gap:** the two paths agents use most, `send_to_agent` and the parent wake, put their substance in a context window. The repo keeps at most a 4000-character headline (`inbox.jsonl`). When either session ends, what the child found and why is gone unless the child wrote it to a file.

## The rule since 2026-10-20: logs over messages

Decision `d-how-does-a-spawned-agent` (written by `Server/Decide.mjs` into [the task log](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/), option C, decided by the system architect):

- **A spawned agent reports by logging.** It writes an overview of what it is doing (what is open, what it is working on, what it decided, what landed; not the fine detail) to its own `session.jsonl` with `node .claude/hooks/append.mjs`. The `minion` skill says so.
- **The parent tails that log.** `Agents.spawn` subscribes the parent to the child's `session.jsonl` through `Follow` (`Agents.follow_child`), gathering 60 seconds of lines into one message so a busy log does not cost the parent a turn per line. The subscription ends when the child stops (`Follow.agent_ended` drops every subscription whose `of` is the child). Not for the Dispatcher (not a real agent) or a spawn with no task dir. `SERVEX_NO_CHILD_FOLLOW=1` turns it off; `SERVEX_CHILD_FOLLOW_MS` changes the window.
- **Chat is for a quick clarification.** The turn-end wake stays as the one "done" signal; its words should be one line pointing at the log.

Alternatives considered: (A) the same follow without the 60-second window or the cleanup: every log burst wakes the parent for a paid turn, and dead logs stay watched. (B) keep chat first and mirror it to the log: the report still lives mainly in a context window, and two copies drift.

## Across platforms (2026-10-20)

The same rule holds when the agents run in different places: a Servex agent, a VS Code tab, and a cloud voice agent in the Claude app.

1. **Every agent writes only to its own `session.jsonl`**, through the `log` tool or `append.mjs`, never by hand.
2. **Parents follow their children by default** (`Agents.follow_child`), and peers follow each other on request. A cloud agent cannot follow a log, so it reads other logs with `read_file` on its own turn.
3. **An inbox (`logs/inbox/<id>.jsonl`) is the addressed nudge**: "read my log at <path>".
4. **Nothing is copied between logs.**

Decided by [vscode-mastermind](/framework/ai/sessions/2026/10/20/session-e00f55c9/) (building on `d-how-does-a-spawned-agent` above) and logged as a decision in the [voice mastermind's log](/framework/ai/sessions/2026/10/20/voice-20261020/).

## Next (not built)

- The wake's body becomes the child's new log lines instead of its last chat words, so even the "done" is read from the file.
- Done 2026-10-20: a child tail (`of` row) drops heartbeat lines and bare `{"commit":sha}` lines (`Follow.NOISE`), so they never wake a parent. Agents write their lines with the `log` tool ([Server/doc/log-line.md](../../../Server/doc/log-line.md)), which stamps `by` and `session` for them.

Related: [follow.md](../../doc/follow.md) (the follow tool) · [module-inbox.md](../../doc/module-inbox.md) · [inbox.md](../../doc/inbox.md) (page inbox) · [external.md](external.md) (VS Code tabs) · [context-loss.md](/framework/ai/doc/context-loss.md) (why only files survive).

## Open: "inbox" names two things (2026-10-20, from the owner's "what is the inbox?")

The word is used for two different files. The **agent inbox** is `logs/inbox/<agent id>.jsonl` under Servex's log folder (`Servex/agents/External.js`): one line per `send_to_agent` message or `follow` delta for an agent outside Servex (a VS Code tab, the cloud voice agent), read by a tail or the `updates` tool. The **page inbox** is a page's own `inbox.jsonl` in the repo (`Servex/agents/inbox.js`, the `inbox` and `page_note` tools): notes left for whoever works on that page next. An agent inside Servex has neither; `send_to_agent` hands the text into its next turn. Decision to write (options ranked with `Server/Decide.mjs`): rename the agent one (candidates: *mail*, *messages*, *delivery*), or rename the page one (*notes*). Nothing renamed yet.

## No blocking tools (the owner, 2026-10-22)

A tool call holds its agent until it returns: while it runs, every message to that agent waits in the queue. So: **a synchronous tool must be fast** (a file read, a lookup). **Slow work is asynchronous**: the tool returns at once with "accepted" and an id, and the result arrives later as its own message, in an envelope that says what it answers (as `run_in_background` and the `updates` tool already do). ⬜ Mark each Servex tool sync or async, and move the slow ones (spawn-and-wait, `wait_for_agent`, long jobs) to the ticket pattern.

**Where async work drops the ball (the owner, 2026-10-22):** a message sent to an agent that never reads it, a result written to a file nobody tails, a queued reply that arrives after the agent stopped, and context lost when a session ends or compacts. Every async path names who reads its result and when; the process system (`core/Task/doc/process.md`) closes each one in code.
