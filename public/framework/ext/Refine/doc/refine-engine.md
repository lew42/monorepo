# The refine engine — `clean()` and `structure()`

This is the shared engine behind the owner's "one refine process, two speeds" plan
([`public/framework/ai/2026-10-02/prompt-refine/requirements.md`](/framework/ai/2026-10-02/prompt-refine/)):
the SAME code cleans a whole logged prompt in one pass, or cleans live dictation segments one
at a time as they finish. Two files:

- [`engine.js`](../engine.js) — `clean(text, options)`. The one every caller needs.
- [`structure.js`](../structure.js) — `structure(sentences, options)`. Groups a whole prompt's
  sentences under headings; only the batch (whole-prompt) side needs this, not live dictation.

Both are plain ESM with no top-level Node-only imports, so they run unchanged in a browser
(Dictate) and under Node (the prompt-log processor, `Server/refine-litmus.mjs`).

## Why the file is `engine.js`, not `refine.js`

The original brief asked for `ext/Refine/refine.js`. This folder already has `Refine.js`
(capital — the existing viewer page, [`Refine.js`](../Refine.js)). On a case-insensitive
filesystem (Windows, which this was built on), `refine.js` and `Refine.js` are the exact same
file on disk — writing one silently overwrites the other, no error, no warning. That happened
once while building this (caught immediately, `Refine.js` recovered byte-for-byte from git).
The file was renamed to `engine.js` right after, so the collision is impossible rather than
just something to remember. If you were told to import `refine.js`, use `engine.js` instead —
same exports.

## `clean()` — near-verbatim, enforced by code, not by trusting the model

```js
import { clean } from "/framework/ext/Refine/engine.js";
const result = await clean(text, { prev });
// result = {
//   text,      // the cleaned text, joined
//   sentences, // [{n, text}] — every sentence, numbered, near-verbatim
//   strikes,   // [{sentence_n, struck_text}] — a self-correction found in the raw text
//   misheard,  // [{sentence_n, from, to}] — a word fixed against the glossary, mechanically
//   flags,     // [{sentence_n, question, confidence, source}] — "model" or "mechanical"
// }
```

**Two speeds, one function.** There's no `{stream: true}` flag. Call it once on a whole logged
prompt, or many times in a row on live segments, passing `prev` (the tail of already-cleaned
text) each time so a self-correction spanning a segment boundary ("wait, not blue — green")
still gets caught. Streaming IS just calling it more than once — the same choice
`ux/Revise`'s own `Revise.run(text, level, {before})` already made.

**The model is asked to do as little as possible.** The prompt it gets is
`Servex/agents/tidy.js`'s existing `LEVELS.clean` — the SAME wording every other "Clean" caller
in this repo uses (never a second copy — law 6). It was extended with ONE short, fixed
addition: number every output sentence (`S1. `, `S2. `, …) and mark a genuinely unsure one with
`S2? ... , unclear: <question>` instead of a period. That's it. **The glossary is never sent to
the model** — per the owner's own note while this was being built (2026-10-02): a growing
instruction block (every module name, every CLAUDE.md term, re-sent on every single call) is
exactly the "every-prompt reload problem" to avoid. Fixing a mis-heard name, and noticing a
self-correction, both happen AFTER the model answers, in plain JS:

- **A self-correction ("no wait, I meant...")** is found by scanning the RAW text for a short,
  fixed list of correction markers (`detectStrikes()` in `engine.js`) — never by asking the
  model to tag it. Best-effort and clause-level, not word-level (documented in the code): a
  correction phrased some other way just doesn't get a `strikes` entry, which is a smaller
  miss than a wrong one, since the model's own cleaned wording already reflects the correction
  either way.
- **A misheard word ("servex" → "Servex")** is caught by the same mechanical check that decides
  pass/fail (next section): a clean-text word absent from the raw vocabulary gets compared, by
  plain edit distance, against `GLOSSARY` — a hand-built list of this repo's own proper nouns
  (every capitalized module/class directory name under `public/framework/*/*/readme.md`, plus a
  few names from `CLAUDE.md` like `Servex`, `Lew42`, `Haiku`, `Sonnet`). A close match is
  accepted and recorded in `misheard`; anything else is rejected (next section).

