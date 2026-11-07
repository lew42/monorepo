# Name, id, slug, title: four words, four jobs

Asked on /live/ (task `ox5xlkmz`, 2026-11-06): "default id = slug of the title (lowercase, hyphens); write a doc page comparing name / id / slug / title".

## The four, side by side

| Word | What it is | Example | Who makes it | Can it change? | Where you see it |
|---|---|---|---|---|---|
| **title** | The words a person reads | `Fix the tab bar` | whoever writes the card or task | yes, any time | the card, the h1, the tab, the link card |
| **slug** | The title made url-safe: lowercase, hyphens, nothing else | `fix-the-tab-bar` | code, from the title (`Task.slug` in [core/Task/Task.js](/framework/core/Task/Task.js)) | it follows the title; whatever kept an old slug keeps it | folder names of tasks |
| **id** | The address of one item inside its list | `k2p9x4mq` today | the item tool, when an `add` brings none (`stamp_ids` in [Servex/agents/page_tools.js](/Servex/agents/page_tools.js)) | never: lines and links point at it | `/live/<id>/`, `{"content":{"<id>":…}}`, `tasks.<id>.complete` |
| **name** | A folder's name: the last part of a sub-page's url | `plan` in `/live/plan/` | whoever calls `pages.add` | only by a scripted rename (`pages.rename`) | the url, the crumbs |

The short version: **the title is for reading, the id is for pointing, the name is the folder, and the slug is how a title becomes a name or an id.**

## Ids: random today, slugs asked for

- **Today** an id the agent does not give is 8 random letters and digits (`k2p9x4mq`). That was decided in [ids-and-paths.md §5](/framework/core/Session/tasks/data-shapes/ids-and-paths.md), which compared seven schemes and rejected slugs because a renamed card keeps an id that no longer matches its title.
- **The ask** is to make the default id the slug of the title, so `/live/fix-the-tab-bar/` reads as what it is.
- **The trade:** a slug id is readable in a url and a log line. Its cost is a stale id after a rename (the url still says the old words) and a `-2` when two titles match. The id still never changes, so nothing breaks; it only reads wrong.
- **Proposed** (sent to the owner of the item tool, mastermind-page-design, 2026-11-06): an `add` that has a `title` and no `id` gets `slug(title)`, with `-2`, `-3` on a clash among its siblings; an add with no title keeps the random id; ids already written stay as they are. Until that lands, an agent that wants a readable id passes `id` itself (`{"content":{"add":{"id":"tab-bar","title":"Fix the tab bar"}}}`).
