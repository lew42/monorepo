# overview.json — how it is built

`Server/ai2-overview.mjs` reads every task's `task.jsonl` (~800) plus the owner's own prompts in
`.claude/prompts/*.jsonl`, and writes `public/framework/ai2/overview/overview.json`. The Overview
tab's page reads that file straight off disk; it does no computing of its own.

**How a task joins a concept:** the seven concepts (Servex, Page, View, App, AI 2, Dictation,
Research & Collab), most important first, each list match words at the top of the script. A task
joins the FIRST concept whose word matches its slug or group as a whole word; only if neither
names one does its request text get tried too (request text is the noisiest of the three). No
match at all leaves the task out, counted in `unfiled`.

**Open vs. done:** unlanded and requested in the last 7 days = open; older unlanded = dropped,
counted in `stale_count`. Landed = done; newest 30 kept, `done_count` is the true total.

**To rerun it:** `node Server/ai2-overview.mjs` from the repo root, under a second.

**To change a concept:** edit `CONCEPTS` at the top of the script.
