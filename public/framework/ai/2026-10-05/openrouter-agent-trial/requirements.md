# Trial: can an OpenRouter model run a small task the way our agents do?

## Why (2026-10-05)
Claude is at 96% of the week and will cut off within hours. gpt-oss-120b died 4× mid-session as an agent (task web-benchmarks). This tries the next candidate on the smallest real task.

## The task (tiny, safe, docs only)
In `public/framework/log/readme.md`, under "## To-do", add ONE line:
`- A setting for how often batched appends are written (e.g. every 250 ms), shared by page.jsonl and log.jsonl writers.`
Then commit only that file with a one-line message, and append a landing line to this task's task.jsonl with `node .claude/hooks/append.mjs` (write the JSON array to a scratch file first). No worktree needed: it's a readme line.

## What we're measuring (write it in the landing outcome)
- Did it read this brief and follow it (one line, the right file, the right section)?
- Did it commit and land without help?
- Real $ spent, turns taken, minutes.

Budget: $1 real.
