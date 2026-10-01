# mastermind-servex-9: checkpoint, 2026-09-30 about 19:10

Start as mastermind-servex-9 (resumed) or -10: load `servex-mastermind`, read checkpoint-8.md's "Your standing roles", then this. Children of a stopped -N report to the live one by themselves (Agents.js:497).

## Two priorities from the owner (19:00)
1. **Memory — DONE.** dormant-idle landed (106a51a1, records df3588f8): 21 claude.exe / 6754 MB → 14 / 4222 MB at +10.3 min, cap holding 5/5. Proof at ai/2026-09-30/dormant-idle/proof.txt. Loose ends (status wakes dormant; wake-by-message overshoots cap) on todo.md.
2. **Limbo**: task-mastermind-asks-ledger ($20, brief at ../asks-ledger/requirements.md): Servex/asks/Asks.js + stalled() on its own 60 s tick, stalled rows + importance 1–100 in AI 2 Needs you, /framework/ai/asks/ page. The VS Code tab appends the ledger lines; we own stall detection and the view.

## Restart batch (restarting at 19:10)
53b297cc + d9dcbc9c (voice sessions, the double-line fix), pool-taken bf2ded99/5674b7a1, review 9dd490bd, pages.js 2dc26a02. Still to come: page-inbox, cards-and-logs, asks-ledger backend, dormant-idle → a second restart later.

## Running
cards-and-logs (review-fix minion), review (walkthrough minion, then land), page-inbox, dormant-idle, asks-ledger (backend minion), owner-tab: audio-consolidate, mentions, servex-docs, chat-reactions, dictation-stream, ai2-rescue-merge.

## Open
- Untracked in main: Servex/ext/, Servex/experts.json, .claude/skills/openrouter/, a `nul` file — find the owner or commit.
- todo.md: list_agents archive default; chat-hitl asks 1+3 unmet; two broken /imagine pages.

## Added 14:59 CDT (after compaction)
- Owner reshaped the skill system: knowledge → /framework/design/ (layout, color, navigation, content, ui) + /framework/code/ (patterns, dos-and-donts, css, objects); skills thin. Proposal rewritten (ui-skills-proposal.md, top). task-mastermind-design-code builds; diff 1 (code side) approved with conditions, diff 2 (design side) due to me. Review questions move beside the pages; review.mjs reads them (273589f9).
- Four owner decisions proposed, not built: merge-approval-proposal.md + card 2026/09/30/proposal-budgets-merge-approval-template (foundational budgets, merge row with Approve/Reverse, template weights via use_template + /framework/ui/ library, one page.jsonl).
- Seven CLAUDE.md draft lines on card claude-md-draft-read-the-readme-chain-to.
- asks-ledger redirected: stalled asks → Inbox rows, Needs you untouched (owner: forget Needs you). Its merge → the batched Servex restart (Asks.js).
- audio-consolidate landed 5c1b7d15; its one-dictation-system plan is parked until the 4:50 PM reset. **If restarted: send it "go" after 4:53 PM local once pace allows** (a session-only cron did this); step 4 needs a Servex restart, mine.
- Landed today also: voice-dir-404 f055b4aa, ai-page b8b9044b/986f406d (readmes, claude-md tab, inboxes home, tabs wrap at 400).

## Added 16:15 CDT
- **CLAUDE.md law 5 (owner, 2026-09-30): keep working; never wait on the owner.** Decide, say the alternative, queue on limits. Proposals on cards are no longer gates: their build is queued (proposal-flow, 10 PM reset), not "awaiting marks".
- Servex restarted 15:33 for asks-ledger (fe471a61, Asks.js stall ticker); back as pid 59256. asks-ledger runs the stalled-ask proof, then lands.
- Quick-fix pool was dead (all nine qf-* names held by leftovers). Cleared; proven with take/return. Notes `ai/2026-09-30/pool-cleanup/`; two todo lines (qf-1 unmerged core/Page nav, qf-3 superseded?, qf-6 folder locked).
- Asks ledger tidied: landed/queued statuses with reasons; nothing falsely stalled.
- inbox-ext: merges 1–5 now, merge 6 waits on ui-system's `System` class (seam written in `ui-system/task.jsonl`). Phased UI feedback = §5a of merge-approval-proposal.md, handed to proposal-flow (seam in `proposal-flow/task.jsonl`). Process monitor is dormant-idle's (plan 5c11d450).
- Cron one-shot **5006c029** at 4:53 PM: usage check → audio-consolidate "go". Session-only; if I am restarted, do it by hand.

## Added 16:40 CDT
- **One-dictation is task-mastermind-one-dictation's** (owner-spawned 16:34, card `one-dictation-chat-everywhere`), building on audio-consolidate's plan 7ecd8f68; audio-consolidate stood down and lands what it has. The 4:53 "go" is cancelled — nothing to do at 4:53.
- chat-reactions' files committed by me (ead237b9) — the per-file merge left them uncommitted again; merge.mjs fix stays on todo.
- CLAUDE.md law 6: one of everything. Before any spawn, check the live agents and asks.jsonl for the same build.

