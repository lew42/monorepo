# ai2-soak-leak — leak hunt on /framework/ai2/

Budget: about $4.

## The ask, verbatim

A leak hunt. The owner's Chrome tab on /framework/ai2/ (open about 12 hours, HIDDEN, at 3440 px
wide) sits at about 100% of a core, and its renderer process is at 3.5 GB. The page's JS heap
reads only 27 MB, and document.styleSheets.length is 115 (suspicious: are sheets appended on
every re-render?). The tab also stopped answering evals for 10 s at a time.

Reproduce it headless (Playwright, `{ channel: "chromium" }`, a 3440x1271 viewport): open
/framework/ai2/ on monorepo.localhost and leave it open for ~20 minutes, first VISIBLE, then with
the page hidden (emulate document.hidden via a second tab brought to front, or CDP Emulation.
setFocusEmulationEnabled / Page.setWebLifecycleState "frozen" vs "active"). Every minute, sample
CDP Performance.getMetrics (JSHeapUsedSize, Nodes, Documents, LayoutCount, RecalcStyleCount,
ScriptDuration, TaskDuration), document.styleSheets.length, the timers and pollers firing, and the
network requests per minute.

Find what grows or what keeps running (a poller re-rendering 450 rail rows? stylesheets appended
repeatedly? a socket re-subscribe loop? the Dictate widget with auto-transcribe?). Fix the cause
through the quick-fix pool (take_worktree, merge.mjs), re-run the soak to show it's flat, and post
the before/after metrics table on card 2026/09/29/inbox-rows-are-the-real-pages-page-class via
POST http://127.0.0.1:8090/card/append?id=... using node fetch.

## Deliverables

1. A headless Playwright soak script reproducing the growth (renderer CPU/memory proxy metrics,
   styleSheets.length growth) on /framework/ai2/ over ~20 min, visible then hidden.
2. A minute-by-minute metrics log identifying the growth culprit(s).
3. A root-cause finding: what keeps running/growing while the tab is hidden.
4. A fix landed through take_worktree + merge.mjs (or a documented reason a fix isn't safe to ship
   in this budget, with the finding filed as a task/card for follow-up instead).
5. A re-run of the soak (can be shorter, e.g. 10 min) on the fixed code showing metrics flat.
6. Before/after metrics table posted to card 2026/09/29/inbox-rows-are-the-real-pages-page-class.

## Fence

Scratch (soak scripts, JSON logs) goes in the session scratchpad. Any code fix goes through a
worktree (take_worktree), touching only the files responsible for the leak — likely under
public/framework/ai2/ (the ai2 board page) and whatever it imports (rail renderer, poller,
socket subscription, Dictate widget). Do not touch unrelated modules.

