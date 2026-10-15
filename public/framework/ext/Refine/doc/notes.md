# engine.js — design and implementation notes

## File history and naming
NAMED "engine.js", NOT "refine.js" (2026-10-02, a mid-task correction, logged in task.jsonl): the brief asked for `ext/Refine/refine.js`, but this directory already has `Refine.js` (capital R, the viewer — explicitly off-limits to this task). Windows filesystem is case-INSENSITIVE but case-PRESERVING: "refine.js" and "Refine.js" are the exact same file on disk, so writing one overwrites the other in place, with no error and no warning. This happened once while building (caught immediately, Refine.js recovered from git HEAD). This file was renamed to make the collision structurally impossible. On case-SENSITIVE filesystems the two could coexist, but this stays a loaded landmine for any Windows checkout, so the rename stands.

## Two speeds, one function
TWO SPEEDS, ONE FUNCTION (the owner's framing, 2026-10-02): there is no separate "stream mode" flag. `clean(text, {prev})` is the same call either way:
- once, on a whole logged prompt (`prev` omitted): one clean pass over everything.
- many times, on live segments as they finish (`prev` = last ~2 sentences already settled): a self-correction spanning segment boundary still gets caught.

Deciding this way (not a `{stream: true}` flag) because calling the same function more times IS what streaming means elsewhere in the pipeline — a flag would be a second name for "I'm passing `prev` now." If that turns out wrong later, add `{stream}` option; nothing here would change shape.

## Model call separation (law 6)
THE MODEL CALL IS SPLIT FROM THE PROMPT ON PURPOSE (law 6 — one clean prompt, not two): the actual wording lives in ONE place, `Servex/agents/tidy.js`'s `LEVELS.clean` — this file never writes its own copy. What IS here, and does NOT live in tidy.js, is everything in the mechanical checks (laws 2-7): code-only checks run on the model's OWN output, so the model can't just be trusted.

The owner's note (2026-10-02, folded mid-task): keep the model prompt LEAN. The glossary (CLAUDE.md names, module names) is NOT sent to the model — it's matched here in JS, by edit distance, only against a word the mechanical check already flagged. Self-corrections ("strikes") are found here by regex scan of RAW text, never by asking the model to tag them.

## Glossary (law 6, deliverable 2b)
Built once, by hand, from the two sources the brief named: proper nouns in CLAUDE.md (root + public/framework/ai/CLAUDE.md) that aren't already plain English, plus every module/class directory name under `public/framework/*/*/readme.md` that starts with capital letter. To regenerate after adding/renaming a module: run `for f in public/framework/*/*/readme.md; do basename "$(dirname "$f")"; done | sort -u | grep -E '^[A-Z]'`

This is a plain array on purpose (easy to extend) — add a name by hand any time one gets mis-heard a lot and isn't here yet; there's no build step to regenerate it automatically.

## Word-matching helpers (intentional duplication)
Small, local, duplicated-on-purpose word-matching helpers. `Server/refine.mjs` has this exact logic (coverage.md "new words" flag) — the brief says reuse it, but `refine.mjs` imports `node:fs`/`node:child_process` at the top, which crashes in a browser — so ~20 lines are copied, kept deliberately tiny and byte-similar so the two can be eyeballed if one is ever fixed without the other.

## Mechanical self-correction (strike) detection
Deliberately simple and best-effort: looks for one of a few common correction markers ("no wait", "actually", "scratch that", "i meant") sitting in a clause right after another, and calls the clause BEFORE the marker "struck" and AFTER it (marker stripped) "kept." A correction phrased some other way is not caught — it just never gets a strikes entry, which is worse than wrong: the clean text itself (built by the model) already reflects the correction either way; `strikes` only adds presentation on top.

## parseModelReply format (matches Servex/agents/tidy.js)
Matches `Servex/agents/tidy.js`'s own output contract exactly: "S1. <sentence>" for normal, "S2? <sentence>, unclear: <question>" for flagged. The model's own flags show "S2?" and the line carries the question.

## mechanicalSplit fallback
Mechanical stand-in for when the model ignores the numbered format — a plain sentence split, same shape `Server/refine.mjs`'s `mechanicalClean()` fallback uses, so a formatting miss never produces empty result.

## applyFaithfulnessCheck guards
Runs on the model's OWN numbered sentences against the FULL raw vocabulary (this call's `prev` + `text` — `prev` counts so a streaming segment that refers back to previous segment isn't wrongly flagged). Checked globally, not sentence-by-sentence — same choice `Server/refine.mjs` makes for "new words" flag.

Glossary check BEFORE strike check on purpose: a self-correction sentence can still contain a genuine glossary fix, and `misheard` should record that either way.

## Test setup (nodeCall vs browserCall)
Node vs browser split: nodeCall imports `Server/AskEach.mjs` and `Servex/agents/tidy.js` dynamically (not static, else browser crashes on `node:...` builtins). browserCall hits `/api/tidy` on Servex. Everything above these functions is identical both ways.

## word_overlap_score
"A simple word-level diff %" (owner, 2026-10-04) — plain Dice coefficient over each text's own set of 3+ letter words. Lives here not in `Servex/ext/clean-test/run.js` or page code so the one score both show is computed once (law 6).

## quick_clean instant version
INSTANT clean (no model, ms): drop filler words ("um", "uh", "ah", "er", "you know", "like" as pause) and stutters ("the, the"), capitalise each sentence, end in punctuation. Never rewords. Returns same `[{ n, text }]` shape as clean().

## Flags confidence scoring
`confidence` is plain fixed number, not model-derived probability: 0.3 for model's own "unsure" marker, 0.5 for mechanical reject (LESS sure — could be checker's blind spot).
