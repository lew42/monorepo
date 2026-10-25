# Compaction: when a Servex agent's context is summarized, and what makes it hard

See also [context.md](context.md): what a context window is and how its size is read live.

**Compaction** means `/compact`. The CLI replaces the conversation so far with a summary of about 10-20k tokens and keeps a short tail of recent messages. The agent goes on from there. It makes every later turn cheaper and frees memory. The cost is that detail is lost: what the agent read and why it decided things.

This page is the one home for Servex's compaction rules and the factors that make them hard. Its companion, [context-drift.md](context-drift.md), covers what an agent forgets *without* compaction, and what has to survive it.

## The rules today (the code: `Servex/agents/Agents.js`)

1. **Compact before sleep** (the owner, 2026-10-23). An agent about to go dormant compacts first if its context is over its sleep line, then sleeps. The line is 100k tokens, or half the window if that is lower (`SERVEX_SLEEP_COMPACT_TOKENS`, or per role as `compact_after.sleep` in `roles.js`). The next message then wakes a small agent. Code: `Agent.sleep_compact()`.
2. **The nudge** (2026-10-16, with step reminders added 2026-10-22). An idle agent past its role's line (a mastermind at 150k, others at 200k) gets a message with its context size and cache state. It may compact itself with the `compact_self` tool. It is reminded again each time its context grows another 5% of the window. Node only reminds; the agent decides. Code: `Agent.nudge()`.
3. **The safety ceiling.** Past 400k tokens (`SERVEX_COMPACT_TOKENS`) or 500 MB of process memory (`SERVEX_COMPACT_MB`), the agent compacts at the end of its turn, whatever else is going on. A memory compaction also restarts the process, because a process keeps the heap it grew. Code: `Agent.oversized()`.
4. **Who is left out:** minions (`compact_after: null`; they live 10-30 minutes), the standing front desk (`assistant-*`, `manager-*`, `master-assistant`, `session-*`, the Dispatcher; Layers.js restarts these fresh from a checkpoint instead), and forks.
5. **After every compaction** a short role reminder is added to the agent's next prompt or tool call. See [context-drift.md](context-drift.md).

Every nudge, compaction and reminder is logged in the agent's Servex log as `compact_nudge`, `compacting` / `compact` (with `why`, the tokens `before` and `after`, `turn_cost`, `duration_ms`) and `role_reminder`.

## What makes it hard: the complicating factors

- **Compaction loses detail.** The owner's rule (2026-10-16): never compact a mastermind mid-work. It has read files it needs, and they are all cached. Compacting then loses that context and saves nothing. That is why the soft rules wait for idle or sleep, and only the ceiling cuts in.
- **The cache decides the cost.** The prompt cache lasts 5 minutes. A compaction on a warm cache re-reads the history cheaply. A huge cold context woken for one small question re-writes the whole history to cache. Compacting at the sleep moment falls inside the cache's 5 minutes for every default idle wait: 3 minutes, 30 s when RAM is tight, 0 for a task mastermind.
- **Measured cost of one compaction** (Servex's own `compact` lines): 158,513 → 16,746 tokens for **$0.24 in 61 s** (Sonnet, warm). 57k → 5k cost $0.08 in 15 s. Waking that 158k agent cold without compacting re-writes 158k to cache: about $0.59 at $3 per million input tokens. One compaction pays for itself at the first wake. An agent that never wakes again paid for its compaction for nothing.
- **Agents can't be trusted to compact themselves.** They forget, and they often don't know their own context size. So node does the counting and the reminding.
- **What survives a compaction.** The system prompt, CLAUDE.md and the tool definitions sit outside the conversation and are kept. The conversation is summarized, and so is anything injected into the first message. That is why the role text moved into the system prompt (2026-10-23, [context-drift.md](context-drift.md)). The SDK reports a compaction as a `compact_boundary` message: `pre_tokens`, `post_tokens`, and `preserved_messages` (the tail it kept). [Live proof](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/compact-before-sleep/role-system-proof.txt): 25,885 → 1,334 tokens, with the role text still there afterwards.
- **A compaction is a turn.** `/compact` is queued like a message. A message that arrives during it runs after it, in order. A sleep-compaction that finds a message waiting stays awake for that turn.
- **Repeat compactions.** Each rule fires at most once per turn (`compacted_turn`). A memory compaction clears the old process's memory reading, so it is not compacted again for nothing. On 2026-10-19, `task-mastermind-voice-opus` compacted three times in four minutes on a stale 698 MB reading.
- **The CLI's own auto-compact** (`autoCompactEnabled`, `trigger: "auto"`) can still fire near the model window. Servex never turns it off.
- **A compaction holds a working slot** while it runs (the working cap of 5, [dormant.md](/Servex/doc/dormant.md)).
- **The system prompt is recorded once** per session (the SDK's `snapshot`). A changed role readme reaches a running session only at its next compaction.

## History and sources

- The owner's dictation and the decisions taken on it (2026-10-16, step reminders 2026-10-22, compact before sleep 2026-10-23): [Servex/agents/doc/owner-2026-10-16-compaction.md](/Servex/agents/doc/owner-2026-10-16-compaction.md)
- Dormancy, the idle waits and the working cap: [Servex/doc/dormant.md](/Servex/doc/dormant.md)
- Tests: `node Servex/agents/compact-before-sleep.test.mjs`, `node Servex/agents/compact-nudge.test.mjs`
