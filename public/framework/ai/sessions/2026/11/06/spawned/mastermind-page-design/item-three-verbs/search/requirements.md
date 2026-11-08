# Brief: past-work search on tool reduction and item verbs

Budget: $0.60. Load the `minion` skill first, then read `public/framework/ai/indexing-past-work.md` (the search recipes). Read only what the hits point to. Never edit code, never restart a server, never `git stash`. rg is not installed; use `git grep`.

**The question:** what has already been decided or built about (a) cutting the number of Servex MCP tools, and (b) one item tool with verbs like get / set / call, or `Item.open(url)`?

**Search terms (one search each):** `three verbs`, `get / set / call` and `get, set, call`, `Item.open`, `mcp-unify`, `fewer tools` and `tool count` and `97 tools`, `page_tools`, `ITEM_DESCRIPTION`, `one tool`, `read:` together with `item tool`, and `computed value` in `public/framework/core/Session/readme.md`.

Start with these files: `Servex/ext/remote/doc/mcp-unify.md`, `public/framework/core/Page/doc/ai-api.md`, `public/framework/core/Item/readme.md`, `public/framework/core/Session/readme.md`, plus the session logs the recipe names, filtered with `from: owner` for the owner's own words.

**Deliverable:** `answer.md` in this folder, one screen. Up to 8 bullets, each `**what was decided or built** (date) — path:line`. Then one line: "Still live:" or "Superseded by:" for each bullet. Then a list of the owner's own quotes on the subject (date, link to the log line), at most 5. "Nothing found" for a term is a fine answer; say which terms found nothing.
