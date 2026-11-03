# Dictation: the six things the end-to-end walk left (fast stays silent, smart warms faster, no task from a statement, the 404, the stale mic line, the taller half sheet)

Budget: $12. Load the `sub-mastermind`, `code`, `ui-test` and `review` skills first. Read `ux/Dictate/doc/next.md` section "Next 4" (six measured findings from the Opus walk, with the review at `../voice-e2e-review/review.md`) and the owner's words behind them: `../requirements-5.md` asks 2–4 (fast = Haiku, silent unless addressed; smart replies), `../requirements-7.md` (the first reply took 30 s). Your log is this dir's `task.jsonl`.

## Deliverable, in this order (each its own commit; stop when the budget is spent and say where)

1. **The fast assistant never replies unless addressed by name** (Servex `session-fast.md` and the fast agent's turn code): measured today it replied after 4 of 8 "Smart assistant, …" sentences. Fix the prompt and the gate in code (a reply is dropped unless the sentence names "fast"); prove it with the same replay, 0 of 8.
2. **The smart assistant's cold start**: 60k tokens of context per new smart agent; halve the prompt (what it loads, measured with the `readme_chain` size and the skill text it inlines) and show the first-reply time before/after on the same replay (target: under 6 s cold on desktop).
3. **No task from a statement**: a sentence that is not a request ("the sheet should show every bubble in order") must not spawn a `task-mastermind`; the smart assistant confirms in one line first. Replay proves it.
4. **The `page.jsonl` 404 on every open** (`core/Page/ext/Inbox/Inbox.js` fetching a file most pages do not have): check existence through the file index or catch quietly; console clean on open.
5. **The stale "Mic: on" line** after stop, and **the half sheet's default height** (two bubbles visible; a taller default such as 60% so four show): fix both, shots at 400 before/after.
6. `next.md` section "Next 4" marked per item (done with commit, or left with the measurement); `check_page` at 400 / 1200 / 1920 / 3440; card (title "Dictation: fast is silent, smart replies in N s cold, no task from a statement"); landing line checked with `tail -1`; `merge.mjs`; Servex files tested on a private port, the live Servex restarted by the mastermind.

Fence: `ux/Dictate/**`, `ext/drawer/**`, `core/Page/ext/Inbox/Inbox.js` (the fetch only), `Servex/agents/session-fast.md` and the fast/smart turn code in `Servex/agents/*.js` (only the gate and the prompt size), this task dir. Never drive the owner's live tabs; never restart the live Servex or the :8137 server. Sonnet.
