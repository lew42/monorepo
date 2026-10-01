# Minion brief: merge 14, the ✓/? marks and the filler check

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Read `public/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md`: you own items **12** (only the marks; threaded replies are another task's) and **13** (only the `is_filler()` extension).

## 1. The ✓ and ? on the owner's own bubbles (item 12)
**Today:** `Widget.Thread.mark()` in `ux/Dictate/Widget.js` (around line 322) adds a muted " ✓" (`ok`) or " ?" (`unclear`) after each of the owner's lines. It comes from `ux/Understand`'s `marks()`, and its only explanation is a `title` that is often empty. The owner: "unexplained… make them self-evident (a tooltip or a label) or remove them". The owner reads on a phone, so a tooltip alone won't help.

**Do:**
- **Drop the ✓.** Understood is the normal case, so it needs no mark.
- **Turn the `?` into a small, plain label after the text: "unclear?".** Its `title` and `aria-label` read "The assistant wasn't sure what this meant" plus the purpose when there is one. Tapping it shows the same sentence inline, beneath the bubble. Tap it again to hide it.
- The alternative was keeping both icons with a tooltip. That was rejected because a phone has no hover.
- Change it in that one place, so every surface updates (law 6). Add a line to `ux/Dictate/doc/widget.md` and `doc/decisions.md`.

## 2. The filler check (item 13)
**Today:** `is_filler()` and `FILLER` in `Servex/agents/Sessions.js` (around line 940) skip a FAST reply that is only filler ("Go on", "Got it, I'm listening"). The owner hit a "Go on" loop from the SMART assistant, and replies like "Go on — and the second part?" also get through.

**Do:**
- **Apply the same skip to SMART replies** (`heard()`, around line 821, where it now checks only `who.role === "fast"`).
- **Strip a filler PREFIX:** when a reply starts with filler and then says something real ("Go on — what about the dot?"), drop the filler words and the dash or comma after them, and keep the rest. When nothing real is left, it's a skip.
- **Tests:** add cases to `Servex/agents/Sessions.test.mjs`: pure filler is skipped for both roles; a filler prefix is stripped; a normal reply that merely contains "go on" mid-sentence is untouched. Run it: `node --test Servex/agents/Sessions.test.mjs`.
- This change goes live only when Servex restarts. Don't restart it. Say so in your report, and your parent will ask mastermind-servex-9.

## Prove
- **The marks:** headless Playwright on the demo, never the owner's tabs. Stub Servex and the Understand call so one line comes back `unclear` and one `ok`. Shoot at 400 and 1920 (`minion-marks/shots/`): no ✓, one "unclear?". Tap it, and the sentence shows.
- **The filler check:** the test output.

## Rules
- Work in your worktree only. Commit by exact path, and never commit `.jsonl` files.
- Run `node Server/review.mjs` on your task dir and answer every finding.
- End your turn with the commit hash, the test count, and the shot paths.
