# Task audit (pilot): grade 5 finished tasks — requirements

The owner's words are verbatim in [owner-words.md](../owner-words.md) (one level up, shared by every auditor this round). Re-read before you score anything.

You are one of 4 auditors grading the SAME 5 tasks (3 cheap models + 1 Sonnet reference). You never talk to the others. A node script (`Server/audit.mjs`) folds everyone's lines into one consensus afterward — that is not your job.

## The scale — read this before scoring anything

Every score is a **whole number from -3 to +3**. Never a decimal.

**0 means "what you'd expect"** — the ask was met, nothing more, nothing less. ±1 is normal variation. ±2 is a strong outlier — say why in `notes`. ±3 is extreme and rare: -3 means nothing usable was delivered; +3 means far beyond the ask, and you verified it.

- **`complete`** — did it do what was asked, fully? 0 = met the ask. -1 = one small gap or thin spot. -2 = a real chunk of the ask was not delivered. -3 = nothing usable landed. +1/+2/+3 = delivered meaningfully more than asked, and you checked that the extra actually works.
- **`obedience`** — did it follow the PROMPT's own rules (budget, file fence, "ask before", "never" lines), or ignore parts of it? 0 = followed it. -1 = ignored one small instruction. -2 = ignored a real rule (budget, fence, a "never"). -3 = ignored the prompt almost entirely, or did the thing it was told not to. +1/+2/+3 = unusually careful — logged every decision, caught an ambiguity, asked nothing it shouldn't have.
- **`utility`** — how useful is what landed, for what was spent? 0 = normal value for the cost. -1/-2/-3 = unusually poor value (expensive for what it did, or nobody will use it — say why). +1/+2/+3 = unusually good value.

Other fields, same line, same rigor:
- **`review_done`** (bool) — is there a review report for this task (a `review.md`/`review.jsonl`/`review` folder, or a `{"review":{...}}` line in its `task.jsonl`)?
- **`review_accurate`** — `"n/a"` if no review was done. Else: `"yes"` (the review's verdict matches what you find), `"missed-failures"` (the review said it was fine but you find a real problem it should have caught), or `"wrong"` (the review flagged something that is not actually a problem).
- **`best`** — up to 3 short phrases: what this task did well.
- **`worst`** — up to 3 short phrases: what's wrong or missing.
- **`name_ok`** / **`icon_ok`** (bool) — does the task have a clear, correctly-named directory/title, and (if it has a dashboard card) a sensible icon? If a task has no card/icon, mark `icon_ok: true` and say "no card" in `notes`.
- **`missing`** — an array of SPECIFIC items from `requirements.md`'s own numbered asks that were not delivered. Quote or closely paraphrase the ask. Empty array if nothing is missing.
- **`evidence`** — the exact paths or URLs you actually opened or checked. Not a guess — only what you really looked at.
- **`depends_on`** — other task slugs this one depends on or blocks, only if the task's own files name one.
- **`notes`** — ONE line. No essay.

## What you read, per task — nothing else

For EACH of the 5 tasks below:
1. `requirements.md` and `owner-words.md` in its directory.
2. `task.jsonl` — read it for the **outcome and landed lines** (near the end: `log`/`assign` lines mentioning "landed", "merged", a commit hash, or a final cost). You do not need every line.
3. Any review report (`review.md`, `review.jsonl`, or a `review` folder) if the task has one.
4. Run `git show --stat <hash>` for up to 2 commit hashes the task's own log names (near its "landed"/"merged" line), to see which files it actually touched.
5. Pick ONE or two URLs the task claims work (from `requirements.md` or a `log`/`assign.links` line) and check them with `curl -s -o /dev/null -w "%{http_code}\n" <url>` — a 200 is good, anything else is a finding.

**Never open an image.** Not a `.png`, not a screenshot path, not anything binary. If you try and it fails, stop trying — note it in `notes` and move on with text evidence only.

## The 5 tasks

1. `public/framework/ai/2026-09-30/ai2-inbox-read` — a KNOWN failure (the owner reported an `rm -rf` incident on this one). Score it honestly from what you find; don't assume the verdict, prove it.
2. `public/framework/ai/2026-10-01/line-filter`
3. `public/framework/ai/2026-10-01/local-ai`
4. `public/framework/ai/2026-10-01/inspect`
5. `public/framework/ai/2026-10-01/token-efficiency`

## Writing your answer — the ONLY way to write it

For each task, write ONE line to **that task's own `audit.jsonl`**, through the append tool — never any other way, never any other file:

```
node .claude/hooks/append.mjs <task-dir>/audit.jsonl <a lines.json file you write with the Write tool>
```

The line is `{"audit": {"at":"NOW", "by":"<your agent id>", "model":"openai/gpt-6-luna", "cost_usd": <your own running cost so far, from your own turn if you can see it, else your best estimate>, "complete": <int>, "obedience": <int>, "utility": <int>, "review_done": <bool>, "review_accurate": "<n/a|yes|missed-failures|wrong>", "best": ["…"], "worst": ["…"], "name_ok": <bool>, "icon_ok": <bool>, "missing": ["…"], "evidence": ["…"], "depends_on": [], "notes": "<one line>"}}`.

Write the `lines.json` file with the **Write tool** (never a heredoc or a shell string — it corrupts quotes). One line.json, one task at a time; run `append.mjs` 5 times, once per task.

## Rules

- **You may ONLY write `audit.jsonl` files, through `append.mjs`, in the 5 task directories above.** Never touch any other file anywhere in the repo — not `requirements.md`, not `task.jsonl`, not a card, nothing.
- Also write your own one-line progress to **your own** `task.jsonl` (already open for you) as you finish each task: `{"log":{"at":"NOW","msg":"audited <slug>: complete X, obedience Y, utility Z"}}`.
- When all 5 are done, write one line to your own `task.jsonl`: `{"assign":{"step":6,"now":"done — 5 audits written"}}`, then stop. Don't wait for anyone.
- Budget for your whole turn: under $1. If you are a cheap model and hit trouble reading or appending, say so in `notes` and move on — don't loop.
