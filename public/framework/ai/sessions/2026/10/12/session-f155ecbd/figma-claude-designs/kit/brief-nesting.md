# Brief: how components nest, shown (owner, 2026-10-13)

The owner's words: "help me understand via a demo how to nest components in the right way… having an icon component might not be a bad idea where we can swap out an icon… I don't know if we want to bring the entire Google icon set in… building icon items, then putting them into lists, then doing color permutations… what becomes a component, how you make compound components… the workflow of creating nesting is confusing me." Also: "we don't want to be overwriting components unless absolutely necessary… one master component, edit it once and it updates everywhere, in all four columns."

Read first:
- [doc/page-layout.md](/framework/ext/Figma/doc/page-layout.md): one 1920 wrapper, the page as a component.
- [use-figma.md](/framework/ext/Figma/doc/use-figma.md): recipe rules 6–7, and "One master, four schemes".
- [ds-icons.md](ds-icons.md): the icons use the Material Symbols Rounded font, where a ligature name such as `bolt` draws the icon.

The owner's page `Color Schemes` (`209:6580`) has iconify vector icons (`ic:baseline-cloud`…). Read that page, but don't edit it. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. **The owner reads the file, not chat**: a Notes box at the top.

## Page `Kit · Nesting` (new), built as a ladder you read top to bottom
1. **Atom: `Icon`.** Show two ways side by side:
   - (a) A font icon: one component, one TEXT property `glyph`. Typing any Material Symbols name gives any of its ~3,000 icons with nothing imported. This is the recommendation.
   - (b) Vector icons: one component per icon, swapped with an INSTANCE_SWAP property and a short list of preferred values (as the owner's iconify icons would be).
   Say when each wins. Size variants 16/20/24, and the colour bound to `text` / `accent`.
2. **Molecule: `Icon item`** = an Icon instance + a label (+ optional meta). Its own properties: Label (TEXT), Show icon (BOOLEAN), and the nested Icon's `glyph` exposed through "expose nested instance properties", so a user edits the glyph from the item. States: default, hover, active.
3. **Organism: `List`** = an auto-layout slot of Icon items (SLOT property). Show the same List filled with 3 items and with 6.
4. **Card** = a header + a List instance inside a card that binds `surface` / `text` / `accent`.
5. **Four schemes**: ONE master (`Card · schemes demo`) placed 4× (white, light gray, prime, dark) using Text modes only. Then edit the master's Icon glyph once and screenshot all four changing (before and after in the Notes).
6. **"What becomes a component" box:** make it a component if it repeats or must change everywhere at once; don't for one-off layout. The steps, in order: atom → molecule → organism → place it → modes. How to swap, how to expose nested properties, how to avoid overriding every instance.
7. Make the whole page a `Page · Kit · Nesting` component per page-layout.md. The demo's own masters sit in a `Components` frame beside it, because a component can't contain another component's main.

Screenshot and fix. Link the page from the Overview design-system card. Report `kit/nesting.md`, committed by path.
