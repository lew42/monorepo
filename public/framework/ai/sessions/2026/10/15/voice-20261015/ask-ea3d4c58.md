# Voice ask ea3d4c58: two briefs (2026-10-15)

The owner asked these by voice. They were relayed by the voice agent, and this is the relayed text.

## A. Page mastermind → @helper-page-system

Answers come back as short code blocks the owner can read on screen. Minions do the code reading.

1. **The handoff from page.js to page.jsonl.** Pages load top-down: the root `page.js` loads `child/page.js`. How does the router reach a child that is a `page.jsonl`? Does the parent reference it, or does the router pick by which file exists? Where exactly is the Page instance created, and what code path loads the jsonl and passes it in? Does it recurse?
2. **A page.jsonl example.** Give a simplified, readable example, explained line by line: the delta/replay model, where lines are order-dependent and replayed. The owner's view is that it stores data less efficiently but buys real-time updates and full history. He is undecided and wants an opinion.
3. **The Page class architecture, as a code block.** Show the main API, what Page extends (Item?), whether "pages" is just an alias for "items", the children list, and name/path. Page.class.js is thousands of lines, and the owner can't believe that much logic belongs there. Propose splitting it by function, or composing it from sub-instances. Size isn't the worry; clarity is.
4. **Storage permutations.** A page can be `page.js`, `page.json` or `page.jsonl`, and each can be embedded in a parent. There are also dynamic pages with no file (a code pattern, or embedded with no real path). Should each page or item declare its own storage? Is the current setup right? Give opinions.
5. **Debug views (asked before).** Render any instance (its class, name, path, children, items and props) as a UI, likely in the dev-shell sidebar as an admin/dev mode. Collect this as vision; it doesn't have to be built now.
6. **The framing.** The page system is THE core data item of the framework. Sculpt the vision, and record the ideas even if they go on the back burner.

## B. AI mastermind → @helper-ai-system (brief: `ai-system/requirements.md`)

1. **A standing rule for the mastermind skill.** A mastermind assigned to a module reads its readme chain and runs a built-in, surface-level smoke test. Anything self-contradictory, clearly stale or nonsensical gets flagged and looked into, by the mastermind itself or a minion, without chasing irrelevant loose ends. Core docs must never go stale. For `framework/ai` specifically, do a thorough audit now and report anything obviously wrong.
2. **Session logging mechanics.** Do agents append to jsonl files directly, with plain file writes? The owner asked before that they NOT; writes should go through a system tool and be timestamped. Verify and report.
3. **Tagging.** Any page path (really any string) can be a tag on a session, a task, or anything else, and everything can be filtered by tag. There are two indexing options. One is a generated index file, which the owner dislikes because it goes stale. The other is an in-memory query system in the dev server, which the owner asked for before. Was it built? It risks bogging down or crashing the dev server. Report what indexing and query systems exist today, and recommend one.
4. **The goal.** The owner asks "didn't I ask for X?" and gets a quick executive summary: when it was asked, what was done, and what was decided against and why. What's the shortest path to that feedback loop?
