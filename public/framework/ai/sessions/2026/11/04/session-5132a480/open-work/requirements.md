# What was asked for and never finished?

Expected cost: about $2. Haiku. Follow [findings-method.md](../findings-method.md); write only `findings.md` and your log.

The owner's words: "There was a whole bunch of phases for... the item and page and list classes. Had like a whole 5-phase or more plan, and we only got through half of the phase 0 or whatever." They also want a better way to query past work, and asked what `framework/tasks` is.

## Answer with a script

1. **Multi-step plans.** Find them: `public/framework/core/doc/status.md` (the Item system status), `core/Session/tasks/data-shapes/`, `plan.md` files, `requirements-*.md`, anything with phases or numbered steps and ⬜ or `[ ]` lines. For each: what it's for, steps done and open, evidence for done from the code or commits (not from the plan's own ticks), last touched. Check each "done" you report: does the code it names exist?
2. **The task stores.** How many tasks are open in each: session records, `<module>/tasks/`, `framework/tasks/` (markdown), `ai/asks.jsonl`, `public/framework/ai/asks/undone.json`, `ai/todo.md`. How much do they overlap? `doc/follow-up.md` and `Server/PastWork.mjs` exist; say what each does, and whether it works when run.
3. **Marked done without being done.** The AI2 removal was marked `landed` in `asks.jsonl` line 209 and not done. Sample 20 owner asks marked landed in the past 30 days, and check by file or commit whether each happened. Give the rate, with receipts.

## End with

- One ranked table, owner value first: open plan or ask, what's left, rough size, and whether it's still wanted, judged by whether later work replaced it.
- A recommendation on one place to query past and open work, from what exists.

Change nothing.
