# The fast path — plan

The owner's words: [owner-words.md](owner-words.md). The brief: [requirements.md](requirements.md).

**What exists and is reused (law 6):** the qf pool (`Servex/Pool.js`, `take_worktree` ≈ 50 ms, a worktree already branched, served and watched); `merge.mjs` (lock, smoke, merge) and `review.mjs`'s `sizeOf` (none / light / full); the helper pattern in `Servex/agents/Assistant.js` (a parent-woken Sonnet spawned by the fast assistant); the smart assistant's `[Selected: …]` prefix and `(now on /x/)` nav lines in `Sessions.js`; `layout-check.mjs` for one shot at one width; the `review` skill for which widths matter.

## The hot path, end to end

```
voice "make this bold"
  → smart assistant: quick_fix({page, selection, text})        ~0 s   (a Servex tool, node)
  → Servex hands it to the standing fixer-1 (warm, holds qf-N)  ~0 s   (send_to_agent, no spawn)
  → fixer edits in qf-N, commits                                ~5–15 s
  → node Server/merge.mjs qf-N --quick                          ~5–10 s (smoke + ONE shot at the width that matters, no reviewer when sizeOf ≤ light and ≤ 20 lines, 1 module)
  → owner's page: one reload / stream; one chat line + the shot
  → node logs {quickfix: {asked_at, landed_at, ms, files, lines, width}}  (law 7: measured, never recalled)
```

Too big (more than one module, a layout, a new feature, or `sizeOf` says `full`) → the fixer says so in one line and `spawn_agent` role `task-mastermind` with the request verbatim; it never stalls.

## Two minions, non-overlapping fences

| minion | builds | fence |
|---|---|---|
| **fixer** | the standing warm quick-fixer: `Servex/agents/fixer.md` (its brief), a `quick_fix` Servex tool the smart assistant calls (`Sessions.js` / `Assistant.js` pattern), the fixer's hold on a qf slot, the timing line, and the hand-off to a task-mastermind | `Servex/agents/*` (new `Fixer.js`, `fixer.md`; small edits in `Sessions.js`, `session-smart.md`, `Agents.js`), `Servex/Pool.js` (a `hold` so the sweep never reclaims the fixer's slot), `Servex/doc/fixer.md`, tests |
| **quick-merge** | `merge.mjs --quick`: the threshold, the one-shot step and where it saves it; `review.mjs`: `widthsFor(diff)` (mobile-only CSS → 400; a layout/page → all four; a few lines of text → 1200) used by both the quick path and the normal review; the review skill's "pick widths by what changed" | `Server/merge.mjs`, `Server/review.mjs`, `Server/doc/review.md`, `Server/doc/merge.md` (or where merge is documented), tests; the `review` skill text goes to the Servex mastermind as a drafted paragraph on the card, not edited by the minion |

Seam: the fixer calls `MSYS_NO_PATHCONV=1 node Server/merge.mjs <qf path> --quick` and reads its one JSON result line `{"merged": "<sha>", "shot": "<path>", "width": N, "ms": N}` (quick-merge prints it last). Until quick-merge lands, the fixer tests against plain `merge.mjs`.

## Measured
`public/framework/ai/quick-fix/page.jsonl` (data lives with its page): one `quickfix` line per fix, appended by node at merge time. The page shows the last fixes with their seconds and shot. Target: first fix live in 10–30 s.
