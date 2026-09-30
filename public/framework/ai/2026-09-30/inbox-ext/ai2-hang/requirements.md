# Minion brief: AI 2 freezes for about 13 seconds on load

Load the `minion` skill first, then `code`. Parent: task-mastermind-inbox-ext. Task dir: `public/framework/ai/2026-09-30/inbox-ext/`. The owner's words are in its `owner-words.md`, in the last section.

## The owner's words (verbatim)

> I think the page just crashed. My cursor is a pointer and it's not changing. Let me duplicate this tab and close it out. Yeah, it's, it's having a hard time loading. The framework AI2 live page

## What we already know

servex-mastermind-opus measured it headless at 1920. After `load`, the main thread is blocked for about 13 s: an evaluate call sent at t+2 s returned at t+17 s. The page has about 4,900 DOM nodes, a 40 MB heap, and three 404s.

The probe is [probe.mjs](probe.mjs) in this folder. Run it with `node probe.mjs <url>`; it uses the global Playwright.

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, server http://localhost:51490/). Commit there. Don't merge; I merge.

## Deliverables, in order

1. **Find the cause.** Take a CPU profile over the first 20 s of loading `/framework/ai2/` on the worktree server. Use CDP `Profiler.start`/`stop` through Playwright, with `windowsHide: true`. Name the functions that hold the thread, with file, line and self time. Put the top ten in `ai2-hang/profile.md`, with one sentence on why each is slow, e.g. a loop that re-renders every card for every line, a layout thrash, or a render of all 4,900 nodes at once. Also name the three 404s and say whether each one matters.
2. **Fix it, if the fix is small and in AI 2's own files** (`ai2/**`, or `ext/drawer/**` if the cause is there). The goal is main-thread lag under 200 ms after the page settles, and the first rows on screen within 2 s. Keep everything AI 2 shows today. If the fix is large or outside those files, don't build it: write the plan in `profile.md` and message me.
   - **Don't touch** the `board()` closure's structure beyond the fix. Another minion turns it into a class next; keep your change small and local so theirs merges cleanly.
3. **Proof.** Take shots of `/framework/ai2/` at 400 and 1920, before and after, in `ai2-hang/shots/`. They must look the same apart from the fix. Record the probe output before and after in `profile.md`. Zero new console errors.

## Fence

`ai2/**` (smallest edits), `ext/drawer/**` (only if the cause is there), and this folder. Nothing in `core/Page/`, `ai/`, `ux/` or Servex.

## Rules

`windowsHide: true` on every process. Stop any browser or server you start. Log each step in your task.jsonl. When you're done, message task-mastermind-inbox-ext with the cause in one sentence, the commit, and the before and after numbers.
