# UI library, step 4: widen it

**Budget:** $15 · **Model:** Sonnet · **Worktree:** `C:/Code/lew42/worktrees/ui-library` (branch `worktree/ui-library`, dev server http://localhost:58510/) · **Parent:** @mastermind-ui-library

The library at [/framework/library/](/framework/library/) already browses two collections, `ui` and `figma`. Read `public/framework/library/readme.md`, `doc/decisions.md` and `Library.js` first. Plan and decisions: [../plan.md](../plan.md). The first slice's brief: [../build/requirements.md](../build/requirements.md).

## Deliverables

1. **Four new collections**, added as `new Collection({...})` entries in `Library.collections()`, in this filter order: ui · ux · sections · layouts · templates · figma.
   - **ux**: the declared children of `/framework/ux/page.js` (`children: "Auth Wizard …"`). optimalWidth 1000. Render each item's `preview()` thumb with the zoom removed, which `Item` already does. Add `specimen` only where a page already has a one-line render function, and never rewrite a ux page.
   - **sections**: the default exports of `styles/sections/*.js` (hero, navbar, features, pricing, …), as listed in `styles/sections/page.js`. Each one is a bare render function, so it becomes the `specimen`. optimalWidth 1920, `no_parent_padding` (they are bands that bleed). Each section page's tones (`tone.js`) are its variants, if that is simple. Otherwise leave variants empty and say so.
   - **layouts**: `LayoutCatalog.entries` (`styles/layouts/catalog/LayoutCatalog.js`). Render each one as its catalog screenshot (`catalog/shots/`) at full width, with an "Open the demo →" link to `entry.demo`. optimalWidth 1920. Write this down as a decision in `doc/decisions.md`, with the alternative: an `<iframe>` of the live demo (live, but heavier). Related = entries with the same score, or skip related.
   - **templates**: the `Template` subclasses under `core/Page/Template/` (today only `BigCard`). Render one live instance per template the way `TemplateDemo.js` does. optimalWidth 1000.
2. **The wall, decision 5 (span by width).** This was not built in the first slice. Add `?at=<collection>&view=wall`: the collection's items in one CSS grid, where each card's column span comes from its optimalWidth (400→1, 1000→2, 1920→3, 3440→4) with `grid-auto-flow: dense`. Each card is scaled by the same zoom rule the Rail uses: reuse Rail's card method rather than a second card. A "wall / browse" toggle sits next to the collection chips. Every CSS rule goes in a layer, and scaling uses `zoom`, never `transform`.
3. **Related, generalised:** each Collection may define `related(item)`. ui keeps its BANDS rule; the others return siblings, minus the item itself, capped at 6.
4. **Docs:**
   - Update `readme.md` (one line per collection).
   - Update `doc/decisions.md` with the new decisions and their alternatives.
   - Each source page (ux, sections, the layouts catalog, Template) gets one line linking `/framework/library/?at=<collection>`, so a reader can find the library from where they already are.

## Checks

- Run smoke clean: `node Server/smoke.mjs C:/Code/lew42/worktrees/ui-library --base http://localhost:58510 /framework/library/ "/framework/library/?at=ux" "/framework/library/?at=sections" "/framework/library/?at=layouts" "/framework/library/?at=templates" "/framework/library/?at=ui&view=wall"`. The run must have no console errors, and every item in every collection must load, so click through them headless.
- Take screenshots at 400 / 1200 / 1920 / 3440 of `?at=sections/hero` and `?at=ui&view=wall` into `../widen/shots/`.
- No PaddingContract misuse on any item. If a real one shows up, fix the item's flag rather than the check, and list it in your report.

## Rules

- Commit in the worktree with a `Co-Authored-By:` line naming your own model. Don't merge. Never stash, reset or checkout.
- One class per file. Every CSS rule in a layer. No new npm deps. No DOM after an await without capturing the box.
- Don't change `core/Page/Template/*` code, which belongs to page-templates. Read and instantiate it only.
- Report to the parent in under 10 lines: what landed, what was skipped and why.
