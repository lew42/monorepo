# Console: keep it clean, and make the smoke test notice

## The ask (owner's words, 2026-10-03, dictated)
> I'm getting a lot of console errors … a whole bunch of weight.jsonl console 404 logs, there's a whole bunch of insert list insert consoles … I'm on the ai/live page and it doesn't seem we're properly monitoring the console. We want to keep the console clean, we want to use these warnings and errors as feedback so that when something happens, we can fix it. As part of our smoke test, before we merge anything, the mastermind should make sure that there's no console problems. Some warnings are okay if it's a temporary problem that's going to be fixed by something else, so we don't have to absolutely wait on perfectly clean. … about a hundred or so between page.jsonl's and weight.jsonl.

## What's known (read only these first)
- `public/framework/core/Page/weight/weight.js`: `weight()` fetches `weight.jsonl` and then falls back to `page.jsonl` for EVERY page it weighs, so most pages log one or two 404s. That's the ~100.
- `Server/smoke.mjs` line ~140 classes "Failed to load resource" as a **warn**, not an error, and ignores `console.log`/`warn` noise entirely. That's why the storm passed every merge.
- The "List insert" lines: find their source (grep `insert` in core/Item, ext/, ai2/ — could be a `console.warn`/`log`).

## Do
1. **Load `/framework/ai/live/` headless** (Playwright, never the owner's tabs) and capture every console line and failed request. Post the counts as the first log line.
2. **Stop the 404 storm.** Don't probe-and-fail: ask the one place that already knows which files exist (`directory.json` / the files index the page tree reads) and fetch only files that are there. Same fix for any page.jsonl probes you find.
3. **Remove the debug "insert" logs** (or move them behind a debug flag, if one exists).
4. **Smoke test, `Server/smoke.mjs`:**
   - 404s on same-origin requests count as errors.
   - Count console warn/log lines per page and print them; over a small budget (say 5) is a FAIL, unless the line matches an entry in a short, dated allow-list file beside smoke.mjs (`console-allow.jsonl`: pattern, why, until date). An expired entry fails. This is the "temporary warnings are fine" rule.
5. **Mastermind skill**, `.claude/skills/mastermind/SKILL.md` "review before merge": one line saying smoke output must show no console FAIL; a warning stays only with an allow-list entry naming who fixes it.
6. Reload `/framework/ai/live/` again: 0 errors, 0 404s. Put the before/after counts on the card.

## Fence
Write: the files above, `Server/console-allow.jsonl` (new), this task dir. Nothing else without a note on the card.
Model: Sonnet. Budget $8. Usage is over pace (60% of the week at ~33% elapsed): no reviewer spawn; check the diff yourself.
