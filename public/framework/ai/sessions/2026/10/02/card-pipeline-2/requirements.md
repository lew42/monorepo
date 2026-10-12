Budget: $15.

# Card pipeline 2: approve tasks, module cards, plain categories, module names, no dictation walls

The owner's Inbox asks, relayed by vscode-mastermind on 2026-10-02 (verbatim):
1. **Approve each task:** every task card gets **Approve** (done and good) and **Unclear** (needs a better description, or a link to my original prompt). Approvals are lines on the card, and the audit reads them as the truth.
2. **Module cards:** when work lands on a module (e.g. core/Page), the MODULE appears as a card at the top of the Inbox: its icon, why it's notifying ("Page extends Item landed: 3 commits, $18"), a short summary list of what was done with the cost, and a link to the exact sub-view on the module's page. Use the asks `paths` field.
3. **Replace the score hack:** items sit at 90+ only to be seen, though they're only mildly blocking. Use plain categories instead: `blocking` (needs a decision), `review` (approve a landed task), `fyi`. Order by category, then recency. Keep the score internal.
4. **Name tasks by module:** card and task titles read "<module>: <outcome>" (e.g. "core/Page: Page extends Item").
5. **No dictation walls:** a card never shows raw dictation as the main text. It shows the structured summary, with the raw words one click down.

"Don't wait on the owner."

Owner: `mastermind-servex` (the current `mastermind-servex-N`). Card: the card-pipeline card, `2026/10/02/the-card-pipeline-every-major-ask-gets-a` (this is its second half).
**Starts after** `ai/2026-10-02/card-pipeline/` is committed on michael/dev and Servex has restarted with it: this builds on its `ensure_card()`, `Cards.create_for_ask()`, `paths` and `reason_of()`.

## Read first
- The readme chain down to `public/framework/ai2/`; its readme's "The priority score, band by band" is what item 3 replaces.
- `ai/2026-10-02/card-pipeline/` (the task log and its review findings): what exists now.
- `Servex/asks/readme.md`: the asks ledger, `paths`, and "Tasks, not just asks" (the `tasks.json` shape).
- `Server/audit.mjs` + `ai/2026-10-02/task-audit/requirements.md`: the audit that item 1's lines feed.

## Deliverables (each is ticked against the owner's own sentence above)
1. **Approve / Unclear on every task card.** Two buttons on the card itself (the `ui` skill for the controls). A press appends one line to the card's own log: `{"verdict":{"by":"owner","is":"approve"|"unclear","note"?}}`. Choose the exact verb with the `naming` skill if this one reads badly. `Server/audit.mjs` reads these lines as ground truth: an `approve` counts as done and good, and an `unclear` sends the task back to its mastermind (one inbox message) to rewrite its description or link the owner's original prompt. Law 6: `ai2/inbox.js` already reads `verdicts.jsonl` for the old Approve/Improve flag. Decide whether that file becomes this record, or a reader of the card lines; log the decision with `Server/decide.mjs`, and keep one record, not two.
2. **Module cards at the top of the Inbox.** Use `paths` on asks.jsonl landing lines, never a second list. When a task lands, its module (the deepest module dir with a `readme.md`) gets one card: the module's icon, a one-line reason ("Page extends Item landed: 3 commits, $18": counts and dollars computed from git and `spend`/`cost_usd`, law 7), a short list of what was done with the cost of each, and a link to the module page's exact sub-view (a routed URL). One card per module, updated as more lands, not one per landing.
3. **Plain categories replace the 90+ floor.** Each row gets `category`: `blocking` (needs a decision), `review` (a landed task waiting for Approve), or `fyi`. The Inbox orders by category, then recency. `importance()` in `needs-rule.js` stays internal, used only within a category; no number shows to the owner. The 24-hour "lift into the low 90s" goes. Rewrite the readme's band section to the three categories.
4. **Titles read "<module>: <outcome>".** Done in `Cards.create_for_ask()` and wherever a task title is minted (task.jsonl line 1 `title`, `spawn_agent`'s task option), by code. Backfill today's open cards by computing each module from `paths`.
5. **No dictation walls.** A card's first section is the structured summary (asked, status, next step, links); the raw words sit one click down (a `<details>` or a routed "Owner's words" sub-view). Find every card that leads with raw dictation (`ai/2026-10-02/card-pipeline/audit-cards.mjs` is a starting point) and fix the writer, not just the cards.

6. **`public/framework/ai/modules.json`: the per-module count, one file** (decided by mastermind-servex-10, 2026-10-02, for @task-mastermind-framework-home, whose /framework/ module cards and sidebar "Framework (3)" badge read it). It's written by the same Asks tick that writes `tasks.json`, and only when something changed. It's gitignored like `tasks.json`. The shape is a contract, so don't change it without telling that task:
   ```json
   {"generated_at":"…","total":3,
    "modules":{"core/Page":{"count":2,"card":"2026/10/02/…","url":"/framework/core/Page/#…",
       "items":[{"card":"…","title":"core/Page: Page extends Item","category":"review","at":"…"}]}}}
   ```
   Keys are module paths under `public/framework/`, as in `paths`. `items` are newest first. **`count` is the items waiting on the owner:** `blocking`, plus `review` with no Approve/Unclear line yet. `fyi` is listed but not counted. Reading isn't tracked: the owner turned read-marking off on 2026-09-22 (`ai2/inbox.js`), so "unread" means "not yet acted on". The alternative was one `inbox.json` per module; it was rejected because the sidebar total would need one fetch per module.

## Fence
`public/framework/ai2/` (inbox.js, needs-rule.js, rail.js, card.js, readme.md, doc/), `Servex/cards/`, `Servex/asks/`, `Server/audit.mjs`, this task dir. Not `ai/` pages owned by `task-mastermind-panel2-sessions` (its Dashboard reads `tasks.json`; send it one line if `category` should show there too).

## Rules
Sonnet, high effort. A pool worktree (`take_worktree`), commit after each piece. Review by the new rule (`Server/doc/review.md`, "Who reviews"): this changes pages, so it gets the screenshot review. Then `merge.mjs` and a Servex restart. Never wait on the owner: decide, log the alternative, keep going.