**The mechanical diff-check (deliverable 2) — the actual safety net.** After the model answers,
`engine.js` checks every content word in its cleaned sentences against everything actually said
(this call's `prev` + `text`, the same whole-vocabulary comparison
[`Server/refine.mjs`](/framework/ai/2026-09-29/prompt-refine/)'s own coverage table "new words"
flag already uses, and for the same reason: a legitimate paraphrase from elsewhere in the same
dictation must never be flagged, only a word that was never said at all). A word that's
genuinely new, with no glossary match and not inside a detected self-correction, means the
model added or changed something it shouldn't have: that WHOLE SENTENCE is rejected and
replaced with its raw-text fallback, and a mechanical flag records why. **Never silently
trusts the model's own cleaning** — this check runs whether the model behaves or not.

## `structure()` — every sentence placed, checked by code

```js
import { structure } from "/framework/ext/Refine/structure.js";
const result = await structure(sentences); // the SAME [{n, text}] clean() returns
// {ok: true, md} or {ok: false, missing: [...], duplicated: [...], md}
```

Sends the numbered sentences to a model with the EXACT prompt
[`Server/refine.mjs`](/framework/ai/2026-09-29/prompt-refine/)'s own `structuredPromptDefault()`
already uses for its structured rung (imported, not rewritten — reused word for word). Then,
in plain JS: every sentence number `S1..Sn` must appear in the result exactly once. Missing a
sentence fails the run loudly (`ok:false, missing:[...]`) rather than silently dropping it —
this is deliverable 3's actual point. A sentence cited twice under two different headings also
fails (`duplicated`), since the structured prompt's own rules already say never to do that.

Node-only for now (no caller needs it live in a browser yet — see "What's left" below).

## The litmus test — which cheap model to actually use

```
node Server/refine-litmus.mjs <raw.txt | date:line>
```

Runs `clean()` against three cheap models already wired into this repo's own model ladder (not
invented for this test): `claude-haiku-4-5-20251001` (`Server/refine.mjs`'s own
`MODELS.haiku`), and `deepseek/deepseek-v4.1-flash` + `openai/gpt-6-luna` — the two models
[`Servex/ext/openrouter/spike.mjs`](/framework/servex/)'s own `DEFAULT_MODELS` marks "cheap," on
this repo's already-proven OpenRouter harness. For each model: did it pass the mechanical
diff-check above (no invented content), its cost, its latency — no opinion needed, the
diff-check already decides pass/fail, and a tie goes to the cheapest. Writes
[`Server/refine-litmus-result.json`](/Server/refine-litmus-result.json).

**The real run on one of the owner's own short dictated prompts**
(`.claude/prompts/2026-10-02.jsonl`, a 79-word rambling request about the Inbox rail's naming,
with a real mid-sentence self-correction) —
see `refine-litmus-result.json` for the exact numbers and the verdict line.

## What's left, honestly

- `structure()` has no browser-side path yet — nothing needs it live in-browser today (the
  owner's "prompt card" is built from the daily log, server-side), so this wasn't built; if a
  future caller needs it in-browser, it needs its own prompt source the way `clean()`'s
  `browserCall()` has one (`/api/tidy` route), documented in `structure.js`'s own doc comment
  rather than silently guessed at.
- `detectStrikes()` is clause-level, best-effort regex, not a full parse of what was struck vs.
  kept — see its own code comment for exactly what it catches and what it doesn't. Good enough
  for the "X struck through, Y kept" presentation; never relied on for correctness (the model's
  own cleaned wording is what's actually shown).
- The raw-fallback used when a sentence is rejected assumes the model's sentence count roughly
  matches a mechanical split of the raw text (same assumption `Server/refine.mjs`'s own fallback
  makes). A model that merges or splits sentences very differently from the raw text could get a
  slightly mismatched fallback sentence — rare in practice (rejections are rare to begin with),
  and still strictly safer than keeping the model's unverified wording.
- `refine-litmus.mjs`'s cost figure for an OpenRouter model is the SDK's own (approximate, priced
  off Anthropic's table — `Servex/ext/openrouter/provider.js`'s own documented caveat), not the
  several-seconds-later polled real figure (`provider.js`'s `real_turn_cost()`). Good enough to
  compare three models' ballpark cost; not the number to bill against.
- The glossary is a hand-written, hand-regenerated list (`GLOSSARY` in `engine.js`), not scanned
  live — see the regenerate command in its own comment. It will go stale as modules are renamed
  or added; nothing currently reminds anyone to re-run it.
