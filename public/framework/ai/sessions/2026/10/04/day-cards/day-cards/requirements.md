# Today and Yesterday cards: one day at a glance

## The ask (owner, 2026-10-04 ~15:00, dictated)
The full prompt, verbatim: /framework/ai/2026/10/03/session-60d9def6/ (Prompt id a0327b80, starting "All right, here's what I want you to do"). Key sentences:
> make a card on the AI dashboard called today and yesterday. And those should be like daily summary cards ... a little navigation for focusing on a specific day ... all the prompts from today should go into that card in a refined way.

> every sentence is accounted for ... we should probably have a weighting or a confidence interval in terms of how confident is the model that this sentence properly is addressed by this content card ... lower confidence ... would sort of automatically trigger part of the review

> a day is a pretty specific period of time, has a start time, end time, and we should be able to total cost for each day accurately.

> If anything spans several days ... put it in like the month path ... a card for each month ... calculate the cost that month in terms of both Claude based tokens and open router tokens.

> making that yesterday card unread, if I haven't taken a look at it

> I don't want to do a major refactor of the inbox rail right now ... Let's just for now do a card for each day

## Want
1. **A Today card and a Yesterday card** pinned in the AI inbox (same pinning mechanism as Now), each opening that day's summary; prev/next day arrows on the summary, each day its own URL.
2. **The day summary, all computed by node (law 7):** total cost for the day (Claude $ and real $, from `day-spend.mjs` / the token-accounting source of truth); tasks started, landed, still open; and **the owner's prompts of that day, refined** (from session pages' Prompt items + Echo's sentences).
3. **Refine retroactively, free:** run the Refine engine (`ext/Refine/engine.js`, Echo now uses `local/qwen2.5-coder`) over 2026-10-03 and 2026-10-04's owner prompts that have no sentences yet. Add a **confidence 0–1 per sentence → section** in `structure()`; list sentences under 0.6 in a "check these" block on the day summary.
4. **Yesterday shows unread (bold)** until opened.
5. Month card: a stub only (title + month cost total); multi-day tasks moving to month paths is a To-do line in `public/framework/ai/readme.md`.
6. Worktree → check_page (400, 1920) → merge.mjs. The main site is production.

Budget: $5 (a guide; finish it right)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
