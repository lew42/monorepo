# paging-audit-3 — the third audit (two critics, Opus)

Same shape as `../paging-audit-2/requirements.md` (read it; it is the rubric), applied to the realm after `../paging-fix-2/task.jsonl` landed (read its landing lines: eleven items, what changed, what was left). The owner's bar: *"don't stop until the paging system is perfect - simple, powerful, organized, intuitive, easy to browse, infinite potential."*

**Critic A — the newcomer, third visit** (this dir): cold walk at 1280 and 3440, screenshots, the six words scored 1–5 with a sentence each and the delta from your second visit's scores (they were 3 / 4 / 4 / 2 / 3 / 2). What is still confusing, ranked; anything that got worse; the ranked one-line FIX LIST (what · url · how · S/M/L). If a score is 5, say what earned it; if the list is empty, say so — that is the loop's exit.

**Critic B — the systems designer, third visit** (`../paging-audit-3b/`, create with `new-task`): re-check your second verdict item by item with file:line — one name/control/page per block; blocks crossing (the toolbar, `cross/`); one stage renderer or how many; one vocabulary or how many; the url seam (does every configuration have an address; what still cannot be sent); Make/Build sharing one schema. Then the two things the fix pass left (`BuildStage` → `PagingStage` behind a `draw_child` seam; `compare/`) — are they worth their cost now, and what is the smallest first step. The ranked FIX LIST, or an empty one with the reason.

## Rules

Fix nothing; change nothing under `public/`. Private server (kill by the pid you started; never port 80); never `find /`; never spawn agents; never `git stash`/commit. Budget ~200k each. Report in ≤ 10 plain lines plus the list.
