verdict: pass
1. [note] Requirement 1 met: Server/review.mjs:713-720 exits 1 when the target branch is empty, "HEAD" or michael/dev, with a message that names the fix; it sits before the `head` rev-parse, so no diff is written. It is not tested (no test for the refusal).
2. [note] Requirement 2 met: Servex/Heartbeat.js:127 skips held tasks (Landed.state "waiting" or "paused", Heartbeat.js:197-200); Servex/Heartbeat-held.test.mjs passes 3/3 when run, and mastermind.md:125 documents the wait line for look-first briefs.
3. [note] A held task is also skipped by the revive/escalate path (same `continue`), so a waiting task whose agent crashed is never revived until the owner un-waits it. That matches "no status checks", but is worth knowing.
4. [note] Heartbeat-held.test.mjs builds a Heartbeat via Object.create and stubs `servex`/`agents`, so it will break if `read()` gains new dependencies; acceptable for a 21-line test.
