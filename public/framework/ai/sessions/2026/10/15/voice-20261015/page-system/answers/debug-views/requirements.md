# Census: what already renders a live instance as a UI

Budget: $1.50. Load the `minion` skill first. Read-only: you write only `answers/debug-views/out.md` and this folder's `task.jsonl` (through `node .claude/hooks/append.mjs`, run from `C:/Code/lew42/monorepo`). The owner's ask is question 5 in section A of `../../../ask-ea3d4c58.md`: render any instance (its class, name, path, children, items, props) as a UI, maybe in the dev-shell sidebar as an admin/dev mode.

Find what already exists. Start points: `public/framework/core/Page/object.js` (`page_object(page)`), `DefaultView`, the CLAUDE.md "Show the class" rule (a debug view of the live instance), `public/framework/ai/doc/classes.md`, `ext/Doc`, and the dev shell / DevBar sidebar. Search with `rg` scoped to `public/framework` (never `find /`): `DefaultView`, `page_object`, `debug view`, `inspector`, `instance tree`, `DevBar`.

**Output** `out.md`, under 30 lines: one table `| piece | file:line | what it shows | where it is used (count) |`, then one line on the dev-shell sidebar (which file builds it, does it have a tab/mode slot), then one line: the smallest step to "click any instance, see its tree". "None found" is a fine answer for any row; prove it with the grep you ran. Never kill or restart the dev server, never drive the owner's tabs, never stash. Do not commit.
