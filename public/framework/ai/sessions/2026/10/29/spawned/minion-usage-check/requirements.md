# Usage: report it, and give a cloud session a tool to read it

Relayed by a Claude cloud session for the owner (session.jsonl line 1). That session can't run node, so it can't see the plan's usage itself.

1. **Report the plan's usage now:** used, gone, and % of pace.
2. **Give the cloud session a tool to check usage itself:** the Servex tool `check_usage`, reading the same `usage.json` as `node Server/usage-now.mjs`, with the pace rule in one place (`Server/UsagePace.mjs`).

The tool appears after a Servex restart.
