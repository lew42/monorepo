# System, theme, outcomes: the process words, and the Index as the design system (research, 2026-11-17)

Answers question E (and F) of [the brief](../brief-2026-11-17.md); the owner's words are [section 3](../owner-words-2026-11-17.md#3-system--theme--outcomes-the-index-as-the-design-system-root-21). No Figma file was touched. **V** = verified by reading the source; **R** = reported by a secondary source.

## The answer

The industry splits design work into three layers, and our files already have that shape:

1. **The system** (the library): foundations (tokens, text styles) plus components (the reusable masters).
2. **The theme**: variable modes that re-skin the system (brand colour, light and dark, density).
3. **Outcomes**: real pages and screens, built in a separate **consumer** (or **product**) file from instances only, with no masters in them.

A design becomes a master only when it repeats or must stay in sync. A page designed once is a frame of instances. So the owner's instinct holds: "pick the colour mode for each section, … and boom, your design's done" is the normal outcome workflow, not a shortcut.

## The standard words

- **Atomic Design** (Brad Frost) has five levels: atoms, molecules, organisms, **templates** (the layout with placeholder content) and **pages** (a template filled with real content, used to test the system). [V] Pages, Frost's last level, are our *outcomes*.
- **Foundations → Components → Patterns → Examples** is the usual page list of a library file. [R, several guides] Figma's own Simple Design System (SDS) uses *primitives* (cannot be split further), *compositions* (example layouts) and *layout* components. [V]
- **Library file vs consumer (product) file:** "product files contain actual design work and consume the library … no main components, only instances. Never put working designs in the library file." [R] Figma's own guide says only that larger teams keep components in separate design system files. [V]
- **Theme = modes.** The usual setup has one variable collection per axis of variation: Primitives (no modes, hidden from publishing), Semantic (Light and Dark), then Brand or Density as their own collections. [R, several] Our **Colors** is the primitives, **Scheme** is the semantic theme, and **Scale** is a density-by-width axis.
- **Recipes** (Frost, *The Design System Ecosystem*): product teams compose core pieces into "recipes"; the system "doesn't have to own … every bit of UI", and a recipe that proves itself can **"graduate"** into the core. [V] Recipes are the middle ground between a one-off and a master.

## The three layers in our files

