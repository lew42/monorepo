# Plan: question cards (ask 7)

## What exists today
- **In place, answer on card (items 1+2): already built.** `Question extends Task` (`core/Task/Question.js`) nests under its
  Prompt's own task (`from`); `ChatV3.question(q)` (`ext/Chat/v3/ChatV3.js:267-276`) draws it inside the Prompt's card with a
  "?" icon and, once `q.answer` exists, the answer text right on the same card. Punctuation is the smart seat's job
  (`single-voice-assistant.md`, "fix punctuation"), not the view's — nothing to change here.
- **Resurface on answer (item 3): not built.** An older brief (`task-mastermind-2/resurface-answer-brief.md`) asked V1/V2 to
  *move* the whole card to the end on answer. The owner's newer, more specific words (`ux/Dictate/doc/principles.md:88-91`)
  are different: never move the original; add a small *reference* near the end with a back-arrow overlay on its icon.
- **Dedupe repeats (item 4): not enforced.** `session-smart.md:73` only tells the smart seat to check by hand before adding a
  second Question for the same thing. The item tool's own duplicate guard (`page_tools.js:1339`, "the same title twice is
  the same ask") only compares `title`, and only on a root-level add (`!at.target.length`) — a Question nested under a
  Prompt (`{"p-<ms>": {tasks: {add: {type:"Question", text}}}}}`) never reaches it.

## What I will change
1. **`ChatV3.js` + `placement.js`**: a pure, DOM-free helper `far_off_questions(roots, task_for, nested_tasks)` that finds
   every answered Question whose owning Prompt is not the newest root (i.e. other cards exist after it). `ChatV3.draw()`/
   `update()` append one small reference card per far-off answered Question at the end of the box: a back-arrow icon,
   the question's first words, `href="#<id>"` (the existing per-card permalink, `ChatV3.js:22`) that scrolls to the real
   card. No move, no animation (both already true — we only ever append).
2. **`page_tools.js`**: one new guard, next to the existing per-item checks in `run_item_now`, before the generic write at
   the end of the function. A small recursive scan of the delta body finds every nested `tasks.add` whose `type` is
   `"Question"`; for each, normalize its `text` (same rule as `ChatV3.norm_words`) and compare against every Question
   already in this file's live root (`every_task(root()._tasks)`, filtered to Question by duck-typing `typeof t.phase ===
   "string"` — unique to `Question`, never imported to avoid a cycle). A match refuses the write with `{ok:false, why,
   existing: <id>}`, the same shape the title-dedupe already answers, so the caller is told which card to use instead.

## What I will NOT touch
- `ux/Dictate/Widget.js` (V1) — the owner's new words are Chat-specific; V1's own Question row is untouched (law 6: V1 is
  not drawn from `session.messages`, so the same helper does not apply there without a bigger change than this ask asks for).
- The root-level, title-based dedupe (`page_tools.js:1339`) — left exactly as is; the new guard is additive, never replaces it.
- Batching, log mode, saved/cross-session questions (`principles.md:93-95`, explicitly "later").
- Any CSS/animation for the move (there is no move to animate).

## Tests first
- `placement.test.mjs`: `far_off_questions` — an answered Question under the newest root is not far-off; one under an older
  root with newer roots after it is; an unanswered Question is never far-off.
- `ChatV3.test.mjs`: a new section — the reference card renders at the end, its link's `href` matches the real card's id,
  clicking it scrolls there (reuses the existing `#id` scroll logic, `ChatV3.js:135-136`).
- A new `page_tools.Question-dedupe.test.mjs` (node, no browser): adding a second Question with the same normalized text
  under a different Prompt in the same file is refused with `existing: <first id>`; a different question is not; an
  answered duplicate is still caught (dedupe is about the text, not the phase).

## Report shape
File:line for each change, the three tests' counts, screenshots at 400/1200 for the reference card, and an explicit note
that V1 and saved/cross-session questions are left for later, with why.
