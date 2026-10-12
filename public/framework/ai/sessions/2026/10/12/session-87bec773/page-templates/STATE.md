# STATE — page templates

- ✅ Past work: [past-work.md](past-work.md) (Haiku minion). No old `Property` class exists in git history.
- ✅ Plan with a decision per question: [plan.md](plan.md). Architecture draft: [templates-draft.md](templates-draft.md) (becomes `core/Page/doc/templates.md`).
- ⬜ Build: `minion-templates-build` (Sonnet) in worktree qf-2, to plan.md decisions 1–12 (owner notes 2 folded in: fallthrough maps, copy-on-write Properties, lazy binding, node tests). Clone-as-a-delta is design only.
- ⬜ Review the diff, merge, land.

## Coordination (Servex refused direct messages to peer masterminds; defaults taken)
- @mastermind-data-grid: table vs rail → one data-grid template with a `shape` field, not two templates.
- @mastermind-style-system: BigCard reuses `card`, `bg-white`/`bg-prime`/`bg-dark`; a `scheme` field comes later.
- layout-catalog: BigCard is the first template; the catalog picks the next ones.

## 2026-10-12 owner notes 3
- ✅ slice built in qf-2 (7bbdf220e, aff047c73, e45085cf2); Property test 18/18.
- ⬜ minion-templates-merge: review + merge qf-2, return worktree.
- ⬜ minion-binding-doc (Opus): brief binding/requirements.md → core/Page/doc/binding.md + 1,000-row measure. Spawn refused (no pool worktree); respawn when qf-2 is returned.
