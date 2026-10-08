# Measure: the phone load of a card page, before and after (minion-pf-measure)

Load the `minion` skill first. Context: `../requirements.md` and `../owner-words.md`; the earlier
measurement of the same page is in `public/framework/ai/2026-09-29/slow-card-fix/` (read its
task.jsonl and requirements.md; reuse its method so the numbers compare).

## Deliverables
1. **A probe, `pfl-measure.mjs`, in the session scratchpad** (Playwright, headless, never the
   owner's tabs, `windowsHide: true` on any spawn). Given a base url, it loads
   `<base>/framework/ai2/2026/09/29/experiment-3-models-read-the-dictate-spa/` with CDP
   `Network.emulateNetworkConditions` at "Fast 3G" and at "Wi-Fi-like" (use slow-card-fix's
   exact numbers), cache disabled, and reports: ms until the placed table appears, total bytes
   transferred, and whether `directory.json` was requested (and its bytes). 3 runs each, median.
2. **BEFORE, now:** run it against the main site, `http://monorepo.localhost`. Log the numbers.
3. **Then wait.** End your turn with the BEFORE numbers in two lines. You will be sent a message
   to run AFTER against the worktree server (http://localhost:53780) once the readers land.
4. **AFTER:** same probe, same page, on the worktree. Write both into
   `public/framework/ai/2026-09-29/page-files-log/measure/result.md` as one small table
   (throttle × before/after × ms to table / bytes / directory.json requested).

## Fence
The scratchpad, and `ai/2026-09-29/page-files-log/measure/`. Nothing else.
Budget: about $1.

