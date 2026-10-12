# paging-audit-4 — the fourth audit (two critics, Opus)

Same shape as `../paging-audit-3/requirements.md` (read it and `../paging-audit-2/requirements.md`, the rubric), applied after `../paging-fix-3/task.jsonl` landed (read its landing lines: eight of nine; what was left and why). The owner's bar, verbatim: *"don't stop until the paging system is perfect - simple, powerful, organized, intuitive, easy to browse, infinite potential."* This round is the exit test: if your list is empty or only cosmetic, say so plainly.

**Critic A — the newcomer, fourth visit** (this dir): cold walk at 1280 and 3440 with screenshots; the six words scored 1–5 with the delta from your third visit (3 / 5 / 5 / 4 / 4 / 3); what would move `simple` and `infinite potential`; anything worse; the ranked one-line FIX LIST or an empty one. Also this round: use the realm the way the owner said he wants to — *"SEE different layouts x navigation x appearance/style x visual hierarchy in action, and … configure or play with it without having to write it out as a new page"* — try to make a page you actually want (say which), send yourself its link, open it cold, then make it a file with Make. Report each step in one line: worked / did not, and why.

**Critic B — the systems designer, fourth visit** (`../paging-audit-4b/`, create with `new-task`): re-check your third list item by item with file:line; count the stage renderers and the vocabularies now; check the url seam end to end (every control writes the query; every page reads it; `?nest=` round-trips); then rule on the last big item — `BuildStage` → `PagingStage` (the four steps are in `doc/builder.md`) — is it worth an afternoon now, and what does the realm gain that a newcomer would notice. The ranked FIX LIST or an empty one with the reason.

## Rules

Fix nothing; change nothing under `public/`. Private server (kill by the pid you started; never port 80); never `find /`; never spawn agents; never `git stash`/commit. Budget ~200k each. Report in ≤ 10 plain lines plus the list.
