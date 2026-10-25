# Sessions: the card and the session page show the same labelled cost

Budget: $4. Load the `minion` skill first. Work in the worktree Servex gives you, committing at every working step. The deputy reviews and merges. Never kill or restart the dev server or Servex, never `git stash`, never drive the owner's tabs. Log your completion with the item tool on the main tree's folder (`/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/cost-line/`).

**The owner's words** (relayed by vscode-mastermind, 2026-10-24, priority 1): for e00f55c9, the Sessions list's preview card shows about $200-something and the session page shows about $900-something. Make the card and the page show the SAME labelled numbers ("$259 this tab · $X with children"), computed by one function, and prove there is no double count.

**What is true** ([cost-proof.md](cost-proof.md), written by a script from the live summary):
- **This tab:** $279.07. This is `summary.cost.own.usd`, from the tab's own transcript.
- **With children:** $989.20 = `summary.cost.total`, the tab plus its 176 child agents ($710.13, each agent counted once).
- **Why the two surfaces differ:** the card shows only the tab's own cost (the day snapshot's `usd`), and the page shows `summary.cost.total`. Both numbers are right; neither is labelled.

**Build:**
1. **One function** that turns a session's cost into the line "$279 this tab · $989 with children". Put it on `AICost` (`public/framework/ai/AITask/AICost.js`), which already asks the item tool's `summary` and caches each answer for 30 s.
   - Its input is the summary's `cost` (`{own: {usd}, children, total}`).
   - Its output is the text, plus the two numbers.
   - A session that is not a VS Code tab says "this session" instead of "this tab".
   - Before the summary arrives it shows the own number alone, with "· with children …".
2. **The session page:** the stats bar's Cost tile (`ai/AISession/SessionStats.js`, `SessionStats.cost`) shows that line.
3. **The Sessions list:** find the preview card the owner means, on `/framework/ai/sessions/`, for a selected or opened row. It shows the same line from the same function.
   - Ask the summary only for that one card, never for every row in the list, so the list stays fast.
   - The list rows may keep their own number, but label it "this tab" (or "this session").
4. **The proof link:** on the session page, the line links to the Cost tab, or to a list of the child agents and their costs, so a reader can check the sum.

**Proof:** two headless shots at 1920, the preview card and the session page, both showing the same "$… this tab · $… with children". Save them in this folder; they are gitignored, which is fine. Report both readings.

**Report (one screen, as your task's `complete` outcome):** the function's name and file, the commits, and both shots' readings.
