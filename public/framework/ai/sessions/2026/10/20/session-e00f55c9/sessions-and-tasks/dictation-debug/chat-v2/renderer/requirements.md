# Chat v2, step 1: the read-only renderer

Budget: $8. Load the `minion` skill first, then `page`, `layout` and `ui`. Your parent is `mastermind-chat-v2`. Card directory with the owner's raw words: `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

## What the owner wants (read these, they are the acceptance test)

- The Decision section at the end of [../../chat-shape.md](../../chat-shape.md), including "Two more", and "One rule from the misorder bug".
- The parent brief: [../requirements.md](../requirements.md).

In one line: a session's conversation is its `tasks` list in `session.jsonl`. Each Prompt draws at the root of the chat (no left/right bubbles, not in a card), showing the smart assistant's refined version; its replies, questions and child tasks nest under it, marked with the brain icon 🧠. Raw Whisper text and cleaned paragraphs are one click down ("show raw"), never dropped.

## Where you work

Worktree `C:\Code\lew42\worktrees\chat-v2` (branch `worktree/chat-v2`, served at `http://localhost:61527/`). Commit there after every working piece. Never edit the main tree.

**Your fence (only these):** `public/framework/ext/Chat/v2/` (new folder, all files in it), and one line in `public/framework/ext/Chat/readme.md` linking it. Nothing else; the old chat (`ext/Chat/Chat.js`, `ux/Dictate/*`) stays exactly as it is.

## The data (fields agreed with mastermind-prompt-task; render from the plain fields, never write a Prompt class)

```js
{type:"Prompt", id:"p-<ms>", title, text,              // the smart assistant's refined version (main view); may be absent early
 raw:["whisper text", …],                               // one per utterance, "show raw"
 paragraphs:[{id:"a", text}],                          // the fast assistant's cleaned text, "show raw"
 replies:[{id:"r-<ms>", text, by, ts, anchor?:{sentence:"a1", words?:[start,end]}}],   // words: end exclusive
 tasks:[ …child Task / Question entries… ]}
{type:"Question", id:"q-<ms>", text, from:"p-<ms>", answer?:{text, by, ts}}   // phase: open (no answer) → answered (answer, not complete) → complete
```

**Sentences are computed, not stored:** the id is the paragraph id plus a 1-based index (`a1`, `a2`, `b1`), split from each paragraph's text; earlier ids stay stable when text is appended. The real classes (`core/Task/Prompt.js`, `core/Task/Question.js`, landing within about an hour from mastermind-prompt-task) will give `prompt.sentences = [{id, n, para, text}]` and `question.phase`; until they land, compute both yourself in one small helper each, written so swapping to the class getter is a one-line change.

A prompt's children are its own `tasks` **plus** any root-level Question/Task whose `from` equals its id; draw both under it. A reply with an anchor draws beside the sentence it names (highlight the words if `words` is given); with no title/text yet, the prompt shows its paragraphs. Fields may still change slightly; keep the field reads in one place (one small method per field) so a rename is one edit.

## Build

1. **`ChatV2.js`**: `class ChatV2 extends JSONL` (`/framework/ext/JSONL/JSONL.js`), modelled on `core/Session/SessionTasks.js` (read it: `read(entries)` collects lines, `draw()` replays them with `Session.replay(lines)` and reads `s._tasks`; `live()` streams appends). Draw `_tasks` in **list order, never sorted** by a stamp or id. One class per file; small parts (a prompt block, a reply, a child card) may be static subclasses (`this.constructor.Prompt`) in the same folder. A child Task/Question card can reuse `core/Task/TaskView.js`'s row if it fits; say which you chose.
2. **`ChatV2.css`**: every rule inside `@layer` (restate `@layer base, theme, site, util;`). Prefix classes `chat-v2-`. Readable at 390 (phone) and 1920; the chat column has a sensible max width, not full-bleed text at 1920.
3. **`fixture/session.jsonl`**: a fixture session with: a Prompt with refined title/text, raw, two paragraphs with sentence ids, a reply anchored to one sentence with a word range, a plain reply, a child Question answered and one open, a child Task done and one open; a second Prompt with only paragraphs (no refined text yet); a root Question with `from`. Write it as real replayable lines (look at a real `session.jsonl` under `public/framework/ai/sessions/2026/10/25/` and at how `tasks.add` lines look in `core/Task/Task.js` / `core/Task/doc/`).
4. **`page.js`**: the demo page at `/framework/ext/Chat/v2/`: draws the fixture by default; `?src=<url of any session.jsonl>` draws that session instead, live. First line on the page says in plain words what it is.
5. **`ChatV2.test.mjs`** or a headless Playwright script in your task dir: load the page headless, assert the prompts appear in file order, the replies sit under their prompt, "show raw" reveals raw text; then **append a line** to a copy of the fixture (served under `v2/fixture/`) and assert it appears without reload (live). Playwright imports use `file:///C:/…` paths. Every spawned process sets `windowsHide: true`.
6. **Shots** at 390 and 1920 (`node Server/layout-check.mjs http://localhost:61527/framework/ext/Chat/v2/ --widths 390,1920` from the main repo root, or your own headless script) saved in your task dir.
7. **`readme.md`** in `ext/Chat/v2/`: what it is, the on-disk shape it reads (above), who writes the data (fast assistant: Prompts via `Servex/agents/Sessions.js` `voice_say`; smart assistant: tasks, questions, replies — both not wired yet), which class reads it. Plus the one link line in `ext/Chat/readme.md`.

## Rules

- `node --check` every JS file before committing. Run `node Server/smoke.mjs C:\Code\lew42\worktrees\chat-v2` (from the main repo root) and get no FAIL.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), never `git stash`.
- Log progress as `log` lines in your own `task.jsonl` (this folder). Don't merge: your parent reviews and merges.

## Deliverable

Committed on `worktree/chat-v2`; your last message is one screen: what is built, the commit, the two shot paths, the test result (pass counts), and anything you decided (with the alternative).
