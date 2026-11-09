Budget: $3

# Audit the newest 20 "waiting on you" items (slice 1): propose a verdict for each

Load the `minion` skill first. Change nothing in the repo except the one output file below: no closing, moving, waiting or completing any task. Your verdicts are proposals the owner will read.

**Why:** the owner sees ~85 items "waiting on you" and asked for a calibrated audit, newest first. Design: `public/framework/ai/doc/past-work-audit-design.md` (read its "What each prompt yields" section). How to search past work: `public/framework/ai/indexing-past-work.md` (`git grep`, not rg).

**Input:** `evidence.json` beside this file: 20 items from `list_waiting`, each with its task's log lines (`lines`, `file:line`) and the last commits on its folder. Read the task file lines it points to when you need more (read only that line range).

**For each item, judge against the repo as it is TODAY (not "was it done at the time"):**
- `asked`: what was asked, in the owner's words if you can find them (a `refined`/`sentences`/`from:"owner"` line in the session that filed it, often `public/framework/ai/sessions/2026/11/0{6,7,8}/cloud-voice-app-*/session.jsonl`); else the agent's words, and say so.
- `asked_link`: `path:line` of those words.
- `built`: commits (short hash) and files that answer it, or "nothing".
- `still_true`: is the wait still real today? One sentence with the proof (a file that exists, a commit, a later line that answered it).
- `verdict`: one of `done` (answered or built since; the wait is stale), `stale` (no longer relevant: superseded, its agent gone, the thing it waits on moved), `still waiting` (a real open question for the owner), `duplicate` (the same ask as another item: name its `n`).
- `question`: if still waiting, the ONE line to put back to the owner, plain words, no ids; else "".
- `confidence`: high / medium / low.

Watch for: items whose `id` repeats with the same ask text (list them as duplicates of the first), an agent's whole-session root task shown as "waiting" (is it the agent waiting, or one of its subtasks?), and waits on a merge that has since landed (`git log compliance/dev --oneline | grep`, `node Server/unmerged.mjs`).

**Output:** `results.json` beside this file: a JSON array of 20 objects `{n, id, asked, asked_link, built, still_true, verdict, question, confidence}`. Not .jsonl. Then reply with one line: the tally by verdict.

Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash/checkout/reset in the main tree, or commit anything (the mastermind commits). Keep under ~80k tokens: read lines, not whole files.
