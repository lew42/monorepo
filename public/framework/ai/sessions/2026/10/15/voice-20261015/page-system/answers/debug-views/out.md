# Debug views: what already draws a live instance

Read-only census. Greps: `DefaultView`, `page_object`, `inspect(`, `object(`, `InstanceTree` (run under `public/framework`, `*.js`). Counts are import sites unless noted.

| piece | file:line | what it shows | where it is used (count) |
|---|---|---|---|
| `DefaultView` (class) | `ux/Content/Object/DefaultView.js:33` | any object as a tree of `.item` rows: class header, then every own property; objects expand on click | 8 files import it (`audio/Part.js`, `ext/Refine/RefineExplorer.js`, `core/Page/page.js`, others) |
| `view(thing)` | `ux/Content/Object/DefaultView.js:148` | the usual entry point; uses a class's `static View` override if it has one, else `DefaultView` | same files as above |
| `page_object(page)` | `core/Page/object.js:21` | one live `Page` drawn through `view()` | 4 files import it (`core/Page/page.js`, `ux/Content/Object/page.js`, `ux/Content/Object/page/page.js`, `core/Page/object.js`'s own demo) |
| `inspect()` / `InspectCard` | `ux/Content/Object/Inspect.js:62,199` | an object card with nested cards that open on click; skips Map/Set entries | 4 files import it (`ux/Dictate/playground/Playground.js`, `core/Page/Template/TemplateDemo.js`, `ai/classes/Session/SessionClassPage.js`, `ux/Content/Object/page.js`) |
| `object()` / `ObjectCard` | `ux/Content/Object/Object.js:38,177` | a flat property card; the older base that `InspectCard` extends | 3 files import it |
| `InstanceTree` | `ux/Content/Object/InstanceTree.js:14` | the live page hierarchy from `App`; each node has a `view` button for its `DefaultView` | 5 files; mounted by the DevBar "instances" section (`dev/DevBar/tools.js:68-76`, off by default) |
| `static View` override | `ux/Content/Object/page.js:25` | a class's own look, picked up by `view()` | 1 demo (`Widget`) |

**Dev-shell sidebar:** `dev/DevShell/DevShell.js` builds it. The right side reuses the DevBar tab list in `dev/DevBar/tools.js:18-24` (`page`, `layout`, `ai`, `chat`, `screenshots`), so a new tab or mode has a slot there. The `page` tab already holds an `instances` toggle (`tools.js:19`, `68-76`), but the shell only shows `route` and `structure` from it (`DevShell.js:165`).

**Smallest step to "click any instance, see its tree":** add `instances` to the shell's `wanted` list at `dev/DevShell/DevShell.js:165`, then check that a node's `view` button opens its `DefaultView` in place. The header comment says it does; I have not run it in a browser.
