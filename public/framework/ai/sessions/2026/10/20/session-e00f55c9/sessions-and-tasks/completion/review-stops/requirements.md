# Completion: review the stopped and deferred asks, and the dropped list

Budget: $6, Sonnet. Use Haiku for the bulk reading, in chunks of 30–60k tokens.

**Why.** The new red flag (`/framework/ai/queue/dropped.json`, 2026-10-25 08:21) marks this tab's session red: of the owner's 370 asks, 94 are stopped and 63 deferred, so **42% of the owner's asks were not done.** The owner said that's the failure to catch: "If you're deciding to defer half of them, I think we have a problem. If you mark them as complete and I don't think they're complete, then we have a problem." (The completion brief, [../requirements.md](../requirements.md).) The same file lists 69 dropped tasks across older sessions, most of them "running" with a stopped owner or none.

## Do

1. **Every stopped owner ask in session e00f55c9:** read the stop reason against the owner's own words (the Prompt it came from; `Server/PromptTrace.mjs` finds it). Each gets one verdict:
   - **fair:** it's a duplicate (link the one it duplicates), filler, or the owner withdrew it;
   - **reopen:** real work that was stopped for no good reason. Reopen it, or hand it to the agent whose module it belongs to.
2. **Every deferred one:** check it has a home and a decide-by time. If either is missing, fill it in or reopen the task.
3. **The 69 dropped tasks:** give each a verdict. Close it as landed if its work did land (link the commit); defer it with a home; or stop it with a reason.
4. **Write the verdicts as JSONL** in this folder, apply them in one batch with the item tool, and re-run the rates. Report the new owner-ask rate, plus a short list of the reopened asks in plain words.

Don't build anything new here. Reopened asks go to their owners as tasks.
