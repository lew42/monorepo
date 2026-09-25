# Forks for side decisions

A fork is a copy of an agent's own session, made at this moment, that goes off and answers one
question while the original keeps talking to everyone else.

## How it works

An agent calls `fork_self(question)`. Servex starts a background session with the SDK's
`query()`, `resume: <the caller's session_id>` and `forkSession: true`. The call returns at once,
the caller ends its turn, and it is free to answer the owner, a child, or another agent. When the
fork finishes, its answer arrives as an ordinary message to the caller, through the same
`wake_parent` path a child uses, with priority `later`. There is no second way to reach an agent.

Because the fork starts from the caller's own conversation, the model reads that whole conversation
from the prompt cache instead of paying for it fresh.

**Measured** ([proof.txt](../proof.txt), Haiku, 2026-09-24): `fork_self` returned in 7 ms. The agent
answered the owner's next message 3 seconds later, while the fork was still running, and the fork's
answer arrived at 19.5 seconds. The fork's input was 42,056 tokens read from the cache (98%), 853
newly cached and 10 fresh. It cost $0.014.

**The cache trap:** a fork must keep its parent's tool list, or the cache misses entirely. A fork
given no tools read 0 cached tokens and paid for 44k fresh ones. So a fork keeps every tool, and a
hook refuses any call a fork is not allowed to make.

## Fork, minion, node job, or ask?

| the work… | route | why |
|---|---|---|
| is a fact: read, count, load a page, run a test, watch a log | **`start_job`** (node) | costs no tokens and needs no model |
| is a decision that needs what I already know, writes nothing, takes minutes at most | **`fork_self(question)`** | starts warm from the cache; I stay free |
| writes files, needs a fence, runs long, or should be resumable on the board | **`spawn_agent`** a minion | a cold start is fine; it gets a brief and a fence |
| needs one or two sentences of judgement | **`send_to_agent`** the master assistant | it is already warm and does exactly that |

## A fork is cheap for one turn and expensive for many

Every tool call a fork makes re-reads the whole cached context. A mastermind at 120k tokens that
forks, and lets the fork read three files in three tool calls, pays four cache reads of 120k —
about the price of 48k fresh tokens (an estimate). The same fork, handed the three files already
read by a node `read` job, answers in one turn: one cache read, about 12k fresh-equivalent.

So the pattern for the owner's "look at these three files, then decide this" is **node reads, the
fork decides**: `start_job({ kind: "read", ... })`, and on its result,
`fork_self("given job-7's result, which ...?")`.

## Limits

- A fork cannot fork, spawn, or write files. It keeps its parent's tools (see the cache trap above),
  and a hook refuses those calls.
- At most three forks run at once per caller.
- A fork is disposable: on the board it is a small dot under its caller, not a card of its own
  (a `registry.json` row with `role: "fork"`, `parent`, `visibility: "internal"`).

From [proposal-messaging.md](../proposal-messaging.md) and [proposal-node.md](../proposal-node.md).
