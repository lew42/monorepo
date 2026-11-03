# NeedsRule.js — Needs Detection and Importance Scoring

Shared pure function (no DOM, no /app.js) for detecting open needs and scoring importance. Used by needs.js tab, rail filter, and Servex /waiting route.

## Open Items (contract-v2 §1)

An item is open when:
1. A `place` line for Decision (ux/Content) with no later `chose` line
2. A `place` line for Question (ux/Content) with no later `answer` line
3. Legacy `{"ask": {...}}` line with no `{"answer": {"ask": id}}` line
4. Card of `type: "question"` (pseudo-id "card") or last message ending "?" (pseudo-id "last"), with no answer AND no newer `reviewed` line

**Drops out:** status `done` or `archived`, or task-loop/heartbeat escalations (system questions, not owner's).

⚠ Not `fold_card()`: multiple open asks per card (Decision AND Question AND legacy ask) — reads raw lines.

## Heartbeat Lines

⚠ Heartbeat notices are not activity; never move last-activity time. Shared by inbox.js, groups.js. Matched by `by === "servex-heartbeat"` or text starting with it.

## Importance Scoring

Blocker (97-100): key/login/password/payment/delete words; NEVER DECAYS.
Blocked (90-96): live agent waiting; rising with age; NEVER DECAYS.
Fresh (90-99): anything recent (< FRESH_HOURS, ~24h); straight-line fade down.
Prompt fresh: raw voice transcription, 1h not 24h.
Stalled (15-35): owner agent silent; rises with hours_silent + cost (never ≥90 alone).
Decided (30): decision_made (FYI, not question).
FYI (10): default resting score.
Owner note (100): unread, pinned; decays only when reviewed.

Functions: `blocker_signal()`, `blocked_score()`, `plain_ask_score()`, `stalled_score()`, `fresh_bonus()`, `importance()`, `reason_of()`.
