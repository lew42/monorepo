# Figma and code: what came back, the token link, and whether to mock up in Figma

Computed by `node Server/figma-roundtrip.mjs` (the counts and tables below are rewritten by it, never typed). Asked by the owner 2026-10-13 ([the words](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-4.md)).

## The answer in four lines

- **Little has come back.** Of the Figma file's 36 pages, 6 have code: the ones that became code are the controls, layouts and button bar on [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/), the title-layout and icon docs, the guide, and (older) the Palette pages built from the owner's pages 1-8.
- **The tokens are half-linked.** Colours match by name; spacing is a different system (Figma fixed per mode, the site fluid). The map is [tokens/map.json](/framework/ext/Figma/tokens/), shown on that page.
- **Nothing on the site loads the Figma tokens yet** (`tokens.css` is opt-in), so a map exists but no alias does.
- **Next step** is in [next.md](./next.md).

## Counts

<!-- counts -->
Figma file lists **36** pages; this inventory lists **36**; they agree. Coded **6**, doc only **17**, not coded **13**. Cross-check: the Figma agents' reports name 35 of those 36 page ids (the rest are named by title only). Tracked in `data/` since 2026-10-10: 8 pages, **8** no longer in the file (the owner's Page 1-8); 11 site pages were built from them (11 from nodes no longer in the page list: the Palette sections are frames inside the old Page 7).

Tokens: 24 Figma variables: 5 same name and value, 2 same name other value, 9 same role other name, 6 Figma only, 2 skipped.
<!-- /counts -->

"Coded" means a `.js`, `.css` or `.mjs` file under `ext/Figma/` names the page's node id or `DS n.n` tag; "doc only" means only a `.md` does. The scan is conservative: `DS · 1.1 Icons` is really coded as `.fig-icon` (see [controls.md](./controls.md)) but only the doc names it.

## Every Figma page

One row per page, with the code that names it: [figma-pages.md](./figma-pages.md) (generated).

Code to Figma runs the other way through `generate_figma_design`: [capture.md](./capture.md) (our page into Figma works; flex survives as auto layout).

## Figma variable to site property

<!-- tokens -->
| Figma variable | Site property | Relation |
|---|---|---|
| `prime` (Colors) | `--prime` | same name, same value |
| `light` (Colors) | `--light` | same name, different value |
| `dark` (Colors) | `--dark` | same name, different value |
| `error` (Colors) | `--error` | same name, same value |
| `ok` (Colors) | `--ok` | same name, same value |
| `warn` (Colors) | `--warn` | same name, same value |
| `text` (Text) | `--ink` | same role, other name: body text |
| `muted` (Text) | `--subtle` | same role, other name: second text colour |
| `surface` (Text) | `--surface` | same name, same value |
| `accent` (Text) | `--prime` | same role, other name: the accent; the site never swaps it per ground |
| `on-accent` (Text) | - | figma only: no site token: text on an accent fill is picked per component |
| `pad-x` (Resolution) | `--pad-card` | same role, other name: card inset; fluid on the site, fixed per mode in Figma |
| `pad-y` (Resolution) | `--pad-card` | same role, other name: same |
| `radius` (Resolution) | `--radius` | same role, other name: 0.5em on the site, 4/4/6px in Figma |
| `gap` (Resolution) | `--gap` | same role, other name: fluid on the site |
| `section-pad-y` (Resolution) | `--flow` | same role, other name: vertical flow between sections; fluid |
| `h1-size` (Resolution) | - | figma only: no site token (the site has no h1-size) |
| `section-pad-x` (Resolution) | `--pad` | same role, other name: page edge pad; fluid |
| `btn-pad-x` (Resolution) | - | figma only: no site token (the site has no btn-pad-x) |
| `btn-pad-y` (Resolution) | - | figma only: no site token (the site has no btn-pad-y) |
| `small-pad-x` (Resolution) | - | figma only: no site token (the site has no small-pad-x) |
| `small-pad-y` (Resolution) | - | figma only: no site token (the site has no small-pad-y) |
| `size` (Resolution) | - | skipped: unfinished experiment in the file |
| `ref` (Resolution) | - | skipped: unfinished experiment in the file |
<!-- /tokens -->

Site-only colour tokens with no Figma variable: `--prime-ink`, `--line`, `--wash`, `--tint`, `--hot`, `--shadow`. Values and the measured gaps at 390 / 1920 / 3440: [token-sync.md](./token-sync.md).

## What the Figma agents said (2026-10-13)

- **ds-lists-cards:** nothing it built (Lists & rows, Cards & containers) has been coded. It asks for one file saying which CSS variable each Figma variable becomes (that is `map.json`), a decision on fluid vs fixed Resolution, and a home for the pieces with no token: the 10% black/white insets, the 50% scrim and the hairline divider.
- **web-ground:** nothing on the site aliases a Figma variable; only `ext/Figma/tokens/` uses `--fig-*`. (Its guess that `text`, `muted`, `accent` have no site twin is corrected by the map: `--ink`, `--subtle`, `--prime`.)

## Is mocking up in Figma the way to go?

**Recommendation: use Figma for the visual surface, but keep code the single source of truth for tokens and for any page that ships.** Figma gives you something to look at and click through, and the agents can read it with the MCP tools. But the code already renders from tokens and a page tree, so a design that lives only in Figma is a second source of truth that drifts (dark is `#675F56` there and `#42404B` here; spacing is fixed there and fluid here). So tokens flow from code to Figma (the map is the one place both agree), and a Figma frame is approved, then coded straight away, as the 2026-10-12 process says. The alternative is skipping Figma and mocking up as live pages checked with Shots: cheaper per page and it never drifts, but there is no canvas to rearrange. Choose that if the Figma round trip feels slower than writing the page.
