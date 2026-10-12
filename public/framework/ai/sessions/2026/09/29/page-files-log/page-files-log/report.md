# Each folder lists its own files: the detail

![The md/ page, its list read from each folder's own log](md-1920.png)

## The shape
- A **jsonl page** (every AI card, core/Page/jsonl/) keeps its file lines in its own `page.jsonl`: loading the page gets the list for free.
- **Every other folder** lists its files in `files.jsonl`. It changed from `page.jsonl` to match page-system-2's rule that a `page.jsonl` means "this folder is a page".
- A file added gets `{"file": "x"}` appended, and a removed one gets `{"file": "x", "gone": true}`. Nothing is ever rewritten.
- An empty folder gets no list. The insides of task folders get none either.

## What it cost, and why the files are tracked
Every new file now also changes a tracked list. They are tracked because the live site is static: a list made by the dev server would never reach it, which is why `directory.json` never worked there. `merge.mjs` now merges `.jsonl` files by keeping both sides' lines.

## Smoke test, by hand (merge.mjs listed 2,420 pages and crashed)
/framework/, /framework/ai2/, /framework/core/Page/, /framework/core/Page/md/, /framework/core/Page/jsonl/, /framework/ext/files/, /framework/ext/files/fs/, /framework/ext/drawer/, /framework/dev/DevBar/, /imagine/cms/json/, /framework/ai/2026-09-29/, and one card. Links were followed one level deep: 59 passed.

## Left, on purpose
- The Router uses a list only when something has already loaded it: fetching one for every folder on every route would cost too much.
- Search, Omnibox, the AITask dashboard and Research still read directory.json.
- Deleted empty folders: [deleted-folders.txt](deleted-folders.txt).

