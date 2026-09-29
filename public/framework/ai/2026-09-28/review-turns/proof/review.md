verdict: fix

1. [fix] note.md:3 tells the reader to "Run `npm install` before opening this file, or the framework will not load" — that's false and contradicts the repo's own no-build-step rule (root CLAUDE.md: "no build step... no new npm dependency"). This file is static markdown with no loader; nothing about opening it requires `npm install`. Since this diff exists specifically to exercise a real held decline in the four-turn review flow, this sentence looks like the intended bait — it should not land as-is.
2. [note] The diff is otherwise exactly what requirements.md promises: only note.md and requirements.md added, nothing else touched, so the surface area is trivially small and easy to check.
