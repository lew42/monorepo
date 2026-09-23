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

**Append the landing line with the helper.** Write it to `<scratchpad>/landing-<your-slug>.json`
with the **Write tool** (the scratchpad is shared by every agent in the session — a generic name
was overwritten by a sibling mid-run, 2026-09-04) and run `node .claude/hooks/append.mjs
<task.jsonl> <that file>`. It stamps every `"NOW"` from the real clock, so `landed_at` cannot
drift, and it re-parses every line of the file afterwards. Inside the JSON a blank line in
`outcome` is a SINGLE `\n\n`; the doubled `\\n\\n` that looks right by eye stays four literal
characters, so print the parsed string back out and read it.

⚠ **The backtick hazard is not only a jsonl one.** Any text you append from the SHELL that
contains a backtick loses every backticked word silently — a double-quoted shell string eats each
one as a command substitution, the append succeeds and nothing complains (a 74-line
`doc/decisions.md` addition landed with every code word blank, 2026-09-19). Write it to a file
with the Write tool and append that file's bytes, whatever the extension.

`window.after` from `check-claude-usage`; `tokens`/`usage` summed from
`~/.claude/projects/<cwd-slug>/<session_id>.jsonl` (assistant lines' `message.usage`, deduped by
`message.id`). A subagent cannot sum its own tokens (its turns are not in that file) — write
`"tokens": null` and let the parent log the cost. `landed_at` and `outcome` go **inside** `assign`.

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
