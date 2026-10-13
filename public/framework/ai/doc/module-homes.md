# Module homes: which modules belong in `ai/`, and what moves next

**The rule.** A module that exists only to run, show or feed an AI agent or model lives in `framework/ai/`. A module that AI uses but any page could use too stays next door, in `ext/`, `ux/` or `core/`. The rule is stated once, at the top of [ai/readme.md](../readme.md) and [ext/readme.md](../../ext/readme.md).

**Moved (2026-10-13):** [AITask](/framework/ai/AITask/) went from `ext/AITask` to `ai/AITask`. A script did it (`Server/ModuleMove.mjs`): 223 files relinked, 399 paths, manifest [move-ext-AITask.json](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/move-ext-AITask.json). The old address [/framework/ext/AITask/](/framework/ext/AITask/) is a one-line pointer page. Dated records keep the old name in their prose; only their import paths changed, so old pages still load.

## The census

Computed by `node Server/ModuleHomes.mjs --judgments <file> --out <dir>` (read-only). 125 modules, 18 record/data dirs. Strictly AI: 15 · uses AI: 6 · not AI: 4 · unjudged: 100. The AI column is a judgment, written in [judgments.json](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/judgments.json); everything else is counted. Every module: [module-homes.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/module-homes.md).

| module | AI? | importers | mentions | size | scope line | readme says |
|---|---|---|---|---|---|---|
| `ext/Ask` | strict | 40 | 186 | 199 KB | no | Ask — talk to a Claude Code session from the browser; for pages and tools on the dev server (localhost only) |
| `ext/Chat` | uses | 11 | 152 | 942 KB | no | Chat — a scrolling chat log, composer, and conversation widget |
| `ext/Collab` | strict | 0 | 31 | 56 KB | no | Collab — a mastermind's members through phases to a vote, live, as one object |
| `ext/DesignTool` | uses | 6 | 218 | 3.5 MB | no | DesignTool — measures a layout numerically: what is BROKEN, what is OFF, what is GOOD. For pages, the layout generator, and the site audit — |
| `ext/ErrorLog` | uses | 1 | 8 | 7 KB | no | ErrorLog — a UI error becomes one log line a session can follow |
| `ext/Refine` | strict | 23 | 161 | 238 KB | no | Refine — speak one prompt and watch it refine (raw → clean → cards, with flags); plus a saved run shown as a ladder |
| `ext/Research` | strict | 14 | 89 | 109 KB | no | Research — a question dug by several minions into append-only files, rendered live: conclusions first, every claim a card that opens forever |
| `ext/Session` | strict | 5 | 71 | 50 KB | no | Session — one ✦ press is one voice session, answered by a fast and a smart assistant |
| `ext/Shots` | uses | 2 | 20 | 88 KB | no | Shots — the screenshot system: shoot, diff, judge |
| `ux/Card` | strict | 0 | 33 | 65 KB | no | Card — the look of an AI card's own page: a head, an outline, a properties sidebar |
| `ux/Dictate` | strict | 30 | 396 | 3.4 MB | no | Dictate — a mic button that always shows what is happening |
| `ux/Rename` | uses | 1 | 16 | 16 KB | no | Rename — tap a title, Rename it, pick from a dropdown of 5 |
| `ux/Revise` | strict | 0 | 18 | 19 KB | no | Revise — text in, revised text out, at a level |
| `ux/Understand` | strict | 1 | 15 | 18 KB | no | Understand — a ✓ or ? after every sentence, a clarifying question right in the flow |
| `ai/AISession` | strict | 21 | 96 | 242 KB | no |  |
| `ai/AITask` | strict | 52 | 148 | 806 KB | no | AITask — the AI working log, rendered: one task's page, a day's dashboard, the highlights wall the front opens with, and the board over ever |
| `ai/cards` | strict | 18 | 85 | 138 KB | no | ai/cards: one card and what it shows |
| `ai/rail` | strict | 9 | 57 | 315 KB | no | ai/rail: the list on the left, and the data behind it |
| `ai/sessions` | strict | 3 | 777 | 109.6 MB | no | Sessions — a data grid of every Claude session, newest activity first |
| `ai/talk` | strict | 0 | 33 | 26 KB | no | Talk — press the mic, talk, see your words |
| `core/Session` | uses | 1 | 11 | 6 KB | no | core/Session |

## Proposed next, in order

1. **The voice group:** `ux/Dictate`, `ext/Session`, `ux/Revise`, `ux/Understand` move together, so voice stays one system. Dictate is the big one (30 importers, about 400 mentions, the phone page). Its last owner would keep the mic in `ux/`, because `Mic.js` is shared with Chat and Refine; so the move may split the mic out first.
2. **`ext/Ask`, `ext/Refine`, `ext/Research`:** strictly AI; 14 to 40 importers each. Same script.
3. **`ext/Collab`:** strictly AI, but `ai/collab` (its data) already exists, and Windows treats `Collab` and `collab` as the same folder. It needs a new name before it can move.
4. **`ux/Card`:** the look of an AI card. Fold it into [ai/cards](/framework/ai/cards/) so cards have one home.

Each move is: `node Server/ModuleMove.mjs <from> <to>` (a dry run), then `--apply --manifest <file>` in a worktree, then the pages that import it checked, then `merge.mjs`. `--undo <manifest>` reverses it.

## The two session-page module sets

[ai/AISession](/framework/ai/AISession/) is the live set: the Sessions tab's `ai/sessions/page.js` imports `../AISession/AISessionsPage.js`. The eight `ai/sessions/Session*.js` files are re-export shims left by the 2026-10-09 rename (`ai/AISession/rename-manifest.json`), and their own header says to remove them one release later. **Proposal:** point their importers at `ai/AISession` (`ai/classes/Session/SessionClassPage.js`; a path string in `ai/SystemClasses.js`; one sentence in `ext/DataGrid/page.js`), then move the shims aside. Nothing of them moved today.

## Watch out

- `ai/AITask/tree.test.mjs` fails at its last step, before and after the move, because it scans the retired day folder `ai/2026-09-29/`.
- `ai/talk` (a mic and a card) overlaps `ux/Dictate`. Settle that when the voice group moves.
