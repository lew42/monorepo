# Check 2 asks against the repo: ai/cards

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/36-ai-cards/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ai/cards`, folder `public/framework/ai/cards` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ai/readme.md`, `public/framework/ai/cards/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ai/cards/readme.md`)

# ai/cards: one card and what it shows

Moved here from `ai2/` on 2026-10-09 (the old paths are one-line shims). A card is a task or conversation; this folder draws it, small in the rail and whole on its page.

- `card.js`: `Card`, the card page and its tabs (the biggest file; start here).
- `CardChat.js`, `Compose.js`: the conversation and the box you talk into.
- `Outline.js`, `Activity.js`, `Tasks.js`, `Agents.js`, `workspace.js`, `real.js`: what a card shows (outline, news, tasks, agents, files, real pages).
- `faces.js`, `Meter.js`, `floating.js`: small shared parts (clocks, flags, progress bars, the floating panel).
- `Fold.js`, `Rules.js`: turn a card's `page.jsonl` lines into its current state; read/resolved rules.
- `CardDir.js`: where a card's folder is. The id `2026/10/13/<card>` and the page `/framework/ai/2026/10/13/<card>/` never change; the folder is `ai/sessions/2026/10/13/cards/<card>/` (one tree, [doc/task-folders.md](../doc/task-folders.md#2026-10-13-one-tree-applied)). Servex, the dev server and the browser all ask it.

The list that holds these cards is in [rail/](../rail/readme.md). Why it moved: [doc/ai2/ai2-vs-ai.md](../doc/ai2/ai2-vs-ai.md).

Comments pruned from `card.js`, verbatim: [doc/notes.md](./doc/notes.md).

- Notes: [doc/card-notes.md](doc/card-notes.md) — history and lessons moved out of the code comments.


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/36-ai-cards/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 2 asks

1. `6bd51d1f55` (3 days old): Explain prompt-refinement cards using terms and references the owner already knows, such as Harvest 4 and Dictation 8.
2. `a2963bb311` (3 days old): Make prompt-refinement cards familiar and visible so the owner can see what is going on.
