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
