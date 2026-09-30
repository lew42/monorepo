---
name: finish-task
description: Run every time a task lands — the closing report the /framework/ai/ board renders: a landing line whose `outcome` is the report (a headline, then links to everything produced, a picture when there is one, what was left), the deliverables linked from where a reader already is, and the day log closed. Simple, clear, visual — a screen, not an essay. Trigger skill; the Stop hook will nag until it runs.
---

# Finish a task

**The build order (the owner, 2026-09-29).** Landing comes after all five steps: (1) build in the worktree; (2) update the docs, the readme and what it links to, so they are true now, pointing to a log for ongoing detail and never holding log data; (3) spawn a FRESH mastermind that reads only those docs, as a smoke test: `spawn_agent` role `reviewer`, Sonnet, prompt "You are a mastermind working in <dir>. Load its readme chain with `load_module` and nothing else. Does it make sense? Is anything unclear or missing? Write <taskdir>/docs-check.md, then stop." Fix what it finds; (4) THEN the fresh-eyes review (`review.mjs`), which now reads current docs; (5) then merge. The reason: every later mastermind starts from a blank slate and learns the directory only from its readme.

Run `documentation` first if the task touched a module. Then run `node Server/review.mjs <taskdir> <worktree>` (sizes none/light/full, see `Server/doc/review.md`), answer every finding, and put `node Server/review.mjs --status <taskdir>`'s phrase ("reviewed: pass" / "reviewed: 2 fixed, 1 declined") and a link to `review.md` in the outcome. Then, in order:

**Before you write anything the owner reads, load the `page` skill (for a page, card or view; it brings in `content`) or the `content` skill (for words alone), and follow it.** Show it first (a folder tree or `ext/files`, the live objects, a checklist, a screenshot), then use as few words as it takes. A card also follows [the card standard](/framework/ai2/doc/card-standard.md). At landing, `text-check` flags any paragraph over 60 words, an outcome over 120 words, and any file of words with no picture.

**A change the owner can see lands with a walkthrough** (the owner, 2026-09-25: "demos so simple
and self-evident that I literally just click Next"). It's a Next / Next page, one small screen per
step: what it is, what was done, and how to use it. Each step shows the real thing (the live element
or a screenshot) with a one-line caption. Link it first in the outcome. A backend-only change can
skip it.

**Before you land a change anyone can see, look at the whole page at 1920, reached the way the owner reaches it (from the rail, not a direct crop).** Answer from the picture alone: what is its status, what was asked, what was delivered? A screenshot you took but didn't judge proves nothing.

**The outcome is a checklist of the owner's asks, each with its proof.** One line per ask, in the owner's own words, ticked only when the proof sits beside it **At most 120 words, no paragraph over 60**: the rest goes one click down, in a linked file. After writing the landing line, run `node Server/text-check.mjs <task dir>`; if it flags the outcome, append a shorter landing line (the latest one wins). Every landing on 09-29 failed this check, because this skill never said the number.

```
- [x] newest card on top: shot rail-1920.png, the new card at row 1
- [ ] segmented progress bar: bars are still one solid line
```

An ask you built but didn't prove stays unticked. A smaller version of what was named is a miss. (The feedback council, 2026-09-25, found 24 of 44 asks only "partly" done, most of them never proven: "confirm it's newest-first", "click and confirm it's top-aligned".)

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

**First, run `git status --short` and look for every file this task touched.** If any is still uncommitted, commit it (by exact path) before you land, or the next merge sweeps it into someone else's commit (2026-09-29).

```json
{"assign": {"step": <last>, "landed_at": "<ISO with local offset>", "outcome": "**what landed** — …", "links": [{"url": "/…/", "label": "…"}], "window": {"before": <carried>, "after": <5h fraction now>}, "tokens": <total>, "usage": {"input": …, "cache_write": …, "cache_read": …, "output": …, "calls": …}}}
```

**Give the task a plain `title`** in the same landing line (`"title": "Live card: replying hid the usage bars"`): the part it is about, then what changed, in a few words. AI 2 lists a task by it; without one it shows the request cut short, and "When I respond on that page" means nothing to the owner (2026-09-25).

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

`window.after` from `check-claude-usage`. Token cost is written by Servex; write `"tokens": null` if you cannot sum it. `landed_at` and `outcome` go **inside** `assign`.

## 4. Close the day

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "landed — <one line>"}}
```
appended to `public/framework/ai/<date>/day.jsonl`.

## What the hooks already do

`layout-check` runs by itself on landing (the ledger hook spawns `Server/on-landing.mjs`) and logs a line to your task — a flagged landing is a thing to fix, not to ignore.

`.claude/hooks/ledger.mjs` logs the first edit of each file (`action`), every skill call
(`log: skill: …`), session resume/end, and **blocks a stop** while `step < steps.length`
with no `landed_at` — this skill is how you satisfy it honestly. Format:
`ext/JSONL/readme.md`; the board: `ext/AITask/readme.md`.

Improve this skill: append to [`improvements.md`](improvements.md).
