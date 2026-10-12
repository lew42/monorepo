# The relay rule: the owner reaches a mastermind through the root assistant

**Rule.** When the owner or a registered VS Code tab calls `send_to_agent` on a mastermind, Servex delivers it to `master-assistant` wrapped as `RELAY for <id>`. The assistant answers fast, files or finds the card, and passes the ask on (the table lets `master` message a mastermind). Code: `Policy.route()` in `policy.js`, called from `send_to_agent` in `tools.js`.

**Direct stays open** when the text starts with `@<mastermind-id>`, or the call passes `direct: true`, or no live `master-assistant` exists (never a lockout). `SERVEX_RELAY=off` turns the rule off; `SERVEX_POLICY=off` turns off all of policy.

**Alternative not taken:** refuse direct messages. It risks locking the owner out of a stuck mastermind.

**A bug found on the way.** `Policy.kind()` only knew `task-mastermind-*`; today's ids are `mastermind-*` (a "worker" to `kind()`), so the step-1 `relay-bypass` line could never fire. The live `policy` log held 0 such lines for that reason. `is_mastermind()` now covers both spellings.

**Proof** (`node Servex/agents/relay-bypass-proof.mjs`, private Servex on 8290): 3 owner prompts delivered to `master-assistant`; `@named` and `direct:true` delivered to the mastermind. `policy.test.mjs` passes. Live after the next Servex restart.
