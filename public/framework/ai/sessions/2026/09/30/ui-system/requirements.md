# UI: a System class, and /framework/ui/ as the library of approved blocks: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

**Queued for after the weekly reset (10 PM, 2026-09-30).** The owner: "when we have time… running out of tokens".

## Asks
1. **A `System` class** (core, capital S): more than a page. A whole system of rules plus its actions and skills. /framework/design, /framework/code, /framework/ui and /framework/ux are instances of it, so an upgrade to the class reaches every system for free. They share the same docs top-tabs. mastermind-servex (the architect) reviews the shape, because design-code just built two of these pages by hand.
2. **/framework/ui/ is the library of approved building blocks:** layouts, widgets, cards, the HTML and which classes to use.
   - Every component is composed only of approved blocks, so there are no unapproved layouts.
   - A new component is fine, but it is built from approved blocks. If a block is missing, the agent requests one.
   - Reuse, never one-off.
3. **Class pills.** Show the CSS classes on each component as small tags, e.g. a section label naming a layout area (two-column, three-column) or a card's `pad`/`flex`. Seeing the classes is how you learn to reproduce a look.
   - Document classes, content order, colors, spacing, sizing and scale: the concepts, not the JS syntax.
   - Still show the real source beside each template, as the source of truth.
4. **Masonry preview grid:** mixed heights and widths with no voids, the smallest items at the top, and the order running across and then wrapping. It works at the four target widths (~400, ~1000, 1920, 3440). An earlier version may exist outside this repo.
5. **Previews at their native width, scaled:** a zoom that fits a set number per row (dynamic), with a manual slider, so a 3440 layout previews properly.
6. **The tree navigation (asked before):** the left rail previews the siblings and the right rail previews the children, so you drill down through variations. Check whether it was built.
7. **The /framework/ui/card/ page:** the demo renders about 2000 × 200 px and there's wasted space. Screenshot it at 3440, find the empty areas, and make it compact and meaningful. Keep the code beside the template. Every UI kind gets an optimal width.
8. **A tree UI with icon items** (seen in the dev bar): make it a library block if it isn't one.

## How a page becomes a System (checked 2026-09-30)
No swapping is needed. A page is already built as the right class from the start:
- **page.js:** `export default new System({...})`.
- **page.jsonl only:** line 1 carries `{"class": "/framework/core/System/System.js"}`. `PageLog` loads that module BEFORE it constructs anything (`core/Page/Log.js` about line 302, `log_class()`), and falls back to a plain Page if the module is not a Page subclass. The AI 2 cards already use this: `{"class": "/framework/ai2/card.js"}`.

So `System extends Page`. It starts as little more than the shared template: the top tabs, the readme chain, and the concept tiles. Methods get added as they become clear. **/framework/ai/ becomes a System too**, alongside design, code, ui and ux.

## Backburner (don't build)
- The demo stage overhaul (hover and the sidebar launch).
- An editor that edits the template source in place.

## Rules
Foundational, so no hard cap: plan first, post it on a card, and take screenshots at 400, 1200, 1920 and 3440. Coordinate with mastermind-servex (skills) and with what design-code built at /framework/design/ and /framework/code/.

## Added 2026-09-30 (15:55): see owner-words.md, last section
9. **Task pages** (`/framework/ai/<date>/<task>/`): redesign them once the System page exists.
   - The Report tab's grey checkboxes are markdown `- [x]` items that marked renders as disabled inputs. They don't link anywhere and aren't self-evident.
   - The progress bars stretch across 3440.
   - A report is arbitrary structured content, not a fixed template.
10. **The docs answer with a link.** Every UI piece has a findable name and page, e.g. "the mobile rail". The answer to "what's it called?" is a link.


## Added 2026-09-30 (23:30): weight on every object
11. **Every object has a weight, default 1** (the owner, 2026-09-30). Not just pages: cards, messages, names in a decision, layout templates. A new object starts at 1. Below 1 diminishes it, above 1 amplifies it.
    - **Build on `core/Page/weight/` (`weight.js`).** It already gives pages a weight of 1 by default, with references and a manual number, and shows two undecided A/B ways to display it. Generalize it to any object; don't start a second system.
    - **Show it on a gentle sliding scale, never 1:1.** For example, a scale like `1 + 0.15·log2(weight)`, clamped to about 0.85–1.25 in size or emphasis, so the important things look a little bigger and bolder and the rest a little smaller. A weight never blows out the layout. Pick one and show it on a demo with real data.
    - **The same number everywhere:** template weights (proposal-flow), Inbox importance, and decision ratings (openrouter-harness phase 2, item 5, where each model's rating is a weight around 1).

## Added 2026-09-30 (23:58): weight is part of the Page system
12. **The weight system lives in the core Page docs** ([/framework/core/Page/weight/](/framework/core/Page/weight/), already a child of core/Page). Any page can have a weight. Its job is to make the system converge on the most important things. It could be called importance, but importance is one ingredient among several.
    - **A page ranks and sorts its children by weight,** and their SIZE follows tiers (the owner's first cut):
      - weight > 100: an H1-level item;
      - > 10: H2;
      - > 1: a normal item;
      - < 1: a small item;
      - **< 0: an anti-pattern.** It isn't just irrelevant, it's something to avoid. It goes below a line, marked as "avoid".
    - **Reconcile with the existing design:** `weight/doc/design.md` ADDS references to a base, and explains why it adds rather than multiplies. The owner's model is a multiplier around 1, with sub-weights multiplied together. Decide one formula (for example, references add to the base, and the sub-weights multiply it), record the alternative, and update the doc.
    - **Contextual weights: later, as a documented option, not built.** A page sits in many lists and may deserve a different rank in each. The options are named weights per context (keyed by a page, a keyword or a list), or one weight plus per-list overrides stored on the list rather than the page. Default for now: one weight per page, meaning its rank among its peers.
13. **A System page versus a class doc page** (the owner, 2026-10-01). The Page CLASS is also a whole system. A class doc page's main feature is its top tabs, so a System, which has top tabs, may REPLACE the class doc page. Decide: is `System` the doc page for any class that is really a system (Page, View, App)? Record the alternative.
