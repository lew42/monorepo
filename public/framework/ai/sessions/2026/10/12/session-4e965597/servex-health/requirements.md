# Servex and dev-server health: close the open asks

**The asks:** [ai/doc/asks.md](/framework/ai/doc/asks.md) cluster **servex-infra-health** (#8, asked 9x). Read that entry and its source links first; its "Open" line is the work. Labels came from reading docs, not every line of code, so check each against the code before building.

## Done when
- [ ] Each open point in the cluster is done (with a commit), or written up in `STATE.md` with the reason it cannot be done tonight and the smallest next step.
- [ ] Proof per point: a headless check, a screenshot, or a command's output. Layout-check 400/1200/1920/3440 for any page change; smoke clean.
- [ ] The cluster's entry in `ai/doc/asks.md` is updated (done / partly / open) with commit links.

Never destructive (move aside, never delete). Sonnet 5.5, medium. Worktree; commit each step; merge. One-sentence chat replies; `STATE.md`; land with `finish-task`.
- Also: give the reviewer, checker and voter roles a `skills:` row in `Servex/agents/roles.js` (skill-reliability open item), and prune merged worktree branches by script (dry run, manifest, branches tagged under `salvage/` before removal).
