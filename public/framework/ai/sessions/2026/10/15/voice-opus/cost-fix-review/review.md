# Review of cost fix a392e2049 (read only)

**Verdict: sound, approve. One real bug to fix, three small notes.**

Checked: the diff, `AISessionCost.test.mjs` (3/3 pass, including a real 5319-line log at $35.85 read once, twice, tail+full, halves, reversed), and the update/recost paths.

## Passes
- **Idempotent:** a message is keyed by id and each token field is the max over its lines. Max is commutative and idempotent, so replay, tail, overlap and reversed order cannot move the total. Verified by the test.
- **No undercount:** a streamed message's growing output count is kept (max), a zeroed replay adds nothing, cache read/write are maxed separately, and each message is priced with its own model, so multi-model sessions are fine. Subagent files get their own key space (`part|id`), matching the SDK billing each file separately.
- **Three implementations agree:** AISession, AISessionCost, the audit and the digest use the same rule.
- **`--recost` is not destructive:** it re-derives snapshots from the raw transcripts, appends to cache/day files, and deletes nothing. Ancestor `tree_usd` is adjusted by the child's delta; the ordering of ancestors vs children in the same run still gives the right total (child delta added, or already inside the parent's `prev.tree_usd - prev.usd`).

## Findings
1. **Bug (low odds, real crash):** `update()` resets an old state only when `s.messages` is truthy (AISession.js:517). A cached v1 summary with `messages: 0` (user prompts only so far) keeps `state.ring` and has no `state.seen`; the next assistant line then throws on `seen[key]` (line 180). Fix: reset when `(s.v ?? 1) < STATE_V` regardless of messages, or default `s.state.seen ||= {}` in `apply_text`.
2. **Note:** `state.seen` is never trimmed, so snapshots grow with message count (a 10k-message session is on the order of a megabyte in cache.jsonl). Acceptable given correctness, but worth watching.
3. **Note:** `heal()` re-queues forever for a snapshot whose transcript `find_transcript` cannot locate, since its `cost_v` never bumps. It logs each load; harmless but noisy.
4. **Note:** the audit's `cost_of_transcript` is only compared on the main file in the test; the subagent sum is not covered by a test.
