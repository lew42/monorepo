---
name: performance
description: Invoke before building anything that shows many items (a list, grid, table, log, feed) or a drag / resize / scroll gesture, and when a page or the machine feels slow. Draw only what's visible, one variable per drag, measure the load.
---

# Performance

The rules live on one page: [/framework/code/performance/](/framework/code/performance/) (`public/framework/code/performance/readme.md`). Read it; it is short.

Before you land:
1. **Over a few hundred items?** Window them (only visible rows in the DOM) or page them. Never render them all.
2. **A drag or resize?** It writes one CSS variable; nothing loops over rows during the gesture. Hover affordances are pure CSS.
3. **Prove it:** a headless trace through `Server/browser.mjs` (never the mcp__playwright tools): frame times during the gesture, the page's load time, its peak memory. Put the numbers on the task card.
4. **Something slow you didn't build?** Note it on the performance page's Watch out list with the number, and tell the Servex mastermind (it owns speeding up the slowest frequent paths).