## Added 17:25 CDT
- process-monitor merged ecaba702; Servex restarted for it (17:25). dormant-idle then measures `/api/processes` live and lands — if I am gone, tell it Servex is up. Skill lines applied (servex-mastermind Processes bullet; fans step 0; owner's-tab clarification).
- Weekly window 96% until 10 PM: no new spawns before then. 10 PM batch: proposal-flow, ui-system, padding, selection.
- 5 PM fans: three worktree servers spinning without a port, killed; spin.md updated.

## Added 22:15 CDT — proposal-flow is mine; wave A queued

- The owner (via `vscode-mastermind`, 22:04): the weekly reset passed, usage 0%; "you and your minions build it… Do items 9–12 FIRST". So the proposal-flow task is owned by me, not a task mastermind. Brief: `proposal-flow/requirements.md`; owner words verbatim in `proposal-flow/owner-words.md`.
- Plan + picture: `proposal-flow/plan.md`, `plan.svg` (42ab5b85). Card: `2026/09/30/proposal-flow-main-is-production-then-pr`.
- Worktree `C:/Code/lew42/worktrees/proposal-flow`, branch `worktree/proposal-flow`, server `http://localhost:62566/` (made with `node Server/worktree-up.mjs proposal-flow`).
- Wave A minions (parent me, bypassPermissions, task dirs `proposal-flow/<name>`): `minion-health-monitor` (Opus, $12), `minion-validated-writes` (Opus, $12), `minion-verbs-reader` (Sonnet, $5). They sit in Servex's spawn queue (positions 1–3 at 22:15) behind the 5/5 working cap; `system_health` → `queue[]` shows them (the `/agents` list does not). Servex wakes me when each starts and when it ends a turn.
- On "ready to merge" (card): merge each piece through `Server/merge.mjs`, verify headless, commit per-file leftovers by exact path. validated-writes touches `.claude/settings.json` hooks and Servex `append_log` → one batched Servex restart.
- Wave B briefs (Proposal class, node-led loop, merge rows + revert, template weights, page.jsonl archiving + promotion, session focus) are written after A lands.
- process-monitor landed by dormant-idle (eefbf20e + acf942cb CSS). Nothing left for me there.

## Added 23:15 CDT — wave A landed; pacing cut; stop after the restart

- **Owner pacing cut (22:55, via vscode-mastermind):** the week burned 5% in its first hour. Scope is items 9–12 ONLY, one Sonnet minion at most, no review rounds beyond the gate, stop when 9–12 land. ui-system, selection, dev-shell, process-monitor were paused by the owner (revivable). Wave B (Proposal class, node-led loop, merge rows + revert, template weights, page.jsonl archiving + promotion, session focus) and item 8's anomaly check WAIT — do not spawn for them until the owner lifts the cut.
- **Wave A merged:** `1ebc924e` (worktree/proposal-flow → michael/dev, through merge.mjs). Landing line on `proposal-flow/task.jsonl`. Verified in main: `jsonl-schema.test.mjs` 33/33, `jsonl-guard.test.mjs` 16/16, a flat line refused on a task.jsonl, `/framework/ai2/` loads. The jsonl-guard is now a PreToolUse hook on Bash/PowerShell in `.claude/settings.json`: a shell `>>` into a .jsonl is refused (even inside a commit message that quotes one).
- **Gate lesson (applied):** a review finding is answered by a `{"review":{"answer":{"n","reply":"fixed: …"}}}` line in the task dir's task.jsonl via append.mjs — never by typing under the finding in review.md. Minion skill rule 10; merge.mjs refusal names the shape (f5fa02ef).
- **Minions:** minion-health-monitor (Opus, stopped clean, $5.93), minion-validated-writes (Opus, idle, ~$4.6), minion-verbs-reader (Sonnet, idle, ~$6.3 of $9). Gate reviews: four runs, $3.70. All three can be revived for wave B (cached, on topic).
- **Servex restart pending** (last act): one-dictation's Sessions.js (6a586e90, 49f93b37) + validated-writes' append_log check (66060694). Then stop.
- Still open from earlier: 25 node scripts append .jsonl without the schema check (first three: Server/plugins/SocketServer/Append.js, Server/review.mjs, .claude/hooks/ledger.mjs — list in validated-writes/task.jsonl); Server/readme.md does not link Server/doc/health.md; Pool.js per-slot TEMP trick unneeded now.

## Added 00:15 CDT (Oct 1) — probe tasks landed; stopped per the pacing cut

- **Servex restarted** after wave A (pid file in sustain.log): Sessions.js (6a586e90, 49f93b37) and the append_log check are live.
- **Probe tasks** (owner's lean follow-up via vscode-mastermind, openrouter-harness §2b): design at `ai/2026-09-30/probe-tasks/probes.md` + `probes.json`; runner `Servex/ext/openrouter/evals/probes.mjs` merged (ce4f61d3; per-file path, committed by me). Owner: task-mastermind-openrouter runs the models and sends me the (a) cells — a cell every model fails is a SYSTEM fix (skill/readme/CLAUDE.md). First Haiku control: no task, no skill call — likely (c): check whether hooks reach a probe agent spawned into a sandbox dir of a pool worktree before blaming the instructions.
- **Gate quirks seen tonight:** (1) a minion's answers in the WORKTREE's copy of task.jsonl are invisible to the gate, which reads the main tree — copy them over (node, not grep >, the jsonl-guard blocks that redirect too); (2) merge.mjs's smoke needs the worktree's server up and its .worktrees.json entry — the process-monitor cleanup dropped proposal-flow's entry, so pass `--port`; (3) a stale worktree branch (34 commits) conflicts on add/add — the minion merges michael/dev into its branch first.
- **All my minions stopped** (revivable): health-monitor, validated-writes, verbs-reader, probe-runner. Worktree `proposal-flow` is merged; its branch can go when the pool reclaims it.
- **Waiting on the owner's pacing call:** wave B (Proposal class, node-led loop, merge rows + revert, template weights, page.jsonl archiving + promotion, session focus), item 8's anomaly check, the 25 scripts that append .jsonl without the schema check.
