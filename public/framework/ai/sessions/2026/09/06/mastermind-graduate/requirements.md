# mastermind-graduate — the run that brings the labs home

## The ask, verbatim (the owner, 2026-09-06 morning)

Asked "what would you recommend working on next?", the mastermind answered: stop exploring and start consolidating — (1) graduate paging into core Page, (2) build the platform's first vertical slice, (3) fold sections and layouts into the same system, (4) the spacing-constants pass and the four skill proposals. The owner:

> ok, do it, but don't ask for my approval. you make the call, you're the mastermind. begin.

That sentence is the approval for the core surgery CLAUDE.md's "Ask before" names. It is logged here so nobody asks again.

## The calls the mastermind made

- **Additive first.** Core gains the capability; no existing page changes behaviour until it opts in. The site is green after every slice (crawl at 400/1280/1920/3440, zero console errors, the paging realm's 108 pages still pass).
- **Aliases over renames.** Nothing with a dozen callers is renamed. A new word is added; the old one keeps working.
- **The lab becomes a consumer.** Proof that the move is real: `/imagine/paging/` deletes its own copy of the renderer and the vocabulary and imports core's. Sections and layouts follow the same path as choices under the *arrangement* word.
- **Configuration lives in the page file.** The url overlay (`?navigation=…`) stays an editor feature (the lab, Build), not a core default.
- **A page made from JSON is first-class.** `page.json` → a real page through one core seam; the fs writer stays in `ext/Saver`.
- **The platform slice runs in parallel** — it lives under `worker/` and `/imagine/platform/`, files nobody else touches.
- **The four skill proposals are decided, not parked** — see `../skill-decisions/requirements.md`.

## Waves

1. `graduate-plan` (Opus, read-only) · `spacing-constants` (Sonnet) · `skill-decisions` (Sonnet) · `platform-slice` (Opus).
2. The plan judged; core seams built by Opus, one slice at a time, site green between.
3. Paging, sections, layouts rebuilt on core; the lab's own copies deleted.
4. Audit: the two critics from the paging loop walk the graduated system; fixes; land.
