# OwnCSS — a page uses the kit, it does not add CSS of its own

A page should be built from the kit: `framework.css`, `styles/`, `ui/`, and the `core/`, `ext/` and `ux/` classes. Writing new CSS for a page instead is what keeps every page looking slightly different. `Server/OwnCSS.mjs` counts that CSS and stops it from growing. This is step 5 of the [ui-kit plan](/live/plan/ui-kit/).

## What counts as "own CSS"

One **declaration** (`prop: value`) in either place:

- a `.css` file outside the kit;
- a `css(\`…\`)` literal in a `.js` file outside the kit.

A `page.js` or `page.css` counts wherever it sits, inside the kit folders too. Session folders, `archive/`, `shots/` and `node_modules` are skipped.

## Where it runs

| Where | How | Result |
|---|---|---|
| `merge.mjs` | for every file the branch adds or changes | a file whose declaration count goes **up** refuses the merge and is listed with its before and after counts; `--own-css "why"` merges anyway, with a loud warning in the output |
| by hand, on one branch | `node Server/OwnCSS.mjs --diff compliance/dev <branch>` | exit 0, or 1 with the list |
| the census | `node Server/OwnCSS.mjs --census [--top N] [--json]` | every folder's own CSS, most first; report only |

Only growth is refused. The 15,130 declarations that existed on 2026-11-10 stay until someone moves them into the kit. A branch that shrinks a file's CSS always passes.

## Watch out

- The count is a regex, not a CSS parser. A `prop: value` that ends in `;` or `}` counts; a selector such as `a:hover {` ends in `{`, so it never matches. Across `public/live/LivePage.css` the census found 484 declarations, against 500 semicolons in the file.
- A rule moved from a page into `ui/` is a net gain for the page and passes. That move is exactly the fix the refusal asks for.
