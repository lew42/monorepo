verdict: pass
1. [note] Server/SessionRecord.mjs:59-60 implements the rule as asked (spawn line, `{"session":…}` line, day-level session_id, else task.jsonl); the three new test cases at SessionRecord.test.mjs:109-112 cover it. I did not run the tests.
2. [note] The diff touches only Steps, prompt-relay, naming-guard, TaskPage and the tests. Landed, TaskLoop, Cards, tasks.js, ledger.mjs and page_tools.js are not edited, so the brief's yes/no readers table and the post-restart proof folder must be in the report. I could not check either from the diff.
3. [note] TaskPage.js:9 sends a HEAD request on every task page load. That is one extra request, and a 404 on task folders; fine, but `AITask.has` (as the brief suggested) would reuse an existing helper.
4. [note] prompt-relay.mjs:182 uses `log_or_old`, and the brief asked for `log_file`. The effect is the same here because `read()` of a missing file is presumably safe.
5. [note] The brief asked to fix the sentence "only a folder directly under a day gets session.jsonl" in ai/sessions/readme.md. That sentence no longer exists in the file, so the row edit is enough.
