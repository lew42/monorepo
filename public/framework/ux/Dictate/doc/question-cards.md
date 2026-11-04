# Question cards

How a Question the owner asked is shown in Chat V3, from the owner's own four asks (`ux/Dictate/doc/principles.md`,
"Questions"). The build history and test counts live in the task's own `task.jsonl`/`report.md`, not here.

## In place, punctuation fixed

A Question nests under its own Prompt's card — never a separate root card. `core/Task/Question.js` is the record
(`text`, `from`, `answer`, `working`, `also_from` — `core/Task/doc/prompt.md`); `ChatV3.question()`
([`ext/Chat/v3/ChatV3.js`](/framework/ext/Chat/v3/ChatV3.js)) draws it with a "?" icon inside the Prompt's own nest.
Punctuation is fixed by the smart seat (`Servex/agents/single-voice-assistant.md`, "fix punctuation"), not by this
view — **untested here**, since ChatV3 never touches a sentence's own words.

## The answer goes on the card, live

`ChatV3.question()` draws `q.answer.text` on the same card, the moment the answer lands — no reload. A plain nested
field write (`{"q-id":{answer:{…}}}`) is routed by `Session.apply_line` to `Task.replay_line`, which never fires a
live "delta" event for an ordinary field; `find_answered_ids()` ([`placement.js`](/framework/ext/Chat/v3/placement.js))
reads each incoming line itself for any id that just got an `answer` or `also_from`, and `ChatV3.read()` marks that
card dirty directly, bypassing the event system. `ChatV3.test.mjs` proves this live.

## A far-off answered card resurfaces as a small reference

`far_off_questions()` (placement.js) decides "far off" as a real distance — more than `threshold` (default 3) other
root cards between the question's own Prompt and the end of the chat — never merely "not the newest root". The
result is capped to the most recent `max` (default 5), so references never pile up for the whole session.
`ChatV3.refresh_refs()` draws them in a `.chat-v3-refs` box that always stays at the very end: `update()` inserts any
fresh card BEFORE that box, never after it, so new activity can never drift the references into the middle of the
chat. Each reference (`reference()`) is a back-arrow badge over a "?" icon with `href="#<id>"`, the real card's own
permalink; tapping it scrolls there. Only a Prompt actually drawn on screen (within the "show earlier" window) gets
a reference — one that scrolled past that window would link to an `#id` nothing owns.

## A repeated question links to its existing card

`strip_duplicate_questions()` ([`Servex/agents/page_tools.js`](/Servex/agents/page_tools.js)) checks a nested
`tasks.add` of type Question, session-wide, against every Question already in the file (normalized text). A match
is removed from the write — never a second card — and the EXISTING Question's own `also_from` grows with the
repeating Prompt's task id; the answer reports `{id, existing, from}`. Everything else in the same delta still
writes normally (a sibling field is never dropped), and a write that is only a repeat writes nothing at all (no
hollow bookkeeping line). `ChatV3.js`'s `all_questions()` then draws a reference (the same small element far-off
answers use) under the REPEATING Prompt's own card, pointing back at the one true card — live, through the same
`find_answered_ids()` mechanism above.

**Self-link guard:** the match is skipped — both written as real, separate cards — when it is the same Prompt asking
itself again, or the exact same id re-added (an idempotent retry). Either way, linking would point a Question's
`also_from` at the very Prompt that already holds it, and the view would draw a reference to a card on the card
itself.

**Scope:** this only catches a Question nested under a Prompt (the real, documented shape). A Question added at the
session's own root bypasses the guard entirely (consumed earlier by the root's own title-only duplicate check) — not
seen in practice.

## Left for later

- V1's own Question row (`ux/Dictate/Widget.js`) moves the card to the end on answer — a separate, already-reviewed
  decision; untouched by any of the above, which is V3-only.
- Batching, a log mode, and questions that outlive a session (`principles.md`'s "Later": `session.questions`, a
  module's `questions.jsonl`, a module readme FAQ) — not built.
