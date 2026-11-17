# Essence: what the owner wants from Lew42 v2 (2026-11-16)

Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) is the simple new design system. Sources: [owner-words-2026-11-16.md](./owner-words-2026-11-16.md), the briefs relayed that day, [design-system-notes.md](./design-system-notes.md), [build-checklist.md](./build-checklist.md). His own summary of the day: "We're failing at everything. So we need to reduce, and we need to find something that works."

## 1. What he wants, strongest first

1. **Simple and robust.** "A minimal set of building blocks for a maximal set of outcomes." Fewer things, refined, not accumulated.
2. **One Index that shows everything.** A masonry preview (3 columns, the best 10% of each page) where "our whole design system is previewed and it's all perfect and works properly".
3. **One home per thing.** Click a component, land on the page it belongs to, not "a card defined on a templates page". Masters are visible, loose on the page root, and previews are made of instances.
4. **Swapping that cannot go wrong.** See everything a component can swap to, and where it is defined. Sizes are nailed down so "you can't put the wrong template in the wrong size container".
5. **Scale and Scheme do the work.** Modes carry size and colour, so masters stay few. Test dragging a card or menu into a bigger or smaller container.
6. **Agents that check themselves.** "If I have to put out little fires all day every time we build something, we never get anywhere."
7. **Real text styles.** Never Inter; JetBrains Mono stays; no unstyled text.
8. **Full-width sections, not slop.** Real hierarchy: one clear entry point, no voids, no inset padded or transparent cards, no extra nesting.
9. **Self-documenting, nothing stale.** An AI page with the rules, a Systems page, a Scale page above the size pages; show live variables, never typed values.
10. **Don't wait on him.** Low-risk and reversible: decide, do it, log it.

## 2. Already decided

- Scale modes are named `<resolution> <name>` (360 XS, 400 Mobile, 600 SM, 1000 Default, 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega); the `width` variable holds the resolution. No resolution in layer names.
- Scale is set on regions (root, a column) to match their width, never on cards or inside masters. Scheme goes on the thing that should look different.
- Set names are dot-nested like a JS class and end in " Set" (`Icon.Item Set`). Masters sit loose on the root canvas, never framed.
- v2 depends on nothing outside itself (no Big Sloppy instances or variables). Index first, reuse, no duplicate Card or Button; a new master needs his OK.
- Tokens: `fill` replaced `surface`; padding is `pad-x`/`pad-y`, blocks use `gap`, `text-gap` only inside a text stack; `measure` = 720. White is the default scheme; Prime text is white.
- Image cards are full bleed. Cards are white on light gray; wrappers are 5% black. Button defaults to gray. `on-accent` is dark ink on orange.
- Don't edit pages he is hand-editing (Index, Icons, 1920 Desktop). Review tag: yes.

## 3. Contradictions and how to resolve them

| Conflict | Resolution |
|---|---|
| One page per size is a rule (notes rule 8), but he said it "might be a mistake" while liking the sidebar. | Keep the pages (they are the swap test). Give each a small fixed block; don't grow them. Revisit only if he asks. |
| Scale on the region versus a grid of 750px cards under a 3440 root inheriting Mega padding. | Open. Workaround now: set the grid's mode to the card width. A separate content mode and layout mode is the proper fix; have one agent price it before anyone builds it. |
| Previews hold instances, yet "no duplicate content between a preview and the page". | Preview = instances only, one frame at the top; the page below holds masters and docs, not copies. |
| Masters "visible on the root" versus 11,000px pages of scattered masters. | Visible, but beside what they drive, in a fixed order. Few masters is the real cure (Scale and Scheme absorb variants). |
| "Sizing in layer names (Sidebar (Hug × Fill))" trial versus "no resolution in names". | Different things; sizing in names is a trial on one page only. Don't spread it. |
| The readme and notes still mention the old file, Padded/Unpadded modes and 7 modes. | Fix them to 8 modes and v2 only; he said not to document stale values. |
| "Don't wait on me" versus "no major structural changes" and "don't touch pages I'm editing". | Reversible and local: just do it. Structure, tokens and his pages: propose, don't change. |
| The Index page is Big Sloppy content, but the checklist says Index lists every master. | His preview Index replaces it; until then agents don't invent a second index. |

## 4. What he keeps repeating (candidate lint or AI-page rules)

- **Same-on-same fills**: a padded container with its parent's fill. Lint exists; make it a blocker before "done".
- **Unstyled text and Inter**: lint on any text without a style; fix the master, not the instance.
- **Mode on the cards instead of the region**: lint on a Scale mode inside a master or card.
- **Fixed heights on layouts and sidebars**: sidebars are Fill height; hug otherwise.
- **Text wider than `measure` (720)** and `text-gap` used outside a text stack.
- **A new master or a duplicate** (Card, Button, Page card): refuse without Index lookup.
- **Master not on its own page, or inside a frame**.
- **Pages with no title, no root auto layout, no entry point**: every page opens with a title and one root frame.
- **Reports with no screenshot**: no "done" without a judged screenshot; the review passed bad pages because it only looked at one section.
- **Too much nesting and slop**: "simplify" is the recurring word; cap nesting depth and flag single-child wrappers.
