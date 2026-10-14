# Archive: layout pages the navigation model retired

Variations of the four kinds [the navigation model](/framework/core/Page/navigation/model/) keeps. Moved here by `git mv`, never deleted.

- `retire.mjs --plan` lists every retired folder: pages, links in, imports that would break. `--apply` moves only the ones nothing links to; `--undo` moves them back.
- `manifest.json` is every move, old path to new path.
- A folder still linked from elsewhere stays where it is until those links change; the plan names them.
