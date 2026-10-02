# Can a cheap model do the work? Sonnet vs DeepSeek, side by side

**Short answer: yes, for small, fenced page tasks; for a new module it makes a good first draft, not the finished one.** DeepSeek V4 Pro built the same thing Sonnet built, just as well, for about **a fifth of the cost** ($0.30 vs $1.51). Its one weakness: **it cannot look at images.** If it tries, its turn dies. Its brief must say "never open a screenshot".

| Pair | Sonnet 5 | DeepSeek V4 Pro (OpenRouter) | Merged | Could the cheap one do it alone? |
|---|---|---|---|---|
| 1. The cheap ladder on [/framework/ai/system/models/](/framework/ai/system/models/) | $1.51 · 4 min of turns · clean | $0.30 · 10.5 min · equal or better output, died on an image read before committing | **DeepSeek's** | **Yes**, if its brief bans images |
| 2. The line filter [/imagine/lines/](/imagine/lines/) | $3.23 · 10 min · clean, 0 console errors | ≈$0.42 · 11 min · works, 0 console errors, but no readme, doc or tests, and every line comes out doubled | GPT-6.1 Sol's (frontier point, $3.06) | **Mostly**: a working first draft at an eighth of the cost, but it skipped the module system and needed a second pass |

**What to send where, now:**
- **DeepSeek V4 Pro:** one-page edits with a clear brief, a file fence and a smoke test. It costs about 0.2× Sonnet. Its brief always carries the no-images rule.
- **Sonnet:** anything that needs screenshots, judgment about how a page looks, or work across many files.
- **Free models:** not yet. Most fail even the easiest rung (h1-page). See the ladder on [/framework/ai/system/models/](/framework/ai/system/models/).
- **Frontier models (GPT-6.1 Sol):** they worked well but cost the same as Sonnet. Use them only when a second opinion is worth it.

---

## Detail

### Pair 1: the cheap ladder (Models page)
Both minions got the same brief: [models-ladder-sonnet](pairs/models-ladder-sonnet/requirements.md) and [models-ladder-cheap](pairs/models-ladder-cheap/requirements.md).
- **What each did:** both added "The cheap ladder" above the chart. It has one row per model, free first, and one computed sentence. Both put the numbers in `models.mjs`, so the page only draws. That follows Law 7.
- **Did it follow the system?** Sonnet: yes. It read the readmes, logged, stayed in its 3-file fence and wrote result.md. DeepSeek: mostly. It stayed in its fence and smoke passed. Then it opened its own screenshot, its turn died on an API 400, and it never committed or wrote result.md. Its mastermind did both.
- **Does it work?** Both pass `smoke.mjs` with 0 console errors. Shots: [Sonnet 1200](pairs/models-ladder-sonnet/shot-1200.png), [DeepSeek 1200](pairs/models-ladder-cheap/shot-1200.png).
- **Quality:** about the same. DeepSeek's code passed review: all 5 findings were answered ([review.jsonl](pairs/models-ladder-cheap/review.jsonl)). Both sides used stale Claude prices. The mastermind fixed them to OpenRouter's catalog: Sonnet 5 is $2/$10, Opus 5.5 is $4/$20.
- **Cost and time:** Sonnet $1.51. DeepSeek $0.30 over 10.5 minutes. Both figures come from the agents' own logs.
- **Verdict:** the cheap model could have done it alone. Merged as 43595dcd. That commit message says "V4 Flash" by mistake; the model was **V4 Pro**.

### Pair 2: the line filter (/imagine/lines/)
- **Sonnet** (lt-sonnet, c699be54): a multichannel structure-tensor score with four live sliders. It added 4 new files and touched 3 existing ones, all in its fence. Smoke is clean with 0 console errors at 1200 and 400 ([result](pairs/line-filter-sonnet/result.md)). It cost $3.23 over 10 minutes of turns.
- **GPT-6.1 Sol**, the frontier point: it built the version now in main (10441d7d … 8d896907). That version also has deterministic tests (`test.mjs`), a doc and the review fixes. The box sample checks out correct in 36 ms. It cost about $3.06. It is fuller than Sonnet's, so it stays. Sonnet's branch is kept unmerged as the trial record.
- **DeepSeek** (lf-deepseek, e96167ed in lt-cheap): `lines.js` (a structure-tensor score), `page.js` with three samples and four sliders, and `lines.css`. It obeyed the no-images rule, stayed in its fence, logged, and wrote [result.md](pairs/line-filter-cheap/result.md). Smoke passes with 0 console errors ([shot 1200](pairs/line-filter-cheap/shot-1200.png)). Two misses: it wrote no `readme.md`, `doc/` or tests, which every module needs, and its score marks both sides of each edge, so every line in the box comes out doubled. It ran 11 minutes. Its cost is **about $0.42**, worked out from its token counts (1.49M fresh in, 4.50M cached, 27k out) at OpenRouter's V4 Pro prices, because the running Servex does not yet record proxied costs (gap 4). **Verdict:** not merged; main's version is better. The cheap model could make the working draft alone, but a stronger model, or a second pass, would still have to add the docs and tests and fix the doubled lines.

### What the harness got wrong (to fix)
1. **A text-only model dies on any image.** One read of a .png gives a 400. Every later wake re-sends the image and fails again. Fix: strip image blocks before calling a model that has no image input.
2. **A spawn the guard refuses is dropped without telling anyone.** Only system.jsonl records it; the parent is never told.
3. **The gate is shared across sessions.** Other sessions' agents filled all 5 working slots, and it reads 9/5 now. The trial waited behind them.
4. **The OpenRouter cost doesn't reach the run ledger until Servex restarts.** The fix (cf1992ae, `reconcile.mjs`) is waiting for that restart.
5. **review.mjs keys the review to branch `null`** in a fresh worktree, so merge.mjs can't find it.
6. **Finished agents get woken about every 7 minutes, and each wake is billed.** Stop finished minions right away.
