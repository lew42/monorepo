---
name: finish-task
description: Run every time a task lands — the closing report the /framework/ai/ board renders: a landing line whose `outcome` is the report (a headline, then links to everything produced, a picture when there is one, what was left), the deliverables linked from where a reader already is, and the day log closed. Simple, clear, visual — a screen, not an essay. Trigger skill; the Stop hook will nag until it runs.
---

# Finish a task

Run `documentation` first if the task touched a module. Then, in order:

## 1. Link the deliverables where a reader already is

Nothing crawls: a page exists only once its parent's `children:` names it or the page it
is about links it. `links` in the log is the record, not navigation. If you cannot say
where a page is linked from, link it now.

## 2. The report is the `outcome`

The board card shows its first line; the task page renders the whole thing as markdown.
Keep it to a screen: **what landed** (bold headline) · clickable links to every page, dir
and doc produced · a picture when there is one (`![](shot.png)` — a screenshot saved in
the task dir via headless Playwright or `mcp__site__shot`; ⚠ the jsonl `shot` verb only takes a
file under the OS temp root — `Server/plugins/Screenshots.js` refuses everything else, so a screenshot
that is a SITE ASSET goes in the outcome markdown as a plain url; five `shot` lines pointing into
`public/` drew grey swatches and 403s, 2026-09-17) · what was deliberately left, in
one line each. No narrative, no deliberation — verdicts and links. A task with something to
*show* may add its own `page.js` (`new AITask({ meta: import.meta, extra(){ … } })`) — the
board renders it in place of the generic viewer.

## 3. The landing line — one append to `task.jsonl`

```json
{"assign": {"step": <last>, "landed_at": "<ISO with local offset>", "outcome": "**what landed** — …", "links": [{"url": "/…/", "label": "…"}], "window": {"before": <carried>, "after": <5h fraction now>}, "tokens": <total>, "usage": {"input": …, "cache_write": …, "cache_read": …, "output": …, "calls": …}}}
```

Optional, and only when this landing produced something the owner will go looking for later — a tier, a realm, a system, a class, a standard, a post, a tool, a study with a page — append one more line so it draws a card on the front of `/framework/ai/`: `{"assign": {"highlight": {"icon": "<one of layers explore science article build straighten>", "title": "<five words or fewer>", "line": "<one plain sentence>", "url": "<THE THING, never this task page>"}}}` — what earns one and what the six icons mean: [`ext/AITask/doc/highlights.md`](/framework/ext/AITask/doc/highlights.md).

⚠ **A literal blank line in `outcome` needs a SINGLE backslash (`\n\n`) to become a real newline
once the JSON is parsed — the doubled `\\n\\n` that looks right by eye stays four literal
characters** (`\`,`n`,`\`,`n`) in the parsed string, not a blank line. `bad: 0` on a re-parse
check only proves the JSON is valid, not that the STRING inside it holds what you meant — print
`JSON.parse(line).assign.outcome.slice(...)` back out and read it (2026-09-18).

`window.after` from `check-claude-usage`; `tokens`/`usage` summed from
`~/.claude/projects/<cwd-slug>/<session_id>.jsonl` (assistant lines' `message.usage`,
deduped by `message.id`). A subagent cannot sum its own tokens (its turns are not in that
file) — write `"tokens": null` and let the parent log the cost from its notification. `landed_at` and `outcome` go **inside** `assign`. Re-read the clock immediately before
writing `landed_at` — one composed by hand while drafting the outcome landed 7 minutes in the
future (2026-08-31); the timestamp drifts even in a Write-tool payload. ⚠ Read it in **bash**
(`NOW=$(date -Iseconds)`) and pass it into a script as an argument: inside `node -e` /
`execSync("date -Iseconds")` on Windows, `date` resolves to cmd's `date.exe`, which PROMPTS for a
new date and exits 1 ("The system cannot accept the date entered"), so a script that builds its own
stamp dies mid-append (2026-09-05). Never write a
`.jsonl` with `Out-File`/`Set-Content` (BOM) — bash `printf`, `Add-Content`, or the Write tool.
⚠ **The outcome is full of backticks, and a DOUBLE-QUOTED shell string eats every one as a
command substitution** — the append succeeds, the JSON parses, and the card renders with the
code words missing; nothing complains. Bit three times in three days (`node -e` twice,
`python -c` once). Write the landing line to a scratchpad file NAMED AFTER YOUR SLUG (`landing-<slug>.jsonl` — the scratchpad is shared by every agent in the session, and a sibling overwrote a generic name mid-run, 2026-09-04) with the **Write tool** and
append the FILE's bytes (`[IO.File]::ReadAllText` → `AppendAllText`, or run the file); then
re-parse every line of the jsonl before walking away — do this after EVERY append the task
makes, not only the final landing line: four of twenty-five hand-typed `log` lines once shipped
missing their second closing brace, `git status` showed nothing wrong, and they would have sat
silently dropped by the next reader's parser until someone actually ran `JSON.parse` over every
line (2026-09-18). The same backtick-eats-as-command-substitution hazard is not unique to jsonl
either — it eats a plain **markdown** doc append from the shell exactly as silently (a 74-line
`doc/decisions.md` addition landed with every backticked word replaced by nothing, no error
reported); the rule is general: any text you append from the shell that contains a backtick goes
through a scratchpad file written with the Write tool, whatever the target file's extension
(2026-09-19).

## 4. Close the day

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "landed — <one line>"}}
```
appended to `public/framework/ai/<date>/day.jsonl`.

## What the hooks already do

`.claude/hooks/ledger.mjs` logs the first edit of each file (`action`), every skill call
(`log: skill: …`), session resume/end, and **blocks a stop** while `step < steps.length`
with no `landed_at` — this skill is how you satisfy it honestly. Format:
`ext/JSONL/readme.md`; the board: `ext/AITask/readme.md`.

Improve this skill: append to [`improvements.md`](improvements.md).
