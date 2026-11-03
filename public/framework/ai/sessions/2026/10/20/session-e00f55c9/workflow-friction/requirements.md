# Workflow: fix the four snags every agent hit today (you are a mastermind, on Sonnet, high effort)

**Why:** the owner's rule (2026-11-02): fix the cause, so there's less work later ([agent-rules.md](/framework/ai/doc/agent-rules.md)). Every agent that landed today, including replay-bubbles, chat-layout and item-phase1, worked around these by hand.

## The snags, each with its evidence
1. **A report to the VS Code tab says it failed, but it was delivered.** `send_to_agent` to `vscode-mastermind` answers that the tab "isn't a live agent", yet the message lands in `%LOCALAPPDATA%/lew42/servex/logs/inbox/vscode-mastermind.jsonl`, which the tab reads. So agents think it failed and post duplicate `owner_note`s. **Fix:** a send to a tab answers "delivered to the tab's inbox".
2. **`merge.mjs` can't find a task in an older session.** It scans only the last 4 days of sessions, and this session's folder is dated 2026-10-20. Agents had to pass `--review-dir` by hand. **Fix:** find the review by the branch's own task dir (the worktree's task record, or the brief path), not by age.
3. **The screenshot gate made agents hand-make PNGs.** `review.mjs` refuses to write shots into a worktree, and the merge gate wants 400/1200/1920/3440 shots. So chat-layout drew them by hand to pass. **Fix:** one route that works. `review.mjs`, or a small helper, takes the gate's shots from the worktree's own dev server into the task dir. A gate that can only be passed by faking it is wrong.
4. **The Dictate browser tests time out under load.** Three scripts timed out in `run-all --browser` while a review ran beside them, and all three pass alone. **Fix:** find what is slow under load (a fixed sleep, a cold page, a shared port), and fix the wait (wait for a condition, not a time). Or run the browser scripts with less parallelism. Prove it by running `run-all --browser` while another headless job runs.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
- **Each snag is its own commit,** with a test or a rerun as proof.
- **Document each fix** in `Server/doc/review.md` and in `Servex/agents/readme.md` (for snag 1).
- **Snag 1 is in Servex code.** Don't restart the live Servex; say in the report that a restart is needed.

**Fences:** commit by path; no `python -`. Coordinate with `mastermind-task-close-loop` (it's editing `Servex/agents/Agents.js`) before you touch that file. **Budget:** about $10. Report to vscode-mastermind in 3 lines.
