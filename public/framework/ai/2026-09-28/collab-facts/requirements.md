# Collab, part 2: facts first, disputes, and abstaining

Owner's words: `2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-4.md`, the first half. What exists: `ext/Collab/` and `Server/collab.mjs` (collab-rounds), contract in `ai/2026-09-28/collab-rounds/collab-format.md`.

1. **A `Fact` object:** `{id, text, certainty, disputes: [{member, why}]}`. The text is a simple, foundational truth: "always X", "never Y", "one A per B", "before X, do Y". Certainty is one of `settled`, `likely` or `open`. Write "never" and "always" only for what actually breaks; anything else is `likely`.
2. **A facts phase comes first** in every collab: the members list the facts together, and each member marks the certainty of each one. An `open` fact is where the digging goes; the next phases get the open facts as their focus.
3. **Any member may dispute a fact** in any later phase, with one line saying why. A disputed `settled` fact drops to `likely`, and the mastermind sees each dispute next to the tally.
4. **Abstaining:** `Vote` gets `abstain: true`. A member weighs in only where something looks false, misleading or easy to get wrong. An abstention is not counted as a vote for anything, and the tally shows how many abstained.
5. Update `collab-format.md` (one section added, nothing renamed), the Collab page (facts first, with a certainty chip on each and disputes shown), and the sub-mastermind skill's collab section (one line: start with the facts).

**Proof:** one real collab run showing its facts, one dispute and one abstention, with the cost. **Fence:** `ext/Collab/`, `Server/collab.mjs`, `collab-format.md`, the one skill line. Start after review-turns lands (it has collab-rounds' branch merged in); take a worktree from michael/dev.
