# vision-browse-page — `ext/DesignTool/vision/page.js` (the report Mike asked for)

Laws: less is more · clarity · prioritize. **Deliverable: one page that shows every shot of a run with its prompt, model, tokens and feedback, and an ask box. Final message ≤ 20 lines.**

Spec: [`../screenshot-tool/requirements.md`](../screenshot-tool/requirements.md) §Design — the `vision.jsonl` record schema there is **fixed**; a sibling agent (Opus, `vision-runner`) is writing the runner and a pilot run to `public/framework/ai/2026-08-17/vision-pilot/vision.jsonl` in parallel. Until it lands, build against a **fixture** you write yourself in this dir (`fixture.jsonl`, 6 lines, 2 models, 2 widths, 1 region row with `page_shot`; point `path` at any png that exists, e.g. `../ai-board-review/board-1440.png`).

Mike, verbatim: *"I want to be able to see a report of every screenshot taken … the precise feedback given … the model used, and the token consumption. And, hopefully, a textbox where I can ask the same session a question about the image. Also, I want to see the prompts used. This is actually the most important part."*

## Build

1. `public/framework/ext/DesignTool/vision/page.js` + `browse.js` + `vision.css` (one stylesheet, every rule in a layer — `css` skill first). `?run=/framework/ai/2026-08-17/vision-pilot/` loads `<run>/vision.jsonl` (+ `<run>/prompts.json`); no `?run` → list the runs it knows (any `ai/*/*/vision.jsonl` — read `directory.json` like `ext/ai/dashboard.js` does) as links.
2. Rows, cloned from `ai/2026-08-17/vision-browse/row.js` — keep what works: thumb (click → full size, served from `path`) · url · width · region sel (page rows first, their region rows nested/indented) · **model** · **tokens in/out/cache + cost_usd** · prose · findings as badges (`broken` red-ish, `maybe` neutral) · **prompt** — the `prompt_id` as a toggle that expands the verbatim text from `prompts.json`.
3. **Ask box** on each row: `ask(q, {resume: session_id, on})` from `ext/Ask` (read `ext/Ask/readme.md`, `doc/shot.md`); render the reply under the row; append nothing to the jsonl (v1).
4. Filters (query-string-backed so a view is linkable): page, width, model, prompt. **Compare**: for a shot taken by 2+ models, a toggle lays the prose side by side.
5. Sizing per the `layout` skill: this page must read at 900 (VS Code) and 3440 — thumbs a fixed column, prose the measure, no sprawl. Prove with headless shots at 900 and 3440 saved here.
6. Wire it where a reader already is: `ext/DesignTool/page.js` `children:` (or its nav) names `vision`; the sibling owns `ext/DesignTool/vision/readme.md` — leave your one browse line for the mastermind in your final message.

## Rules

- Files: `ext/DesignTool/vision/{page.js,browse.js,vision.css}`, `ext/DesignTool/page.js` (children line only), this dir. **Not** `run.mjs`, `prompts/`, `readme.md` there. Never Mike's live tabs.
- Skills: `code` once; `css`; `layout`; `new-page`; `finish-task` to land. Log in `task.jsonl` here (bash `printf`); bump `step`.
- Land with the two shots and the URL that opens the pilot run (or the fixture if the pilot is not there yet — say which).
