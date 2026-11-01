# Test-first changes: the owner's rule (2026-10-29)

Status: **adopted as a rule for recommendations; no monorepo work started.** Nothing is being built yet.

## The rule

A change is only worth making if a test shows it fails today and passes after the change.

1. **Define the problem as a test first.** Write the test that fails today, for the stated reason.
2. **Commit the failing test on its own.**
3. **Commit the fix separately.** Replaying the two commits shows the before and after.

## Keeping tests honest

- Use real components: real files in a temp folder, a real WebSocket server, a socket actually closed mid-send.
- Mock only what can't run, and say what is mocked and why.
- Never invent a state that can't happen in real use just to make a test fail.
- Never weaken a test to make it pass. If the test was wrong, fix it and say why.
- Think through edge cases up front.

## Where the test specs already are

Every recommendation in the code lessons comes with a spec written for the framework's own harness (plain Node scripts using `core/Test/Test.js`):

- `persistence-sync/lessons/storage-compaction.md` → "Failing tests" F1–F10
- `persistence-sync/lessons/sync-protocol.md` → specs for recommendations 1–9
- `persistence-sync/lessons/object-model.md` → specs for recommendations 1–5
- `agent-ops/proposal.md` → 13 checks for the agent-instruction and git changes

## When building starts

The failing tests go on a short-lived branch of the **monorepo** (off whatever branch is current, e.g. `integration/data-shapes-2`), never in this research repo. One failing test per commit, then each fix in its own commit.
