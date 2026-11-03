---
name: fork-claude-session
description: Spawn worker Claude processes that inherit the CURRENT conversation's full context — loaded files, tool results, reasoning — instead of starting cold like Agent subagents do. Use when the user asks to "fork the session", "fork my context", or wants parallel workers that have already read what you've read. Covers finding the live session ID, `claude --resume --fork-session`, setting each fork's model and thinking effort, fanning out N forks, and collecting their JSON results.
---

# Fork the current session

A fork is a new `claude` process that starts with this session's whole transcript, so it knows everything you have read. An `Agent` subagent starts cold, with only the prompt you write.

**Fork only when re-deriving the context would cost more than re-sending it.** Each fork re-sends the entire transcript as input, so N forks cost N × your context. A distilled brief to a cold agent is usually far cheaper; in this repo the normal route is `spawn_agent` on Servex (the `mastermind` skill).

```bash
claude --resume "$CLAUDE_CODE_SESSION_ID" --fork-session -p "the worker's instructions" \
  --model <full id> --effort <low|medium|high> --output-format json
```

- `--fork-session` is **not optional**: plain `--resume` appends into your own transcript and parallel workers corrupt it.
- Set `--model` and `--effort` per fork: a cheap, shallow worker for mechanical work, a deep one for a judgment call.
- For many forks, fork a small **library** session (cold-started with `--session-id`, it reads the shared files and exits), not your working session.
- Any process you start sets `windowsHide: true`.

**Read [`reference.md`](reference.md) before your first fork:** finding the session id without the env var, the library pattern with sizing, fanning out from one message, the JSON result shape, and the sharp edges verified so far.
