# Understand — a ✓ or ? after every sentence, a clarifying question right in the flow

The owner's own ask: figure out what each sentence is trying to say, mark it with a
green ✓ when it's clear, and a yellow ? when it isn't — then let the assistant actually
ask the clarifying question, in the chat, instead of guessing. See it happen, live:
[the demo](/framework/ux/Understand/).

## Use
```js
import Understand, { marks } from "/framework/ux/Understand/Understand.js";

const out = await marks(["Sentence one.", "Maybe sentence two?"]);
// -> {ok: true, marks: [...], source: "assistant" | "fixtures"}

new Understand({ sentences, marks: out.marks, log: [] });
```
`marks()` is the client call that BUILDS the `marks` array — `Understand` only ever
draws one it's given, so a real caller (the chat panel this rehearses) can call
`marks()` itself and hand the result straight over.

## Watch out
- **`marks()` asks Servex's `/api/hitl`, live only after a later restart** (a sibling
  task is building the route). Until then, and any time the call fails, it falls back
  to `fixtures.js` — a plain "does this sentence hedge?" rule — and says so in a small
  status line. The production site is static, so that fallback is what it really shows.
- **The clarification card is `ux/Content/Decision`, unmodified** except for where its
  log lives: a demo never writes a real log, so a small subclass in `Understand.js`
  (`ClarifyCard`) keeps that log in memory instead of a file or the dev socket. Every
  other behavior — the "your choice" mark, the guard against a stray tap mid-scroll —
  comes along for free.
- **A card with no options pre-chosen** is exactly what `Decision` already draws when
  nothing sets `chosen` or `recommended` — no second component was needed.

## More
- [Live demo](/framework/ux/Understand/) — a canned paragraph marked on load, plus
  "try your own"
- [`doc/decisions.md`](/framework/ux/Understand/doc/decisions/) — why `Decision` over `Question`
- [`ux/Content/Decision`](/framework/ux/Content/Decision/) — the clarification card itself
- [`ux/Rename`](/framework/ux/Rename/) — the other HITL widget from this same brief, tap-to-rename by dropdown; shares Servex's `/api/hitl` (a different `op`) and the same fixtures fallback
- Files: `Understand.js` (the class, `marks()`, the demo), `fixtures.js` (the offline rules pass), `Understand.css`
