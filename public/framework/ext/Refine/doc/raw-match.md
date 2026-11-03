# Why Raw highlights, even though nothing marked it

`clean.md` numbers its own sentences (`S1`, `S2`, …), because `Server/refine.mjs` writes them that
way on purpose — later files cite `[S3, S7]` against those numbers. `raw.txt` has no such
numbers: it is the dictation byte for byte, exactly as Whisper produced it, and nothing may
change that.

So when you click an ask and its clean sentence lights up, how does the matching stretch of Raw
light up too? `Refine.js` guesses, using the fact that clean.md is *near-verbatim* — same
sentences, same order, only fillers removed and punctuation fixed:

1. Split `raw.txt` into rough sentences on `.`/`?`/`!` (`split_raw`).
2. For each clean sentence, keep its **significant words** — lowercased, 4+ letters, not a
   filler like "um", "like", "kind", "whatever" (`sig_words`, the `FILLERS` list at the top of
   `Refine.js`).
3. Pick whichever raw sentence shares the most significant words with it (`match_sentences`).

## Worked example, from the fixture

Clean **S1**: *"Because I think, especially given this transcription mode that I'm leaning
into, I'm a little worried that my long rambling transcriptions pollute the IQ of the LLM."*

Its significant words: `think`, `especially`, `transcription`, `worried`, `long`, `rambling`,
`transcriptions`, `pollute`, `llm`.

Raw's first sentence (the same one, fillers and all) shares almost all of them — `worried`,
`rambling`, `transcriptions`, `pollute`, `llm`, `long` — far more than any other raw sentence, so
it wins. Try it on [the live fixture](/framework/ext/Refine/): click S1 in Clean and the whole
first raw sentence highlights.

## Where it can be wrong

- **A clean sentence merged from two raw ones** (the tool is allowed to do this for "repeated
  words" per `Server/doc/refine.md`) matches whichever raw sentence has more overlap — the other
  half doesn't light up. Not fixed; a caveat rather than a bug, because merges should be rare in
  near-verbatim text.
- **Two raw sentences about the same few words** (say, both mention "LLM" and "details") can
  tie or nearly tie; the first one found wins. Only matters on unusually repetitive dictation.
- This is a **pointer for the eye, not a citation the tool wrote** — `coverage.md`'s own table is
  the source of truth for what a sentence became; the Raw highlight only helps you find it fast.
