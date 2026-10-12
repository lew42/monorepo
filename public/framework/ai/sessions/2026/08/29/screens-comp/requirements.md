# screens-comp — composition pass on /imagine/screens/

The lab (8 experiments, 24 urls) was built earlier today by `screens-lab`. The mechanics
are right; the COMPOSITION is not. The mastermind reviewed the keeper shots and the brief
is the findings.

**The standard:** `screens-divide-two-three-four-3440.png` — display-size numerals,
hairline seams, poster-clean.
**The gap:** `screens-title-document-1920.png` — a 40em document adrift in ~950px of dead
white; cover and document share one paper so nothing separates them.

## The pass — don't restructure, RECOMPOSE

Variations stay. Urls stay. Mechanics stay.

1. **Type scale.** Divide's display numerals are the bar. Title / Peek / Deck / Mix titles
   should hit the same scale — a full-screen word is display type, not a heading.
2. **Placement.** A lone document in a big room gets PLACED — centered in the leftover
   room, or on the golden seam (Uneven proved shares compose); dead space becomes margin,
   not absence. Measure dead-right px at 1920/3440 on title/read, before and after.
3. **Tone.** One tone step separates live areas — the vary lab's verdicts apply (stepping
   reads as hierarchy; a flip reads as "you are here"): the ARRIVING area carries the step
   (cover on wash, document on surface — or the inverse; pick by eye, screenshot both,
   keep one, log why).
4. **The seam.** Where two areas meet, the boundary should be deliberate — hairline,
   shadow, or tone change; **not three at once**.

Also in passing (this fence now): anything the shots show misaligned at 400 (the
one-column paging states).

## Fence

`public/imagine/screens/**` only.

## Traps

- Every CSS rule in a layer; one backtick inside ``css(`…`)`` kills every page.
- The lab's own keydown/deactivation fix — do not regress it.
- A `default` column has no `app` (bug queued in core) — do not rely on `this.app` in defaults.
- Headless Playwright global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.
- Never kill/restart the :80 dev server; never drive owner tabs; never stash; never commit.
- Do not touch ext/Playground, dev/DevBar, ext/grip.

## Verify

Re-shoot all 8 experiments at 400/1920/3440 (the SAME states as the originals, so
before/after pairs exist), zero console errors, all 24 urls still cold-load, the dead-space
numbers before and after. Keepers in this task dir + `links`.
