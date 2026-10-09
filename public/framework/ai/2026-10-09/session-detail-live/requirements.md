# Session detail page: live conversation, both sides, compact header

The owner (2026-10-09 ~16:55, VS Code tab 7efd07d5), looking at their own session's page under `/framework/ai/sessions/<id>/`: it shows only the prompts that existed at load; new prompts never appear until a reload; the AI's replies never appear at all; the top ~500 px is roomy and wastes space; the "Template: ..." line takes its own row; the title is truncated although it is the page's path; the content is a narrow column inside a full-width panel. They want the AI to be able to put UI cards (links, context cards) into this page, and each prompt refined later.

## Diagnosis already done (mastermind)
- `public/framework/ai/AISession/AISessionDetail.js:44-47` loads the transcript **once** (`load_transcript`, user prompts only, last 50). `AISessionFollow` (line 39) already tails the live log, but only to correct the grid row. So: nothing appends to the prompt list.

## Do, in order (commit each step)
1. **Live**: new lines from the tail append to the conversation in about 100 ms (stream, never poll; `doc/realtime.md` describes the tail). Keep scroll position unless the reader is at the bottom.
2. **Both sides**: show the assistant's text replies too (not tool calls; maybe a one-line collapsed "12 tool calls" between turns). Owner prompts and AI replies are visually distinct; reuse the existing chat/bubble component if one exists (law 6: one component; look in `ux/` and `ai/cards` before writing one).
3. **Compact header**: title not truncated (it is the path; drop the `slice(0, 8)` at line 17 or show the full id small), and "Template: AISessionDetail.js" moves inline into that header line as a small link to the source, not its own row. Aim: conversation starts within the first ~200 px at 1400 wide.
4. **Fill the width**: the body fills the panel; side cards (cost, related, trace) flow into columns that fit; padding from the framework's clamp spacing tokens. Check with the layout skill. Shoot at 1400 and 3440.
5. **Cards from the AI (smallest slice, design first)**: a session can carry AI-posted cards that render inline in the conversation at their time. Find what exists first (the `create_card` tool, `page_add`, the session's own `page.jsonl`/session folder); write a 10-line design note in `doc/` choosing one, then the smallest working slice: one card the mastermind can post that shows up live here. Do not build a second card system.

Leave prompt refinement (a Refine button per prompt) for a later task; just leave room for it.

## Fence
You own `AISessionDetail.js`, `AISessionFollow.js`, `AISessionLive.js`, `AISessionTrace.js` and their CSS. `minion-sessions-red-flags` owns the grid, rows, index and In-flight strip (`AISessionsPage.js`, `AISessionRows.js`, `AISessionIndex.mjs`): do not edit those; if you must, message it first.

## Rules
Sonnet. Worktree, smoke-test, commit each step, merge with `Server/merge.mjs`. Scripts read data, not the model. Land with finish-task; one-screen outcome with a screenshot.
