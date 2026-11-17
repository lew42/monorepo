# Slot vs instance swap: three tiny demos (built 2026-11-16, on the Showcase page)

Lew42 v2 file. The owner's question, relayed 2026-11-16: how should a template take content? Two Figma features answer it, and they sit at opposite ends.

- **Instance swap** picks WHICH component goes in a spot. With preferred values, the picker shows thumbnails (confirmed 2026-11-16), and a slash in a component name ("400 / Icon + title") makes a folder in that menu. But it takes exactly one component: you can't add a second paragraph or three more icons.
- **A slot** takes any content: drop in, duplicate, reorder. It gives no picker and no thumbnails.
- **The in-between** is a template with some areas locked (fixed layers with text and boolean properties), some swap spots, and some slots. An example is a toolbar slot where you drag in any number of icons.

The owner's leaning: drill in (Ctrl/Cmd-click) and select the actual thing, rather than a big template with many mapped swap properties. Don't make every permutation a variant (header + 1 paragraph, header + 2 paragraphs).

What broke and started this: in the [Swap preview test](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=100-5842), a paragraph duplicated next to the swapped "400 / Icon + title" landed outside the template in the master, so every instance shows it. It is visible, tagged "Needs work", on the [Showcase](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=109-15) page.

**Built** as the "Slots and swaps" block on the [Showcase](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=109-15) page, not on a new page (voice-app, 2026-11-16). Demo 1 is Card (Content swap, four preferred values) beside the new `Card · Slot`; demo 2 is the new `Icon.Title` (locked header, Toolbar slot, Body slot); demo 3 is `Icon.Title` (mapped Icon and Title) beside a Card holding `400 / Icon + title` (drill in). Answer to the first open fact: a SLOT property accepts and stores `preferredValues` through the API; thumbnails in the UI are not confirmed yet.

## MVP: three demos, each one frame with a Review tag (Draft) and a "Try" line

1. **Same spot, two ways.** One small card master, built twice. Card A's body is an instance-swap property with three preferred values: one paragraph, two paragraphs, a list. Card B's body is a slot. Try: give each card a second paragraph. A needs a new component for every count; B takes a duplicate. Shows: thumbnails and a short menu (swap) against free content (slot).
2. **Locked header, open toolbar.** One template: a locked header (an Icon.Item plus a title as a text property), a body slot, and a toolbar slot holding three Icon button instances. Try: duplicate an icon in the toolbar (Ctrl+D), then drag a Button into the body. The header can't be broken; the slots grow. This is the in-between the owner described, and the model for the rest.
3. **Drill in vs mapped properties.** The same card twice. Card A exposes six properties at its top level (icon swap, title, two booleans, a body swap, a button label). Card B exposes none: you Ctrl/Cmd-click the icon and swap it there. Try: change the icon and the button label on each, and count the clicks. Shows the owner's preferred way (B), and when A is still worth it (a component placed 50+ times with a fixed shape).

Each demo is one master at the canvas root, with 2–3 instances beside it. They are built from the real masters (Icon.Item Set, Button, Card), and text uses text styles. They go on one small new page, "Explore – Slot vs swap", and get a line in the Live board's "Demos to review".

## Open facts to check while building

- Can a slot hold preferred instances, or show thumbnails? Figma's slot picker is newer than the plugin docs. Test it in demo 1; if it can, the "in-between" may collapse into slots alone.
- `component.createSlot()` is how a slot is made through the API (from the Flow page work in the old file). A plain frame is not a slot.
- A Card can't swap in a layout that contains a Card: Figma refuses the cycle ("change would create a cycle", found on the Showcase, 2026-11-16).

## Alternatives

- **Variants for each count** (header + 1, + 2, + 3 paragraphs): easy to pick, but the set grows with every permutation. The owner rejected this.
- **Slots everywhere, no swaps:** the most freedom, but no thumbnails and nothing locked. A good fit inside a page, not for a card someone else will place.

## Cost

About $3–5 on one agent: three small `use_figma` builds, three screenshots and a board line.
