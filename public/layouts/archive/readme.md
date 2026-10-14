# Archive: layout pages the navigation model retired

[Live page](/layouts/archive/) · back to [Layouts](/layouts/). The [navigation model](/framework/core/Page/navigation/model/) keeps four kinds of layout: a **document** (a padded reading column), a **document in the app** (the left tree beside it), a **workspace** (fills, panes, no padding) and a **wall** (a grid of cards for an index page). Every other layout is a variation of these; it moves here by `git mv`, never deleted.

## What is here

- [`labs-trees/`](/layouts/archive/labs-trees/): Family tree, from `layouts/labs/trees`.
- [`manifest.json`](manifest.json): every move, old path to new path.

## Use

- `node public/layouts/archive/retire.mjs --plan`: run from the repo root. Lists each retired folder with its page count, the pages that link to it, and the imports that would break.
- `--apply` moves only the folders nothing links to; `--undo` moves everything in the manifest back.
- A folder still linked from elsewhere stays where it is until those links change; the plan names them. [`retire.mjs`](retire.mjs) holds the retire list.
