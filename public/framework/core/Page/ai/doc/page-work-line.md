# The open-work line: every page says what is being worked on

**What you see:** under a page, one line, `2 open tasks on this page · 1 below`. Click it for the task links. A page with no open work shows nothing. This closes ask #6 in [asks.md](../../doc/asks.md).

**Where it comes from (computed, never typed):**
- `ai/tasks.json` (Servex derives it every minute) lists every task and whether it has landed.
- `node Server/page-ai-cost.mjs --work` reads it and, for each unlanded task, finds the pages it **edited** (its `action` lines) or its brief **names**. It writes `ai/page-work.json`, a derived file that is git-ignored.
- `core/Page/ai/PageWork.js` fetches that one file once and draws the line. `Page.render()` and `ext/Doc` (a Doc draws its own view) both call it.

**Differs from [work.md](work.md):** `page_work()` is the opt-in, live, keyword-matched block with agents and parents; this line is on every page and matched by files touched, not keywords. They share no code on purpose: one is a quick signal, the other a detailed view.

**Open:** nothing runs `--work` on a timer yet. Wiring it into Servex's task tick needs a Servex change, so it waits for the next batched restart (`public/framework/ai/2026-10-12/page-context-asks/STATE.md`). Until then, run the command by hand; a stale file only shows older tasks.
