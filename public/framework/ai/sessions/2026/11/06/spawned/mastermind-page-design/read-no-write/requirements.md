# A read on a session page never writes

Budget: $4. Asked by voice-app, 2026-11-10 11:45 UTC (found by live-page, filed in commit 28a22def6, `public/Servex/agents/improvements.jsonl`).

1. **Servex:** `session_file` in `Servex/agents/page_tools.js` created a session folder on a READ (the cost-summary query a session page sends). For an id that is not a uuid (voice-app's `cloud-voice-app-20261110`) it threw, and Servex answered 500. A read must never create a folder; a bad id gets a reason, not a 500. Test that a read leaves the tree unchanged.
2. **Page:** `AICost.ask` (`public/framework/ai/AITask/AICost.js`) asked by the bare id; ask by the dated folder url (`AISession.page_url`).

Check: opening `/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/` makes no POST that writes and no 500.

Built in worktree `read-no-write`, commit f063d6098. Test: `node Servex/agents/item-read-no-write.test.mjs` (14 checks; it fails on the old code with the same throw).
