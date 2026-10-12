# The sweep: every waiting question, on a card

Six questions were already waiting on the owner across `todo.md`, `handover.md` and the
loose-ends report, but had never been put on a card as an ask — so the dashboard's "waiting on
you" list would have shown nothing. Each is now an `ask` on a card, written through the live
Servex (`POST /card/append`). Nine existing cards of `type: "question"` already count as asks on
their own; they needed nothing written and are just listed at the bottom.

## New asks (6)

| Title | Question | Options | Card | Source | From |
|---|---|---|---|---|---|
| Delete the 739 dead files? | May I delete the 739 dead files (14,354 lines) left behind when /imagine/ pages moved, since they are byte-identical to their moved copies? | prune, wait | [reuse-audit](/framework/ai/2026/09/22/reuse-audit/) (existing) | todo.md §2, handover.md #0, loose-ends #1 | |
| Drop the old git stash? | Once the dead-file prune lands, may I drop git stash@{0} (the full working tree from the 2026-09-19 reset), since it looks fully subsumed by later work? | drop after prune, keep for now | [drop-the-old-git-stash](/framework/ai/2026/09/28/drop-the-old-git-stash/) (new) | todo.md §2, loose-ends #2 | |
| Add the tab rule to CLAUDE.md? | May I add this rule to CLAUDE.md: multi-file work goes to a Servex mastermind, and small edits stay in the tab? | yes, no | [add-the-tab-rule-to-claude-md](/framework/ai/2026/09/28/add-the-tab-rule-to-claude-md/) (new) | todo.md §2, loose-ends #4 | |
| Log in to Cloudflare? | Will you run `npx wrangler login` (or give an API token), about 5 minutes, so a real Cloudflare D1 database and the Cloudflare MCP connector can be set up? | | [log-in-to-cloudflare](/framework/ai/2026/09/28/log-in-to-cloudflare/) (new) | todo.md §2, loose-ends #3 | |
| Authorize the Gmail connector? | Will you authorize the Gmail connector in your claude.ai connector settings, since a non-interactive session can't run that sign-in itself? | | [authorize-the-gmail-connector](/framework/ai/2026/09/28/authorize-the-gmail-connector/) (new) | todo.md §2, loose-ends #5 | |
| Add a git-safety hook? | May I add a hook in .claude/settings.json that blocks git stash, checkout --, and reset --hard in the main tree (worktrees stay unaffected), since the written rule alone was broken today? | yes, no | [add-a-git-safety-hook](/framework/ai/2026/09/28/add-a-git-safety-hook/) (new) | todo.md §3 (mastermind-servex-3, 2026-09-28) | |

`from` is blank on all six: none is one agent's own open question — they are the owner's standing
list, so an answer wakes whichever non-minion agent is attached to the card (or none, since five
of the six cards are brand new with no agent attached yet).

## Left out, on purpose

- **A checkpoint commit of the main tree** (checkpoint.md) — not an open question. Card
  [commit-the-live-system-code](/framework/ai/2026/09/28/commit-the-live-system-code/) already
  has a `request` ready to dispatch a task mastermind to do the commit itself; the owner was
  never going to be asked.
- **"The lobby files the owner's words by guessing," "a fresh AI 2 lead," "a native Servex
  crash"** (checkpoint.md) — bug reports and dispatch work, not questions for the owner.
- Everything else in `todo.md` §1 and §3, and `handover.md`'s numbered list, is either project
  work (not an owner decision) or already marked resolved in
  [loose-ends/report.md](/framework/ai/2026-09-24/loose-ends/report.md) (hooks armed, restarts
  done, the six skill changes overtaken, the pm2 daemon gone, etc.).

## Already asks — listed, nothing written (9)

Open cards of `type: "question"` already count as one ask each (id `"card"`), per the contract.
Left exactly as found:

- [commit-the-dictation-playground](/framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/commit-the-dictation-playground/)
- [demo-of-jsonl-pages-with-code](/framework/ai/2026/09/24/pages-markdown/demo-of-jsonl-pages-with-code/)
- [explain-the-jsonl-page-format](/framework/ai/2026/09/24/pages-markdown/explain-the-jsonl-page-format/)
- [where-we-landed-on-pages-and-markdown](/framework/ai/2026/09/24/pages-markdown/where-we-landed-on-pages-and-markdown/)
- [chat-demo](/framework/ai/2026/09/24/chat-demo/)
- [session-lifetime-and-message-relay-to-ma](/framework/ai/2026/09/24/new-card/session-lifetime-and-message-relay-to-ma/)
- [chat-as-right-hand-column](/framework/ai/2026/09/24/prompt-mechanics-2/chat-as-right-hand-column/)
- [two-no-image-screenshot-links](/framework/ai/2026/09/24/cards-content/two-no-image-screenshot-links/)
- [why-is-this-card-full-width](/framework/ai/2026/09/24/cards-content/why-is-this-card-full-width/)

## Proof

Each new-ask card's `page.jsonl` was read back after the append and ends with the `ask` line
above — checked one by one with `tail -n 1`. Total open asks written this sweep: **6**.
