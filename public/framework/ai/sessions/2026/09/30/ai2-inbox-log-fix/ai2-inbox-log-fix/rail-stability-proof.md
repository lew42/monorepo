# Proof: the rail stops reordering itself, and the Needs-you flood is gone

Headless Playwright, against the quick-fix worktree's own server (127.0.0.1:54916), nothing
touching the owner's live tabs or the real Servex process.

## 1. Needs-you: heartbeat escalations filtered out

`needs-rule.js`'s new `is_task_loop_escalation()` is a pure function — three direct assertions,
no DOM:

```
opt pair close/keep: true
opt pair look/close: true
real decision (should be false): false
card_needs on an escalation-only card: []
```

End to end (the real Servex `/waiting` still serves the OLD, unmerged rule from the main tree
until this lands and Servex restarts — so the client's own fallback scan, which runs the SAME
shared rule from this worktree, is what was exercised here, by blocking `**/waiting` so
`needs.js` falls back to reading every card's own `page.jsonl`):

- **22 rows**, zero "close it" / "keep chasing" / "look into it" rows — every one a real
  blocker, decision or question. See `needs-you-filtered-1920.png`.
- Before the fix (the live, unmerged main-tree Servex `/waiting`): the badge read **36**, and
  the visible rows were almost entirely heartbeat escalations ("The Page system... has been
  quiet since... Close it, or keep chasing?", repeated).

## 2. The rail never reorders while the owner is looking

1. Loaded `/framework/ai2/` (Inbox, the default again), captured the DOM order of all 379 rail
   rows.
2. Directly edited this worktree's own `ai/cards.jsonl` (no Servex, no write the owner or any
   agent would see) to bump one card — `2026/09/28/shared-browser-launcher-no-popups`, then
   ranked well down the list — to "now".
3. Waited 23s for `CardList`'s own 20s poll to pick it up.
4. Recaptured the order: **identical**, byte for byte, to step 1. The "N updated ↑" pill
   appeared, reading "2 updated ↑".
5. Clicked the pill.
6. Recaptured the order: the bumped card was now at the top. See
   `rail-updated-pill-after-tap-1920.png`.

The FIRST run of this same proof (before the `flush()` fix, see `task.jsonl`'s `decision`/`log`
lines) showed the order changing on step 4 anyway, with the pill never appearing — `flush()`
was still forcing a reorder on every quiet poll, regardless of whether anything was genuinely
new. That is the real bug the owner saw ("reorders live and jumps"); fixed in `page.js`'s
`flush()` and `order_rows()`.

Scripts and raw run logs: the session scratchpad (`probe-rail-stability.mjs`,
`probe-needs-fallback.mjs`, `bump-card.mjs`) — not copied into the repo, per the minion skill
("scratch goes in the scratchpad, not the repo").
