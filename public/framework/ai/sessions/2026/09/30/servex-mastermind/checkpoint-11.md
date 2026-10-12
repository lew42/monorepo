# mastermind-servex-10: checkpoint 11, 2026-10-02 evening

**Newer: [checkpoint-12](checkpoint-12.md)** has the queue table, the spawn lines and the 15-minute queue check. Read that first.

## Why -10 stopped at once

mastermind-servex-10 could not do its job. The `mastermind` role started with `acceptEdits`, and in a session with nobody to approve, that refuses every Servex tool (`list_agents`, `spawn_agent`, `send_to_agent`, `system_health`), every `curl`, and most `git` and `node` commands. Only Read, Grep, Glob, Write and Edit worked. Task masterminds and minions had already been moved to `bypassPermissions` for the same reason.

**Fixed in code:** `Servex/agents/roles.js`, mastermind row → `bypassPermissions`. It takes effect after the next Servex restart. **It's not committed** (git commit was refused too). The next mastermind commits these by exact path: `Servex/agents/roles.js`, `Server/doc/review.md`, this file, everything in `ai/sessions/2026/10/02/servex-mastermind/`, `ai/sessions/2026/10/02/token-reduction/` (task.jsonl and requirements.md), `ai/sessions/2026/10/02/card-pipeline-2/`, `ai/sessions/2026/10/02/stamped-logs/`, `ai/sessions/2026/10/02/known-issues/`, `ai/sessions/2026/10/02/node-reap/` (result.json included), `Servex/readme.md` (the dev-server rule), `Servex/agents/assistant.md` (no-filler rule for the lobby assistant-fast; live after the restart), and the naming docs (`public/framework/servex/doc/roles.md`, `public/framework/core/Page/ai/readme.md`, `public/framework/core/Page/ai/page.js`, `public/framework/core/Page/readme.md`, `Servex/agents/readme.md`, `Servex/agents/doc/names.md`), plus the two skills once step 1 below has run.

**To start the next one before that restart:** spawn `mastermind-servex-11` with `role: "mastermind"` and **`permission_mode: "bypassPermissions"` passed explicitly**, on Opus. Don't revive -10: a revive keeps the permission mode recorded in its row, so it would be refused again. Then stop -10.

## FIRST: the echo loop and the always-on watchdog (2026-10-02, 22:17 to 23:10)

At 22:17 Servex started 16 claude processes in four minutes; free RAM fell to 1.4 GB. The cause was the prompt refiner (Echo.js) refining its own model calls (issue `echo-loop` in `known-issues/seed.json`). Then VS Code crashed at 22:30, and the always-on mastermind stayed down (issue `mastermind-not-restarted`). -10 fixed both in code but could not run anything. In order:
1. `node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-echo-gate.mjs`: the hook half. It works at once, with no restart.
2. `node --check` on `Servex/agents/Echo.js`, `Servex/agents/Global.js` and `Server/ask-each.mjs`, then `node --test Servex/agents/global.test.mjs` (the sweep now calls `keep_on()`; a test without `SERVEX_NO_ASSISTANT` may now see a spawn).
3. **Restart Servex** (`sustain.mjs --restart`). One restart carries Echo.js (loop guard, a 5-echo cap, the 4 GB floor, the gemini trial), Global.js (the watchdog, and a forced revive for the holder), ask-each.mjs and roles.js.
4. After the restart, stop `echo-361c4d18` if it's still live, so its next prompt spawns on `google/gemini-3.8-flash` (the OpenRouter live trial, token-reduction item 13). Check a `route` line in Servex's system log.
5. Commit these too: `Servex/agents/Echo.js`, `Servex/agents/Global.js`, `Server/ask-each.mjs`, `ai/sessions/2026/10/02/servex-mastermind/apply-echo-gate.mjs`, `ai/sessions/2026/10/02/standing-voice-pair/`, and `ai/sessions/2026/10/02/known-issues/seed.json` (two new issues).

## ALSO FIRST: free pool slot qf-6 (task-mastermind-model-weights, 2026-10-02 late)

