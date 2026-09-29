# Dictation playground — requirements

The owner's words, verbatim, are the brief: /framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/owner-words.md (two parts). Read them fully. Use the owner's own names for things.

## The asks, numbered (tick each against the owner's sentence at landing)

1. A playground on the default dictation page (/framework/ux/Dictate/ — check what exists first, incl. "send modes"; don't clobber what works).
2. One click on the mic starts a new session and starts transcribing.
3. Audio source panel: which microphone is selected, live level meter while listening (reuse the existing mic meter).
4. Raw Whisper view: code-font box (divs + spans, not contenteditable), each Whisper chunk on its own line; bigger breaks (sentence/paragraph) as a blank line. When Whisper revises its current chunk, just replace it (the wrong version isn't kept, for now).
5. Fast-assistant cleanup pass, as deltas: strike this / add this. Minimal: typos, capitalization, punctuation, remove fillers (um, uh, you know, like). Never change the intent; near-verbatim.
6. Diff view: struck text red with strike-through, added text green, drawn over the text.
7. Live mode: the red/green marks fade out over ~5 seconds, leaving the clean version.
8. Tabs on the dictate widget: Raw · Corrections (diff) · Live.
9. Later, not now: a structured final version (headings, sections) — it waits on the structured-content design (card 2026/09/28/structured-content-icon-cards-outlines-b).

## Rules
- Worktree from the pool (take_worktree), smoke test with links followed, merge with node Server/merge.mjs.
- Fresh-eyes review before landing (see task fresh-eyes-review if landed; otherwise a fresh Sonnet reviewer with screenshots).
- Every Playwright launch hidden (task hidden-windows) — no terminal popups.
- Post progress on the card, two sentences at a time; land with a walkthrough (Next/Next) of the playground.
