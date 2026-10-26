# Routing: design report only (no building)

Budget $2, Sonnet, read-only. Load the `minion` skill first. Parent: task-mastermind-2 (plan: [../plan.md](../plan.md)). Write `report.md` in this folder (one screen: a table plus a recommendation); change no code.

The owner's question (handoff, "Routing"): the global voice sheet (the ✦ sheet and the desktop drawer: `ext/drawer/Sheet.js`, `ChatView.js`, `ext/drawer/readme.md`) must not own the URL path. Cards in the chat (prompts, tasks, questions) become clickable previews that open their full detail view with a way back. On a session's own page, `/framework/ai/sessions/...`, that is a normal dynamic subpath through the existing router.

Answer from the real code, citing file:line:
1. Does the sheet already persist its open state across reload (localStorage, hash, query)? How?
2. Is the chat on a session's page (`AISessionDetail`, Chat tab) the same component as the sheet's chat? Where do they differ?
3. How does the existing router (`core/Router`, `AISessionsPage.route()`, `StoreFolder.child()`) handle a deeper subpath like `/framework/ai/sessions/YYYY/MM/DD/<session>/<item id>`? What is the smallest change to show an item's detail there?
4. Options for the sheet: (a) unrouted UI state only; (b) a query-string variable (for example `?chat=<item path>`) that keeps the sheet open and the current item across reload; (c) other. For each: the existing code it reuses, cost in lines, what breaks. One recommendation. No new routing system.
