# Sessions: red flags and wrong numbers

The owner (2026-10-09, VS Code tab 7efd07d5): "Our sessions system should be bulletproof... we need to know exactly how our sessions are doing... programmatic filters to red flag expense or when things stall out." Top priority.

Page: `/framework/ai/sessions/` (code: `public/framework/ai/AISession/`, readme `public/framework/ai/sessions/readme.md`). Read the readme first, then only the files you need.

## Defects seen in a screenshot at 16:31 today (fix these first)
1. **Negative durations** on Servex voice rows in the In-flight strip: `session-smart-v-0kfikyu ... 1m -93102s`, `session-fast-v-0kfikyu ... 5m -94011s`. Find why (probably a start time taken from a later boot / `last_at`), fix it.
2. **"(unknown)" role holds $12,726 of $12,911** (7,270 of 7,845 sessions). Most money has no role, so the "cost by role" chips say nothing. Classify by what is computable (source: VS Code tab / SDK / CLI; the Servex registry; the first prompt naming a skill such as `/mastermind` or "you are a minion"). Leave a true unknown as unknown, but it should be small.
3. **Duplicate chips**: `clarity` and `assistant` each appear twice, plus `(unknown)` and `(n/a)` both. One chip per role.

## Then: red flags (the real ask)
Extend the existing **Needs attention** filter (it reads `alerts` from a session's session.jsonl) so a script computes the flags from real state, never an AI guess:
- **Expensive**: one session over $10, or over $5 in its last hour.
- **Stalled**: state working, but no new transcript line for 5+ minutes.
- **Context bloat**: last turn's context over 300k tokens (every turn re-pays it).
- **Opus minion**: a spawned non-mastermind on Opus.
Show each flag as a small red tag on the row and in the In-flight strip, with a count in the filter label.

## And: a mastermind tag
A session is a mastermind if it registered as one in Servex, or its first prompt loads the mastermind skill / says "you are the mastermind". Tag it like the role chips. This VS Code tab (7efd07d5) is one.

## Rules
- Sonnet. Work in a worktree, smoke-test the page at 1400 wide (`mcp__site__shot`), commit each step, merge with `Server/merge.mjs` (review gate applies).
- Do not read the whole session index or transcripts with the model; write node to compute and print summaries.
- Land with the finish-task skill; one-screen outcome on your card. Update the sessions readme in a line or two.
