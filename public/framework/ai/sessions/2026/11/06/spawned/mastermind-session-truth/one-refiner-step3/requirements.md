# One refiner, step 3: `session.coverage()`

Budget: $5. Sonnet. Read `../brief-common.md` first (worktree, tests, docs, report).

## Why

The owner's decision, made by voice-app under the owner's rule (2026-11-09): build the one-refiner plan in small steps. Step 2 landed (merge 9783830fc): the parts brief is `public/framework/ext/Refine/PartsBrief.js`, the live process runs on Sonnet (`LIVE_MODEL` in `Server/PromptRecords.mjs`), and PromptTasks is on. Plan: `/live/plan/one-refiner/` (card `steps`, step 3). The study's own per-channel count is `../one-refiner-plan/coverage.mjs`; reuse its rules, don't fork them.

## Step 3, exactly

1. **`coverage()` on the session class** (find it from `public/framework/core/Session/readme.md`; the method sits beside `completion_score()`, computed on demand, never stored). It returns `{sentences, cited, ratio, uncited: [{prompt, n, text}]}`: the owner's sentences in this session's prompts (the stored sentence rows, or the shared splitter `Ask.split` where none are stored), and which of them a task cites (a task's `cites`, or the `parts` lines PromptRecords writes, whichever the record holds; read the code to see which). A session with no prompts returns `null` (unknown, never 0 or 1).
2. **Show it on the session page.** One line near the score, for example "Coverage: 41 of 52 sentences placed in a task (79%)". The uncited sentences go one click down. Use the existing session detail view (`public/framework/ai/AISession/readme.md`); no new page.
3. **Test:** a lean `coverage` section in the session class's test. One record with 3 sentences and a task citing 2 gives 2/3. One record with no prompts gives null. Existing session tests still pass.
4. **Check on real data:** run it on this week's 5 newest sessions that have prompts, and write the numbers into your task log. It must agree with `../one-refiner-plan/coverage.mjs` on the same session, or say why not.
5. **Docs:** add one line to the Session readme, and update the refinement map's step 3 (`public/framework/ai/doc/prompt-refinement-map.md`).

Page change: take shots at 400 and 1200 of one session page that shows the line. Leave out steps 4–6 (web dictation, cloud voice, archive). If you are short of budget, cut the one-click-down list first.
