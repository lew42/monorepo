# Name, id, slug, title: four words, four jobs

Asked on /live/ (task `ox5xlkmz`, 2026-11-06): "default id = slug of the title (lowercase, hyphens); write a doc page comparing name / id / slug / title".

## The four, side by side

| Word | What it is | Example | Who makes it | Can it change? | Where you see it |
|---|---|---|---|---|---|
| **title** | The words a person reads | `Fix the tab bar` | whoever writes the card or task | yes, any time | the card, the h1, the tab, the link card |
| **slug** | The title made url-safe: lowercase, hyphens, nothing else | `fix-the-tab-bar` | code, from the title (`Task.slug` in [core/Task/Task.js](/framework/core/Task/Task.js)) | it follows the title; whatever kept an old slug keeps it | folder names of tasks |
| **id** | The address of one item inside its list | `fix-the-tab-bar` (older ones: `k2p9x4mq`) | the item tool, when an `add` brings none: the slug of its title, else random (`title_id` in [Servex/agents/page_tools.js](/Servex/agents/page_tools.js)) | never: lines and links point at it | `/live/<id>/`, `{"content":{"<id>":…}}`, `tasks.<id>.complete` |
| **name** | A folder's name: the last part of a sub-page's url | `plan` in `/live/plan/` | whoever calls `pages.add` | only by a scripted rename (`pages.rename`) | the url, the crumbs |

The short version: **the title is for reading, the id is for pointing, the name is the folder, and the slug is how a title becomes a name or an id.**

## Ids: the slug of the title, since 2026-11-06

- **Before** an id the agent did not give was 8 random letters and digits (`k2p9x4mq`). That was decided in [ids-and-paths.md §5](/framework/core/Session/tasks/data-shapes/ids-and-paths.md), which compared seven schemes and rejected slugs (it now carries a "changed 2026-11-06" note) because a renamed card keeps an id that no longer matches its title.
- **The ask** is to make the default id the slug of the title, so `/live/fix-the-tab-bar/` reads as what it is.
- **The trade:** a slug id is readable in a url and a log line. Its cost is a stale id after a rename (the url still says the old words) and a `-2` when two titles match. The id still never changes, so nothing breaks; it only reads wrong.
- **Built** (2026-11-06, by mastermind-page-design, 149a4a5a1; live after the next Servex restart): an `add` that has a `title` and no `id` gets `slug(title)`, with `-2`, `-3` on a clash among its siblings ("Hello card" twice gives `hello-card`, `hello-card-2`); a slug that is a field name (`tasks`, `title`) gets a suffix; an add with no title keeps the random id; ids already written stay as they are. How: `title_id()` in [Servex/agents/page_tools.js](/Servex/agents/page_tools.js), doc [Servex/doc/item-tool.md](/Servex/doc/item-tool.md) "Ids". Not changed: a Task's own `tasks.add("a string")` in the browser still makes a random id.
