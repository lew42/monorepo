# Proposal — messaging and responsiveness

## 1. The rule

**A mastermind's own session only reads messages, decides, and sends messages. Any work that takes
more than a few seconds goes to someone else — a fork when the work needs what the mastermind already
knows, a minion when it writes files — so a message sent to the mastermind is answered in one short
turn, not after minutes of tool calls.**

## 2. The design

### Who may message whom

A message is a doorbell; the state lives in the logs ([coordination.md](/framework/ai/2026-09-22/tiers-design/doc/coordination.md)).
Each agent talks up to its parent and down to its own children, never sideways.

| sender | may message | how |
|---|---|---|
| Owner | the fast assistant (always the first stop) | a `prompt` line in the `prompts` log |
| Fast assistant | the agent whose `topics`/`page` match in `registry.json`; with no single match, the mastermind | `send_to_agent`, priority `next` |
| Mastermind / task mastermind | its own children; the master assistant for an opinion | `send_to_agent` |
| Minion, sub-mastermind | only its parent, and only by ending a turn | `wake_parent` (`done` / `blocked` / `error`) — automatic |
| Fork | only the agent that forked it | its answer comes back through the same wake, `from: fork-<caller>-<n>` |
| VS Code tab (not held by Servex) | anyone, like the fast assistant does | `send_to_agent`, then `wait_for_agent(id)` running in the background |

Siblings never message each other: A says `BLOCKED: need B's X` and the parent decides. A tree cannot loop.

A VS Code tab has no queue Servex can push into, so it *pulls*: `wait_for_agent` in the background.
That is the only place `wait_for_agent` belongs.

### Three priorities, all already in the SDK

The SDK takes `priority: 'now' | 'next' | 'later'` (checked in `agentSdkTypes.d.ts`), and `Agent.send()`
already passes it through; today only `now` is used. Each gets one fixed meaning:

- **`now`** — "stop". It cancels the turn in progress (measured 2026-09-22), so it is only for the owner
  saying stop, or a parent cancelling a child that is doing the wrong thing.
- **`next`** — a person is waiting: the owner's words relayed by the fast assistant, a question from a
  VS Code tab, a child that is `blocked`. It jumps ahead of everything else in the queue, but it does not
  cut off the current turn.
- **`later`** — `done` wakes and fork answers. Nobody is waiting on these in real time.

The rule for choosing is in `Agents.wake_parent` and the fast assistant's `send`, not in each agent's
head: `blocked` → `next`, `done`/`error`/fork answer → `later`, relayed owner words → `next`.

### How the mastermind keeps its session free

What slows a mastermind is its own tool calls — a `Read` sweep, a `Bash` build, a sleep loop — because a
`next` message only lands when the turn ends. So in `roles.js`, `mastermind` and `task-mastermind` get:
`spawn_agent, send_to_agent, fork_self, list_agents, interrupt_agent, stop_agent, append_log`, plus `Read`
(for a brief or the tail of a log). They get no `Bash`, `Edit` or `Write`. If they cannot run the slow
thing, they cannot get stuck in it.

When the mastermind needs work done, it picks exactly one route:

| the work… | route | why |
|---|---|---|
| is a decision that needs what I already know ("read these three files, then pick A or B"), writes nothing, takes minutes at most | **`fork_self(question)`** | the fork starts with my whole context from the prompt cache; I stay free |
| writes files, needs a fence, runs long, or should show on the board and be resumable | **`spawn_agent` a minion** | a cold start is fine; it gets a brief and a fence |
| needs one or two sentences of judgement | **`send_to_agent` the master assistant** | it is already warm and does exactly that |
| needs to know when an agent finishes | **nothing** — the wake arrives by itself | a Servex agent never waits |

### Coalescing: one turn for many wakes

When three children finish while the mastermind is busy, it should not pay for three turns. Before the
queue hands them to the SDK, `later` messages from the same parent's children are merged into one
envelope: `[from: minion-a, minion-b, fork-mastermind-3]` with one line each. `next` and `now` are never
merged, because a person is waiting on each one.

**Logging adds nothing new:** every message is already an `agent_msg` line (`from`, `reply_to`,
`priority`) in the receiver's log. A fork gets a `registry.json` row with `role: "fork"`, `parent` and
`visibility: "internal"`, so the AI board draws it as a small dot under its caller, not a new card.

## 3. Timing

Today a message to a mastermind waits for its whole turn to end — one to five minutes when the turn
reads a sweep of files, runs a build or sleeps on a child *(guess, not measured)*. A turn of only
coordination tools is one model call, about 10–30 s for Opus *(guess)*. So a relayed question is
answered in **about 30 seconds instead of several minutes**, and `next` skips any queued `done` wakes.
The fast assistant still answers first, in 2 s (measured, [prompt-lifecycle](/framework/ai/2026-09-22/prompt-lifecycle/)).

A fork reads its prompt from the cache at about a tenth of the input price: forking a 100k-token session
costs roughly 10k fresh tokens plus its answer *(estimate — use the sibling's measured `cache_read`)*.
Coalescing saves one turn per extra wake — three minions finishing together save two turns.

## 4. The picture

```
  Owner ──prompt──▶ Fast assistant ─────next─────▶ Mastermind  ◀──next── VS Code tab
                     (2 s, Sonnet)                 (coordination           │  └─ wait_for_agent
                                                    tools only)            │     (background pull)
                                          ┌──────────┼──────────┐
                                  fork_self│   spawn  │   spawn  │
                                          ▼          ▼          ▼
                                   ┌─ fork ─┐   minion A    minion B
                                   └────────┘       │           │
                                          │       done:later  blocked:next ──▶ jumps the queue
                                          └──answer:later──┘──▶ coalesced into ONE turn
```

Orders go down, wakes come up, nothing goes sideways; the fork is drawn small and grey — it is disposable.

## 5. What to build next (best benefit per effort first)

1. **Tool list per role in `roles.js`**: masterminds get only coordination tools and `Read`. About one
   line per role, and it is what makes every other part of this work.
2. **Priority by message kind**: `wake_parent` sends `blocked` as `next` and `done` as `later`; the fast
   assistant relays owner words as `next`. About three lines, in `Agents.js`.
3. **Wake coalescing in `Agent.Queue`**: merge `later` messages that are waiting while the agent is busy.
   About thirty lines. Measure turns saved before and after.

## 6. What NOT to do

- **A fork that forks, spawns, or writes files.** Give forks read-only tools and a depth of one, at most
  three running per caller. Otherwise it recurses and burns tokens, and two agents end up in one file.
- **`wait_for_agent` inside a Servex agent, or `now` for anything but "stop".** The first blocks the very
  session this design frees. The second throws away the turn in progress.
- **Siblings messaging siblings.** The number of possible conversations grows with the square of the
  team, and each message costs the receiver a turn. Go through the log and the parent.