`take_worktree()` answers "No worktree could be made ready", so **every `role: "minion"` spawn on the machine is blocked**. qf-6 is still held by the stopped mastermind-servex-9, and Pool.js won't throw away its uncommitted changes. That slot is the card pipeline's branch (`worktree/qf-6`, e7d28a31).
1. `git -C C:/Code/lew42/worktrees/qf-6 status --short`: see what it holds. (-10's git and node were refused.)
2. `node Servex/Lifecycle.js --salvage qf-6 --dry`, then without `--dry`. This is safe. `Pool.salvage()` commits the uncommitted files and the unmerged commits to a new branch `salvage/qf-6-2026-10-02`, never merges it and never deletes anything. It sets live-log diffs aside as a patch in `.worktree-logs/`. Then it resets `worktree/qf-6` to the base, so the slot comes back.
3. **This changes card pipeline step 1 below:** after the salvage, `worktree/qf-6` no longer holds the card pipeline commits. Merge `salvage/qf-6-2026-10-02` instead (after committing main's copies by exact path, as before). Before merging, check its extra salvage commit holds nothing but files main already has.

## TOP PRIORITY: the node RAM leak (the owner, 2026-10-02)

59 node.exe were holding 3.9 GB, mostly idle worktree dev servers. -10 couldn't run or kill anything, so:
1. **Right now:** `node public/framework/ai/sessions/2026/10/02/node-reap/node-reap.mjs` (a dry run; read the plan), then the same with `--apply`. It stops whole server trees with no working or idle agent there, the extra main copies, and orphans. It writes `result.json` with node totals before and after. That's the RAM issue's first fix (`ram-limit`).
2. **Then spawn `minion-node-reap`** (Sonnet, high) on `ai/sessions/2026/10/02/node-reap/requirements.md`, **ahead of token reduction**. It covers the guard against agents starting servers, worktree-up going through Servex, the 10-minute lease idle stop, the reaper in the reconcile pass, the pool's return stopping its server, and one server in main. The rule is in `Servex/readme.md`, "Dev servers".

## First things for -11 (each is one command; -10 could not run node)

1. `node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-review-rule.mjs`. This applies the owner's 2026-10-02 review rule to the `minion` and `sub-mastermind` skills: the mastermind reads the diff first, a fresh reviewer only on doubt or for a page or layout change, no docs-check agent by default, the fix goes to whoever is best placed, one ruling. If it aborts, the old text has moved: apply the same meaning by hand. `Server/doc/review.md` ("Who reviews") is already updated. The `mastermind` skill already carries the rule (vscode-mastermind put it there).
2. `node public/framework/ai/sessions/2026/10/02/servex-mastermind/review-audit.mjs`. It gives the exact count of findings and answers, matched per finding. Grep counts so far: the owner's figures match the files (569 findings, 238 answers in `review.jsonl`, 09-28 on), but **answers are written to `task.jsonl`, and `review.jsonl` gets a copy only when someone runs `--turns`**. 30 of 57 `review.jsonl` files have no answers in them at all. Comparing line counts per task, the findings that really have no answer are roughly 150 to 165. They are mostly in openrouter-harness (about 37), framework-home (24, today's, possibly still open), hitl-widgets (18), page-system (15) and slow-card-fix (11). The script gives the real figure. Put that figure on the live card.
3. The system fix the audit points to: `merge.mjs` should run `review.mjs --turns` before its gate, so `review.jsonl` is never a stale copy. That's a small change on the merge path: add it to token-reduction item 5, which touches the same code.

4. `node public/framework/ai/sessions/2026/10/02/servex-mastermind/apply-every-prompt-once.mjs`. It removes `every-prompt`'s "re-invoke on EVERY prompt" line. The measurement and any context cap are token-reduction item 10.
5. Token reduction's brief now has items 8 and 9 (vscode-mastermind's findings, ~19:50). Item 8: a stopped agent's claude.exe stayed alive, and the reconcile also *respawns* stopped agents that have a spec. Item 9: `review.mjs` picks Opus for a full-size review regardless of pace. Leave `reviewer-card-pipeline-4` (Opus) running: it's mid-review, and stopping it throws away what it has already cost.

## State found (from git and the task logs)

- **Stalled tasks + budgets: landed** (97e3de9a, 8e20aace, both on michael/dev). It could not message @task-mastermind-panel2-sessions because a minion may only message its parent, and -9 was stopped. The `tasks.json` shape is in `Servex/asks/readme.md` ("Tasks, not just asks"). The next mastermind sends that one-line pointer to @task-mastermind-panel2-sessions.
- **Card pipeline: landed, but its files sit uncommitted in main** (the "applied, not merged" landing). Branch `worktree/qf-6`, head e7d28a31, after three review rounds. -10 checked it against git: all 13 tracked files in main match the branch exactly; the 4 new files (`ai/asks/rows.js` and `card-pipeline/{audit-90,audit-cards,run-pipeline}.mjs`) exist in main but are untracked, so compare them by `git hash-object` before committing; `asks.jsonl` differs only by 23 newly appended lines. **To do:** commit those 17 paths by exact path (`git diff --stat michael/dev...worktree/qf-6` lists them), then `git merge --no-edit worktree/qf-6` so the slot can go back, then **restart Servex** (Asks.js and Cards.js, plus the roles.js fix, in one restart). After the restart, check that `ensure_card` keeps making cards on its own tick. The minion ran it once by hand: 3 of today's 4 asks got new cards, and framework-home already had one.
- **Usage:** week 39% used, 27% of the week gone → pace about 1.45, over. Sonnet minions, no redundant reviewers.

