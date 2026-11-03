# Accounting: handoff to a replacement mastermind

You are taking over session accounting and past-work retrieval from `helper-accounting` (session `0f6b7ccf-225d-43c1-aaf0-55e795194a15`; resume it with `spawn_agent({resume, fork: true})` if you need its full context). **The owner's rule: nothing is built until they approve a shape.** The voice agent (voice-app) relays the owner's asks.

## Read these, in order

```
accounting/
  requirements.md     the owner's asks, R1–R17
  shape.md            the proposal (full: doc/shape-full.md)
  answers.md          the verdicts (full: doc/answers-full.md)
  cloud-voice-log.md  cloud sessions
  facts.md            counts behind the shape
  task.jsonl          every finding, with commits
```

1. [requirements.md](requirements.md): the owner's 17 requirements, quoted word for word where it matters.
2. [shape.md](shape.md) ([full](doc/shape-full.md)): the proposed session / sub-session / task folder shape. The facts behind it are in [facts.md](facts.md).
3. [answers.md](answers.md) ([full](doc/answers-full.md)): measured answers for Q1–Q2 and R10–R14, including the counters to delete and the list of copies to scrap.
4. [cloud-voice-log.md](cloud-voice-log.md): the proposed log for cloud (claude.ai) sessions.
5. [task.jsonl](task.jsonl): every finding, with commit hashes.

## Where it stands

- ✅ **The policy is off** (`Servex/agents/policy.js`, `511d6611d`). Servex restarted fine. `SERVEX_POLICY=on` turns the rules back on.
- ⚠️ **Minions can't start right now:** the spawn test was refused with "No pool worktree is ready for minion" (`Agents.js:131`), because all 3 pool slots are taken (`.worktree-pool.json`: qf-8 by fixer-1 since 10-14, qf-4 and qf-7 by mastermind-voice-opus since 10-15). Helpers spawn fine: `helper-spawn-test` answered in 32 s, but cost $0.28 for one sentence on Haiku.
- ✅ **Agreed with mastermind-page:** `Session extends Item` and has a page. `session.jsonl` holds the data and `page.jsonl` holds what agents draw. Children are plain child folders; `sessions` and `tasks` are filtered Lists over them. There is one `item({path, method, target, args})` tool.

## Open questions for the owner

1. **Approve the shape** ([shape.md](shape.md) ([full](doc/shape-full.md))), with the folder name equal to the agent id ([R12](answers.md#r12)).
2. **Usage, live (proposed in shape.md):** the Digest writes a derived `cost` line after each turn; no per-turn usage log.
3. **Writers (agreed):** every line is written by code (tools); the item tool refuses agent writes of `session`, `child` and `cost`.
4. **Scrapping `agent-<id>.jsonl`:** what replaces the live dashboard stream (`delta` lines) and `turn_cost`.
5. **The rename (R15, decided):** four commits, in [shape.md](shape.md).

## Rules that bit this task

- **Hand-writing a `.jsonl` is blocked,** even a heredoc that only mentions one. Put the lines in a JSON array in a scratch `.json` file and run `node .claude/hooks/append.mjs <target> <scratch>`. Lines take the shape `{"log":{"at":"NOW","msg":"..."}}`.
- **Restart Servex** with `node Servex/sustain.mjs --restart`, and watch `%LOCALAPPDATA%/lew42/servex/logs/sustain.log` for "back as pid". Never restart during a voice call without the owner's go-ahead.
