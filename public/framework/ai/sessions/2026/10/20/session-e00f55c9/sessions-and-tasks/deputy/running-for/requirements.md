# Sessions: show a session's real span and its active time, and make the VS Code tab's row recognisable

Budget: $3. Load the `minion` skill first. Work in the worktree Servex gives you, committing at every working step. The deputy reviews and merges. Never kill or restart the dev server or Servex, never `git stash`, never drive the owner's tabs.

**The owner's words** (relayed by vscode-mastermind, 2026-10-24): the sessions dashboard shows this session (e00f55c9, the VS Code tab) as "running for 2 days". It began 2026-10-20 23:31Z: that is 98 h (4 days) of span with about 9 h of active time. The 2 days most likely count from the 10-23 01:31Z restart line, after StaleClose stopped it on 10-22.

**Build:**
1. Wherever a session's running time shows, show the span from its first line plus its active time, e.g. "4 days · 9h active". Find both surfaces:
   - the session page's stats bar: `public/framework/ai/AISession/SessionStats.js:47`, "Running for", which today is `root.ms()`, the Task's banked running time;
   - the Sessions list row on `/framework/ai/sessions/`.
2. **The span:** from the record's first line (`{"session":{…,"at"}}`, or the snapshot's `first_at`) to its last activity, or to now while it runs. A stop and restart does not reset it.
3. **The active time:** use the number the session index already keeps: `AISessionIndex` (`ai/AISession/AISessionIndex.mjs`), the newest summary in the folder's `cache.jsonl`, or `session_state`'s own active time in `Servex/agents/page_tools.js` (look for "active time"). Use one source and say which.
4. **Make the tab recognisable:** in the list, a VS Code tab's row (kind `vscode-tab`) shows its title. If it has none, show "VS Code tab", plus its short id, instead of a bare id.

**Proof:** a headless shot at 1920 of the session page `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`, and one of its row on the Sessions list. Both should read about "4 days · 9h active". Save them in this folder; they are gitignored, which is fine.

**Report (one screen, as your task's `complete` outcome):** the source of each number, the commits, and both shots' readings.
