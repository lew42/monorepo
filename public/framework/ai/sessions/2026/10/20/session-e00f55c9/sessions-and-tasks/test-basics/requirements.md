# Tests: one basic test per class, failures to the builder without noise, the 28 red tests fixed

Sonnet, medium effort. Work in a worktree and land ready to merge. The system already exists: read `public/framework/core/Test/readme.md` first. The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, "Give me a quick overview of our test system").

## The owner's ask

1. **One basic test per class, in the class's own folder.** It makes one instance, runs it through its most basic use (up to about 15 method calls), and checks the result after each one. "If you had to do one quick run, here's the things you want to test to make sure you haven't broken anything": it should catch 99% of breakage, and run in well under a second.
   - Start with `core/`: Item, List, Store, Dated, Task, Project, Process, Session, Page, Test. Then `ext/`, most-used first.
   - Naming stays `X.test.mjs`. The owner used `X.node.tests.js` in the past; the runner and 118 files use the current name, so say it in one line if you think a switch is worth it.
   - Add to the readme's "What earns a test": every class has its basic test.
2. **Failures go to the builder, without noise.** Only a failure is reported; a pass stays silent.
   - An agent editing two files in a row can break a page for a moment, so don't report on every save. Report a failure only if it still fails once the agent's turn ends, or after about 30–60 s with no further saves. Pick one and say why.
   - The report goes to the builder (the worktree's owner) first, so the mastermind's context stays clean.
   - Today, `Servex/WorktreeWatch.js` sends "was passing and now fails" on each save. Change that; don't build a second watcher.
3. **Console errors count as failures.** A page that throws or logs an error is reported the same way, through the page smoke check that already runs on change (`Server/smoke.mjs`).
4. **The 28 tests red on michael/dev today** (from `results.jsonl`, mostly `Servex/agents/*`):
   - fix the real bugs;
   - retire, with a reason, any test whose subject is gone;
   - fix the missing `@anthropic-ai/claude-agent-sdk` in worktrees (see the readme's Watch out).
   - Goal: the test page all green.

## Done when

- [ ] Basic tests exist for every `core/` class, all passing.
- [ ] Failure reports are debounced and go to the builder, with one test proving it.
- [ ] Red tests: 28 → 0 (or each remaining one has a written reason). Log a `show:` line with the test page link, `/framework/core/Test/`.


## One subscription system (the owner, 2026-10-24, the next prompt)

"We want to basically use the same system everywhere... the same way an agent subscribes to a sub-agent session log, an agent can subscribe to a certain module, and just by subscribing it automatically gets test errors or browser errors... lean into our one solid system rather than redesigning a subscription system for every new use case."

- **The one system is Servex `follow`.** It watches a file or a folder (module level), and a `.jsonl` file's new lines arrive verbatim, batched every 2 seconds.
- **So a test failure or a page error is just a line appended to a log in the module's own folder** (data lives with its module). Whoever follows that module gets it. No direct `send` from the watcher, and no second subscription mechanism.
- **The builder follows the modules it is changing,** the mastermind follows its children's session logs, and both use the same tool.
- **The noise rule still applies:** report a failure only if it still fails after a quiet spell. Passes are logged as one "clear" line.
- **`ai/errors/` (one global folder) moves toward per-module logs.** Say how in your outcome.
