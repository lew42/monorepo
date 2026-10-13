# Session data: are we duplicating the raw SDK session files, and where do the strays go

Budget: $8. Load the `sub-mastermind` skill first. The owner's raw words: `../requirements-6.md`, ask 3 ("it's possible we're re-logging the entire prompt, the entire session file, in our own session logs… another data efficiency question of what should go where… if it's broken, fix it; a recommendation goes to the inbox… we don't need a duplicate copy of the raw transcript if we already have it in those session files; deep-link back to the source"). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; never destructive; a question is answered in the inbox.

## What exists

- Decided 10-03 (`ai/sessions/2026/10/02/panel2-sessions/sessions-date-homes/`): "no duplicate data: the 110-file transcripts/ copy is gone; prompts load live through `/ai-logs/<id>`". `AISessionConversation.js` renders the raw file. `SessionIndex` (today) gives each task row `raw.task` and `raw.transcript`. `repo-size.md` (today): all text records are 30 MB; `owner-prompts.jsonl` (7.2 MB of the owner's prompts in a 10-12 task dir) slipped past the transcript rule and is now ignored for new writes.

## Deliverable: `public/framework/ai/sessions/doc/data-sources.md` (one screen) + one `owner_note`

1. **Measure, by script** (`Server/session-dup.mjs`, read-only): for every writer that stores owner prompt text in the repo (`chat` lines in task logs, `requirements*.md`, `owner-prompts.jsonl`, `words.jsonl`, Dictate's logs, the cards' `page.jsonl`), the bytes and line count, and how much of it is verbatim duplicate of text that also exists in the SDK session file at `~/.claude/projects/<dir>/<session>.jsonl` (hash a normalised line; count matches). Two numbers that must agree: lines scanned vs lines in the files.
2. **Decide**: which copies are records (a brief's verbatim ask the task was built from stays), which are duplicates to stop writing (a `decision` line each, with the writer named: file:line), and what a deep link looks like (`/ai-logs/<id>#line` or the SessionIndex `raw` field). Fix a writer only if the fix is one or two lines and additive (a link instead of a copy); otherwise write the exact edit in the doc.
3. **The strays** seen today (do not delete; decide and move with a script if obvious): `public/framework/ai/2026-10-13/` (an old-style day folder with `crawl/` and `feedback-council/`; the day folders were retired 10-12 for the sessions store, `ai/doc/task-folders.md`; find which agent wrote it and whether `TaskDirs.mjs` has a mover for it) and `public/ai/v-*.jsonl` (test logs 10-05, 10-09, today). A `git mv` with a manifest if they belong in the store; a `.gitignore` line with a reason if they are machine state.
4. **The owner_note** (kind `decision`): are we duplicating, how much, what was changed, where to read it.
5. Report on your card: the duplicate bytes, the decisions, the links.

Fence: `Server/session-dup.mjs`, `public/framework/ai/sessions/doc/data-sources.md`, one link line in `public/framework/ai/sessions/readme.md`, the two stray locations (move or ignore only), one-line writer fixes named in your log, this task dir. Worktree, `merge.mjs`. Never read a session file's content into a committed file; hashes and counts only.
