# Object-oriented census — the function bags still left, ranked

**CLAUDE.md rule broken by every row:** *one class per file, named for the class; no lowercase `*.js` that exports a pile of loose functions.* The ranking is by importers (how many files import it), because a bag many files lean on is where a class pays back most.

Run it yourself: `node public/framework/code/patterns/function-bag-census.mjs --repo --top 300` (the file is the source of truth; this page is a dated snapshot, 2026-10-14). It scans `public/`, `Servex/` and `Server/` (`Servex/agents` and `Server/plugins` included).

**281 function-bag files before this pass, 276 after.** 131 more `page.js` files hold three or more loose functions (counted apart: a page keeps its helpers beside it until they grow).

## ✅ Made classes in this pass (each a shim at the old path, one commit each)

The old path is now one shim line that re-exports the same names from the class, so every caller keeps working; callers move to `import Class from` as they are touched.

| Old file | Class | Importers | What it is |
|---|---|---|---|
| `ext/Panel/glyphs.js` | `PanelGlyphs` | 10 | the Panel's picture codes and word tables (`WORDS`, `ALIGN`, `glyph`) |
| `ext/layout/controls.js` | `LayoutControls` | 13 | the bar and panel controls: `pick`, `menu`, `knob`, `chips` |
| `ext/DesignTool/score.js` | `DesignScore` | 10 | defect census, grade ladder and page metrics |
| `ai/AITask/cost.js` | `AICost` | 12 | what a task cost: `money`, `total`, `breakdown` |
| `ext/Ask/edit.js` | `EditSwitch` | 21 | the one edit-mode switch, now with its state as statics |

## ⬜ The ranking — top 40 still open

Class names are the proposed ones, picked from each file's job (checked against the source for the top ten). Files under `core/new/1/site/` are the prototype tier of `core/`: moving them is ask-first (CLAUDE.md "Major surgery"), so they are listed, not converted.

