# Quick-fix worktrees, and a smoke test before every merge

**The owner, verbatim (condensed only by removing fillers):** "for every new task a work tree where the changes get tested and smoke tested, at least for loading errors. We don't have to do the full UI test before the work tree can be merged in. As long as the page doesn't throw any errors, you could assume it's at least a viable merge. We don't want the page or the website to just crash. We don't want minions editing files in a bad way, and clearly they are. So we need to at least do a smoke test on a work tree. We could easily have one or more ready-to-go work trees: quick fix one, quick fix two, quick fix three. The master assistant and masterminds can help manage the usage of those. Rather than spinning up a new mastermind and a new work tree and a new Playwright, which takes time, if you have a quick fix you send it off to an existing one, it's built immediately and smoke tested immediately, and once it seems to work, within a few seconds you merge it in and my website updates. If it has an error, you fix it, and when it's ready you merge it. That way we keep michael/dev clean, or at least error free."

Card: 2026/09/25/quick-fix-worktrees-smoke-test-then-merg. Post progress there in two sentences at a time.

## Deliverables (each is ticked in your landing, in the owner's words, with its proof)

1. **The rule.** Nothing merges into michael/dev without a smoke test: the touched pages plus `/framework/` and `/framework/ai2/`, loaded headless on the worktree's own server, with zero console errors, zero failed module requests and zero page errors. A full UI test is not needed to merge. Put it as one line at the top of the `sub-mastermind` and `minion` skills (edit SKILL.md files with a node script).
2. **The script:** `node Server/smoke.mjs <worktree dir> [paths…]`. It uses the worktree's own server (see `Server/worktree-up.mjs`) and Playwright, the way `Server/layout-check.mjs` already does. It prints each error with its URL and exits non-zero on any. Prove it both ways: once on a clean worktree, once on a worktree with a deliberately broken import.
3. **A pool of ready worktrees, with no manager agent** (the owner, correction 2026-09-25). Start with one. It is already branched from michael/dev, with its server up, the page watcher on and git configured. Servex keeps it ready, with no standing fixer agent. (The correction's verbatim words are on the card.)
4. **Two MCP tools any agent can call** (minion, mastermind or assistant):
   - `take_worktree()` returns `{id, path, branch, url}` immediately. The caller writes straight into it, runs `Server/smoke.mjs`, and merges into michael/dev. Merges are serialized, one at a time. Taking one makes Servex prepare the next, so one is always ready.
   - `return_worktree(id)` hands back an unused one. A merged or finished one is reset to michael/dev, or removed.
   - **Cleanup:** keep at most K = 3. Prune any idle more than N = 6 hours, beyond the one kept ready.
5. **A skill section, and Live.** Add "take, write, smoke-test, merge, return" in about five lines to the `minion` and `sub-mastermind` skills (edit SKILL.md files with a node script). The Live card shows the pool: ready, taken by whom, and idle for how long.

## Constraints

- Servex code changes are proven on a **private Servex** (its own port) before the live one is restarted. Restarting the live one: `node Servex/sustain.mjs --restart`, once, at the end.
- Every process you start is hidden (`windowsHide: true`; proven by MainWindowHandle = 0).
- Keep the machinery small: reuse worktree-up/down and layout-check's Playwright. No agent manages the pool. No new npm dependency.
- The 404 that prompted this was a mistyped URL, not a bad merge. The rule stands anyway.
