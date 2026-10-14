# Brief: Colour · Schemes on the foundations: one switch, four looks (owner, 2026-10-14)

Composition is now locked on the Foundations pages, so this is the colour step the owner put last: "then explore the colour schemes and the modes; if we have a quick way to switch between them, that's definitely useful… one master component, placed four times; edit it once and all four update."

Read: [use-figma.md](/framework/ext/Figma/doc/use-figma.md) ("One master, four schemes"; recipe rules 6–7), [builder.md](/framework/ext/Figma/doc/builder.md) (items inherit the mode: no clicks), [design/color/readme.md](/framework/design/color/readme.md) (contrast is computed, never stored; prime stays prime, small prime text on a dark pill; step a ground away from its ink), [design/color/doc/error-colour.md](/framework/design/color/doc/error-colour.md) (the open error-colour question: don't change tokens). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Keep calls lean; if the shared tool limit hits, stop and record what's left.

## Page `Colour · Schemes` (new; right after `Colour · Permutations`)
1. **One master, `Schemes · sample`**: a small page made only of instances: a header band, a Foundations card grid with 4 Essentials cards (plain, stat, list, callout), a button row, a toggle and field row, a status row. The master sets no Text mode.
2. **Placed 4×** (white, light gray, prime, dark), plus a 5th on near-black: each copy sets only its Text mode and its ground (bound to the variable). Then edit the master once (change a card) and show all five update (before/after in the Notes).
3. **Run the contrast script** (`ext/Figma/scripts/contrast.figma.txt`) and write *in words, without numbers*, where each scheme is weak (for example "muted text on prime is borderline"). The numbers stay out of the file.
4. **Quick switching:** show the fastest way to recolour a whole page: select the page frame and change its Text mode (one click), versus a `Scheme` variant. Say which one you'd use where.
5. Notes: what reads well and what doesn't, per scheme.

Make it a 1920 `Page · Colour · Schemes` component. Screenshot at 100%, report `kit/schemes.md`, committed by path. Finish within about 75 minutes.
