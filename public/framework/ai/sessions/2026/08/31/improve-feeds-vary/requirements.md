# improve-feeds-vary — requirements (verbatim)

TASK — the improve pass these /imagine/ labs never got: look, brainstorm, build. LOOK first (drive each live, all three resolutions): `/imagine/feeds/` (video/data/live feed layouts) and the three original vary labs `/imagine/vary/scroll/`, `/imagine/vary/tone/`, `/imagine/vary/place/` (scrollbar treatments, background hierarchy, child placement incl. carousel). Do NOT touch `/imagine/vary/colstyles/` — it had its own pass today. BRAINSTORM 8-12 ranked improvements as log lines, then BUILD the top 2-3 S/M total. Candidates to weigh, or beat with your own from the look: feeds/live — the stream lab's `rpc:append` write path landed 08-31 (see `public/imagine/stream/stream.js` `send()`; one line up the wire, whole-file fallback raced vs 2s timeout) — if feeds/live still whole-file-writes, adopt the same seam (S, real improvement); feeds — a paused/live toggle or new-items-since indicator where a feed auto-updates; vary — each lab ends in a one-line verdict per its readme: verify every variation still HAS its verdict line and its verdict still matches what renders (a verdict audit with fixes is a first-class build item); place — if the carousel variation lacks keyboard/wheel travel the others have, even it up. Controls and data, never a new page per state.

FENCE — `public/imagine/feeds/**`, `public/imagine/vary/scroll/**`, `public/imagine/vary/tone/**`, `public/imagine/vary/place/**`, + `public/imagine/vary/readme.md` ONLY if a verdict line must be corrected there. Nothing else.

VERIFY: headless proofs (append-path round-trip if adopted, with the line count on disk before/after; screenshots for visual changes), zero console errors, 400/1920/3440 on changed pages. Docs: one readme line per touched lab. Keepers + `links`. Report: built (one line + proof each), the verdict-audit result (N checked / N wrong), roadmap left, cuts.

## Steps
1. Look — drive feeds + 3 vary labs at 400/1920/3440
2. Brainstorm 8-12 ranked improvements as log lines
3. Verdict audit across all vary variations
4. Build top pick 1
5. Build top pick 2
6. Build top pick 3 (if S)
7. Headless proofs + console sweep + width sweep
8. Docs (readme line per touched lab) + land