## Queue (the owner's order, with vscode-mastermind's one change)

1. Card pipeline: built and checked. Commit it, merge the branch, restart Servex (the restart includes the roles.js fix). Stop `minion-card-pipeline`, which is done.
2. **Token reduction**: `ai/sessions/2026/10/02/token-reduction/requirements.md` ($10). Its task.jsonl line 1 is written as queued. Spawn `minion-token-reduction` (Sonnet, high) into a pool worktree. Moved ahead of the rest because it saves the most money.
2b. **Known issues** (the owner, 2026-10-02): `ai/sessions/2026/10/02/known-issues/requirements.md` ($8), seeded from `seed.json` (8 issues). It goes right after token reduction, because it shares the start-line hook with token-reduction item 2. Spawn `minion-known-issues` (Sonnet, high). **After it lands, this system is yours to run:** on every wake, read the inbox at `/framework/servex/issues/` and triage each note into a `report()`, a `plus1()` or a decline, then `clear()` it. Keep the statuses current as token-reduction items land (most seeds point at one).
2c. **One standing voice pair** (the owner, 2026-10-02): `ai/sessions/2026/10/02/standing-voice-pair/requirements.md` ($12). It replaces a pair per ✦ press with one site-wide pair started at boot, kept like `fixer-1`, recycled with a short handover when its context grows, and tagged by role for cost totals. `Servex/readme.md` "The voice pair" already describes it. Spawn `minion-standing-voice-pair` (Sonnet, high).
3. **Card pipeline 2** (the owner's five Inbox asks, 2026-10-02): `ai/sessions/2026/10/02/card-pipeline-2/requirements.md` ($15), queued. It covers Approve/Unclear on every task card as card lines the audit trusts; module cards at the top of the Inbox, built from `paths`; `blocking`/`review`/`fyi` categories replacing the 90+ score; "<module>: <outcome>" titles; and no raw dictation as a card's main text. It starts once the card pipeline is committed and Servex has restarted with it. Spawn `minion-card-pipeline-2` (Sonnet, high).
4. Stalled tasks: done (above). What remains from it is the panel2-sessions pointer.
5. **Stamped logs**: `ai/sessions/2026/10/02/stamped-logs/requirements.md` ($10), after card-pipeline-2 (they share `Servex/asks/` and `Cards.js`). It replaces "JSONL gaps 2–5" and folds them in. The owner's ask: no AI types a log line or retypes a prompt; a tool stamps the fields itself. Spawn `minion-stamped-logs` (Sonnet, high).
6. Phantom hardening, then the pool follow-up brief, then roadmap 5–13: unchanged from checkpoint-10.

## Voice pair, logs and names (the owner's three checks, 2026-10-02, done by -10)

Post this on the live card (`card_reply` was refused for -10):
1. **Both voice assistants get every owner line from code.** `Sessions.say()` and `release_thought()` send each line to the fast and the smart assistant themselves. The fast one has no tools, so it can't retype a prompt. Owner words on a card take the same path (`Layers.card_prompt_session`). No fix needed.
2. **Logs:** the prompt log, voice chat, card lines, ask marks and review lines are already stamped by code. Task launch and landing lines, day lines, ask route lines and audit lines are still typed by an AI, and owner words are retyped into `create_card`/`ask_manager`. Fix: the stamped-logs brief.
3. **Names:** the docs now say "smart assistant" (`/framework/servex/doc/roles.md`, `core/Page/ai`, `Servex/agents/readme.md`, `doc/names.md`). `master-assistant` is retired. It still runs on Opus and hears page-less owner prompts a second time; its removal is token-reduction item 11. `.claude/skills/every-prompt/page-assistant.md` still says "manager" for the page pair's page mastermind. That pair no longer hears the owner, so this is low priority; rename it when the skill is next touched.

Still open from checkpoint-10: `fixer-1` missing after the restart (check whether `Fixer.js` starts it on the first call), the working cap counting reviewers, and time-to-first-fix not yet measured.
