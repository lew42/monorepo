# core/Page: page tools, so agents write pages live

Budget: $8.

The owner, 2026-10-02 (now in CLAUDE.md, "Pages are live"): "if an agent creates a page, we want the agent to be able to update that page via the page.jsonl in real time… writes little changes as they're asked for… a toolset… we don't want to bloat our toolset with thousands of cross-domain tools… page aware… reading the whole JSONL and interpreting a big delta storm could be tricky… a page could generate a readme-like view from its structured content, programmatically."

Builds on what landed today (e44930ad, ai/2026-10-02/page-extends-item): Page extends Item, `static Store` with append and tail, list verbs as lines, and FsFile as the only writer. Read that task's outcome and follow-ups first.

## Build
1. **Four Servex in-process tools over Store** (Servex/doc in-process tools; not HTTP to itself):
   - `page_add(path, item, {after})`;
   - `page_set(path, id, delta)`;
   - `page_log(path, text)`, a "now doing X" line;
   - `page_read(path)`.
   
   The tools stamp the time, author (the calling agent) and ids, validate the line with the schema check, and append through the same path as Store.
2. **`page_read` returns COMPUTED state**, not raw lines: the replayed page as compact markdown (title, headings, items with their ids, a question card turned into "Q: … / A: …"). It's generated on demand, never stored, so there's no second copy.
3. **Prove it live:** an agent builds a small page with 5 tool calls while a headless browser tails it. Take 3 screenshots at different moments, showing it grow without a reload.
4. Document the tools in core/Page's readme (one line each) and in Servex's in-process tools list.

## Rules
A Sonnet task mastermind with no minions. Mastermind self-review is allowed for the tool code; screenshots for the live proof. Never wait on the owner.
