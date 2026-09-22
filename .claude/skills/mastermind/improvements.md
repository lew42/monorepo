# mastermind — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- **PROPOSAL, owner's call to promote:** 2026-09-04 · the owner: the mastermind should not
  execute skills or hands-on edits itself, only relay to a minion — its own tool calls bury its
  answers in the sidebar chat. Proposed for Each-cycle: the mastermind's own calls are ledger,
  usage, dispatch, harvest; everything else is a minion.
- **PROPOSAL, needs settings.json (the owner's) — now FOUR incidents:** 2026-09-04 · a third
  minion ran `find /` despite the written rule (paging-scout; three orphans reaped by the
  mastermind). **2026-09-20: a FOURTH — the `ai-padding` minion launched `find / -maxdepth 6`
  while checking for a global Playwright install and it burned a full core for ~30 minutes**; it
  found and killed its own, and disclosed it unprompted. Four agents in seventeen days, each
  having read the rule. The rule alone does not hold; a PreToolUse hook refusing `find /` /
  `find C:/` would. The fix is written and costs the owner one settings entry.
- **PROPOSAL, adds a required step:** 2026-09-19 · the mastermind writes `note` and in-flight
  `agent` lines so the v2 board stays live with no reload (ai-v2 leaned on this). Proposed: keep
  doing both on every run the v2 board is meant to show.
- **PROPOSAL, self-marked NOT fail-safe:** 2026-09-19 (monorepo) · the CLI launch recipe produced
  five minions that could not write a single file (Write, `Set-Content`, bash redirection all
  refused, even with `dangerouslyDisableSandbox`) — $8.50 and 291 turns for nothing, across five
  sessions. The child `claude` process does not inherit the parent's write access, and
  `--permission-mode bypassPermissions` is itself refused by the auto-mode classifier. Needs the
  flag that actually works, or a one-line smoke test before any fan-out (one minion writes one
  file and replies DONE; dispatch the wave only if it exists) — verify first, this session could
  not.
