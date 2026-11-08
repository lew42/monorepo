# Item tool: one tool, three verbs (study and plan only)

**The ask** (the owner, 2026-11-06, relayed by voice-app on 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/)): "I'm getting really aggravated with this page tools… 2,000 lines of tools… do a past work search… it should be object-oriented."

- One item tool with three verbs, `get`, `set` and `call`, on [`Item.open(url)`](/framework/core/Item/readme.md).
- Shrink [`Servex/agents/page_tools.js`](/Servex/agents/page_tools.js) (1,881 lines) to that.
- Cut the other Servex tools where `item` covers them.
- Open question, in [core/Session/readme.md](/framework/core/Session/readme.md): is logging a computed value a `get` or a `call`?

**No code.** The deliverable is a plan page at `/live/plan/item-tool/`.

**Deliverables**
1. A past-work search: what was already decided about tool reduction and item verbs (Haiku minion: [search/requirements.md](search/requirements.md)).
2. The three verbs as JavaScript, compared with today's `delta` and `read`.
3. An inventory of every Servex MCP tool, each marked keep, fold into item, or drop, with one line why (Sonnet minion: [inventory-run/requirements.md](inventory-run/requirements.md)).
4. What leaves `page_tools.js`, in small merge steps, each with its test.
5. The risks (agents' prompts, voice instructions, RemoteMCP) and the order to switch.
6. A needs-you note asking the owner for yes or changes.

**Budget:** under about $5.
