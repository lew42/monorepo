# Todo scout: the five cheapest still-valid items in ai/todo.md, ranked, with evidence

Budget: $2. Haiku. Load the `minion` skill. Your log is this dir's `task.jsonl`. Stay under 60k tokens: read only the files named here.

**Why:** the week is 7 points under pace and nothing is queued. `public/framework/ai/todo.md` (233 lines, 3 sections: "1. Asked for, not finished yet", "2. Only you can do", "3. Proposed by agents, not requested") has 74 lines that look open, some from September, and some are already done by later work. The mastermind needs the five that are cheapest and still valid, to brief Sonnet helpers at $3–6 each.

## Deliverable

1. Read `ai/todo.md` once. For every open-looking line in section 1 (the owner's asks first), then section 3, run `node Server/PastWork.mjs <three or four key words of the line> --limit 4` (a script; it prints landed tasks and docs that match) and decide from its output: **done** (a landed task covers it: name it), **still valid**, or **unclear**. Never read a task folder or a module; the script's one screen is your evidence. Log one `log` line per 10 items with the counts so far.
2. Rank the still-valid ones by cost in your judgment (small = one file and a check; medium = a class or a page; large = a system), and write ONE `log` line `{"log":{"at","msg":"ranked","top":[{line, section, title, cost, why_valid, evidence}]}}` with the five cheapest still-valid items, plus a second line with the count by verdict (done / valid / unclear) that must add up to the lines you read: print both numbers.
3. A `finish` line with the three counts. No file edits anywhere (not even todo.md: the mastermind strikes the done ones from your evidence). Never restart servers; never drive the owner's tabs.

Fence: this task dir only.
