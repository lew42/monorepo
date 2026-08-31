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
the task dir via headless Playwright or `mcp__site__shot`) · what was deliberately left, in
one line each. No narrative, no deliberation — verdicts and links. A task with something to
*show* may add its own `page.js` (`new AITask({ meta: import.meta, extra(){ … } })`) — the
board renders it in place of the generic viewer.

## 3. The landing line — one append to `task.jsonl`

```json
{"assign": {"step": <last>, "landed_at": "<ISO with local offset>", "outcome": "**what landed** — …", "links": [{"url": "/…/", "label": "…"}], "window": {"before": <carried>, "after": <5h fraction now>}, "tokens": <total>, "usage": {"input": …, "cache_write": …, "cache_read": …, "output": …, "calls": …}}}
```

`window.after` from `check-claude-usage`; `tokens`/`usage` summed from
`~/.claude/projects/<cwd-slug>/<session_id>.jsonl` (assistant lines' `message.usage`,
deduped by `message.id`). A subagent cannot sum its own tokens (its turns are not in that
file) — write `"tokens": null` and let the parent log the cost from its notification. `landed_at` and `outcome` go **inside** `assign`. Never write a
`.jsonl` with `Out-File`/`Set-Content` (BOM) — bash `printf`, `Add-Content`, or the Write tool.
⚠ **The outcome is full of backticks, and a DOUBLE-QUOTED shell string eats every one as a
command substitution** — the append succeeds, the JSON parses, and the card renders with the
code words missing; nothing complains. Bit three times in three days (`node -e` twice,
`python -c` once). Write the landing line to a scratchpad file with the **Write tool** and
append the FILE's bytes (`[IO.File]::ReadAllText` → `AppendAllText`, or run the file); then
re-parse every line of the jsonl before walking away.

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
