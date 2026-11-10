# calibration: the first prompt-refinement calibration (2026-11-07)

Four owner prompts from the cloud transcript `cloud-8849dcc6`, refined by Haiku 5.5 and Sonnet 5.5 on the same instructions and judged by Opus. **Start with [results.md](results.md).**

- [results.md](results.md): the verdict, the coverage table, and what to fix before the next run.
- [instructions.md](instructions.md): the fixed instructions (the system prompt of every call).
- [inputs/](inputs/): one file per prompt: its numbered sentences, the two turns before it, and the 24 tasks of the voice-app record. Built with `node Server/ClaudeCodeTranscript.mjs` ([Server/doc/transcripts.md](/Server/doc/transcripts.md)).
- [outputs/](outputs/): `<model>-<prompt>.json`, each call's answer plus its real cost and tokens.
- [compare.mjs](compare.mjs): `node compare.mjs` prints the table.
- The page: [/live/calibration/](/live/calibration/) draws each prompt's words, both models' output and the verdict, read from inputs/ and outputs/ (`public/live/calibration/page.js`).
- [live-page-2026-11-07.jsonl](live-page-2026-11-07.jsonl): the first version of that page (five suggestion cards), moved aside 2026-11-09.

One call, run from a folder outside the repo (so no project hooks run):

```
claude -p --model claude-sonnet-5-5 --system-prompt-file instructions.md --tools "" --strict-mcp-config --setting-sources "" --no-session-persistence --output-format json < inputs/p27.txt
```
