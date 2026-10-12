# ai-board-review — why the AI dashboard is hard to follow, and the shortest fix

Laws: less is more (ASAP) · clarity is the one exception · prioritize. **Length budget: `proposal.md` ≤ 80 lines; final message to the mastermind ≤ 40 lines.** Every proposal item = problem → fix → cost (S/M/L). No narrative.

Mike (2026-08-17), verbatim:

> my ai dashboard doesn't work so well. the layout is broken. the order of the content displayed is either broken, not updated correctly, or just generally confusing. the steps seem to work ok. but still, it's just really hard for me to follow.
> maybe we need some top tabs on each task? Requirements, Proposal, Results?
> we need a way for each ai task to create custom content. I tried to get one of the mastermind's to write a report page. he linked to it, and it opened here in VS Code, which wasn't terrible, except the nav "rail" that is vertical on my big screen, became a 50/50 vertical split (2 scrollable rows), which was very hard to read...
> launch an Opus to investigate how to improve our AI reporting system. Look into all the data that is currently logged. We also have some new skills, i'm not sure if they've been hooked in. The actual session logs, which do seem to render, are rendered poorly. Ideally, I want to see each message I send, here in VS code, appear on my AI dashboard? If a sub-agent is spawned from within a task, that should probably be a sub task, stored inside the parent tasks folder, etc? that could help, a lot. It seems there's a system on these ui cards to link to various assets (little pill-like links on the card previews). We need deliverables in a MUCH MORE CONCISE way. If there's a demo, put that in there. If the demo lives somewhere else, link to it. I want ANSWERS. I want short and sweet NUGGETS OF VALUE. I don't want walls of errors, problems, run arounds...

## Answer these, in this order

1. **What is logged today** — one table: stream · writer · path · consumed by · rendered where. Streams: `task.jsonl` verbs (`assign/log/action/agent`), `day.jsonl`, `usage.json(l)`, session transcripts (`Server/plugins/AILogs.js`, `~/.claude/projects/c--Code-lew42-monorepo/<session>.jsonl`), the hooks (`.claude/hooks/ledger.mjs` + `.claude/settings.json`: which events fire, which skills get logged — **are the new skills wired in? Prove it from a live task.jsonl**).
2. **See it as Mike does** — headless Playwright shots of `/framework/ai/`, `/framework/ai/2026-08-17/`, one task detail page (a busy one, e.g. `mastermind-run` on 08-16 or `report` today) at **900 px** (VS Code Simple Browser) and **1440**; save ≤4 small PNGs in this dir. Name the concrete defects: order of content, stale/unupdated regions, the rail turning into a 50/50 vertical split, the session-log rendering.
3. **Diagnose causes** — for each defect, the file:line responsible (`ext/AITask/`, `ext/ai/`, `ext/JSONL/`, the day/board pages). A mass finding means the rule is wrong — say which rule.
4. **Propose** (ranked by value ÷ cost, ≤ 10 items): per-task tabs (Requirements · Proposal · Results); per-task custom content (does `new AITask({ meta, extra(){} })` already do this? how well?); each user message from the VS Code session on the board; sub-agent → sub-task inside the parent's dir; concise deliverable pills (demo inline or linked); what to **delete**. Each item: problem → fix → cost.
5. **The single next step** — one line: if only one thing gets built tonight, what.

## Rules

- Read-only outside this dir. Write `proposal.md` here; log findings as `{"log": {"at","msg"}}` lines in `task.jsonl` (bash `printf`, never `Out-File`). Land with `{"assign": {"step": 5, "landed_at": "<ISO>", "outcome": "**…** — …", "links": [{"url": "/framework/ai/2026-08-17/ai-board-review/proposal.md", "label": "proposal"}], "tokens": null}}` and a `landed —` line in `../day.jsonl`.
- Dev server: `http://localhost/` is up. Headless only — never drive Mike's tabs. Hidden tabs do not lay out; use a real headless page.
- Read `ext/AITask/readme.md`, `ext/JSONL/readme.md`, `.claude/hooks/readme.md`, `.claude/skills/new-task/SKILL.md`, `.claude/skills/finish-task/SKILL.md` first — they are the spec; judge the implementation against them.
