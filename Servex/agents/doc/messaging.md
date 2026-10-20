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

## Next (not built)

- The wake's body becomes the child's new log lines instead of its last chat words, so even the "done" is read from the file.
- `Follow` could skip the hook-written noise lines (`log: "skill: …"`) so they never wake a parent.

Related: [follow.md](../../doc/follow.md) (the follow tool) · [module-inbox.md](../../doc/module-inbox.md) · [inbox.md](../../doc/inbox.md) (page inbox) · [external.md](external.md) (VS Code tabs) · [context-loss.md](/framework/ai/doc/context-loss.md) (why only files survive).