| # | File | Importers | Exports | Lines | Should be |
|---|---|---|---|---|---|
| 1 | `core/new/1/site/ui.js` | 177 | 2 | 13 | SiteUI (core/new prototype tier: ask-first, 177 callers) |
| 2 | `ext/markdown/md.js` | 47 | 1 | 180 | Markdown (`Markdown.render`) |
| 3 | `core/new/1/site/nav/ui.js` | 30 | 1 | 27 | NavUI (prototype tier) |
| 4 | `core/new/1/site/compound/recipe.js` | 29 | 3 | 27 | Recipe (prototype tier) |
| 5 | `ext/demo/demo.js` | 29 | 2 | 148 | Demo (7 fns; the `demo()` factory stays the default export) |
| 6 | `ui/parts.js` | 27 | 2 | 22 | UIParts |
| 7 | `Servex/home.js` | 26 | 2 | 41 | ServexHome |
| 8 | `styles/layouts/web.js` | 22 | 1 | 153 | WebLayouts |
| 9 | `core/new/1/site/deep/probe.js` | 21 | 4 | 82 | DeepProbe (prototype tier) |
| 10 | `util/source/source.js` | 19 | 4 | 83 | Source |
| 11 | `styles/sections/tone.js` | 17 | 2 | 82 | ToneSection |
| 12 | `core/new/1/site/urls/ui.js` | 17 | 2 | 37 | `Ui` (name to confirm) |
| 13 | `core/new/1/site/patterns/recipe.js` | 17 | 1 | 34 | `Recipe` (name to confirm) |
| 14 | `dev/servex_url.js` | 17 | 1 | 22 | ServexUrl |
| 15 | `public/imagine/paging/blocks.js` | 15 | 12 | 228 | PagingBlocks |
| 16 | `ai/AITask/stats.js` | 15 | 12 | 159 | AIStats |
| 17 | `public/imagine/paging/templates/families.js` | 15 | 1 | 574 | TemplateFamilies |
| 18 | `core/new/1/site/forms/this_file.js` | 15 | 1 | 26 | `ThisFile` (name to confirm) |
| 19 | `ext/Ask/chat.js` | 14 | 2 | 166 | AskChat |
| 20 | `ext/grip/grip.js` | 14 | 1 | 156 | Grip |
| 21 | `Servex/ext/openrouter/provider.js` | 13 | 15 | 332 | OpenRouterProvider (19 fns: the clearest class in the list) |
| 22 | `public/arya/lib/ui.js` | 12 | 6 | 69 | AryaUI |
| 23 | `ext/Refine/engine.js` | 12 | 3 | 263 | RefineEngine |
| 24 | `ext/highlight/highlight.js` | 12 | 1 | 312 | Highlight |
| 25 | `core/new/1/site/forms/field.js` | 12 | 1 | 40 | `Field` (name to confirm) |
| 26 | `core/new/1/site/async/lab.js` | 11 | 5 | 97 | `Lab` (name to confirm) |
| 27 | `core/new/1/site/a11y/ui.js` | 10 | 11 | 152 | `Ui` (name to confirm) |
| 28 | `ext/demo/stage.js` | 10 | 7 | 262 | DemoStage |
| 29 | `core/new/1/site/versus/ui.js` | 10 | 6 | 183 | `Ui` (name to confirm) |
| 30 | `core/new/1/site/content/list.js` | 10 | 5 | 78 | `List` (name to confirm) |
| 31 | `core/new/1/site/content/show.js` | 10 | 4 | 69 | `Show` (name to confirm) |
| 32 | `dev/DevBar/parts.js` | 10 | 3 | 42 | `Parts` (name to confirm) |
| 33 | `public/alex/ui/docs.js` | 10 | 2 | 31 | `Docs` (name to confirm) |
| 34 | `ext/files/files.js` | 9 | 7 | 219 | Files (tree, nest, mark_lines) |
| 35 | `public/imagine/blogx/posts.js` | 9 | 4 | 175 | `Posts` (name to confirm) |
| 36 | `public/layouts/labs/blogx/posts.js` | 9 | 4 | 175 | `Posts` (name to confirm) |
| 37 | `Servex/agents/tiers.js` | 9 | 3 | 43 | `Tiers` (name to confirm) |
| 38 | `core/new/1/site/motion/ui.js` | 9 | 2 | 84 | `Ui` (name to confirm) |
| 39 | `ext/layout/layout.js` | 9 | 1 | 95 | `Layout` (name to confirm) |
| 40 | `core/track/track.js` | 9 | 1 | 44 | `Track` (name to confirm) |

The other 236 files have eight importers or fewer; run the script for them. By area: `ext` 85 · `core` 66 · `public` 36 · `ai` 24 · `styles` 19 · `Servex` 18 · `dev` 18.

**What the list says:** the heaviest rows are in `core/new/1/site/` (ui/recipe/probe helpers copied into prototypes: one decision, "adopt or retire that tier", would clear the top of the list), and the next group (`md`, `demo`, `parts`, `web`, `source`, `provider`) are real service objects that want a class and a name, not a rewrite.

## Done properly? A spot check of ten modules landed in the last two weeks

Checked by script (readme present, relative links resolve, classes named in `architecture.md` exist in code) and by opening each page headless against the worktree server.

| Module | Readme | Page opens | Classes in the architecture doc exist | Note |
|---|---|---|---|---|
| `ext/Shots` | yes | yes | yes | |
| `ext/Query` | yes | yes | yes | |
| `ext/DataGrid` | yes | yes | yes | `AISessionsPage`/`AISessionView` live in `ai/AISession`, named as the first users |
| `core/Property` | yes | yes | n/a | no `doc/`: short enough that the readme is the whole story |
| `core/Page/Template` | yes | yes | n/a | same |
| `ext/Refine` | yes | yes | yes | |
| `ux/Inbox` | yes | yes | yes | its classes live in `core/Page/ext/Inbox/`; the doc links there |
| `ext/JSONL` | yes | yes | yes | |
| `ext/Chat` | yes | yes | yes | |
| `ux/Content` | yes | yes | yes | |
| `ai/AISession` | **missing** | **404** | n/a | **fixed on the spot:** added `readme.md`, `page.js`, and listed it in `ai/page.js` `children` |

Verdict: nine of ten were sound. The one gap was a 15-class family with no readme or page.
