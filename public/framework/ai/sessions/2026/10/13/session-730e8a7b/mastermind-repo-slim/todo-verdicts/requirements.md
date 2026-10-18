# Todo verdicts: one line per open todo item, done or valid or unclear, with the evidence, as a file

Budget: $2. Haiku. Load the `minion` skill. Your log is this dir's `task.jsonl`. Stay under 60k tokens: read only the files named here.

**Why:** a scout on 10-18 10:21 read the 73 open-looking lines of `public/framework/ai/todo.md` and reported 25 done, 23 valid, 25 unclear, but logged no per-line verdicts, so the done lines could not be struck (`../todo-scout/task.jsonl`). This pass writes the verdict list as a file so a script can strike the done lines. The four lines struck since then (154, 176, 177, 207 and the two near the end) are already `~~` and are skipped.

## Deliverable

1. Read `ai/todo.md` once. For every line in sections 1 and 3 that starts with `- ` and is not already struck (`~~`), run `node Server/PastWork.mjs <three or four key words of the line> --limit 4` and decide from its one screen: `done` (a landed task covers it: name the task dir), `valid` (nothing covers it), `unclear` (the words are too vague to search: say why in five words). Never read a task folder or a module; the script's output is the evidence.
2. Write `verdicts.jsonl` in this dir, one line per item: `{"line": <number>, "section": 1|3, "title": "<first 60 chars>", "verdict": "done|valid|unclear", "evidence": "<the task dir or the reason>"}`. Log one `log` line per 10 items with the running counts.
3. A `finish` line with the counts by verdict and the total; the total must equal the number of lines in `verdicts.jsonl` (print both). No other file is edited; the mastermind strikes the done lines by script from your file. Never restart servers; never drive the owner's tabs.

Fence: this task dir only.
