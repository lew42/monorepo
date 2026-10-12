# shots-history — what the screenshot/vision work has already built

Laws: less is more (ASAP) · clarity is the one exception · prioritize. **Length budget: `proposal.md` ≤ 70 lines; your final message to the mastermind ≤ 40 lines.** Nuggets, not narrative.

Mike (2026-08-17): *"first, spawn an Opus minion to investigate recent screenshot tasks. I believe there are a few."* Then: *"When I finally found some screenshot's raw analysis, the model (it didn't show me which was chosen) did a fantastic job interpreting the Layout … This is the feedback loop we need."* And what he asked for last time and didn't get: *"a report of every screenshot taken … the precise feedback given … the model used, and the token consumption … a textbox where I can ask the same session a question about the image … the prompts used. This is actually the most important part."*

## Answer these, in this order

1. **Inventory** — every screenshot/vision artifact of 2026-08-15..17: task dirs (`vision-baseline`, `vision-browse`, `shots-in-log`, `human-ranking`, `report`, `report-full`, `taste-*`, `design-program`, `designtool-*`, `depth-sample`, `layout-hunt`, …), `ext/DesignTool`, `ext/Ask`, the MCP `site` server (`shot`/`eval`/`pages`; find its source), `Server/plugins/AILogs.js`, the `?screenshot` query-string wiring, `probe.mjs` scripts in `~/AppData/Local/Temp/claude/c--Code-lew42-monorepo/*/scratchpad/`. One line each: path · what it does · working? (open it, don't guess).
2. **The analysis Mike loved** — find the vision model's prose critique(s). Which file, which model, and the **exact prompt** used (quote it verbatim in `proposal.md`). If several prompts exist, list them all with where each lives.
3. **The gap** — read those tasks' `requirements.md`; ≤5 bullets: asked vs delivered.
4. **Mechanics** — how were shots taken (Playwright? clip region? which widths? DPR?), where stored (repo vs scratchpad; is anything gitignored?), how were models called (`claude -p`? Agent tool? API?), were tokens/model recorded per shot? Cost per shot if it can be derived.
5. **Recommend** (≤15 lines) — the ScreenshotTool: capture (region clip vs crop, widths), ask (fresh session per image, which model tier, prompt), the log record schema, the browse page. **Reuse vs new**, and what to delete/consolidate. Say what would go wrong.

## Rules

- Read-only outside this dir. Write `proposal.md` here; log findings as `{"log": {"at","msg"}}` lines in `task.jsonl` (append with bash `printf`, never `Out-File`). Land with `{"assign": {"step": 5, "landed_at": "<ISO>", "outcome": "**…** — …", "links": [...], "tokens": null}}` and a `landed —` line in `../day.jsonl`.
- Dev server: `http://localhost/` is up. Headless Playwright only — never drive Mike's tabs.
- **Stay alive after landing** — the mastermind will send follow-up questions to you by message; answer from what you have read.
