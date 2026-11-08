# Answer: Three Verbs and Tool Reduction

## Decisions and Builds (Date - Path:Line)

1. **One write tool with deltas, not per-verb (2026-10-12)** — `public/framework/core/Page/doc/ai-api.md:71`
   Still live: The owner decided on `page_set` as the universal write tool taking JSON deltas; old `page_add`/`page_call`/`create_page` kept only as aliases.

2. **Page tools built: page_add, page_set, page_log, page_read (2026-10-02)** — `public/framework/ai/sessions/2026/10/02/page-tools/task.jsonl:1-11`
   Still live: Four Servex in-process tools over Item.Store landed in `Servex/agents/page_tools.js`; page_read computes state fresh without storing.

3. **Shelved: local/remote marking on Servex tools (2026-10-15)** — `Servex/ext/remote/doc/mcp-unify.md:1-70`
   Superseded by: One registry exposed to the tunnel (2026-10-15); `/mcp/remote` serves `servex.mcp.tools` live, never copied; `ask_mastermind` and `live_post` become registry entries.

4. **Item.Store: one Store class for persistence (core/Item)** — `public/framework/core/Item/readme.md:22-33`
   Still live: Item extends Events, replays and appends .jsonl, one `set(delta)` method; Page extends Item; List is a property, not inheritance.

5. **Task is an Item with state/completion; Session is a Task (2026-10-24)** — `public/framework/core/Session/readme.md:5`
   Still live: Session extends Task (since 2026-10-24), has Task's states and adds a dated folder `YYYY/MM/DD/<slug>`.

6. **Completion: computed on demand, never stored (2026-10-20)** — `public/framework/core/Session/readme.md:192-200`
   Still live: `completion` is a query (`{"completion":{}}`) that writes nothing; `Task.completion_score()` computes recursively.

7. **Task: item-three-verbs — get/set/call verbs on Item.open (2026-11-07)** — `public/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/session.jsonl:499`
   Open: One tool with three verbs to consolidate page_tools.js; cut the 97 Servex MCP tools.

8. **Item tool reads queries without writing: `{summary:{}}`, `{completion:{}}` (2026-10-12)** — `public/framework/core/Page/doc/ai-api.md:49-53`
   Still live: A delta whose keys are all queries is answered with no line written; `walk_queries` in `Servex/agents/page_tools.js`.

## Owner's Own Words

- (2026-10-12) "a few universal tools that take deltas" — `public/framework/core/Page/doc/ai-api.md:71`
- (2026-10-15) "one registry, every tool, no local/remote split" — `Servex/ext/remote/doc/mcp-unify.md:3`
- (2026-10-20) "computed value" logged as a reading line never replayed — `public/framework/core/Session/readme.md:192`

## Notes

- "97 tools": the current Servex MCP tool count mentioned as a target for reduction in the item-three-verbs task brief.
- "three verbs": `get` (query), `set` (write), `call` (method); the proposed unified item tool signature.
- Search term "get / set / call" (with slashes): no exact matches found in session logs.
- Search term "Item.open(url)": used in persistence contexts for opening items at a URL; one instance per URL (core/Item/readme.md:32).
