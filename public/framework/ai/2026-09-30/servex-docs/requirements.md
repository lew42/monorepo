# /framework/servex/: the agent system, shown as flowcharts: requirements

The owner, 2026-09-30, looking at /framework/servex/ (it has sections for agents & roles, cards, dev servers and proxy): "Servex is kind of the home for a lot of the logic for the agentic system… I want to see flowcharts, like how is this structured?"

## Asks
1. **Level 1 of /framework/servex/ is a PICTURE of the system:** one flowchart of how an owner's words become work.
   - The owner speaks or types (the ✦ sheet, the drawer, the VS Code tab) → the fast assistant (clean text) → the smart assistant (intent, ✓/?, clarifications) → a routed ask (ai/asks.jsonl) → the mastermind that owns the module (fresh, loaded with the readme chain) → minions in a pool worktree → smoke test, review and merge → the card, then the owner.
   - Beside it: the heartbeat, dormant/resume, the lifecycle reaper, budgets, and the Servex architect owning the skills.
2. **One small diagram per sub-system,** each on its own sub-page: sessions (fast/smart, resume, ai/log.jsonl); spawning and roles (tiers, models, the working cap); the pool, merge and review; the heartbeat, dormant agents and the reaper; cards and inboxes; dev servers and the proxy. Each diagram is linked from the level-1 picture.
3. **Diagrams are built in the site, not as images:** SVG or HTML boxes and arrows drawn by a small reusable diagram module (check what exists first: ext/, ux/Content, the layouts, and the Figma MCP's generate_diagram as a sketching aid only). They must be crisp at 400 and 3440, with the familiar icons (the M logo for masterminds, a brain for smart, a bolt for fast).
4. The text under each diagram is short: a gist line per box, with links to the code-owning pages. Replace stale content (the roles table predates today's voice sessions).
5. Keep the current pages reachable (as v1) until the owner approves.

## Rules
Pool worktree, smoke test (links followed), merge.mjs, the review skill, screenshots at 400, 1200, 1920 and 3440. At most 2 minions; budget $12, hard.
