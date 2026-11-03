# NavCheck — a page nobody can click to does not exist

The owner's rule (2026-10-23): a page you cannot reach by clicking is not a page. `Server/NavCheck.mjs` is the test for it.

## What it checks

For every page a branch **adds** (a new `page.js` or `page.jsonl`), it loads the page's **parent** on the worktree's own dev server in headless Chromium and waits up to 6 seconds for an `a[href]` whose path is the new page. No link, no pass.

- The parent is the nearest ancestor folder that has a page file (a bare folder is not a page).
- A name in a leaf page's `children:` does not count. A leaf page draws no link for it, and a name in a list is not a click.
- Skipped, because they are history or reached another way: dated session and task folders, any `tasks/` folder, `shots/`, `archive/`, `node_modules`.

## Where it runs

| Where | How | Result |
|---|---|---|
| `merge.mjs` | after the smoke test, for every file the branch adds | an unlinked page refuses the merge and prints each page with its parent |
| by hand | `node Server/NavCheck.mjs <worktree dir>` (add `--base http://127.0.0.1:<port>` if the server is not in `.worktrees.json`) | `LINKED` / `MISSING` per page; exit 0 or 1 |
| the census | `... --since "7 days ago"` | every page the last week added, not just this branch's |
| named pages | `MSYS_NO_PATHCONV=1 node Server/NavCheck.mjs . --urls /framework/ai/merge/ /live/sessions/` | checks exactly those urls (Git Bash rewrites a bare `/path`; the tool refuses a mangled one) |

## Overriding it

`node Server/merge.mjs <worktree> --no-nav "why"` merges anyway and prints the refusal as a warning. Use it for a page that is deliberately reached some other way (a redirect target, a page opened only by a command), and say so in the reason.

## Tests

`node Server/NavCheck.test.mjs` runs on throwaway fixtures: a refusal (a page nothing links to, a page only named in text, a parent that does not load), a pass, and which added files count as pages. It prints the refusal text.

## How the links are drawn

The shared row is `public/framework/ai/AIDashboard/PageNav.js` (pills; the Merge pill carries the number of branches waiting, read from `GET /api/ready-to-merge` through `servex_url()`). The AI dashboard, the sessions page and `/live/` use it.
