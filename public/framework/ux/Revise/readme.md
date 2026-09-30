# Revise — text in, revised text out, at a level

This is the AI step of dictation: an LLM plus a prompt that cleans or curates rambling
speech-to-text. It is separate from the microphone (`framework/audio/`, being built
alongside this) and from transcription (turning sound into raw words) — Revise only
ever sees text.

## Use

```js
import Revise from "/framework/ux/Revise/Revise.js";

const out = await Revise.run("so um i was thinking...", "edit");
// -> {ok: true, text: "...", model: "...", ms: 240}
// or -> {ok: false, why: "Servex isn't answering (...)"}   — never throws
```

`level` is one of `Revise.LEVELS` (`"clean"`, `"edit"`, `"summary"`), or your own
`{prompt, model}` object — either way, `Revise.run` sends the request to Servex's
`/api/tidy` and never throws: a caller always gets back `{ok, ...}` and can say
plainly when revision isn't available.

## The three levels

| Level | What it does |
| --- | --- |
| **clean** | near-raw — fixes typos, punctuation, capitalization; drops filler words ("um", "uh"). This is exactly today's original `/api/tidy` prompt. |
| **edit** | light — tightens run-on sentences, same voice and informality. |
| **summary** | heavy — pulls out the real points, organizes into short paragraphs or a list. |

A caller can swap any level's prompt/model, or add a new one — `Revise.LEVELS.loud = {
label, hint, prompt, model }` — with no change to this file.

## Watch out

- **The real prompt text lives in `Servex/agents/tidy.js`, not here.** `Revise.run()`
  sends the level's NAME (`"clean"`, `"edit"`, `"summary"`) for the three built-ins —
  Servex looks up its own copy — so the browser and the server can never disagree
  about what actually ran. This file's own copies of the three prompts are for
  DISPLAY on this page and for callers writing a custom level to start from; there is
  no build step to share one copy of that text between a Node module and a browser
  module, so if a level's wording changes, update both by hand.
- **Servex must be up and restarted** for a `level` request to work — before that,
  `/api/tidy` still answers exactly as it always has (no `level`), and a request that
  names one gets `{ok:false, why:"Servex answered 404"}` or similar until Servex
  restarts with the new code. `Revise.run()`'s caller sees that in `why`, in plain
  words.
- **Wired into the real dictate path:** `new Dictate({ revise: "clean" | "edit" |
  "summary" | false })` — see [`ux/Dictate`](/framework/ux/Dictate/)'s own readme for
  which callers use which level, and how the raw text is kept alongside the revised
  text.
- **See it work on Whisper's real output** — chunk by chunk, raw next to revised — at
  the [dictation playground](/framework/ux/Dictate/playground/).

## More

- [`Revise.js`](/framework/ux/Revise/Revise.js) — the class: `Revise.run()`, `Revise.LEVELS`, `Revise.View` (the demo above)
- [`Servex/agents/tidy.js`](/Servex/agents/tidy.js) — the server side: the real prompts, the `/api/tidy` route
- [`ux/Dictate`](/framework/ux/Dictate/) — the whole dictation system this is one part of
