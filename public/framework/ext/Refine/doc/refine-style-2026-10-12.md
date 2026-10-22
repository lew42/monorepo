# Refine style: one source for how a refined prompt reads

The owner's rule (2026-10-12, `public/framework/doc/rules.md` "How to respond" (moved from `CLAUDE.md` 2026-10-22)): a refined prompt is an overview of what was said, not the rant. The rules live once, in [`RefineStyle`](/framework/ext/Refine/RefineStyle.js), and every prompt that writes something the owner reads pastes them in.

## Who uses it
- `Server/refine.mjs` `structuredPromptDefault` (the outline cards, which `structure()` and `/api/refine` reuse) and `briefPromptDefault` (the numbered asks): `RefineStyle.for("outline" | "asks")`.
- `Servex/ext/refine/Annotator.js` (the Haiku notes): `RefineStyle.for("notes")`.
- Not the clean step: it must change as little as possible, so it stays unstyled.

## The rules (the text is `RefineStyle.RULES`)
- Overview in the owner's key words, answer or action baked into each point.
- Ordered by dependency and ease; clarifications and quick items first.
- Same names every time, context always named.
- `#` / `##` / `###` headings only, each with an icon; ✅ / ⬜ status bullets; cards cite `[S#]`.

Outlines use `#` / `##` (the parser and the existing outline prompt are built on them); chat replies follow `public/framework/doc/rules.md` "How to respond" (moved from `CLAUDE.md` 2026-10-22). The Haiku notes prompt gets only the short `RefineStyle.NAMES` line, since its output is JSON.

## What code checks
`RefineStyle.check(md)` flags a heading deeper than `###`, a heading with no icon, and more than one `#`. The rest (ordering, "overview not retelling") is judgment, left to the model.

## Proof
`test/refine-style.mjs`: no model call. A five-sentence rant goes through `structure()` with a stub model that answers with the overview; the test checks the prompt carries the rules, every sentence is cited once, the overview passes `check`, `Outline.parse` still reads it, and a rant-shaped outline is flagged. Run it with `node test/refine-style.mjs` where `Servex/node_modules` exists. Not yet measured with a real model: whether Sonnet follows the new rules; the first real run is the check.
