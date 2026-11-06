Budget: $4 · Sonnet · worktree · I (mastermind-page-design) review and merge. Goes live only at the next Servex restart: never restart Servex yourself.

# Item tool: refuse a line the page refuses, before appending it

Load the `minion` skill first. The plan: [/live/plan/](/live/plan/), card "The item tool: one read, one write".

## The bug

`item({path, delta})` on a page appends the line even when the page then refuses it. Reported by mastermind-live-page after commit f56543fda: a delta walking into a card id that is really a List method or field name (`{"pages": {...}}` or `{"content": {...}}` used as a card id, e.g. `{"pages":{"text":"x"}}`) was written to `page.jsonl`, and the page refused it on replay.

## Deliverables

1. **Reproduce first**, in a temp copy of a page folder (never a real page): write the failing call, show the line landed in the file. Log the exact delta.
2. **Find why it slips through.** `Servex/agents/page_tools.js:918` `try_line(root, line)` replays a line before writing, and `:1274` tries a page line on a real Page. Find why a refusal from the List or Page during `set()` does not stop the write (a swallowed error, a warning instead of a throw, a check that runs after the append). One log line with the file:line.
3. **Fix it: check first, then append; write nothing when refused.** The answer is `{ok:false, why}` naming the key that was refused. Keep the fix in page_tools.js (or the Item/List refusal path if that is where the swallow is; say so first, since Item and List are shared).
4. **Tests:** add the case to the item tool's existing node tests (find them: `grep -ln "try_line\|item_tool" Servex/**/*.test.mjs Servex/agents/*.test.mjs`). The old tests still pass.
5. **Docs in the same commit:** the item tool's readme or doc that lists what is refused (grep for "refused" in `Servex/agents/doc/` and `public/framework/core/Page/doc/ai-api.md`); one line.

## Fence

You may edit: `Servex/agents/page_tools.js`, its tests, the one doc, this folder. `page_tools.js` is shared with mastermind-live-page (its `card_at`): I have told it; keep your change to the write path.

## Rules

- Your worktree: `C:/Code/lew42/worktrees/pd-item-validate` (branch `worktree/pd-item-validate`). Commit by exact path after each step. Never restart Servex or the dev server, never `git stash`, never drive the owner's tabs. Scratch in `$LOCALAPPDATA/Temp/`.
- Report one screen: the cause (file:line), the fix, the test output, commits, and "needs a Servex restart to go live".
