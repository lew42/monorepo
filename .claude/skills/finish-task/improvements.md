# finish-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
- 2026-10-15 (mastermind-voice-20261015): a helper wrote its landing `assign` (landed_at + outcome) into its PARENT voice task.jsonl instead of its own sub-dir; Servex then treated the live voice session as landed and refused every child report to it. Land into your own task dir; never a parent's.
skill-improvement: item tool path must be a site url; a repo path 'public/framework/...' wrote into public/public/ (2026-10-20, mastermind-whisper-demo)

- 2026-10-20 (vscode mastermind): the `item` tool takes the SITE path (`/framework/ai/sessions/.../<task>/`). A repo path (`public/framework/...`) is accepted silently and writes a stray page log under `public/public/...` (removed by hand). Say the path form in step 3, or make the tool refuse a path starting with `public/`.
