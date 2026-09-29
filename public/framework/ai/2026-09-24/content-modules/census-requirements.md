# Census — every card, box and widget kind (scout brief)

You are a minion of `task-mastermind-content-modules`. Load the `minion` skill first. Read
[requirements.md](requirements.md) beside this file — the owner's words are the acceptance test.
Do NOT run new-task (no task.jsonl of your own); you only read the repo and write ONE json file.

Repo: `C:\Code\lew42\worktrees\page-cards` (dev server `http://localhost:4817`). Read-only for you,
except your one output file.

## Your part

Your part is named in your prompt (A, B or C):

- **A — the component tiers:** `public/framework/ui/**` (every component dir), `public/framework/ux/**`,
  and the card/box words in `public/framework/framework.css` (`.card`, `.surface`, `.pad`, `.wash`, `.bleed` …).
- **B — the style and demo libraries:** `public/framework/styles/**`, `public/framework/ext/demo/**`
  (the five demo blocks), `public/framework/core/Page` preview cards (`preview()`, `page-previews`),
  and hand-rolled card/tile classes elsewhere: `grep -rhoE "\.[a-z0-9-]*(card|tile|box|panel)[a-z0-9-]*" public --include=*.css | sort | uniq -c | sort -rn`
  — report the top 40 by count as kinds (group obvious variants).
- **C — the AI and doc blocks:** `public/framework/ai/v/**`, `public/framework/ai2/**`,
  `public/framework/ext/AITask/**` (every task.jsonl verb's renderer: log, decision, ask, verdict, shot, agent…),
  `public/framework/ext/Panel/**`, `public/framework/ext/Doc/**` (its blocks: exhibit, callouts, tabs…).

## What a "kind" is

Any box a page is built from, with or without background and padding: a card, a tile, a callout,
a row, a chip, a panel, a widget (a control with state). Name each kind ONCE in plain words
("preview card", "decision card", "callout").

## Output — one JSON file, nothing else

Write `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\content-modules\census\<part>.json`
(`a.json`, `b.json` or `c.json`), an array of:

```json
{
  "name": "preview card",
  "what": "One sentence a new coder understands: what it is for.",
  "source": "public/framework/core/Page/Page.js:412",
  "classes": [".page-preview"],
  "render": "import { Page } from '/app.js'; ... one self-contained snippet that draws ONE live example inside the current View context, using only real exported functions (verify each import path exists)",
  "used_in": ["/framework/ux/", "/framework/ui/"],
  "used_count": 12,
  "padding": "--pad-card (framework .card)" ,
  "bleeds": "no | yes: how (negative margin, .bleed, full-width band)",
  "interactive": false,
  "duplicates": ["names of other kinds that do the same job"],
  "notes": "a trap or inconsistency you saw, or empty"
}
```

Rules: every `source` and `used_in` must be something you actually opened or grepped — no guesses.
`render` may be `null` when a kind cannot be drawn standalone; say why in `notes`. `duplicates`
is the point of the census: mark every pair that does the same job under two names, and every
kind whose spacing differs from its twin. Aim for completeness in your part (typically 15–40 kinds).
Validate your file parses (`node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" <file>`).
Finish by replying with one line: the file path and the count.
