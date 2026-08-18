# vision-pilot — the first real run of `ext/DesignTool/vision/run.mjs`

Pilot run of [vision-runner](../vision-runner/requirements.md). Not a build task — a corpus.

6 pages (`/framework/`, `/framework/ai/`, `/framework/ai/2026-08-17/`,
`/framework/ext/DesignTool/`, `/framework/ui/`, `/framework/web/`) × 390 / 1280 / 3440,
whole page then ≤4 regions, `critique-full-v1`, fresh Sonnet session per image. Then the
12 page-shots at 1280 + 3440 again through Opus, and 3 through Fable, so the browse page
can compare the same image across models.

- `vision.jsonl` — one line per shot: shot, prompt, model, tokens, cost, prose, findings.
- `prompts.json` — every prompt used, verbatim, so the run reads on its own.
- `shots/` — the pngs. Gitignored (`public/framework/ai/**/shots/`); the dev server serves them.

Browse it at [/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-pilot/](/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-pilot/).
