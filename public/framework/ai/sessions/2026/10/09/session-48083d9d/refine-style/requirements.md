# Refine: the response style built into the refine prompts

The owner's words (2026-10-12, relayed): the response style they want must be built into the prompt-refinement prompts themselves (the Haiku annotator and the refine prompts in ext/Refine and Server/refine.mjs). A refined prompt is an OVERVIEW of what they said in their own key words (never the whole rant), each point with its answer or action baked in; ordered by dependency and ease (clarifications and quick items first, else their order); the same names reused so things become familiar, with context always named; big headings (H2/H3, each with an icon, never H4 or smaller) and short titled lists, ✅/⬜ status bullets; cards cite the clean-sentence indexes they came from. Put these as a shared prompt fragment (one file, one source) used by every refine prompt, add one fixture test showing a rant in and a refined overview out, and note it in ext/Refine/doc.

1. One shared fragment file: `ext/Refine/RefineStyle.js`.
2. Used by the outline, asks and Haiku notes prompts.
3. One fixture test: `ext/Refine/test/refine-style.mjs`.
4. Noted in `ext/Refine/doc/refine-style-2026-10-12.md`, linked from the readme.
