# Dictation: why words arrive out of order

Budget: $10. Opus, high effort. Load the `minion` skill first. Owner's words: Part 3 item 4 and Part 7 item 5 of [../requirements.md](../requirements.md). Your parent is `mastermind-dictation-2`.

**Investigation plus a failing test: no code edits outside your task folder (`order/`) and one new file, `ux/Dictate/test/order.mjs`.** A builder (`solid/`) is editing `ux/Dictate/` and `ext/drawer/` at the same time; your fix goes to it, or lands after it, through your parent.

## What happened

The owner said "can you hear me now". The chat showed a bubble "now" first, then "can you hear me". The agent's log had the words in the right order, so the agent saw it fine. The owner: "if the data is sound, rendering is right; fix it at the data."

## Find which layer puts them out of order

The candidates, in the order the words travel:
1. **Whisper's amend-and-finalize flow** (`ext/Chat/Mic.js`, the guess → amend → final replies): does a later amend or a final land with an earlier timestamp or sequence number than a piece already placed?
2. **The placement step**: the voice assistant (role `voice-assistant`, skill `.claude/skills/voice-assistant/`) decides same paragraph, own paragraph or own card per sentence. Does it still run, is it the right shape, and can two placements race (each its own async call) so the second-spoken returns first?
3. **The render**: `ux/Dictate/Widget.js` (`show_out`, `patch_piece`, bubble keys) and `ux/Dictate/chat.js`: does order come from arrival time instead of a sequence the data carries?

Use the real records first. Find the actual "can you hear me" incident (2026-10-24 or 25) and trace its pieces through each layer, with timestamps.

- **Raw Whisper replies:** `public/framework/ai/whisper/bucket.jsonl`
- **Voice session records** (`kind: "voice"`): `public/framework/ai/sessions/2026/10/25/` and `.../10/24/`

## Deliverable

1. `order/report.md`, one screen: the layer at fault with the evidence lines (file:line and the record lines), what data field should carry the order (a sequence number? the utterance start time?), and the fix as a short plan naming files and functions.
2. `ux/Dictate/test/order.mjs`: replays the incident's sequence (or a minimal one) through the real code headless and FAILS today, printing the order it got. Commit it on a branch `task/dictation-order` from a worktree (`node Server/worktree-up.mjs dictation-order`); don't merge.

Findings as `log` lines in `order/task.jsonl`. When done, message your parent in two sentences. Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash. Any whisper-server you start, you stop.
