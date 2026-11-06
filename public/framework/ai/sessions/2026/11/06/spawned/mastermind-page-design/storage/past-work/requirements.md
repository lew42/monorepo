Budget: $2

# Past work: page indexes (preview data without loading the page)

Load the `minion` skill, then read `public/framework/ai/skills/past-work/worker.md` and follow it: you are the Haiku searcher. Your task folder is this folder; its task log holds the search lines, as `note` lines wrapping `search` (append.mjs refuses a bare `search` verb; log your `checked`/`find`/`answer` lines wrapped in `note` the same way if they are refused). Card: `/framework/ai/2026/11/06/sub-pages-storage-load-cost-indexes/`.

The owner's words (relayed): "Each page would get an index (e.g. index.jsonl, or the existing files.jsonl) holding only preview data: title, icon, description, metadata. A parent would load only its children's indexes, one level deep, and load the full child on demand. Do a past-work search for earlier indexing discussions and builds: the sessions system (framework/ai/sessions/YYYY/MM/DD, where Session extends Item), the day indexes, files.jsonl, and the AISessionDigest."

Already known (verify it, then go past it): `public/framework/core/Page/doc/index-jsonl.md` (the plan, 2026-11-01, not built) and `core/Page/doc/indexing-2026-10-08.md`.

## Then post cards (what the owner sees)

After your `answer` lines, post one card per system you found to `/live/design/` through the item tool, each with `"tab":"Storage"` and `"type":"part-card"`:
- the title is the system's name (e.g. "files.jsonl");
- the `text` is one line, starting with a status of `built`, `plan` or `partly`, then a code block of at most 4 lines: the path to its file, which code writes it, which code reads it, and one example line.

Six cards at most; merge small ones. Add a last card "Indexes: what's missing", with at most 3 bullets. Never touch the `ui` line or other cards (a Sonnet worker posts cards to the same tab).

## Fence
Read anything; write only your task folder and those cards. No restarts, no stash, never drive the owner's tabs. Done = the `answer` lines plus the cards, then a one-sentence reply.
