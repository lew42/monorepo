# Minion A — review turns + scoreboard scoring

Load the `minion` skill first. Your brief's directory: `public/framework/ai/2026-09-28/review-turns/`
(read `requirements.md` there — the owner's numbered asks are the acceptance test). You are working
in the shared worktree `C:\Code\lew42\worktrees\review-turns` (already has `worktree/collab-rounds`
merged in, so `public/framework/ext/Collab/Collab.js` and `Server/collab.mjs` exist here — read
`Collab.js` and `Server/doc/collab.md` and `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`
before you start, so your turn log follows the same one-verb-per-line JSONL style theirs does).

**Your files, and only these:** `Server/review.mjs`, `Server/doc/review.md`. Do not touch
`ext/Collab/*` or `Server/merge.mjs` — a sibling minion (B) owns the scoreboard view; merge.mjs's
review gate must keep working unchanged (see below).

## What exists today

`Server/review.mjs` (read it fully first) spawns one fresh reviewer, writes `<taskdir>/review.md`
(verdict + numbered `[fix]`/`[note]` findings) and ONE summary line to `<taskdir>/task.jsonl`:
`{"review":{"at","size","verdict","findings","branch","head","model","cost","file"}}`. The author
then hand-appends `{"review":{"answer":{"n":2,"reply":"fixed"}}}` or `"declined: <why>"` to
`task.jsonl` for each finding — no second round unless the mastermind doubts a decline.
`Server/merge.mjs`'s review gate (`reviewGate()`, ~line 85-129) reads exactly that task.jsonl shape:
a `{"review":…}` line for the branch's head (or an ancestor), with every finding answered. **Keep
writing that exact task.jsonl shape, unchanged** — merge.mjs must keep working with zero edits to it.

## What to add: turns, logged to `<taskdir>/review.jsonl`

Replace the "answer once, done" model with four turns, each its own phase, so nothing is said out
of turn or goes unheard (the owner's words, quoted in requirements.md point 2). Write every turn to
a NEW file, `<taskdir>/review.jsonl` (append-only, one JSON object per line, same discipline as
`collab.jsonl`: `{"phase":{...}}` brackets each phase, small verb lines inside it).

**Phase 1 — findings.** Same reviewer run as today (fresh agent, brief+diff+shots, writes
`review.md`). After parsing it, in ADDITION to the existing task.jsonl line, write to review.jsonl:
```
{"phase":{"at":"…","n":1,"kind":"findings","status":"start"}}
{"finding":{"at":"…","n":1,"kind":"fix","text":"…"}}
...one per finding...
{"phase":{"at":"…","n":1,"kind":"findings","status":"done","verdict":"pass|fix","cost":0.42,"model":"…"}}
```

**Phase 2 — the builder answers.** The author still hand-appends the SAME
`{"review":{"answer":{n,reply}}}` lines to task.jsonl as today (don't change that convention — it's
what merge.mjs already reads). Add a new mode, `node Server/review.mjs --turns <taskdir>`: it reads
every `review.review.answer` entry in task.jsonl newer than the phase-1 findings, and mirrors each
into review.jsonl as it finds them (idempotent — running it twice must not duplicate a turn already
recorded for the same finding number):
```
{"phase":{"at":"…","n":2,"kind":"answers","status":"start"}}
{"answer":{"at":"…","n":1,"reply":"fixed"}}
{"answer":{"at":"…","n":2,"reply":"declined: the extra check duplicates line 40"}}
{"phase":{"at":"…","n":2,"kind":"answers","status":"done"}}
```

**Phase 3 — the reviewer replies to every decline.** Still inside `--turns`: if any answer this run
is `declined: …` and has no reply yet, spawn ONE fresh Servex agent (same three-call pattern as
phase 1 — `spawn_agent`/`wait_for_agent`/`stop_agent`, `windowsHide: true`, model Sonnet, given only
the original finding text and the decline's reason, never the rest of the conversation) that writes
`<taskdir>/review/reply.md`: one line per decline, `"N. [accept] …"` (the decline is reasonable) or
`"N. [hold] …"` (not convinced — still thinks it needs fixing). Parse it (mirror `parseReview`'s
regex style) and append:
```
{"phase":{"at":"…","n":3,"kind":"replies","status":"start"}}
{"reply":{"at":"…","n":2,"stance":"hold","text":"…","cost":0.08}}
{"phase":{"at":"…","n":3,"kind":"replies","status":"done"}}
```
Skip phase 3 entirely (no agent spawned) if nothing was declined this run.

**Phase 4 — the mastermind rules on anything still held.** A new CLI mode,
`node Server/review.mjs --rule <taskdir> <n> <fix|stands> "<why>"`, appends one line (no agent
spawned — the task mastermind runs this by hand after reading the hold):
```
{"phase":{"at":"…","n":4,"kind":"rulings","status":"start"}}
{"ruling":{"at":"…","n":2,"decision":"fix","why":"…","by":"mastermind"}}
{"phase":{"at":"…","n":4,"kind":"rulings","status":"done"}}
```
**Stop after one round of holds** — `--rule` refuses (prints an error, exits 1) if phase 3 hasn't
run yet or if `n` was never a `hold`. There is no phase 5.

## Scoreboard scoring (still your file — review.mjs)

New mode, `node Server/review.mjs --score <taskdir>`: once a review run is settled (every finding
answered, and every hold ruled on), append ONE line to the shared
`public/framework/ai/collab/scoreboard.jsonl` (create it if missing — it may already exist from
collab-rounds; append, never rewrite):
```json
{"score":{"at":"…","kind":"review","collab":"2026-09-28/review-turns","decision":"review-<taskdir slug>","member":"<reviewer model>","model":"<reviewer model>","size":"light","cost":0.42,"findings":3,"fixed":2,"changed_outcome":true}}
```
- `collab`: the REVIEWED task's own directory relative to `ai/` (e.g. `"2026-09-28/fresh-eyes-review"`), not review-turns' own dir.
- `decision`: a stable id unique per review run so re-running `--score` on the same run doesn't
  duplicate — `"review-" + (a short slug of the reviewed task's dir)`.
- `changed_outcome`: true if any finding's answer was `fixed` (a real code change landed because of
  this review), false if every finding was `declined` or there were no `[fix]` findings.
- This is a DIFFERENT shape than `Collab.Scoreboard`'s decision-vote rows (no `votes`/`won` — the
  brief calls this "its own format," reusing only the shared file and the `{"score":{…}}` verb so
  `Collab.Scoreboard`'s JSONL reader doesn't choke on it — it will, harmlessly: `apply()` keys rows
  by `collab+decision+member`, which still works for these).
- Also add `node Server/review.mjs --backfill`: scans every `public/framework/ai/*/*/review.md` for
  ones with no matching `score` row yet (by `collab`+`decision`), reconstructs size/cost/findings/
  fixed/changed_outcome from that task's `review.md` + `task.jsonl`, and appends a score line for
  each. Never throws on a task missing task.jsonl or with unparseable review.md — skip it, print why.

## Docs — `Server/doc/review.md`

Put the turns picture FIRST (a small table or list: finding → answer → reply → ruling, one row
each, who writes it, which file). Keep the existing size table but move it below the turns picture.
Update "Answering a finding" and "The merge gate" sections only if a sentence is now wrong — most of
Server/merge.mjs's behavior is unchanged. Add one short section: "Is a review useful?" — the score
line's shape and where it's read (the Collab scoreboard page — sibling minion B is adding a Reviews
view there; you can say "a small Reviews section on the Collab scoreboard page" without knowing its
exact wording).

## Proof you owe

Don't just write the code — RUN it, once, on a real small change so all four turns are real:
1. Make a trivial real diff somewhere harmless (or reuse review-turns' own work-in-progress diff)
   and run `node Server/review.mjs <some taskdir> <worktree>` for a real `light` review.
2. Answer at least one finding `declined: <why>` in task.jsonl, run `--turns` — phase 3 must
   actually spawn a reviewer and produce a `[hold]`. If the reviewer accepts everything, tweak the
   decline's wording (or the finding) so at least one comes back `[hold]` — the proof needs a real
   held decline.
3. Run `--rule <taskdir> <n> fix "<why>"` (or `stands`) yourself as the ruling.
4. Run `--score <taskdir>` and show the appended line.
Leave `<taskdir>/review.jsonl` and the scoreboard line in place — the task mastermind needs them
for the landing proof. Every Node spawn: `windowsHide: true`, never throws (Servex failures become
findings/log lines, not crashes — match review.mjs's existing style).

Log your steps and any decision in `public/framework/ai/2026-09-28/review-turns/task.jsonl`
(`node .claude/hooks/append.mjs`) as you go, not just at the end. Report back to the task mastermind
when you're done — don't merge, don't touch files outside your two.
