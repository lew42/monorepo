# Owner notes, 2026-10-16 (late): compaction (dictated; decision by voice-app)

Facts today: `roles.js` `MASTERMIND_COMPACT = {tokens: 150000, minutes: 45}` (2026-10-13). `Agents.oversized()` queues a `/compact` turn at the END of a turn once a mastermind's context passes 150k, or once it is 45 minutes old with more than 20k context; minions never; everyone else at the host default of 200k. The `/compact` is a queued prompt in the same session, so messages that arrive during it run after it, in order. Whether the SDK's compaction keeps the tail of the conversation exactly is not verified; verify once.

## The owner's rule

- Do not auto-compact in an interruptible way. A mastermind mid-work has read files it needs for its decisions, and it is all cached; compacting then loses the context and buys nothing.
- The cost to avoid is the other case: a huge context whose cache has gone cold, then a small question arrives and the whole thing is re-written to cache for old business.
- Agents cannot be trusted to compact themselves: they forget, and they often do not know their own context size (the owner saw this in the Claude app too).
- So node does the knowing and the asking: when an agent goes idle and its context is large, node tells it the number and says: you are on a break; compact now if nothing in flight needs this context. The agent decides; node never cuts in mid-flight.

## Decided (voice-app, on the owner's standing delegation)

1. Drop the 45-minute age rule. Age is not a reason.
2. At 150k (mastermind) / 200k (others): no auto `/compact`. Instead, when the agent's state becomes idle, node sends one message: "Context: N tokens, cache warm/cold (last turn M minutes ago). You are idle. Compact now unless something in flight needs this context." Sent once per idle period, again only if the context grew.
3. A hard auto-compact stays only as a safety ceiling for memory and the model window, set well above working size (400k), at the end of a turn, never mid-turn.
4. Log every nudge and every compaction (`compacting` events already exist) with the token count before and after, so the policy can be judged later.
5. Verify once what the SDK keeps across `/compact` (a message queued during the compaction, the last few turns), and write the answer here.

Filed to Servex/agents' inbox; built on a worktree by a helper; the Servex restart that applies it waits until the task-system build is quiet.

## Built, and what the SDK does (helper-compact-nudge, 2026-10-16)

Built: `Agent.nudge()`/`nudge_send()`, `oversized()` cut down to the 400k/memory ceiling, `compact_nudge` events, a `compact_self` tool (nothing could run `/compact` from inside a turn before, so the nudge needed an answer), test `agents/compact-nudge.test.mjs`. Docs: `Servex/agents/doc/lifecycle.md`, `Servex/doc/dormant.md`. Applying it needs `node Servex/sustain.mjs --restart`.

**Decision 5, what the SDK keeps across `/compact` (partly verified, from the installed `@anthropic-ai/claude-agent-sdk` types; no live run):** compaction is done by the CLI, and the SDK reports it as a `compact_boundary` system message whose `compact_metadata` has `trigger: "manual" | "auto"`, `pre_tokens`, `post_tokens` and an optional `preserved_messages` / `preserved_segment` ("messagesToKeep": the summary is spliced in front of a kept tail; unset when everything is summarised), so the CLI can keep a tail of recent messages, but how many is not in the types. Verified: the system prompt is recorded once and a compaction is where it is re-rendered. The CLI also has its OWN auto-compact (`autoCompactEnabled`, `autoCompactWindow`, `trigger: "auto"`), which Servex never switches off, so it can still fire near the model window. Not verified: that a message queued during `/compact` runs after it, in order, and exactly which tail survives; that needs one live run watching `compact_boundary` (its `preserved_messages` count) with a message queued behind a `/compact`.

## The owner, 2026-10-22: step reminders, earlier

Remind sooner and in steps: at about 30% of the window, then every 5% (on a 1M window: 300k, 350k, 400k…), each reminder giving the size and suggesting a compaction at the next natural break (an investigation done, no tools in flight). The agent decides; node only reminds. Today's policy (one idle nudge past 150k/200k, a 400k ceiling) is the base: ⬜ add the step reminders, and reconsider 150k as the first one.

✅ **Built (2026-10-22, `Agent.nudge()` in `Servex/agents/Agents.js`):** after the first reminder, the next comes each time the context grows another **5% of the window** (`WINDOW_TOKENS` 1M, `SERVEX_WINDOW_TOKENS` overrides): 150k, 200k, 250k… for a mastermind, up to the 400k forced compaction. Each reminder gives the size, its share of the window and the cache state, and asks for a compaction at the next natural break. **Reconsidered:** the first reminder stays at the role's line (150k for a mastermind, 200k otherwise), not 30%. With a 400k ceiling, a first reminder at 300k would leave only two before the forced one. Test: `node Servex/agents/compact-nudge.test.mjs` (24 checks).
