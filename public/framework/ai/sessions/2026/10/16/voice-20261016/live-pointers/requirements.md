Budget: $5

# live-pointers: /live cards become pointers; their data moves to the log that produced it

The owner's rule (voice question e093fcb0, 2026-10-16, logged in `../task.jsonl`): **/live is a view only.** The data lives with whatever produced it and is timestamped there: that task's `task.jsonl`, the module's doc or log, or git. A card on /live is a pointer: a title, one sentence, and links.

Four cards on `public/live/page.jsonl` break this rule today. For each one, move what the card says into the right file, then make the card a pointer. Add lines only; never delete or rewrite old ones. Write every task.jsonl line with `node .claude/hooks/append.mjs <target> <lines.json>`, and put `"at":"NOW"` so the script stamps the time. Change a card only through the page tools (`page_read`, then `page_set` / `page_add` with path `/live/`), never by editing page.jsonl by hand.

1. **Chat bubbles** (written by mastermind-refine-build). Append `decision` and/or `log` lines to `refine-build/task.jsonl`: what was fixed, what was not reproduced, what is still open, and the merge commit `c82cae958`. Then the card gets one sentence plus links to `/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/` and the commit.
2. **Overnight**. The facts are mostly already `log` lines in `../task.jsonl` (search "Overnight", "landed"). Append a `log` line for any fact on the card that has no line yet (what landed, the commit hash, the cost). `overnight.md` may summarise those lines; add a line at its top saying the log is the record. The card gets one sentence plus links to the task.jsonl and overnight.md.
3. **Task audits** (the card's `task-audits` text in page.jsonl). Create `public/framework/ai/audits/index.jsonl` with one line per audit: `{"audit":{"at","path","verdict","followed_up","note"}}`. Use the audit's own date as `at` when it has one, otherwise NOW. Add `public/framework/ai/audits/readme.md`, under 10 lines, saying what the file is, and link it from `public/framework/ai/readme.md`. The card gets one sentence plus a link to the readme.
4. **Transcripts** (helper-transcripts is stopped). Append one `action` line to `past-work/transcripts/task.jsonl` with the run numbers from the card (sizes, session counts) and `Server/Transcripts.mjs`. The card becomes a 3-line pointer.

Before the first write to /live: `node Server/hold.mjs on "helper-live-pointers — /live pointers"`. After the last write: load `/live/` with `check_page` or a headless shot, then `node Server/hold.mjs off "helper-live-pointers"`. Commit each step with a clear message (`live-pointers: …`), work on michael/dev directly since these are append-only log files, and log each step in `./task.jsonl`. Finish with one `log` line in `../task.jsonl` listing the commits.
