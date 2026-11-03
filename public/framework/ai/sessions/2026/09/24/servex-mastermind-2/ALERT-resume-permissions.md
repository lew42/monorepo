# mastermind-servex was blocked after a restart (fixed)

After the 18:09 restart, Servex reopened this agent in the role's default mode, `acceptEdits`
(`Servex/agents/roles.js:28`), not the mode it was spawned with. Every shell and Servex tool call
then waited for an approval nobody could give. Only file reads and writes worked.

```
spawn (bypassPermissions) → registry row has no mode → reopen() → role default (acceptEdits) → blocked
```

**Fixed:** the next restart reopens it with `bypassPermissions` (merge d447febd). Commands work again.

## Still open

- [ ] **Record the mode in every registry row.** `reopen()` (`Servex/agents/Agents.js:284`) should never guess a mode.
- [ ] **Decide the architect's tools.** It has Read, Grep, Glob and Servex tools only, so it cannot edit skills or run scripts itself.
  - Give it Bash, Write and Edit (it keeps "launches nothing" as a rule), or
  - keep it read-only: safer, but every write becomes a minion spawn.
