# Brief: dogfood: the new pages use the Essentials components (2026-10-14)

The owner: "we want to be dogfooding: creating things and then using them. Everything should be, as much as possible, an instance of a component." Essentials now has the card set ([essentials.md](essentials.md): `Card / Plain`, `Header + actions`, `Stat`, `List`, `Media`, `Feature`, `Callout`, plus `Context` Form=Card). Several pages still use stand-in cards. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Rules: [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (edit masters, not instances), [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md). Keep Figma calls lean (one script per page): the account has a shared tool-call limit. If it hits, stop and write down what's left.

1. **Foundations · Layouts** ([foundations.md](foundations.md) "still not done"): swap the `Card A · Properties` stand-ins for the right `Card / …` instances, in the layout masters' sample content or the placed instances, whichever keeps one source.
2. **Demo · Site** ([demo.md](demo.md) "small leftovers"): hide the leading "+" icon on the footer buttons (the Button's Show icon property, or swap to an arrow); replace the sample session names in the Reading screens' right column with real related links; swap stand-in cards for `Card / …`.
3. **Templates · Two-column / Three-column pages**: in the *filled examples* only (not the masters' empty slots), swap stand-in cards for `Card / …` instances.
4. Screenshot each page you touched at 100%; prototype reactions must match before and after.

Finish within about 75 minutes (the weekly reset follows). Report `kit/dogfood.md`, committed by path.
