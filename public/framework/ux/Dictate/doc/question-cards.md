# Question cards (ask 7, 2026-11-03)

What a Question card does, in V3, and why — the owner's four asks (`ux/Dictate/doc/principles.md`, "Questions"), where
each is built, and the fix history for what the first pass got wrong (a review caught four of eleven findings as "must
fix"; this doc is where that history lives, not the readme — [`ext/Chat/v3/readme.md`](/framework/ext/Chat/v3/readme.md)
only links here).

## The four asks, and where each lives

1. **In place, punctuation fixed.** A Question nests under its own Prompt's card (`core/Task/Question.js`, `ChatV3.question()`
   in [`ext/Chat/v3/ChatV3.js`](/framework/ext/Chat/v3/ChatV3.js)) — never a separate root card. Punctuation is the smart
   seat's own job (`Servex/agents/single-voice-assistant.md`, "fix punctuation"), not this view's; no test here proves it,
   since ChatV3 never touches a sentence's words.
2. **The answer goes on the card, live.** `ChatV3.question()` draws `q.answer.text` on the same card. The first pass of
   this (2026-11-03) only worked after a reload: a plain nested-field write (`{"q-id":{answer:{…}}}`) is routed by
   `Session.apply_line` to `Task.replay_line`, whose per-field loop calls `take()` → `Item.put()` (the bare
   `this.data[key] = value`), never `set_one()` (the one that calls `this.emit("delta", …)`) — so no live "delta" event
   ever fires for it. **Fixed in the view** (the review's own suggestion, not a core `Item`/`Task` change):
   `find_answered_ids()` ([`placement.js`](/framework/ext/Chat/v3/placement.js)) reads each incoming raw line itself for
   any id that just got an `answer` or `also_from`, and `ChatV3.read()` marks that id's owning card dirty directly,
   bypassing the event system entirely. `ChatV3.test.mjs` proves this live, no reload.
3. **A far-off answered card resurfaces as a small reference near the end, with a back-arrow link to the original.**
   `far_off_questions()` (placement.js) + `ChatV3.refresh_refs()`/`reference()`. Two things the first pass got wrong,
   both fixed:
   - **"Far-off" was "not the newest root"**, which qualified the instant the NEXT prompt arrived, and piled up
     references for the whole session once it did. It is now a real distance: `{threshold, max}` — more than
     `threshold` (default 3) OTHER root cards behind the end, capped to the most recent `max` (default 5) so the box
     never grows without bound.
   - **The references box drifted into the middle of the chat**: `update()`'s plain `append()` landed new cards AFTER
     `.chat-v3-refs` once it existed. A fresh card now always inserts BEFORE the refs box (or at the very end, when
     there is none yet), so the box stays "near the end" the whole time.
   - A smaller bug caught in the same pass: a reference to a Prompt older than the "show earlier" window pointed at an
     `#id` nothing on screen owns (no card was drawn for it). `refresh_refs()` now only references a Prompt actually in
     `this.els` (drawn).
4. **A repeated question links to its existing card instead of making a second one.** `page_tools.js`'s
   `strip_duplicate_questions()`: a nested `tasks.add` of type Question, checked session-wide against every Question
   already in the file (normalized text). The first pass REFUSED the whole write on a match — which dropped every
   sibling line sent in the same delta, and made no actual link anywhere. Fixed: the duplicate add is removed from the
   delta IN PLACE (everything else in the same write still lands), and the EXISTING Question's own `also_from` field
   grows the repeating Prompt's task id. `ChatV3.js`'s `all_questions()` then draws a reference (the SAME small element
   `reference()` draws for a far-off answer) under the REPEATING Prompt's own card, pointing back at the one true card
   — live, through the same `find_answered_ids()` mechanism as item 2 (widened to watch `also_from` too).

## Tests

`placement.test.mjs` 37/37 (far_off_questions' threshold/cap, find_answered_ids) · `ChatV3.test.mjs` 36/36 (live answer
redraw, refs-box ordering, also_from reference, no page errors) · `Question.test.mjs` 8/8 (also_from) ·
`Servex/agents/Question-dedupe.test.mjs` 15/15 (link not refuse, siblings preserved, two repeats in one write, answered
duplicates, plain Tasks untouched) · `Servex/agents/item_tool.test.mjs` 118/118 (unaffected).

## Left for later (explicitly out of this ask's fence)

- **V1's own Question row** (`ux/Dictate/Widget.js`) still moves the card to the end on answer (2026-10-25 design,
  [`ext/Chat/readme.md`](/framework/ext/Chat/readme.md)) — a different, already-reviewed decision, untouched here.
- Batching, a log mode, and questions that outlive a session (`principles.md`'s "Later": `session.questions`, a
  module's `questions.jsonl`, a module readme FAQ) — not built.
- A root-level Question add (at the session's own root, not nested under a Prompt) never reaches
  `strip_duplicate_questions()` (it is consumed earlier by the title-only root guard); the documented, real usage shape
  — nested under a Prompt — is the one this fixes. Not seen in practice; noted here if it ever is.
