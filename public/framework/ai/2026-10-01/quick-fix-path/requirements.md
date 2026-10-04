# The fast path: from "fix this" to a live fix in seconds: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). **Driven by: the Servex architect** (mastermind-servex-9), together with the dictation task (task-mastermind-one-dictation) for the voice end.

## Goal
The owner says, about the page or the selected item, "make this bold" or "this gap is too big". **The first fix is live in about 10–30 seconds,** for small changes of a few lines. Measure and log the time to the first fix.

## The path (node-led wherever possible, CLAUDE.md law 7)
1. **Voice → the smart assistant** knows the page and the selected element (the nav and selection events). It sends a SHORT refined request, or the verbatim one, straight to a…
2. **…warm quick-fixer:** a standing agent kept WARM (`dormant_after`: long) with the house rules loaded, plus an always-ready quick-fix worktree (the qf pool, kept synced with michael/dev). No spawn and no new worktree on the hot path.
3. **It edits, smoke-tests, and takes ONE screenshot** at the width that matters (the review skill's "pick widths by what changed"), checks the outcome, and **merges its own worktree** through `merge.mjs --quick` (a size threshold: few lines, one module, so a light review).
4. **The owner sees it live** (one reload, or the stream). The fixer posts one line in the chat with the screenshot, never chit-chat.
5. **If it's bigger than a quick fix** (more files, a layout, a new feature), the fixer says so and hands it to a task mastermind. It never stalls on the hot path.

## Related
- **Logs as rewind:** append-only logs with timestamps are a full playback of what happened; keep them. Purge only by snapshot and archive (page-item-design.md, "Speed"), never by deleting history.
- The streaming UI uses the one JSONL system (tail) for every change, so the page updates without a reload where possible.

