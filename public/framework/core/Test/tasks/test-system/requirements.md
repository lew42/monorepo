# Test system: tests that run themselves when something changes

Estimate: $15. Opus, medium effort. You are the **test mastermind**; name and home the module first (proposed: `core/Test/`, `class Test`; say the alternative). Parent: `vscode-mastermind`. Spawn Sonnet builders in worktrees; merge reviewed work yourself (autonomous by default). Coordinate with `mastermind-system-architect` (Servex) and `mastermind-item` (the item tool).

## The owner (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

Things keep breaking silently (today: the item tool returned ok while a child's verb did nothing). The owner leaves the design to you, with these thoughts:

- **Roll our own, small:** a test helper (a name, a function, asserts), maybe `class Test` (maybe extends `Item`, so results persist and render live). A runner.
- **Two kinds by file name:** browser tests and node tests, so the node ones are obvious and easy to run automatically (the owner once used `X.tests.js` and `X.node.tests.js`).
- **Run on change:** when a file changes, run the tests that cover it (Servex or the dev server runs them; decide). A page smoke check on change may fit here (`Servex/WorktreeWatch.js` and `Server/smoke.mjs` exist).
- **Tests that matter, not many:** no redundant tests of things certain to pass. When something fails that no test caught, ask why and add that test; write the rule for what earns a test.
- **Test-first where it pays:** in a process's plan phase, write the API's tests; builders implement to pass them.

## What exists

About 100 `*.test.mjs` files today (29 in `Servex/agents`, 28 in `Server`, a few in `core/Task`, `core/Item`), each with its own style. Read a sample; the new helper must run them or wrap them, not replace them by hand.

## Do

1. A short design (class sketch, file naming, who runs what on which change, where results live and show).
2. The smallest slice: the helper + runner, the existing node tests discoverable and runnable in one command, run on change for `core/Item` and `core/Task`, results in a JSONL the site can show; plus a test for today's item-tool bug (a verb on a child by id must change its state).
3. Docs: the module readme (conclusions only), a line in `framework/readme.md` and the `code` rules.

Land with `finish-task`; usage is low (5% of the week), but keep builders on Sonnet.
