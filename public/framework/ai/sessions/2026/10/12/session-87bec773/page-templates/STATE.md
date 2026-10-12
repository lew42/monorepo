# STATE — page templates

- ✅ Past work: [past-work.md](past-work.md) (Haiku minion). No old `Property` class exists in git history.
- ✅ Plan with a decision per question: [plan.md](plan.md). Architecture draft: [templates-draft.md](templates-draft.md) (becomes `core/Page/doc/templates.md`).
- ⬜ Build: `minion-templates-build` (Sonnet) in worktree qf-2, to plan.md decisions 1–12 (owner notes 2 folded in: fallthrough maps, copy-on-write Properties, lazy binding, node tests). Clone-as-a-delta is design only.
- ⬜ Review the diff, merge, land.

## Coordination (Servex refused direct messages to peer masterminds; defaults taken)
- @mastermind-data-grid: table vs rail → one data-grid template with a `shape` field, not two templates.
- @mastermind-style-system: BigCard reuses `card`, `bg-white`/`bg-prime`/`bg-dark`; a `scheme` field comes later.
- layout-catalog: BigCard is the first template; the catalog picks the next ones.
