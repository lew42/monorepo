# Minion: the chat widget, human in the loop: select a card, rename it, see ✓/? on every sentence

Load the `minion` skill first, then `code`, `page`, `css`, `ui-test`. Your parent is task-mastermind-chat-hitl.

## The owner's words (full text: ../owner-words.md and ../../owner-words.md, "Continued (about 8:40 PM)")

> "I could click on a title and say, hey, can we rename this? And then it suggests like, you know, maybe it turns that title into a drop down and then it has a whole bunch of alternatives that I can choose from ... I guess I just need like the basic function working for now."
>
> "when you click on a specific card, ... first it kind of selects that card, but also maybe expands it if there's things within it."
>
> "on like a per sentence basis ... a green check mark after it ... a yellow question mark ... the smart assistant could add clarification UI into the chat where it's like, needs clarity. Do you mean this or that?"

The owner tests this ON THE PHONE (the ✦ sheet) and on desktop (the drawer's AI tab). Both build the SAME `ext/Chat/ChatPanel`, so one change reaches both.

## Starting state

- Your worktree `C:/Code/lew42/worktrees/chat-hitl` already holds (from a sibling minion) `ux/Understand/` (the ✓/? marks, a `marks(sentences, context)` client call, the clarification card) and `ux/Rename/` (select, then a dropdown of 5 names). Read both readmes and REUSE them; don't rebuild them inside ext/Chat.
- Your parent has merged `michael/dev` (with 71933e2a: the ✦ sheet drives ChatPanel through `ext/Session`) into the worktree and cherry-picked a6f58363: the audio task's half-built revision pairs (a chat line with `re` + `level` is drawn under its raw line) plus a `watch` option. It is UNTESTED: test it first, fix it, and keep it.
- The universal chat line: `{chat:{at, session, path, from, via, text, re?, level?, place?, fix?}}` ([design](/framework/ai/2026-09-29/voice-sessions/design.md)). A later line with the same `at` and `fix: true` wins. `place: {module, id, ...}` draws a content card in the flow.

## Deliverables, in this order (land each one working before starting the next)

0. **Reconcile first.** Since the WIP was written, clean-transcription merged "clean mode" (1dfb13c3): the composer's mic swaps raw words for the clean text IN the box, with a "raw" chip (see `ext/Chat/readme.md`, the `revise:` paragraph, and `Mic.js`). That is the truth now. The cherry-picked WIP sets `revise: this.revise ?? "edit"` in ChatPanel, which fights it: remove that default so ChatPanel passes `revise` through unchanged, and draw a revision pair only for a chat LINE that carries `re` + `level` (e.g. one written by a session or the smart assistant). Check that clean mode still works the same in the panel demo after your change.
1. **Revision pairs work:** prove the cherry-picked code on the `/framework/ext/Chat/panel/` demo page (fix its literal `**Variable height...**` too: `p()` doesn't read `**`, use `md()`).
2. **Select:** a tap on a bubble (or on a placed card) SELECTS it: a visible selected state, one at a time, a second tap or Esc clears it. Keep the existing tap-to-open behavior of bubbles with `from` pieces: selection is added, not a replacement (a tap selects AND opens what's inside, per the owner's sentence).
3. **Rename:** with a card selected, typing or saying "rename this" in the composer (and a small Rename button on the selected card) turns its title (the heading, or the first line) into the `ux/Rename` dropdown of 5 names. Choosing one DELIVERS a line through the panel's normal `deliver`: the same `at` with `fix: true` and the new title, so latest wins everywhere the log is read. "rename this" itself must not also be sent as a chat message.
4. **✓/? marks:** after the owner's own lines (from `you`), run `ux/Understand`'s `marks()` once per line, asynchronously (the smart assistant, no hurry), and draw a small ✓ or ? after each sentence. For an unclear sentence, deliver ONE clarification line with `place` pointing at the clarification card module, so it appears in the flow. Behind an option `marks: true` on ChatPanel, ON in the demo page, the drawer's AI tab and the ✦ sheet. Fixtures when /api/hitl is unreachable (the route goes live at a later Servex restart), so it shows today.
5. `ext/Chat/readme.md` and `ext/Chat/doc/` current: one line each for select, rename, marks.

## Proof

Headless (Playwright, never the owner's tabs) on `http://127.0.0.1:51851`: `/framework/ext/Chat/panel/` and the ✦ sheet at 400 (the `ext/drawer/rail` demo page), and the drawer AI tab at 1920. Shots: a selected card, the rename dropdown open, a renamed title, ✓/? marks with a clarification card. Look at each one. Zero console errors on every page you touched.

## Fence

Worktree only. Your files: `public/framework/ext/Chat/**`, `public/framework/ext/drawer/**` (only to pass `marks: true`), fixes inside `ux/Understand/` and `ux/Rename/` if the integration needs them, and the two index lines that still miss them: the "Eleven classes live here" count in `public/framework/ux/page.js` and the index in `public/framework/ux/readme.md`. Do NOT touch `ux/Dictate/`, `public/framework/ai2/`, `ext/Session/`, `Servex/` or `Server/`. Keep v1 reachable: the new behavior is an option, and the old behavior is what you get without it. Commit by exact path (never `git add .`; the server boot dirties unrelated files.jsonl). Never restart any server; stop any browser or server you start. Every spawn sets `windowsHide: true`.

**Budget: $4, hard.** Don't spawn reviewers, docs-checks or other agents, and don't run `review.mjs` or `merge.mjs`: your parent runs one review and the merge for the whole task. If you reach the budget, commit what works and land with what's left named.

Land by committing, then appending a landing line with the screenshot paths to your task.jsonl.