| Layer | What it is | Where it lives (ours) | Who edits |
|---|---|---|---|
| **System** | Tokens, text styles, the few masters (Card, Button, Icon.Item, Image, layouts), and the **Index** as their map | Variables and text styles in [Lew42 Design System](https://www.figma.com/design/hbolzQ3Xnc78rhxAPj8xK2) (the published library); masters and the Index in [Lew42 v2](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2) | Owner approves; an agent edits the master only after its brief names it, then lint and a reviewer |
| **Theme** | The mode values: Scheme (White, Light gray, Prime, Dark), Colors (`prime`, `dark`…), Scale values per mode | Variable collections in the library file; shown live on the Scale page and the Scheme strip of the Index | Owner (a value edit re-skins everything, so no per-page work) |
| **Outcome** | Real pages and screens: frames of instances, a Scheme mode per section, a Scale mode on the root and on each region | A consumer file ([Claude November 2026](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f) today; one file per app later), then the site | Any agent, freely; nothing here is a master, and nothing here is previewed per width |

## Master or one-off

- **Make it a master when it repeats or must stay in sync.** Figma: "once you have elements repeated across multiple screens"; the usual rule of thumb is "the second time you use something". [V Figma, R rule of thumb] Our [rules.md](../rules.md) rule 6 already says this.
- **Include what's shared, omit what's not.** The system should "curate, not innovate": answers go in "when the questions are no longer interesting — proven out in product". [R, Curtis and Frost] So **an outcome design is never a master until it repeats.** A good one-off can graduate later.
- **Don't detach as a workflow.** Detaching cannot be undone and the copy misses later fixes. [R, Salesforce] The owner's "default card you break apart" is therefore a *starter*, not a system piece: fine for a one-off, but if it repeats, re-master it.
- **Few properties, compose the rest.** Curtis, *Configuration Collapse*: "make the common configurable, make the uncommon composable". Keep state, appearance and size as properties; drop show/hide booleans, padding and direction props in favour of slots and ready-made examples. A Card that must serve everything should be "an unopinionated container". [V] That backs a Card with one Content slot over a Card covered in toggles.
- **The first item of a repeated grid is the master** is a fine local convention for an outcome. It keeps one-off grids in sync without adding anything to the system.

## How agents read a design system (2025–2026)

- **Figma MCP:** `search_design_system` finds components, variables and styles across the connected libraries by text; `get_design_context` turns a selected node into code plus context; `create_design_system_rules` writes a rules file for the agent. [V, Figma docs]
- **Code Connect** maps each Figma component to its code. Figma measured +1 code quality (on a 1–4 scale), 29.5% fewer tokens and 19.6% less time. "The single biggest factor … [is] how much of the designs are comprised of design system components." With it, agents stopped "fabricating" components. [V, Figma blog] **The lesson for us: outcomes built only from instances are what make agents reliable.**
- **Figma Make kits** use a `guidelines/` folder. `Guidelines.md` is read first: it introduces the system and sets the reading order, then links `setup.md`, `foundations/` and `components/`. Write in imperatives ("Do not use small text for anything except captions"). **"Multiple short guidelines files are better than a few large files."** [V, Figma help]

## "The Index as the design system": spec

1. **One item per approved master**, shown as an instance, never a copy. Its name is its search name (`Card`, `Button`, `Icon.Item`), so `search_design_system` and the Index agree.
2. **Approved only.** A Draft item is not on the Index. "On the Index" means "allowed in outcomes".
3. **One home per thing.** Each item appears once. Clicking it (the main-component link) lands on its own page, where the variants and details live.
4. **Order = the reading order:** Foundations (Scheme strip, Scale, Text, Icons), then Components (Card, Button, Icon.Item, Image), then Layouts (page shell, sections, the 7 from [think-layouts.md](../think-layouts.md)). These are three columns, laid out to about 2:1 (rule 12).
5. **Each item shows only the variants worth choosing between** (Button default and accent), plus one line: what it is for and what to override (text, image, slot).
6. **No permutation grids, no per-size atoms.** Sizes appear only on layouts, and only under the preview rule below.
7. **No explanations on the canvas beyond one line each.** The how-to lives in a text twin: `doc/guidelines.md`, written as Figma's `Guidelines.md` (entry point, reading order, links to short per-topic files such as [rules.md](../rules.md)). The canvas shows; the text tells.
8. **Every item carries its node id in the text twin**, so an agent can `use_figma` / `get_design_context` it without searching the canvas.
9. **An agent's build recipe** is two steps: read `guidelines.md` and the Index, then use instances only, override text, images and slots, and set Scheme per section and Scale per region. A missing piece is a proposal, not a new master.
10. **Lint holds it:** every Index child is an instance of a non-Draft master, and no master appears twice. This is a lint rule to add, per law 7 (compute, don't recall).

## Previews: what to show at which widths

Real systems have **5 or 6 breakpoints**: Material 3 has Compact <600, Medium 600–839, Expanded 840–1199, Large 1200–1599 and Extra-large 1600+ [R, several copies of m3.material.io]; Tailwind has 640, 768, 1024, 1280, 1536 [R]; Bootstrap 576 to 1400 (6 tiers) [R]; Carbon has 5, with a 1584 max [R]. None documents every component at every breakpoint. **8 Scale modes is more than any of them, but modes are cheap; previews are what cost.** Keep the 8 as token values and preview 3.

- **Atoms** (Button, Icon, text): one preview at Default in White. No widths. All schemes appear together once, in the Index's **Scheme strip** (one Card plus a Button on each of the 4 grounds).
- **Components** (Card): the master at Default, plus **one 400 Mobile instance per scheme** (4 narrow instances in a row, about 1700 wide). This is the owner's suggestion, and it is cheap because the instances are narrow.
- **Layouts and sections:** **400 Mobile, 1000 Default, 1920 Desktop.** That is the stack, the default and the one wide case, and it maps to Material's Compact, Expanded and Extra-large. **3440 Mega** gets a preview only on the page-shell layout, to prove the max width holds. 360, 600, 1600 and 2600 stay as modes with no previews.
- **Outcomes:** no previews at all. Design at one width, pick the Scheme per section, and check the rest in the browser.

## Sources

- Brad Frost, [Atomic Design, ch. 2](https://atomicdesign.bradfrost.com/chapter-2/) · [The Design System Ecosystem](https://bradfrost.com/blog/post/the-design-system-ecosystem/) · [Design Systems Q&A](https://bradfrost.com/blog/post/design-systems-qa/)
- Nathan Curtis, [Configuration Collapse](https://nathanacurtis.substack.com/p/configuration-collapse) · [Design System Contribution Criteria](https://medium.com/eightshapes-llc/i-made-this-does-it-go-in-the-system-3b67b9894531) (not opened: HTTP 403) · [Knapsack interview](https://www.knapsack.cloud/blog/nathan-curtis-co-founder-at-eightshapes-balancing-reuse-and-customization-in-ui-design)
- Figma, [Components, styles and shared libraries](https://www.figma.com/best-practices/components-styles-and-shared-libraries/) · [MCP tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts) · [Code Connect in MCP](https://www.figma.com/blog/the-benefits-of-code-connect-in-mcp/) · [Write guidelines for Make kits](https://help.figma.com/hc/articles/43602393097239) · [Slots](https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma) · [Simple Design System](https://github.com/figma/sds)
- File structure: [Atomize](https://atomize.tools/blog/how-to-build-design-system-figma/) · [Design Systems Collective](https://www.designsystemscollective.com/shape-to-system-a-practical-figma-file-structure-for-building-a-design-system-from-scratch-63e1f1b72369) · [Salesforce, Don't Detach](https://www.salesforce.com/blog/figma-component-health/)
- Variables: [Pegasus guide](https://www.pegasusdesignsystem.com/blog/figma-variables-guide) · [Rangle, multi-brand](https://rangle.io/blog/using-figma-variables-to-build-a-multi-brand-design-system)
- Breakpoints: [Material 3](https://m3.material.io/foundations/layout/applying-layout) · [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/layout/breakpoints/) · [Tailwind values](https://1440px.com/breakpoints/tailwind-css/) · [Carbon 2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/)
