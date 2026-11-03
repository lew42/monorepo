# Cards and logs: what was left, and why

- **AI 2 Inbox and Log tabs.** Not built here, because the budget ran out. It's the next task, [next-log-view](next-log-view/requirements.md), dispatch row 46.
- **Saving a log to a file.** `Logger.JSONL` makes the lines, but nothing writes them to disk yet. The Whisper page's "Download JSONL" is the only way to keep one. The first log that needs to persist (AI 2's Log view) should wire a server writer.
- **No walkthrough page.** Budget.
- **Mini pages' `card` verb** has the same name as Page's `card` property. A three-line override covers it, and the trap is recorded in the page skill's `improvements.md`. Renaming the verb would change the stored data format.
- **core/Page's top tab bar** has no Cards tab. That bar belongs to mastermind-page.
- **Demos show code before the result.** That's the site-wide `ext/demo` convention, not this module's call.
- **Merge note.** `merge.mjs` wrote the branch into the main tree without committing it, so it was committed by exact path as 3d4aa09a. The worktree's watcher churn is stashed there as "cards-and-logs: watcher files.jsonl churn before merge".
