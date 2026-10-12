# CLAUDE.md consolidation, non-destructive (task mastermind brief)

**Owner (2026-10-12):** CLAUDE.md is too long (~4,100 words, ~5,700 tokens paid by every session), and rules added one correction at a time may conflict or be worded too strongly. Consolidate for clarity, **but nothing useful may be lost**: a tip that does not belong in CLAUDE.md moves to where it belongs (a module readme, a `doc/`, a skill), it is never just deleted. The owner cannot judge each line, so the process must be safe by construction. Do not wait on the owner: they may not read chat.

Inputs: `ai/sessions/2026/10/09/session-a07780b9/system-architect/claude-md-proposal.md` (a 1,172-word draft, never applied), `ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/recommendation.md`.

## Do
1. **Sentence manifest, by script:** split current CLAUDE.md into sentences/rules with ids; for each, a row: keep (in CLAUDE.md) / move (to a named file, with the anchor) / merge (into which kept rule) / retire (only for a rule about a system that no longer exists, and it still goes to an archive file). Every sentence appears in exactly one row. A check script proves zero sentences are dropped: every one is in the new CLAUDE.md, in its destination file, or in `ai/doc/claude-md-archive.md`.
2. **Strength words:** keep the owner's own strength ("always" only for what has broken things; else "usually", "prefer"). Never strengthen a rule while moving it. Owner quotes and dates stay with the rule wherever it goes.
3. **Review page for the owner** (one screen, linked from the AI board as a Note card): what was cut from CLAUDE.md, shown as short before/after blocks grouped by destination, plus the word counts. The owner can read it later; it does not block.
4. **Apply** in a worktree: the new CLAUDE.md, the moved text appended to its destinations, the archive file, the manifest. Recent owner rules (2026-10-07 to 10-12: "Chat is the headline", "How to respond", "Mind the token burn", "Never destructive", "Stream, don't poll", "Haiku stays under 100k", "Commit after every working step", the class rules) stay in CLAUDE.md, tightened but not weakened. Commit, review the diff yourself, merge. Reversible: the old file is in git and the manifest maps every sentence.
5. Write `STATE.md`; land with `finish-task`.

## Fences
Sonnet 5.5 (you); a fresh Sonnet reviewer reads the manifest and the new file once before merge and flags any rule whose meaning changed. No OpenRouter. One-sentence chat replies.
