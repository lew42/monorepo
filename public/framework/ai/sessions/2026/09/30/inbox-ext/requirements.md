# Inbox: one page extension, used everywhere: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). The example card to post the refined version on is [Now: one inbox everywhere, and refined prompts](/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/) — it's still empty; ask 7 is what fills it. Re-read both before each step.

**PRIORITY, started 15:50** (the owner: "getting the current AI page to look more like the AI 2 dashboard… should be a priority"). Plan now; build heavy pieces after the 4:50 PM reset.

## Asks
1. **`core/Page/ext/`: an extension (plugin) system for Page,** modelled on the Server's plugin system (`Server/plugins/`): event-driven hooks, and extensions configured by data (in page.jsonl), not hard-coded. It is the ext pattern for any module or directory. Keep it minimal.
2. **`core/Page/ext/Inbox`:** the first extension. Any page can have an inbox.
   - Messaging a page = appending one line to its page.jsonl: `{inbox: {type: "message"|"question", author, text, at}}`.
   - The author is the agent that sent it. It's like emailing a directory.
   - Build on the page inbox that already landed ([page-inbox](../page-inbox/): notes live under the `inbox` key), and on the drawer inbox steps. Move it; don't rebuild it.
3. **Move the AI 2 Inbox to the new /framework/ai/** as its **default tab** (the dashboard; the owner, 2026-09-30); the docs live on its System tab. Keep every useful feature of today's Inbox: the sidebar on click, and read/unread, archive, auto-resolve and search from task ai2-inbox-read. The Inbox IS the default tab, so its top-priority items are what the page opens on.
4. **Needs you is a filter in the Inbox list,** not its own tab with its own UI.
5. **Inbox and Log share one UI:** the rail with previews, and each preview opens its card. Today the three tabs use three different templates. Lean into the Inbox's version.
   - Inbox: real time, only what matters now.
   - Log: everything.
6. **The rail is a base class, overridden per page** with object-oriented overrides. The usage meters live only on the AI page's rail subclass, not on every page's inbox.
7. **Each owner prompt becomes an Inbox card showing its refined version.** Servex hears each owner prompt (the `.claude/prompts/` hook, and voice sessions), runs it through the Refine ladder (`ext/Refine`: raw → structured), and posts or updates a card at the top of the Inbox. Post the first one by hand, on the card linked above, as the example.

8. **A card is a whole conversation, and it shows what it's about** (the owner, 2026-09-30). Each Inbox item stands for an entire conversation, which continues in the card's sidebar. The card's body shows at least part of the thing it references, imported live: a page, a module or a screenshot. Build this on the reference system (`#Page`, `/path`, task-mastermind-mentions), so every post makes it obvious what it's talking about.

9. **Chat and card are ONE content model** (the owner, 2026-09-30, the summary of the thread):
   - A card IS a page: a title, a preview and a detail view, backed by its own page.jsonl. It can be a conversation or an AI session, and it has its own inbox, which is its feed of updates.
   - **The two views are two renderings of the same lines and the same content widgets:**
     - **chat mode** (the right sidebar or the mobile rail): informal, with bubbles and rambling allowed;
     - **page mode** (the card): the refined, final, important content.
   - **The flow runs right to left.** While a card is selected and the owner dictates in the sidebar, the AI refines the conversation into that card's page.jsonl. The card then shows the finalized points, and can become a task, a series of tasks, or an update to another page.
   - This replaces a separate "refined prompt card" pathway: item 7's refinement is written INTO the selected card.
   - **Sessions stay GLOBAL** (the owner, 2026-09-30: answered). Clicking a link never cuts off dictation. The session is context-aware instead: each navigation is logged as an invisible event ("now on <page>, card <id>"), as are pause start and pause end, all timestamped. So the AI always knows what you are looking at, and refinement goes to the card that is selected when it happens.

## Coordination
- Replaces AI 2's own inbox code once it has moved. AI 2 then redirects, or stays as v1 until the owner approves (todo: "AI 2 merges into /framework/ai/").
- task-mastermind-ai-page owns /framework/ai/: add the Inbox tab together with it.
- task-mastermind-ai2-inbox-read (read/unread, archive, search) lands first. Carry its work over.
- mastermind-servex-9 owns the Servex side of item 7 (the prompt hook, Refine and posting the card). Ask it, or build it in `Servex/` through the pool.

## Rules
- Pool worktree, then `merge.mjs` (smoke test), then the review skill. Screenshots at 400 and 1920.
- Budget: $12, hard. At most 2 Sonnet minions.


## Added 2026-10-01 (04:00): a "Tools" section on the System tab
The owner keeps asking whether agent tools are MCP tools or local node functions, and wants to look it up rather than ask. Write ONE short section with a picture:
- **Servex agents get tools IN-PROCESS:** node functions registered through the Claude Agent SDK (`tool()` + `createSdkMcpServer`, `Servex/agents/tools.js`). They run inside Servex, with no HTTP hop.
- **The VS Code session uses HTTP MCP servers:** the `servex` and `site` tools.
- **Skills are contracts, each backed by one tool.**
- **Law 7 (compute, don't recall):** record-keeping is a node tool reading real state, never an AI writing from memory.

Link Servex/doc/task-loop.md, Servex/doc/dormant.md and Servex/agents/doc/jobs.md.

