# Docs check: core/Test

Read the readme chain only (`load_module ["core/Test"]`): root readme → `public/framework/readme.md` → `core/readme.md` → `core/Test/readme.md`. Then checked its claims against the files actually on disk in the worktree.

## Verdict

Mostly makes sense — the Use example, Names, Coverage, Near, On change, Results and Trigger-values sections are clear and match the code. Two things are stale or missing.

## Findings

1. **The "Watch out" bullet about Servex tests is out of date.** It still reads: *"A test importing Servex needs `@anthropic-ai/claude-agent-sdk`... 16 Servex tests fail there with ERR_MODULE_NOT_FOUND (they pass in the main tree)"* — stated as an open trap. But `TestRunner.mjs:93-101` already works around exactly this: when a worktree lacks `Servex/node_modules`, it re-launches node with `--import fallback-modules.mjs`, which installs a module-resolution hook (`fallback-resolve.mjs`) that falls back to the main tree's `node_modules` on `ERR_MODULE_NOT_FOUND`. The fix exists; the readme still describes the bug as if nothing had been done about it.

2. **`fallback-modules.mjs` and `fallback-resolve.mjs` aren't in the Index.** They're real, wired-in files (confirmed by grep in `TestRunner.mjs`), but a reader of the readme's Index — which lists only `Test.js`, `TestRunner.mjs`, `TestResults.js`/`page.js`, `tasks/test-system/plan.md` — has no way to discover they exist or what they're for. Worth a line once finding 1 above is fixed to describe the resolved state.

3. **The module's own test files aren't indexed either.** `Test.test.mjs` and `TestRunner.test.mjs` sit in the folder (and both pass) but the readme never names them, even though "Names" explains the `X.test.mjs` convention generally. A reader can't tell this module tests itself without listing the directory.

4. **Minor, not a doc bug:** the readme's "first full run" number (84/99, 15 fail, 2026-10-22) is already behind `improvements.jsonl`'s later line (86/100, 14 fail, same date) and the queued 2026-10-24 task about the merge gate's browser tests pointing at the live site instead of the worktree. This is a dated snapshot by design (CLAUDE.md: "no dated logs in readmes"), so it's not wrong to leave it, but it's worth knowing it's already stale if anyone cites the number.

## Not checked

Didn't read `Test.js`, `TestRunner.mjs`, `TestResults.js`, `page.js`, or `plan.md` line by line — only the readme chain plus the directory listing and a few greps to verify claims 1–3. A full code review of the module is out of scope for this pass.
