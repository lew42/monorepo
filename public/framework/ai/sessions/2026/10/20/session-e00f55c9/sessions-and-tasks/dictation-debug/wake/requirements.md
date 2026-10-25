# Dictation: wake the voice session's smart agent per thought, not per sentence, and measure the tokens

Budget: $10. Sonnet, high effort. Load the `minion` skill first. Owner's words: Part 3 item 5, Part 5 and Part 7 item 6 of [../requirements.md](../requirements.md). Your parent is `mastermind-dictation-2`.

## The problem

While the owner dictates on the website, the voice session's smart agent (now Opus 5.5, the `voice-sessions` task, merged just before you start) is woken too often: it replies more than the owner can read, and every wake is an Opus turn. The owner wants cheap per-sentence work (placing words in bubbles, a Haiku-level refine into cards) and the smart agent woken only when a thought ends (a pause), when it is asked something (a question, or addressed by name), or every N sentences.

## What exists (read first, don't rebuild)

`Servex/agents/Sessions.js`: the fast seat (`voice-assistant`, per sentence, `:68`), and the smart seat, which already "hears a thought, not its fragments" (`gather` / `release_thought`, about `:890`–`:1030`, lines gathered over a quiet gap). Find the gap's value and every path that wakes the smart seat outside it (`:867`, `:963`, `:994`, `:1028`, and any others).

## Do

1. **Before.** From the real voice session records of 2026-10-24 and 25 (folders with `kind: "voice"` under `public/framework/ai/sessions/2026/10/`, and the older `<home>ai/v-*.jsonl`), compute per session: minutes of dictation, owner lines, smart-seat wakes, smart-seat tokens and dollars, so tokens per minute of dictation. A node script in your task folder computes it (law 7); keep its output as `wake/before.json`.
2. **The rule.** Wake the smart seat only on: a pause past the quiet gap (a knob, default from the numbers, likely 4–8 s), a question or being addressed (keep what exists), or every N owner sentences (a knob, default 6). Every other path that wakes it either joins the gather or is justified in one comment line. The two knobs live in one place, read by Servex; say where, so the dictation widget's settings panel (built later) can set them per session.
3. **Prove it** with a unit test (no model calls: a fake clock and fake lines) that a 2-minute dictation of 20 sentences with three pauses gives 3–4 wakes, not 20. Then replay one real session's lines through the rule and report the wakes before vs after.
4. **After.** The expected tokens per minute from the replay, beside the before number.

Work in a worktree (`node Server/worktree-up.mjs dictation-wake`), commit each working step, run the Servex tests the change touches. Don't merge, and don't restart Servex: tell your parent it is ready, with the before/after numbers. Your parent merges and schedules the restart.

## Deliverable

`wake/report.md`, one screen: tokens per minute before and after, wakes per minute before and after, the rule, the knobs and where they live. Findings as `log` lines in `wake/task.jsonl`.

Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash.
