# Docs check: pool.md + lifecycle.md (taken worktrees)

**When the pool reclaims a taken worktree:** only when all three are true —
the holder shows `stopped`/`gone` in the Servex registry, no live agent
(including a minion working from a different cwd) still touches the slot, and
git is clean with no unmerged commits. A sweep checks this every 5 minutes,
plus whenever the pool fills. A person or CLI session (unknown to the
registry) is never reclaimed.

**When one still holds work:** it's kept, forever — no timeout, unlike ready
slots' 6-hour N. The log names why in one line. Nothing is auto-deleted or
auto-merged. Getting it back requires a human to run `--salvage qf-N` by
hand, which commits everything to an unmerged `salvage/<slot>-<date>`
branch, then frees the slot.

**Does it make sense?** Yes — conservative by design, and the qf-9 story
(09-30, salvaged twice by the sweep before this rule) is concrete proof the
three-condition check closes a real false-positive: `stopped` alone was
misleading while a minion kept writing.

**Unclear/missing:**
- No timeout or alert for a taken-forever slot. A person who takes one and
  walks away leaves it held indefinitely with no backstop — is that
  intentional, or just not built yet?
- "No live agent... queued to [work in it]" isn't defined — queued how, and
  checked against what?
- Nothing says who notices a stuck slot needs `--salvage` — it's manual-only
  but there's no mention of anything watching for the need.

Otherwise both docs read clearly and the two agree with each other.
