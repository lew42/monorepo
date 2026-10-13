# Style system: state

Brief: [requirements.md](requirements.md). Work happens on branch `worktree/style-system` (worktree `C:\Code\lew42\worktrees\style-system`), merged at the end of each step.

## Decided (all six, in [styles/doc/architecture.md](/framework/styles/doc/architecture.md))
1. ✅ Tokens: `--prime` `--light` `--dark` (+ `--shadow`); `--prim` and `--bg` kept as aliases; renamed by [rename-tokens.mjs](rename-tokens.mjs), 1,305 replacements in 377 files, [manifest](rename-manifest.json).
2. ✅ Grounds: `bg-white` `bg-light` `bg-prime` `bg-dark`, each sets its ink. Ink on prime is dark (white measures ~2:1).
3. ✅ One `.card` (shadow added; a card in a card steps darker). Section = `core/Section`, no new CSS class. No `card()` helper.
4. ✅ Card home: [/framework/ui/card/](/framework/ui/card/); [core/Page/card](/framework/core/Page/card/) marked superseded and linked; [ux/Card](/framework/ux/Card/) links back (`345209874`); core/Layout/card does not exist. Told sidebar-index by page note.
5. ✅ Names: Style library (`/framework/styles/`), Code: CSS, Design — scope line at the top of each.
6. ✅ Figma browse as routed pages: `/framework/ext/Figma/<file>/<page>/compare/<frame>/`; old `?file=` links rewrite in place (`00a855992`).

## Steps
- ✅ Past-work audit: [styles/doc/past-work.md](/framework/styles/doc/past-work.md) (Haiku ×2 over a digest script).
- ✅ Architecture page: shown on [/framework/styles/](/framework/styles/).
- ✅ Slice: Figma colors + palette root (`b4514ecd0`: colors.css 22→0, palette.css 170→4); ✅ pricing + controls (`b94ce87c4`: pricing.css 342→30, controls.css 279→69). Census after slice: 1,226 lines, 87 colours; CSS census before: 2,235 lines, 205 raw colours ([census.jsonl](census.jsonl), [css-lines.mjs](css-lines.mjs)).
- ✅ Extend: features, hero, collab, autolayout (`82baa6e89`), timeline, tasks, typography (`9c4c0320b`). Census after: 322 lines, 4 raw colours (from 2,235 and 205).
- ✅ Layout check 400/1200/1920/3440 (no overflow, 0 page errors); ✅ smoke; ✅ ui + Figma readmes.
- ✅ Review 1: verdict fix, 2 fixes done (`595d46a80`: Controls wraps at 400, Color Schemes full width); 5 notes left for later (below). The review line was lost when another agent's commit (`3a6ae008f`) swept this task.jsonl and the file was reset; review re-run on the fixed head.
- ✅ Review 2: verdict fix, 2 fixes (`ffbe497f4`: prime buttons take dark ink, Color Schemes grids use the `wide` track); smoke fix `1595eed90` (Collab avatars sized in em); `datagrid.js` left to the data-grid fold (`a4b2c447c`).
- ✅ Merged `c61c3c0a4` into michael/dev (smoke skipped: its failures are the 15 `edric`/`alex`/`castin` pages that show "Page Load Error" on main too); key pages checked on the main site, no errors.

## Next (not this task)
- Figma tasks and timeline columns stay side by side at 400 (headings wrap 5–8 lines).
- 15 pages (edric/style/*, edric/framework/app|view, alex/styles/bem, castin/styles) show "Page Load Error" ("reading 'el'" in Page.activate) on main too; not this task.
- Figma pages show their title twice (page title + frame heading).
- Pricing cards stretch to ~830px at 3440; give them a max width.
- ui/card's first demo is a View card; lead with a plain card.
- Commit `9c4c0320b` lacks the Co-Authored-By line (not rebased on purpose); Figma's lowercase helper files `grid.js` `slug.js` `sync.js` want classes.
